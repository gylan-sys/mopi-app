import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import Database from "better-sqlite3";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import ExcelJS from "exceljs";

import { z } from "zod";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "kopi-nikmat-default-secret-key-2026";
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not defined. Using default secret (Insecure for production).");
}

const loginSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6)
});
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, "database.db"));

// Initialize Database
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      category TEXT DEFAULT 'Bahan',
      unit_price REAL DEFAULT 0,
      min_stock REAL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      customer_name TEXT,
      payment_method TEXT DEFAULT 'Cash',
      order_id TEXT,
      source TEXT DEFAULT 'POS',
      status TEXT DEFAULT 'completed',
      menu_id INTEGER,
      quantity INTEGER DEFAULT 1,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      size TEXT,
      category TEXT DEFAULT 'Kopi',
      image_url TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS menu_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_id INTEGER NOT NULL,
      inventory_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
      FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE,
      email TEXT,
      points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS advertisements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT CHECK(type IN ('image', 'video')) NOT NULL,
      url TEXT NOT NULL,
      title TEXT,
      subtitle TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS promos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed')) NOT NULL,
      discount_value REAL NOT NULL,
      target_type TEXT CHECK(target_type IN ('all', 'specific_menus')) DEFAULT 'all',
      target_ids TEXT, -- JSON array of menu IDs
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);

    -- Add new columns if they don't exist
    PRAGMA table_info(inventory);
    -- We'll use a safer way to add columns in SQLite
    -- Check if 'type' column exists in inventory
    -- Note: In SQLite, we can't easily check column existence in a single statement without a script or PRAGMA
  `);

  // Safely add columns
  try { db.prepare("ALTER TABLE inventory ADD COLUMN type TEXT DEFAULT 'Bahan'").run(); } catch(e) {}
  try { db.prepare("ALTER TABLE menus ADD COLUMN type TEXT DEFAULT 'Internal'").run(); } catch(e) {}
  try { db.prepare("ALTER TABLE menus ADD COLUMN supplier_name TEXT").run(); } catch(e) {}
  try { db.prepare("ALTER TABLE menus ADD COLUMN supplier_price REAL DEFAULT 0").run(); } catch(e) {}

  // Migration: Add source column to transactions if it doesn't exist
  try {
    db.prepare("SELECT source FROM transactions LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE transactions ADD COLUMN source TEXT DEFAULT 'POS'");
  }

  // Migration: Add status column to transactions if it doesn't exist
  try {
    db.prepare("SELECT status FROM transactions LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'completed'");
  }

  // Migration: Add table_number column to transactions if it doesn't exist
  try {
    db.prepare("SELECT table_number FROM transactions LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE transactions ADD COLUMN table_number TEXT");
  }

  // Migration: Add customer_id column to transactions if it doesn't exist
  try {
    db.prepare("SELECT customer_id FROM transactions LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE transactions ADD COLUMN customer_id INTEGER");
  }

  // Migration: Add menu_id column to transactions if it doesn't exist
  try {
    db.prepare("SELECT menu_id FROM transactions LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE transactions ADD COLUMN menu_id INTEGER");
  }

  // Migration: Add quantity column to transactions if it doesn't exist
  try {
    db.prepare("SELECT quantity FROM transactions LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE transactions ADD COLUMN quantity INTEGER DEFAULT 1");
  }

  // Migration: Add promo_code column to transactions if it doesn't exist
  try {
    db.prepare("SELECT promo_code FROM transactions LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE transactions ADD COLUMN promo_code TEXT");
  }

  // Migration: Add discount_amount column to transactions if it doesn't exist
  try {
    db.prepare("SELECT discount_amount FROM transactions LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE transactions ADD COLUMN discount_amount REAL DEFAULT 0");
  }

  // Migration: Add category column to inventory if it doesn't exist
  try {
    db.prepare("SELECT category FROM inventory LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE inventory ADD COLUMN category TEXT DEFAULT 'Bahan'");
  }

  // Migration: Add unit_price column to inventory if it doesn't exist
  try {
    db.prepare("SELECT unit_price FROM inventory LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE inventory ADD COLUMN unit_price REAL DEFAULT 0");
  }

  // Migration: Add min_stock column to inventory if it doesn't exist
  try {
    db.prepare("SELECT min_stock FROM inventory LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE inventory ADD COLUMN min_stock REAL DEFAULT 0");
  }

  const defaultSettings = [
    ['app_name', 'Coffee POS'],
    ['app_icon', 'Coffee'],
    ['app_logo_url', ''],
    ['login_bg', '#f5f5f0'],
    ['login_bg_image', ''],
    ['login_title', 'Coffee POS'],
    ['login_subtitle', 'Silakan masuk ke akun Anda'],
    ['main_bg', '#fdfaf7'],
    ['main_bg_image', ''],
    ['primary_color', '#9a684a'],
    ['smtp_host', ''],
    ['smtp_port', '587'],
    ['smtp_user', ''],
    ['smtp_pass', ''],
    ['smtp_from', ''],
    ['payment_qris_url', ''],
    ['payment_dana_url', ''],
    ['payment_ovo_url', ''],
    ['payment_shopeepay_url', ''],
    ['payment_instructions', 'Silakan scan QRIS atau transfer ke nomor yang tertera.'],
    ['payment_webhook_secret', ''],
    ['delivery_webhook_secret', 'mopi_delivery_secret_2026'],
    ['receipt_name', 'COFFEE SHOP'],
    ['receipt_address', 'Jl. Kopi Nikmat No. 123, Jakarta'],
    ['receipt_phone', '0812-3456-7890'],
    ['receipt_footer', 'Terima kasih atas kunjungan Anda!'],
    ['timezone', 'Asia/Jakarta'],
    ['language', 'id'],
    ['order_counter', '1']
  ];

  const insertSetting = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  for (const [key, value] of defaultSettings) {
    insertSetting.run(key, value);
  }

  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
  if (userCount.count === 0) {
    const adminHash = bcrypt.hashSync('admin123', 10);
    const kasirHash = bcrypt.hashSync('kasir123', 10);
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run('admin', adminHash, 'admin');
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run('kasir', kasirHash, 'cashier');
  } else {
    // Migrate existing plain text passwords for default users if they exist
    const users = db.prepare("SELECT * FROM users WHERE username IN ('admin', 'kasir')").all() as any[];
    for (const user of users) {
      if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        const newHash = bcrypt.hashSync(user.password, 10);
        db.prepare("UPDATE users SET password = ? WHERE id = ?").run(newHash, user.id);
      }
    }
  }
}

// Auth Middleware
function authenticateToken(req: any, res: any, next: any) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
}

function isAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: "Admin only" });
  next();
}

async function startServer() {
  console.log("🚀 Starting Coffee POS Server...");
  try {
    initDb();
    console.log("✅ Database initialized successfully.");
  } catch (dbError) {
    console.error("❌ Database initialization failed:", dbError);
    process.exit(1);
  }
  
  const app = express();
  app.set('trust proxy', 1);
  
  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for Vite dev server compatibility
  }));
  app.use(cookieParser());
  app.use(express.json());

  // Restrict CORS to specific origins if needed (optional, currently allowing all for dev)
  // app.use(cors({ origin: process.env.APP_URL, credentials: true }));
  
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: { success: false, message: "Terlalu banyak percobaan login, silakan coba lagi nanti." }
  });

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    }
  });
  const PORT = 3000;

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/uploads", express.static(uploadsDir));

  // Multer configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });

  // Upload API
  app.post("/api/upload", upload.single("file"), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // Socket.io connection
  io.on("connection", (socket) => {
    socket.on("join_order", (orderId) => {
      socket.join(orderId);
    });
  });

  // --- API Routes ---

  // Payment Webhook
  app.post("/api/payment/webhook", (req, res) => {
    const { order_id, status, secret } = req.body;
    
    const webhookSecret = db.prepare("SELECT value FROM settings WHERE key = 'payment_webhook_secret'").get() as any;
    
    if (webhookSecret?.value && secret !== webhookSecret.value) {
      return res.status(401).json({ error: "Unauthorized webhook" });
    }

    if (status === "settlement" || status === "success") {
      db.prepare("UPDATE transactions SET status = 'processing' WHERE order_id = ?").run(order_id);
      io.to(order_id).emit("PAYMENT_SUCCESS", { order_id });
      io.emit("ORDER_UPDATED");
    }
    res.json({ received: true });
  });

  // Delivery Platform Webhook (GrabFood, GoFood, ShopeeFood)
  app.post("/api/webhooks/delivery-order", (req, res) => {
    const { platform, secret, order_id, customer_name, items } = req.body;
    
    // Validate platform
    if (!['GrabFood', 'GoFood', 'ShopeeFood'].includes(platform)) {
      return res.status(400).json({ error: "Platform tidak valid" });
    }

    // Validate secret
    const deliverySecret = db.prepare("SELECT value FROM settings WHERE key = 'delivery_webhook_secret'").get() as any;
    if (deliverySecret?.value && secret !== deliverySecret.value) {
      return res.status(401).json({ error: "Unauthorized webhook" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Orderan kosong" });
    }

    const transaction = db.transaction(() => {
      const insufficientStock: string[] = [];
      const processedItems: any[] = [];
      const aggregatedIngredients: Map<number, { name: string, required: number, current: number, unit: string }> = new Map();

      for (const item of items) {
        // Try to find menu by name (case insensitive)
        const menu = db.prepare("SELECT * FROM menus WHERE LOWER(name) = LOWER(?)").get(item.name) as any;
        if (!menu) throw new Error(`Menu '${item.name}' tidak ditemukan di sistem POS`);

        const ingredients = db.prepare(`
          SELECT mi.*, i.name, i.quantity as current_stock, i.unit
          FROM menu_ingredients mi
          JOIN inventory i ON mi.inventory_id = i.id
          WHERE mi.menu_id = ?
        `).all(menu.id) as any[];

        for (const ing of ingredients) {
          const required = ing.quantity * item.quantity;
          const existing = aggregatedIngredients.get(ing.inventory_id) || { 
            name: ing.name, 
            required: 0, 
            current: ing.current_stock, 
            unit: ing.unit 
          };
          existing.required += required;
          aggregatedIngredients.set(ing.inventory_id, existing);
        }
        processedItems.push({ menu, ingredients, quantity: item.quantity });
      }

      for (const [id, data] of aggregatedIngredients.entries()) {
        if (data.current < data.required) {
          insufficientStock.push(`${data.name} (Stok: ${data.current} ${data.unit}, Butuh: ${data.required} ${data.unit})`);
        }
      }

      if (insufficientStock.length > 0) {
        return { error: "Stok bahan baku tidak mencukupi", details: insufficientStock };
      }

      const status = 'processing';
      const finalOrderId = order_id || `${platform.substring(0, 1)}-${Date.now().toString().slice(-6)}`;
      
      const insertTx = db.prepare("INSERT INTO transactions (type, category, amount, description, menu_id, quantity, payment_method, order_id, source, customer_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      const updateInv = db.prepare("UPDATE inventory SET quantity = quantity - ? WHERE id = ?");

      for (const item of processedItems) {
        const { menu, ingredients, quantity } = item;
        insertTx.run('income', 'Sales', menu.price * quantity, `Order ${platform}: ${menu.name} (x${quantity})`, menu.id, quantity, platform, finalOrderId, platform, customer_name || 'Pelanggan Delivery', status);

        for (const ing of ingredients) {
          updateInv.run(ing.quantity * quantity, ing.inventory_id);
        }
      }

      return { success: true, orderId: finalOrderId, status };
    });

    try {
      const result = transaction();
      if (result.error) {
        return res.status(400).json(result);
      }
      io.emit("ORDER_UPDATED");
      res.json(result);
    } catch (error: any) {
      console.error("Delivery webhook error:", error);
      res.status(500).json({ error: error.message || "Gagal memproses orderan delivery" });
    }
  });

  app.post("/api/payment/simulate-success", (req, res) => {
    const { order_id } = req.body;
    io.to(order_id).emit("PAYMENT_SUCCESS", { order_id });
    res.json({ success: true });
  });

  // Auth API
  app.post("/api/login", loginLimiter, (req, res) => {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: "Format username atau password tidak valid" });
    }
    const { username, password } = validation.data;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({ 
        success: true, 
        user: { id: user.id, username: user.username, role: user.role } 
      });
    } else {
      res.status(401).json({ success: false, message: "Username atau password salah" });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    res.json({ success: true });
  });

  app.get("/api/me", authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  // Public APIs for Guest Ordering
  app.get("/api/menus/public", (req, res) => {
    const menus = db.prepare("SELECT * FROM menus").all() as any[];
    const menusWithIngredients = menus.map(menu => {
      const ingredients = db.prepare(`
        SELECT mi.*, i.name as inventory_name, i.unit, i.unit_price, i.quantity as current_stock
        FROM menu_ingredients mi 
        JOIN inventory i ON mi.inventory_id = i.id 
        WHERE mi.menu_id = ?
      `).all(menu.id);
      return { ...menu, ingredients };
    });
    res.json(menusWithIngredients);
  });

  app.post("/api/orders/public", (req, res) => {
    const { items, customerName, tableNumber, promoCode, discountAmount, paymentMethod } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Orderan kosong" });
    }

    try {
      const transaction = db.transaction(() => {
        // Get and increment order counter
        const counterSetting = db.prepare("SELECT value FROM settings WHERE key = 'order_counter'").get() as any;
        let counter = parseInt(counterSetting?.value || '1');
        const orderId = String(counter).padStart(2, '0');
        db.prepare("UPDATE settings SET value = ? WHERE key = 'order_counter'").run(String(counter + 1));

        let subtotal = 0;
        for (const item of items) {
          const menu = db.prepare("SELECT * FROM menus WHERE id = ?").get(item.menuId) as any;
          if (!menu) throw new Error(`Menu ID ${item.menuId} tidak ditemukan`);
          subtotal += menu.price * item.quantity;

          // Insert into transactions as pending
          db.prepare(`
            INSERT INTO transactions (type, category, amount, description, customer_name, table_number, order_id, source, status, menu_id, quantity, date, promo_code, payment_method)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
          `).run(
            'income',
            menu.category,
            menu.price * item.quantity,
            `Order via Customer: ${menu.name}`,
            customerName || 'Guest',
            tableNumber || '',
            orderId,
            'Customer',
            'pending',
            item.menuId,
            item.quantity,
            promoCode || null,
            paymentMethod || 'Cash'
          );
        }

        // Insert discount row if any
        if (promoCode && discountAmount > 0) {
          db.prepare(`
            INSERT INTO transactions (type, category, amount, description, customer_name, table_number, order_id, source, status, date, promo_code, payment_method)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
          `).run(
            'income',
            'Discount',
            -discountAmount,
            `Promo Code: ${promoCode}`,
            customerName || 'Guest',
            tableNumber || '',
            orderId,
            'Customer',
            'pending',
            promoCode,
            paymentMethod || 'Cash'
          );
        }

        // Insert tax row
        const settings = db.prepare("SELECT * FROM settings").all() as any[];
        const settingsObj = settings.reduce((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {} as any);
        const taxRate = parseFloat(settingsObj.tax_rate || '0');
        const tax = Math.round((subtotal - (discountAmount || 0)) * (taxRate / 100));
        if (tax > 0) {
          db.prepare(`
            INSERT INTO transactions (type, category, amount, description, customer_name, table_number, order_id, source, status, date, payment_method)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
          `).run(
            'income',
            'Tax',
            tax,
            'Order Tax',
            customerName || 'Guest',
            tableNumber || '',
            orderId,
            'Customer',
            'pending',
            paymentMethod || 'Cash'
          );
        }

        return orderId;
      });

      const orderId = transaction();
      res.json({ success: true, orderId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Menus API
  app.get("/api/menus", authenticateToken, (req, res) => {
    const menus = db.prepare("SELECT * FROM menus").all() as any[];
    const menusWithIngredients = menus.map(menu => {
      const ingredients = db.prepare(`
        SELECT mi.*, i.name as inventory_name, i.unit, i.unit_price, i.quantity as current_stock
        FROM menu_ingredients mi 
        JOIN inventory i ON mi.inventory_id = i.id 
        WHERE mi.menu_id = ?
      `).all(menu.id);
      return { ...menu, ingredients };
    });
    res.json(menusWithIngredients);
  });

  app.post("/api/menus", authenticateToken, isAdmin, (req, res) => {
    const { name, price, size, category, image_url, description, ingredients, type, supplier_name, supplier_price } = req.body;
    const transaction = db.transaction(() => {
      const result = db.prepare("INSERT INTO menus (name, price, size, category, image_url, description, type, supplier_name, supplier_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
        name, price, size, category, image_url, description, type || 'Internal', supplier_name || null, supplier_price || 0
      );
      const menuId = result.lastInsertRowid;
      const insertIngredient = db.prepare("INSERT INTO menu_ingredients (menu_id, inventory_id, quantity) VALUES (?, ?, ?)");
      for (const ing of ingredients) {
        insertIngredient.run(menuId, ing.inventory_id, ing.quantity);
      }
      return menuId;
    });
    const menuId = transaction();
    res.json({ id: menuId });
  });

  app.put("/api/menus/:id", authenticateToken, isAdmin, (req, res) => {
    const { name, price, size, category, image_url, description, ingredients, type, supplier_name, supplier_price } = req.body;
    const menuId = req.params.id;
    const transaction = db.transaction(() => {
      db.prepare("UPDATE menus SET name = ?, price = ?, size = ?, category = ?, image_url = ?, description = ?, type = ?, supplier_name = ?, supplier_price = ? WHERE id = ?").run(
        name, price, size, category, image_url, description, type || 'Internal', supplier_name || null, supplier_price || 0, menuId
      );
      db.prepare("DELETE FROM menu_ingredients WHERE menu_id = ?").run(menuId);
      const insertIngredient = db.prepare("INSERT INTO menu_ingredients (menu_id, inventory_id, quantity) VALUES (?, ?, ?)");
      for (const ing of ingredients) {
        insertIngredient.run(menuId, ing.inventory_id, ing.quantity);
      }
    });
    transaction();
    res.json({ success: true });
  });

  app.delete("/api/menus/:id", authenticateToken, isAdmin, (req, res) => {
    db.prepare("DELETE FROM menus WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Orders API
  app.post("/api/orders", authenticateToken, (req, res) => {
    const { items, paymentMethod, customerName, orderId: providedOrderId, source, tableNumber, customerId } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Orderan kosong" });
    }

    const transaction = db.transaction(() => {
      const insufficientStock: string[] = [];
      const processedItems: any[] = [];
      const aggregatedIngredients: Map<number, { name: string, required: number, current: number, unit: string }> = new Map();

      // Get and increment order counter
      const counterSetting = db.prepare("SELECT value FROM settings WHERE key = 'order_counter'").get() as any;
      let counter = parseInt(counterSetting?.value || '1');
      const orderId = providedOrderId || String(counter).padStart(2, '0');
      
      // Update counter for next order
      db.prepare("UPDATE settings SET value = ? WHERE key = 'order_counter'").run(String(counter + 1));

      for (const item of items) {
        const menu = db.prepare("SELECT * FROM menus WHERE id = ?").get(item.menuId) as any;
        if (!menu) throw new Error(`Menu ID ${item.menuId} tidak ditemukan`);

        const ingredients = db.prepare(`
          SELECT mi.*, i.name, i.quantity as current_stock, i.unit
          FROM menu_ingredients mi
          JOIN inventory i ON mi.inventory_id = i.id
          WHERE mi.menu_id = ?
        `).all(item.menuId) as any[];

        for (const ing of ingredients) {
          const required = ing.quantity * item.quantity;
          const existing = aggregatedIngredients.get(ing.inventory_id) || { 
            name: ing.name, 
            required: 0, 
            current: ing.current_stock, 
            unit: ing.unit 
          };
          existing.required += required;
          aggregatedIngredients.set(ing.inventory_id, existing);
        }
        processedItems.push({ menu, ingredients, quantity: item.quantity });
      }

      for (const [id, data] of aggregatedIngredients.entries()) {
        if (data.current < data.required) {
          insufficientStock.push(`${data.name} (Stok: ${data.current} ${data.unit}, Butuh: ${data.required} ${data.unit})`);
        }
      }

      if (insufficientStock.length > 0) {
        return { error: "Stok bahan baku tidak mencukupi", details: insufficientStock };
      }

      // All orders should go to processing to enter the queue, except if explicitly handled otherwise
      const status = 'processing';
      
      const insertTx = db.prepare("INSERT INTO transactions (type, category, amount, description, menu_id, quantity, payment_method, order_id, source, customer_name, status, table_number, customer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      const updateInv = db.prepare("UPDATE inventory SET quantity = quantity - ? WHERE id = ?");

      for (const item of processedItems) {
        const { menu, ingredients, quantity } = item;
        insertTx.run('income', 'Sales', menu.price * quantity, `Order: ${menu.name} (x${quantity})`, menu.id, quantity, paymentMethod || 'Cash', orderId, source || 'POS', customerName || 'Umum', status, tableNumber || null, customerId || null);

        for (const ing of ingredients) {
          updateInv.run(ing.quantity * quantity, ing.inventory_id);
        }
      }

      // Award points if customerId is provided
      if (customerId) {
        const totalAmount = processedItems.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0);
        const pointsToAdd = Math.floor(totalAmount / 10000); // 1 point per 10k
        db.prepare("UPDATE customers SET points = points + ? WHERE id = ?").run(pointsToAdd, customerId);
      }

      return { success: true, orderId, status };
    });

    try {
      const result = transaction();
      if (result.error) {
        return res.status(400).json(result);
      }
      // Always emit update on success to refresh the queue
      io.emit("ORDER_UPDATED");
      res.json(result);
    } catch (error: any) {
      console.error("Order transaction error:", error);
      res.status(500).json({ error: error.message || "Gagal memproses orderan" });
    }
  });

  app.get("/api/orders/:orderId", authenticateToken, (req, res) => {
    const { orderId } = req.params;
    const items = db.prepare(`
      SELECT t.*, m.name as menu_name, m.price as menu_price
      FROM transactions t
      LEFT JOIN menus m ON t.menu_id = m.id
      WHERE t.order_id = ?
    `).all(orderId) as any[];

    if (items.length === 0) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    const orderSummary = {
      orderId,
      date: items[0].date,
      paymentMethod: items[0].payment_method,
      customerName: items[0].customer_name,
      tableNumber: items[0].table_number,
      customerId: items[0].customer_id,
      status: items[0].status,
      total: items.reduce((sum, item) => sum + item.amount, 0),
      items: items.map(item => ({
        menu: { id: item.menu_id, name: item.menu_name, price: item.menu_price },
        quantity: item.quantity
      }))
    };

    res.json(orderSummary);
  });

  // Customers API
  app.get("/api/customers", authenticateToken, (req, res) => {
    const customers = db.prepare("SELECT * FROM customers ORDER BY name ASC").all();
    res.json(customers);
  });

  app.post("/api/customers", authenticateToken, (req, res) => {
    const { name, phone, email } = req.body;
    try {
      const result = db.prepare("INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)").run(name, phone, email);
      res.json({ id: result.lastInsertRowid, name, phone, email, points: 0 });
    } catch (e) {
      res.status(400).json({ error: "Gagal menambah customer (Mungkin nomor HP sudah terdaftar)" });
    }
  });

  app.put("/api/customers/:id", authenticateToken, (req, res) => {
    const { name, phone, email, points } = req.body;
    db.prepare("UPDATE customers SET name = ?, phone = ?, email = ?, points = ? WHERE id = ?")
      .run(name, phone, email, points, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/customers/:id", authenticateToken, (req, res) => {
    db.prepare("DELETE FROM customers WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Public active orders for customers
  app.get("/api/active-orders/public", (req, res) => {
    try {
      const orders = db.prepare(`
        SELECT 
          order_id as id,
          customer_name,
          table_number,
          status,
          date as created_at,
          json_group_array(json_object('menu_name', description, 'quantity', quantity)) as items
        FROM transactions
        WHERE category = 'Sales' AND status != 'Selesai' AND status != 'Dibatalkan'
        GROUP BY order_id
        ORDER BY date DESC
      `).all() as any[];
      
      res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/active-orders", authenticateToken, (req, res) => {
    const items = db.prepare(`
      SELECT t.*, m.name as menu_name
      FROM transactions t
      LEFT JOIN menus m ON t.menu_id = m.id
      WHERE t.status IN ('processing', 'pending')
      ORDER BY t.date ASC
    `).all() as any[];

    const orders: any = {};
    items.forEach(item => {
      if (!orders[item.order_id]) {
        orders[item.order_id] = {
          orderId: item.order_id,
          customerName: item.customer_name,
          date: item.date,
          source: item.source || 'POS',
          status: item.status,
          tableNumber: item.table_number,
          items: []
        };
      }
      orders[item.order_id].items.push({
        name: item.menu_name,
        quantity: item.quantity
      });
    });

    res.json(Object.values(orders));
  });

  app.put("/api/orders/:orderId/status", authenticateToken, (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE transactions SET status = ? WHERE order_id = ?").run(status, orderId);
    io.emit("ORDER_UPDATED");
    res.json({ success: true });
  });

  // Inventory API
  app.get("/api/inventory", authenticateToken, (req, res) => {
    const items = db.prepare("SELECT * FROM inventory").all();
    res.json(items);
  });

  app.post("/api/inventory", authenticateToken, isAdmin, (req, res) => {
    const { name, quantity, unit, min_stock, unit_price, category, type } = req.body;
    const result = db.prepare("INSERT INTO inventory (name, quantity, unit, min_stock, unit_price, category, type) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      name, quantity, unit, min_stock || 0, unit_price || 0, category || 'Bahan', type || 'Bahan'
    );
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/inventory/:id", authenticateToken, isAdmin, (req, res) => {
    const { name, quantity, unit, min_stock, unit_price, category, type } = req.body;
    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (quantity !== undefined) { fields.push("quantity = ?"); values.push(quantity); }
    if (unit !== undefined) { fields.push("unit = ?"); values.push(unit); }
    if (min_stock !== undefined) { fields.push("min_stock = ?"); values.push(min_stock); }
    if (unit_price !== undefined) { fields.push("unit_price = ?"); values.push(unit_price); }
    if (category !== undefined) { fields.push("category = ?"); values.push(category); }
    if (type !== undefined) { fields.push("type = ?"); values.push(type); }

    if (fields.length === 0) return res.json({ success: true });

    values.push(req.params.id);
    db.prepare(`UPDATE inventory SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    res.json({ success: true });
  });

  app.delete("/api/inventory/:id", authenticateToken, isAdmin, (req, res) => {
    db.prepare("DELETE FROM inventory WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/inventory/purchase", authenticateToken, isAdmin, (req, res) => {
    const { inventoryId, quantity, totalPrice, description } = req.body;
    
    if (!inventoryId || !quantity || !totalPrice) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const transaction = db.transaction(() => {
      const item = db.prepare("SELECT * FROM inventory WHERE id = ?").get(inventoryId) as any;
      if (!item) throw new Error("Item tidak ditemukan");

      // Update stock
      db.prepare("UPDATE inventory SET quantity = quantity + ? WHERE id = ?").run(quantity, inventoryId);

      // Record expense
      db.prepare("INSERT INTO transactions (type, category, amount, description, date) VALUES (?, ?, ?, ?, ?)")
        .run('expense', 'Supplies', totalPrice, description || `Pembelian ${item.name} x${quantity} ${item.unit}`, new Date().toISOString());
    });

    try {
      transaction();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Transactions API
  app.get("/api/transactions", authenticateToken, isAdmin, (req, res) => {
    const { type, category } = req.query;
    let sql = "SELECT * FROM transactions";
    const params: any[] = [];
    const conditions: string[] = [];

    if (type) {
      conditions.push("type = ?");
      params.push(type);
    }
    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY date DESC";
    
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  });

  app.post("/api/transactions", authenticateToken, isAdmin, (req, res) => {
    const { type, category, amount, description, date } = req.body;
    const result = db.prepare("INSERT INTO transactions (type, category, amount, description, date) VALUES (?, ?, ?, ?, ?)").run(type, category, amount, description, date || new Date().toISOString());
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/stats", authenticateToken, isAdmin, (req, res) => {
    const income = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'income'").get() as any;
    const expense = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'expense'").get() as any;
    const recentTransactions = db.prepare("SELECT * FROM transactions ORDER BY date DESC LIMIT 5").all();
    const lowStock = db.prepare("SELECT * FROM inventory WHERE quantity <= min_stock").all();
    
    const today = new Date().toISOString().split('T')[0];
    const dailySales = db.prepare("SELECT SUM(quantity) as total, SUM(amount) as income FROM transactions WHERE type = 'income' AND category = 'Sales' AND date >= ?").get(today) as any;

    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthlySales = db.prepare("SELECT SUM(quantity) as total FROM transactions WHERE type = 'income' AND category = 'Sales' AND date >= ?").get(monthStartStr) as any;

    // Sales by Source (POS vs Delivery)
    const salesBySource = db.prepare(`
      SELECT source, SUM(amount) as total 
      FROM transactions 
      WHERE type = 'income' AND category = 'Sales' AND date >= ?
      GROUP BY source
    `).all(today);

    res.json({
      totalIncome: income?.total || 0,
      totalExpense: expense?.total || 0,
      dailySalesCount: dailySales?.total || 0,
      dailyIncome: dailySales?.income || 0,
      monthlySalesCount: monthlySales?.total || 0,
      salesBySource,
      recentTransactions,
      lowStock
    });
  });

  app.get("/api/reports/financial", authenticateToken, isAdmin, (req, res) => {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no range provided
    const end = endDate ? (endDate as string) : new Date().toISOString().split('T')[0];
    const start = startDate ? (startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Summary Stats
    const summary = {
      daily: db.prepare(`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions 
        WHERE date >= date('now', 'localtime', 'start of day')
      `).get() as any,
      weekly: db.prepare(`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions 
        WHERE date >= date('now', 'localtime', '-7 days')
      `).get() as any,
      monthly: db.prepare(`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions 
        WHERE date >= date('now', 'localtime', 'start of month')
      `).get() as any
    };

    // Income vs Expense by Day (for chart)
    const dailyData = db.prepare(`
      SELECT 
        strftime('%Y-%m-%d', date) as date,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions 
      WHERE date >= ? AND date <= ?
      GROUP BY strftime('%Y-%m-%d', date)
      ORDER BY date ASC
    `).all(start, end);

    // Expense by Category
    const expenseByCategory = db.prepare(`
      SELECT 
        category,
        SUM(amount) as amount
      FROM transactions 
      WHERE type = 'expense' AND date >= ? AND date <= ?
      GROUP BY category
      ORDER BY amount DESC
    `).all(start, end);

    // Income by Category
    const incomeByCategory = db.prepare(`
      SELECT 
        category,
        SUM(amount) as amount
      FROM transactions 
      WHERE type = 'income' AND date >= ? AND date <= ?
      GROUP BY category
      ORDER BY amount DESC
    `).all(start, end);

    res.json({
      summary,
      dailyData,
      expenseByCategory,
      incomeByCategory
    });
  });

  app.get("/api/reports/consignment", authenticateToken, isAdmin, (req, res) => {
    const { startDate, endDate } = req.query;
    const end = endDate ? (endDate as string) : new Date().toISOString().split('T')[0];
    const start = startDate ? (startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const reports = db.prepare(`
        SELECT 
          m.supplier_name,
          m.name as menu_name,
          m.supplier_price,
          m.price as selling_price,
          SUM(t.quantity) as total_quantity,
          SUM(t.amount) as total_sales,
          SUM(t.quantity * m.supplier_price) as total_settlement,
          SUM(t.amount - (t.quantity * m.supplier_price)) as total_profit
        FROM transactions t
        JOIN menus m ON t.menu_id = m.id
        WHERE m.type = 'Consignment' 
          AND t.type = 'income' 
          AND t.status = 'completed'
          AND t.date >= ? AND t.date <= ?
        GROUP BY m.supplier_name, m.id
        ORDER BY m.supplier_name ASC
      `).all(start, end);

      res.json(reports);
    } catch (error) {
      console.error("Consignment report error:", error);
      res.status(500).json({ error: "Gagal memuat laporan titipan" });
    }
  });

  app.get("/api/reports/consignment", authenticateToken, isAdmin, (req, res) => {
    const { startDate, endDate } = req.query;
    const end = endDate ? (endDate as string) : new Date().toISOString().split('T')[0];
    const start = startDate ? (startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const reports = db.prepare(`
        SELECT 
          m.supplier_name,
          m.name as menu_name,
          m.supplier_price,
          m.price as selling_price,
          SUM(t.quantity) as total_quantity,
          SUM(t.amount) as total_sales,
          SUM(t.quantity * m.supplier_price) as total_settlement,
          SUM(t.amount - (t.quantity * m.supplier_price)) as total_profit
        FROM transactions t
        JOIN menus m ON t.menu_id = m.id
        WHERE m.type = 'Consignment' 
          AND t.type = 'income' 
          AND t.status = 'completed'
          AND t.date >= ? AND t.date <= ?
        GROUP BY m.supplier_name, m.id
        ORDER BY m.supplier_name ASC
      `).all(start, end);

      res.json(reports);
    } catch (error) {
      console.error("Consignment report error:", error);
      res.status(500).json({ error: "Gagal memuat laporan titipan" });
    }
  });

  app.get("/api/reports/export-all", authenticateToken, isAdmin, async (req, res) => {
    try {
      const workbook = new ExcelJS.Workbook();
      
      // 1. Transactions Sheet
      const transactionsSheet = workbook.addWorksheet('Transaksi');
      transactionsSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Tanggal', key: 'date', width: 20 },
        { header: 'Tipe', key: 'type', width: 15 },
        { header: 'Kategori', key: 'category', width: 20 },
        { header: 'Jumlah', key: 'amount', width: 15 },
        { header: 'Deskripsi', key: 'description', width: 30 },
        { header: 'Pelanggan', key: 'customer_name', width: 20 },
        { header: 'Metode Pembayaran', key: 'payment_method', width: 20 },
        { header: 'Order ID', key: 'order_id', width: 15 },
        { header: 'Sumber', key: 'source', width: 10 }
      ];
      const transactions = db.prepare("SELECT * FROM transactions ORDER BY date DESC").all();
      transactionsSheet.addRows(transactions);

      // 2. Inventory Sheet
      const inventorySheet = workbook.addWorksheet('Inventaris');
      inventorySheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nama', key: 'name', width: 25 },
        { header: 'Stok', key: 'quantity', width: 15 },
        { header: 'Satuan', key: 'unit', width: 10 },
        { header: 'Kategori', key: 'category', width: 15 },
        { header: 'Harga Satuan', key: 'unit_price', width: 15 },
        { header: 'Min. Stok', key: 'min_stock', width: 15 }
      ];
      const inventory = db.prepare("SELECT * FROM inventory").all();
      inventorySheet.addRows(inventory);

      // 3. Menu Sheet
      const menuSheet = workbook.addWorksheet('Menu');
      menuSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nama', key: 'name', width: 25 },
        { header: 'Harga', key: 'price', width: 15 },
        { header: 'Ukuran', key: 'size', width: 10 },
        { header: 'Kategori', key: 'category', width: 15 },
        { header: 'Deskripsi', key: 'description', width: 30 }
      ];
      const menus = db.prepare("SELECT * FROM menus").all();
      menuSheet.addRows(menus);

      // 4. Customers Sheet
      const customersSheet = workbook.addWorksheet('Pelanggan');
      customersSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nama', key: 'name', width: 25 },
        { header: 'Telepon', key: 'phone', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Poin', key: 'points', width: 10 },
        { header: 'Level', key: 'level', width: 15 },
        { header: 'Total Belanja', key: 'total_spent', width: 15 },
        { header: 'Terakhir Berkunjung', key: 'last_visit', width: 20 }
      ];
      const customers = db.prepare("SELECT * FROM customers").all();
      customersSheet.addRows(customers);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Lengkap.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Gagal mengexport laporan" });
    }
  });

  // User Management API
  app.get("/api/users", authenticateToken, isAdmin, (req, res) => {
    const users = db.prepare("SELECT id, username, email, role FROM users").all();
    res.json(users);
  });

  app.post("/api/users", authenticateToken, isAdmin, (req, res) => {
    const { username, password, email, role } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)").run(username, hashedPassword, email, role);
      res.json({ id: result.lastInsertRowid });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: "Username sudah digunakan" });
      } else {
        res.status(500).json({ error: "Gagal menambahkan user" });
      }
    }
  });

  app.put("/api/users/:id", authenticateToken, isAdmin, (req, res) => {
    const { username, password, email, role } = req.body;
    const id = req.params.id;
    try {
      if (password) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.prepare("UPDATE users SET username = ?, password = ?, email = ?, role = ? WHERE id = ?").run(username, hashedPassword, email, role, id);
      } else {
        db.prepare("UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?").run(username, email, role, id);
      }
      res.json({ success: true });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: "Username sudah digunakan" });
      } else {
        res.status(500).json({ error: "Gagal memperbarui user" });
      }
    }
  });

  app.delete("/api/users/:id", authenticateToken, isAdmin, (req, res) => {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/change-password", authenticateToken, (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
    if (user && bcrypt.compareSync(oldPassword, user.password)) {
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, userId);
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Password lama salah" });
    }
  });

  // Settings APIs
  app.get("/api/settings/public", (req, res) => {
    const publicKeys = [
      "app_name",
      "app_icon",
      "app_logo_url",
      "login_bg",
      "login_bg_image",
      "login_title",
      "login_subtitle",
      "primary_color",
      "language",
      "main_bg",
      "main_bg_image"
    ];
    const settings = db.prepare("SELECT * FROM settings WHERE key IN (" + publicKeys.map(() => "?").join(",") + ")").all(publicKeys) as any[];
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  // Advertisements API
  app.get("/api/public/ads", (req, res) => {
    const ads = db.prepare("SELECT * FROM advertisements WHERE active = 1 ORDER BY created_at DESC").all();
    res.json(ads);
  });

  app.get("/api/ads", authenticateToken, (req, res) => {
    const ads = db.prepare("SELECT * FROM advertisements ORDER BY created_at DESC").all();
    res.json(ads);
  });

  app.post("/api/ads", authenticateToken, (req, res) => {
    const { type, url, title, subtitle, active } = req.body;
    const result = db.prepare("INSERT INTO advertisements (type, url, title, subtitle, active) VALUES (?, ?, ?, ?, ?)")
      .run(type, url, title, subtitle, active ? 1 : 0);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/ads/:id", authenticateToken, (req, res) => {
    const { type, url, title, subtitle, active } = req.body;
    db.prepare("UPDATE advertisements SET type = ?, url = ?, title = ?, subtitle = ?, active = ? WHERE id = ?")
      .run(type, url, title, subtitle, active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/ads/:id", authenticateToken, (req, res) => {
    db.prepare("DELETE FROM advertisements WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Promos API
  app.get("/api/promos", authenticateToken, (req, res) => {
    const promos = db.prepare("SELECT * FROM promos ORDER BY created_at DESC").all() as any[];
    const parsedPromos = promos.map(p => ({
      ...p,
      target_ids: JSON.parse(p.target_ids || '[]')
    }));
    res.json(parsedPromos);
  });

  app.post("/api/promos", authenticateToken, (req, res) => {
    const { code, discount_type, discount_value, target_type, target_ids, active } = req.body;
    try {
      const result = db.prepare("INSERT INTO promos (code, discount_type, discount_value, target_type, target_ids, active) VALUES (?, ?, ?, ?, ?, ?)")
        .run(code, discount_type, discount_value, target_type, JSON.stringify(target_ids), active ? 1 : 0);
      res.json({ id: result.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Kode promo sudah ada" });
    }
  });

  app.put("/api/promos/:id", authenticateToken, (req, res) => {
    const { code, discount_type, discount_value, target_type, target_ids, active } = req.body;
    db.prepare("UPDATE promos SET code = ?, discount_type = ?, discount_value = ?, target_type = ?, target_ids = ?, active = ? WHERE id = ?")
      .run(code, discount_type, discount_value, target_type, JSON.stringify(target_ids), active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/promos/:id", authenticateToken, (req, res) => {
    db.prepare("DELETE FROM promos WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/public/promos/:code", (req, res) => {
    const promo = db.prepare("SELECT * FROM promos WHERE code = ? AND active = 1").get(req.params.code) as any;
    if (!promo) {
      return res.status(404).json({ error: "Kode promo tidak valid atau sudah tidak aktif" });
    }
    promo.target_ids = JSON.parse(promo.target_ids || '[]');
    res.json(promo);
  });

  app.get("/api/settings", authenticateToken, (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all() as any[];
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.post("/api/settings/test-email", authenticateToken, isAdmin, async (req, res) => {
    const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from, test_to } = req.body;
    if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass || !smtp_from || !test_to) {
      return res.status(400).json({ error: "Semua parameter SMTP dan email tujuan harus diisi" });
    }
    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: parseInt(smtp_port),
      secure: smtp_port === "465",
      auth: { user: smtp_user, pass: smtp_pass },
    });
    try {
      await transporter.sendMail({
        from: smtp_from,
        to: test_to,
        subject: "Test Email dari MOPI POS",
        text: "Ini adalah email percobaan untuk memverifikasi pengaturan SMTP Anda.",
        html: "<b>Ini adalah email percobaan</b> untuk memverifikasi pengaturan SMTP Anda.",
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) return res.status(404).json({ error: "Email tidak ditemukan" });

    const settings = db.prepare("SELECT * FROM settings WHERE key LIKE 'smtp_%'").all() as any[];
    const smtp = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    if (!smtp.smtp_host || !smtp.smtp_user || !smtp.smtp_pass) {
      return res.status(500).json({ error: "Sistem email belum dikonfigurasi oleh admin" });
    }

    const transporter = nodemailer.createTransport({
      host: smtp.smtp_host,
      port: parseInt(smtp.smtp_port),
      secure: smtp.smtp_port === "465",
      auth: { user: smtp.smtp_user, pass: smtp.smtp_pass },
    });

    try {
      await transporter.sendMail({
        from: smtp.smtp_from,
        to: email,
        subject: "Reset Password MOPI POS",
        text: `Halo ${user.username}, Password Anda saat ini adalah: ${user.password}.`,
        html: `<p>Halo <b>${user.username}</b>,</p><p>Password Anda saat ini adalah: <b>${user.password}</b>.</p>`,
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Gagal mengirim email: " + error.message });
    }
  });

  // Backup & Restore API
  app.get("/api/backup/database", authenticateToken, isAdmin, (req, res) => {
    try {
      const tables = ['users', 'settings', 'inventory', 'transactions', 'menus', 'menu_ingredients', 'customers', 'advertisements', 'promos'];
      const backup: any = {};
      
      for (const table of tables) {
        backup[table] = db.prepare(`SELECT * FROM ${table}`).all();
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=database_backup_${Date.now()}.json`);
      res.json(backup);
    } catch (error: any) {
      res.status(500).json({ error: "Gagal membuat backup database: " + error.message });
    }
  });

  app.get("/api/backup/settings", authenticateToken, isAdmin, (req, res) => {
    try {
      const settings = db.prepare("SELECT * FROM settings").all();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=settings_backup_${Date.now()}.json`);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: "Gagal membuat backup pengaturan: " + error.message });
    }
  });

  app.post("/api/backup/restore-database", authenticateToken, isAdmin, upload.single('file'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });
    
    try {
      const backupData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
      const tables = ['users', 'settings', 'inventory', 'transactions', 'menus', 'menu_ingredients', 'customers', 'advertisements', 'promos'];
      
      // Disable foreign keys during restore to avoid constraint issues
      db.prepare("PRAGMA foreign_keys = OFF").run();
      
      try {
        const transaction = db.transaction(() => {
          for (const table of tables) {
            if (backupData[table]) {
              db.prepare(`DELETE FROM ${table}`).run();
              if (backupData[table].length > 0) {
                const columns = Object.keys(backupData[table][0]);
                const placeholders = columns.map(() => '?').join(',');
                const insert = db.prepare(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`);
                
                for (const row of backupData[table]) {
                  const values = columns.map(col => row[col]);
                  insert.run(...values);
                }
              }
            }
          }
        });
        
        transaction();
      } finally {
        // Re-enable foreign keys
        db.prepare("PRAGMA foreign_keys = ON").run();
      }
      
      fs.unlinkSync(req.file.path);
      res.json({ success: true, message: "Database berhasil direstore" });
    } catch (error: any) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: "Gagal merestore database: " + error.message });
    }
  });

  app.post("/api/backup/restore-settings", authenticateToken, isAdmin, upload.single('file'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });
    
    try {
      const backupData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
      
      const transaction = db.transaction(() => {
        db.prepare("DELETE FROM settings").run();
        const insert = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
        for (const row of backupData) {
          insert.run(row.key, row.value);
        }
      });
      
      transaction();
      fs.unlinkSync(req.file.path);
      res.json({ success: true, message: "Pengaturan berhasil direstore" });
    } catch (error: any) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: "Gagal merestore pengaturan: " + error.message });
    }
  });

  app.put("/api/settings", authenticateToken, isAdmin, (req, res) => {
    const updates = req.body;
    const transaction = db.transaction(() => {
      const upsert = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
      for (const [key, value] of Object.entries(updates)) {
        upsert.run(key, value);
      }
    });
    transaction();
    res.json({ success: true });
  });

  app.post("/api/settings/reset-order-id", authenticateToken, isAdmin, (req, res) => {
    db.prepare("UPDATE settings SET value = '1' WHERE key = 'order_counter'").run();
    res.json({ success: true });
  });

  app.post("/api/settings/reset-theme", authenticateToken, isAdmin, (req, res) => {
    const defaultTheme = {
      login_bg: '#f5f5f0',
      login_bg_image: '',
      login_title: 'Coffee POS',
      login_subtitle: 'Silakan masuk ke akun Anda',
      main_bg: '#fdfaf7',
      main_bg_image: '',
      primary_color: '#9a684a',
      app_logo_url: ''
    };
    
    const updateSetting = db.prepare("UPDATE settings SET value = ? WHERE key = ?");
    for (const [key, value] of Object.entries(defaultTheme)) {
      updateSetting.run(value, key);
    }
    res.json({ success: true });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`----------------------------------------------`);
    console.log(`🚀 Server is LIVE at http://0.0.0.0:${PORT}`);
    console.log(`📂 Database: data/database.db`);
    console.log(`🖼️ Uploads: uploads/`);
    console.log(`----------------------------------------------`);
  });
}

startServer().catch(err => {
  console.error("CRITICAL ERROR: Failed to start server:", err);
  process.exit(1);
});
