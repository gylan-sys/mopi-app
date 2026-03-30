import React, { useState, useEffect, useRef } from 'react';
import chroma from 'chroma-js';
import { io } from 'socket.io-client';
import { 
  LayoutDashboard, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Trash2, 
  Edit,
  AlertCircle,
  Coffee,
  TrendingUp,
  Wallet,
  Calendar,
  UtensilsCrossed,
  ShoppingCart,
  Info,
  LogOut,
  User,
  Lock,
  Check,
  ArrowRight,
  Printer,
  CreditCard,
  Settings,
  Palette,
  Bell,
  Type as TypeIcon,
  Image as ImageIcon,
  Clock,
  RefreshCw,
  Download,
  Upload,
  Database,
  MoreHorizontal,
  Menu as MenuIcon,
  ChevronRight,
  Search,
  ClipboardList,
  Truck,
  Milk,
  Utensils,
  Cookie,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
  X,
  Camera,
  Maximize,
  Minimize,
  Keyboard,
  Tag,
  Play,
  Pause,
  Monitor,
  Gift,
  ArrowLeft,
  Minus,
  CheckCircle2,
  FileText,
  Smartphone,
  ShoppingBag,
  Store,
  Globe,
  Star,
  Hash,
  Users,
  Sun,
  Moon,
  FileDown,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Toaster, toast } from 'sonner';
import { cn } from './types';
import type { InventoryItem, Transaction, DashboardStats, Menu, UserAccount, Customer } from './types';
import Sidebar from './components/Sidebar';
import { translations } from './translations';

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const formatDate = (date: Date | string | number, formatStr: string) => {
  return format(new Date(date), formatStr, { locale: id });
};

const isMenuAvailable = (menu: Menu) => {
  if (!menu.ingredients || menu.ingredients.length === 0) return true;
  return menu.ingredients.every(ing => (ing.current_stock || 0) >= ing.quantity);
};

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info';
  time: string;
}

const AdCarousel = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/public/ads');
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setAds(data);
          } else {
            // Fallback if no ads in DB
            setAds([
              { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1000', title: 'Kopi Pagi Nikmat', subtitle: 'Diskon 20% untuk pembelian sebelum jam 10 pagi' },
              { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1000', title: 'Camilan Sore', subtitle: 'Beli 2 gratis 1 untuk semua jenis pastry' }
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching ads:', error);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  return (
    <div className="relative w-full h-full overflow-hidden bg-coffee-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {currentAd.type === 'video' ? (
            <video 
              src={currentAd.url} 
              autoPlay 
              muted 
              loop 
              playsInline
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <img 
              src={currentAd.url} 
              alt={currentAd.title}
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-coffee-950 via-transparent to-transparent" />
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-4xl font-serif font-bold mb-4"
            >
              {currentAd.title}
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-xl text-coffee-200"
            >
              {currentAd.subtitle}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute bottom-6 left-12 flex gap-2">
        {ads.map((_, idx) => (
          <div 
            key={idx}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              idx === currentIndex ? "w-8 bg-white" : "w-2 bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<{ id: number, username: string, role: 'admin' | 'cashier' } | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Berhasil mengekspor ${data.length} baris ke CSV`);
  };

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  const t = (key: string) => {
    const lang = (appSettings.language || 'id') as 'id' | 'en';
    return (translations[lang] as any)[key] || key;
  };

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'transactions' | 'menu' | 'orders' | 'reports' | 'users' | 'settings' | 'queue' | 'loyalty'>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
  const [tableNumber, setTableNumber] = useState('');
  const [reportSubTab, setReportSubTab] = useState<'transactions' | 'financial' | 'consignment'>('transactions');
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS'>('Cash');
  const [customerName, setCustomerName] = useState('');
  const [posNotes, setPosNotes] = useState('');
  const [cashReceived, setCashReceived] = useState<number | string>('');
  const [appSettings, setAppSettings] = useState({
    app_name: 'MOPI',
    app_icon: 'Coffee',
    app_logo_url: '',
    customer_page_title: 'MOPI',
    customer_page_subtitle: 'Menu Pelanggan',
    login_bg: '#f5f5f0',
    login_bg_image: '',
    login_title: 'Coffee POS',
    login_subtitle: 'Silakan masuk ke akun Anda',
    main_bg: '#fdfaf7',
    main_bg_image: '',
    primary_color: '#9a684a',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
    payment_qris_url: '',
    payment_dana_url: '',
    payment_ovo_url: '',
    payment_shopeepay_url: '',
    payment_instructions: 'Silakan scan QRIS atau transfer ke nomor yang tertera.',
    payment_webhook_secret: '',
    receipt_name: 'COFFEE SHOP',
    receipt_address: 'Jl. Kopi Nikmat No. 123, Jakarta',
    receipt_phone: '0812-3456-7890',
    receipt_footer: 'Terima kasih atas kunjungan Anda!',
    receipt_contact: 'Kritik & Saran: coffee@example.com / WA: 0812-3456-7890',
    tax_rate: 10,
    timezone: 'Asia/Jakarta',
    language: 'id'
  });
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'theme' | 'email' | 'payment' | 'delivery' | 'webhook' | 'receipt' | 'shortcuts' | 'backup'>('general');
  const [testEmailTo, setTestEmailTo] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [cart, setCart] = useState<{ menu: Menu, quantity: number, sugarLevel?: string, iceLevel?: string }[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    document.title = appSettings.app_name || 'Coffee POS';
    
    // Update favicon dynamically
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = appSettings.app_logo_url || '/favicon.ico';
  }, [appSettings.app_name, appSettings.app_logo_url]);

  const [financialData, setFinancialData] = useState<any>(null);
  const [financialRange, setFinancialRange] = useState({
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const [consignmentData, setConsignmentData] = useState<any[]>([]);

  const fetchFinancialData = async () => {
    if (!user || user.role !== 'admin') return;
    try {
      const params = new URLSearchParams(financialRange);
      const res = await fetch(`/api/reports/financial?${params.toString()}`);
      if (res.ok) {
        setFinancialData(await res.json());
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    }
  };

  const fetchConsignmentData = async () => {
    if (!user || user.role !== 'admin') return;
    try {
      const params = new URLSearchParams(financialRange);
      const res = await fetch(`/api/reports/consignment?${params.toString()}`);
      if (res.ok) {
        setConsignmentData(await res.json());
      }
    } catch (error) {
      console.error('Error fetching consignment data:', error);
    }
  };

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/ads', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAds(data);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  };

  const fetchPromos = async () => {
    try {
      const response = await fetch('/api/promos', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPromos(data);
      }
    } catch (error) {
      console.error('Error fetching promos:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchAds();
      fetchPromos();
    }
    if (activeTab === 'reports') {
      if (reportSubTab === 'financial') {
        fetchFinancialData();
      } else if (reportSubTab === 'consignment') {
        fetchConsignmentData();
      }
    }
  }, [activeTab, reportSubTab, financialRange]);

  const [isCustomerMode, setIsCustomerMode] = useState(true);
  const [ads, setAds] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [activePromo, setActivePromo] = useState<any>(null);
  const [promoCode, setPromoCode] = useState('');
  const [showAdModal, setShowAdModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [newAd, setNewAd] = useState({ type: 'image', url: '', title: '', subtitle: '', active: true });
  const [newPromo, setNewPromo] = useState({ code: '', discount_type: 'percentage', discount_value: 0, target_type: 'all', target_ids: [], active: true });
  const [customerOrder, setCustomerOrder] = useState({ name: '', table: '', paymentMethod: 'Cash', notes: '' });
  const [lastCustomerOrder, setLastCustomerOrder] = useState<any>(null);
  const [showCustomerOrderSuccess, setShowCustomerOrderSuccess] = useState(false);
  const [showQRISModal, setShowQRISModal] = useState(false);
  const [customerOrderId, setCustomerOrderId] = useState('');
  const [showCustomerOrderStatus, setShowCustomerOrderStatus] = useState(false);
  const [customerOrderHistory, setCustomerOrderHistory] = useState<any[]>([]);
  const [customerHistoryTab, setCustomerHistoryTab] = useState<'active' | 'history'>('active');
  const [customerActiveOrders, setCustomerActiveOrders] = useState<any[]>([]);

  // Forms
  const [showInvModal, setShowInvModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [editingInvId, setEditingInvId] = useState<number | null>(null);
  
  const [newInv, setNewInv] = useState({ name: '', quantity: 0, unit: 'pcs', min_stock: 0, unit_price: 0, category: 'Bahan', type: 'Bahan' as 'Bahan' | 'Barang' });
  const [invCategoryFilter, setInvCategoryFilter] = useState<string>('Semua');
  const [newTx, setNewTx] = useState({ type: 'income' as 'income' | 'expense', category: 'Sales', amount: 0, description: '' });
  const [newMenu, setNewMenu] = useState({ 
    name: '', 
    price: 0, 
    size: '',
    category: 'Kopi',
    image_url: '',
    description: '', 
    type: 'Internal' as 'Internal' | 'Consignment',
    supplier_name: '',
    supplier_price: 0,
    ingredients: [] as { inventory_id: number, quantity: number }[] 
  });
  const [confirmUpdate, setConfirmUpdate] = useState<{ id: number, name: string, currentQty: number, delta: number } | null>(null);
  const [dbRestoreFile, setDbRestoreFile] = useState<File | null>(null);
  const [settingsRestoreFile, setSettingsRestoreFile] = useState<File | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseData, setPurchaseData] = useState<{ id: number, name: string, unit: string, quantity: number, totalPrice: number } | null>(null);
  const [txFilter, setTxFilter] = useState({ type: '', category: '' });
  const [txSearch, setTxSearch] = useState('');
  const [calcPurchase, setCalcPurchase] = useState({ qty: 1, content: 0, totalPrice: 0 });
  const [showCalculator, setShowCalculator] = useState(false);
  const [reportFilter, setReportFilter] = useState<'daily' | 'monthly'>('daily');
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [orderView, setOrderView] = useState<'pos' | 'history'>('pos');
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showOrderReview, setShowOrderReview] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [lastOrder, setLastOrder] = useState<{
    orderId?: string,
    items: { menu: Menu, quantity: number }[],
    total: number,
    paymentMethod: string,
    customerName?: string,
    date: string
  } | null>(null);

  useEffect(() => {
    socketRef.current = io();
    
    socketRef.current.on('PAYMENT_SUCCESS', (data: any) => {
      if (showOrderReview) {
        handleProcessOrder();
      }
    });

    socketRef.current.on('ORDER_UPDATED', () => {
      fetchActiveOrders();
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [showOrderReview]);

  useEffect(() => {
    if (showOrderReview && !currentOrderId) {
      const newId = `ORD-${Date.now()}`;
      setCurrentOrderId(newId);
      if (socketRef.current) socketRef.current.emit('join_order', newId);
    } else if (!showOrderReview) {
      setCurrentOrderId(null);
    }
  }, [showOrderReview]);

  // User Management States
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newUserData, setNewUserData] = useState({ username: '', password: '', email: '', role: 'cashier' as 'admin' | 'cashier' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [reportDate, setReportDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'));

  const fetchPublicSettings = async () => {
    try {
      const res = await fetch('/api/settings/public');
      if (res.ok) {
        const settingsData = await res.json();
        if (settingsData) setAppSettings(prev => ({ ...prev, ...settingsData }));
      }
    } catch (error) {
      console.error('Error fetching public settings:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      await fetchPublicSettings(); // Fetch public settings regardless of auth
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          if (userData.role === 'cashier') {
            setActiveTab('orders');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    // Update CSS variables for theme
    const root = document.documentElement;
    const color = appSettings.primary_color;
    const defaultColor = '#9a684a';
    
    // If it's the default color, remove overrides to use original hand-picked coffee theme
    if (color.toLowerCase() === defaultColor.toLowerCase()) {
      [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].forEach(n => {
        root.style.removeProperty(`--primary-${n}`);
      });
      return;
    }

    try {
      root.style.setProperty('--primary-50', chroma(color).brighten(2.5).hex());
      root.style.setProperty('--primary-100', chroma(color).brighten(2).hex());
      root.style.setProperty('--primary-200', chroma(color).brighten(1.5).hex());
      root.style.setProperty('--primary-300', chroma(color).brighten(1).hex());
      root.style.setProperty('--primary-400', chroma(color).brighten(0.5).hex());
      root.style.setProperty('--primary-500', color);
      root.style.setProperty('--primary-600', chroma(color).darken(0.5).hex());
      root.style.setProperty('--primary-700', chroma(color).darken(1).hex());
      root.style.setProperty('--primary-800', chroma(color).darken(1.5).hex());
      root.style.setProperty('--primary-900', chroma(color).darken(2).hex());
      root.style.setProperty('--primary-950', chroma(color).darken(2.5).hex());
    } catch (e) {
      console.error('Invalid color for theme');
    }
  }, [appSettings.primary_color]);

  const fetchActiveOrders = async () => {
    try {
      const res = await fetch('/api/active-orders');
      if (res.ok) setActiveOrders(await res.json());
    } catch (error) {
      console.error('Error fetching active orders:', error);
    }
  };

  const fetchCustomerActiveOrders = async () => {
    try {
      const res = await fetch('/api/active-orders/public');
      if (res.ok) setCustomerActiveOrders(await res.json());
    } catch (error) {
      console.error('Error fetching customer active orders:', error);
    }
  };

  useEffect(() => {
    if (showCustomerOrderStatus) {
      fetchCustomerActiveOrders();
      const interval = setInterval(fetchCustomerActiveOrders, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [showCustomerOrderStatus]);

  useEffect(() => {
    if (socketRef.current) {
      const handleOrderUpdate = () => {
        fetchActiveOrders();
        if (isCustomerMode) {
          fetchCustomerActiveOrders();
          if (customerOrder.name) fetchCustomerHistory(customerOrder.name);
          toast.info("Ada pembaruan pada pesanan!", {
            position: "bottom-right",
            duration: 3000
          });
        }
      };
      socketRef.current.on('ORDER_UPDATED', handleOrderUpdate);
      return () => {
        socketRef.current?.off('ORDER_UPDATED', handleOrderUpdate);
      };
    }
  }, [isCustomerMode, customerOrder.name]);

  const fetchData = async (filters = txFilter) => {
    if (!user) return;
    setLoading(true);
    try {
      const txParams = new URLSearchParams();
      if (filters.type) txParams.append('type', filters.type);
      if (filters.category) txParams.append('category', filters.category);

      const isAdmin = user.role === 'admin';

      const [statsRes, invRes, txRes, menuRes, usersRes, settingsRes, custRes] = await Promise.all([
        isAdmin ? fetch('/api/stats') : Promise.resolve({ ok: false, status: 403, json: () => Promise.resolve(null) } as any),
        fetch('/api/inventory'),
        isAdmin ? fetch(`/api/transactions?${txParams.toString()}`) : Promise.resolve({ ok: false, status: 403, json: () => Promise.resolve([]) } as any),
        fetch('/api/menus'),
        isAdmin ? fetch('/api/users') : Promise.resolve({ ok: false, status: 403, json: () => Promise.resolve([]) } as any),
        fetch('/api/settings'),
        fetch('/api/customers')
      ]);

      // Only logout on 401 (Unauthorized)
      if (statsRes.status === 401 || invRes.status === 401 || menuRes.status === 401 || settingsRes.status === 401 || custRes.status === 401) {
        setUser(null);
        return;
      }

      if (statsRes.ok) setStats(await statsRes.json());
      if (invRes.ok) setInventory(await invRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
      if (menuRes.ok) setMenus(await menuRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData) setAppSettings(prev => ({ ...prev, ...settingsData }));
      }
      fetchActiveOrders();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    if (!user) return;

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password berhasil diubah');
        setShowPasswordModal(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Gagal mengubah password');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingUserId ? `/api/users/${editingUserId}` : '/api/users';
    const method = editingUserId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
      });
      const data = await res.json();
      if (res.ok) {
        setShowUserModal(false);
        setEditingUserId(null);
        setNewUserData({ username: '', password: '', email: '', role: 'cashier' });
        fetchData();
      } else {
        toast.error(data.error || 'Gagal menyimpan user');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Email reset password telah dikirim. Silakan cek inbox Anda.');
        setShowResetModal(false);
        setResetEmail('');
      } else {
        toast.error(data.error || 'Gagal mereset password');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghubungi server');
    }
  };

  const handleUpdateSettings = async (updates: any, silent = false) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setAppSettings(prev => ({ ...prev, ...updates }));
        if (!silent) toast.success(t('save_settings') + ' ' + (appSettings.language === 'id' ? 'berhasil' : 'successful'));
      }
    } catch (error) {
      toast.error(t('save_settings') + ' ' + (appSettings.language === 'id' ? 'gagal' : 'failed'));
    }
  };

  const handleResetOrderId = async () => {
    if (!confirm(t('reset_order_id_desc'))) return;
    try {
      const res = await fetch('/api/settings/reset-order-id', { method: 'POST' });
      if (res.ok) {
        toast.success(t('reset_order_id') + ' ' + (appSettings.language === 'id' ? 'berhasil direset' : 'successfully reset'));
      }
    } catch (error) {
      toast.error(t('reset_order_id') + ' ' + (appSettings.language === 'id' ? 'gagal direset' : 'failed to reset'));
    }
  };

  const handleResetTheme = async () => {
    if (!confirm('Apakah Anda yakin ingin mereset tema ke pengaturan awal?')) return;
    try {
      const res = await fetch('/api/settings/reset-theme', { method: 'POST' });
      if (res.ok) {
        await fetchData();
        toast.success('Tema berhasil direset ke pengaturan awal');
      }
    } catch (error) {
      toast.error('Gagal mereset tema');
    }
  };

  const handleBackup = async (type: 'database' | 'settings') => {
    try {
      const res = await fetch(`/api/backup/${type}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success(t('backup') + ' ' + (appSettings.language === 'id' ? 'berhasil' : 'successful'));
      }
    } catch (error) {
      toast.error(t('backup') + ' ' + (appSettings.language === 'id' ? 'gagal' : 'failed'));
    }
  };

  const handleRestore = async (type: 'database' | 'settings', file: File) => {
    if (!confirm(t('confirm_restore') + file.name + '? ' + t('restore_warning'))) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(`/api/backup/restore-${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        if (type === 'database') setDbRestoreFile(null);
        if (type === 'settings') setSettingsRestoreFile(null);
        
        if (type === 'settings') {
          window.location.reload();
        } else {
          fetchData();
        }
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Gagal merestore data');
    }
  };

  const handleExportAllReports = async () => {
    try {
      const res = await fetch('/api/reports/export-all');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laporan_Lengkap_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success(appSettings.language === 'id' ? 'Laporan berhasil diexport' : 'Reports exported successfully');
      }
    } catch (error) {
      toast.error('Gagal mengexport laporan');
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Gagal mengunggah file');
      return null;
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailTo) {
      toast.warning('Masukkan email tujuan test');
      return;
    }
    setIsTestingEmail(true);
    try {
      const res = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp_host: appSettings.smtp_host,
          smtp_port: appSettings.smtp_port,
          smtp_user: appSettings.smtp_user,
          smtp_pass: appSettings.smtp_pass,
          smtp_from: appSettings.smtp_from,
          test_to: testEmailTo
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Email test berhasil dikirim! Silakan cek inbox Anda.');
      } else {
        toast.error('Gagal mengirim email test: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghubungi server');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (user?.id === id) {
      toast.error('Tidak bisa menghapus akun sendiri');
      return;
    }
    if (confirm('Hapus user ini?')) {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCustomerId ? `/api/customers/${editingCustomerId}` : '/api/customers';
    const method = editingCustomerId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });
      if (res.ok) {
        setShowCustomerModal(false);
        setEditingCustomerId(null);
        setNewCustomer({ name: '', phone: '', email: '' });
        fetchData();
        toast.success(editingCustomerId ? 'Customer berhasil diperbarui' : 'Customer berhasil ditambah');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal menyimpan customer');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (confirm('Hapus customer ini?')) {
      try {
        const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchData();
          toast.success('Customer berhasil dihapus');
        }
      } catch (err) {
        toast.error('Gagal menghapus customer');
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (isCustomerMode && !user) {
      const fetchPublicMenus = async () => {
        try {
          const res = await fetch('/api/menus/public');
          if (res.ok) setMenus(await res.json());
        } catch (err) {
          console.error('Failed to fetch public menus');
        }
      };
      fetchPublicMenus();
    }
  }, [isCustomerMode, user]);

  useEffect(() => {
    if (user && activeTab === 'transactions') {
      fetchData();
    }
  }, [txFilter, user]);

  const calculateCartTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0);
    let discount = 0;
    if (activePromo) {
      if (activePromo.target_type === 'all') {
        discount = activePromo.discount_type === 'percentage' 
          ? subtotal * (activePromo.discount_value / 100)
          : activePromo.discount_value;
      } else {
        const targetSubtotal = cart.reduce((sum, item) => {
          const isTarget = activePromo.target_type === 'category' 
            ? activePromo.target_ids.includes(item.menu.category)
            : activePromo.target_ids.includes(item.menu.id.toString());
          return isTarget ? sum + (item.menu.price * item.quantity) : sum;
        }, 0);
        discount = activePromo.discount_type === 'percentage'
          ? targetSubtotal * (activePromo.discount_value / 100)
          : activePromo.discount_value;
      }
    }
    const tax = Math.round((subtotal - discount) * (appSettings.tax_rate / 100));
    return { subtotal, discount, tax, total: subtotal - discount + tax };
  };

  const handleCustomerOrder = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang masih kosong');
      return;
    }
    if (!customerOrder.name) {
      toast.error('Mohon isi nama Anda');
      return;
    }

    setLoading(true);
    try {
      const subtotal = cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0);
      let discount = 0;
      if (activePromo) {
        if (activePromo.target_type === 'all') {
          discount = activePromo.discount_type === 'percentage' 
            ? subtotal * (activePromo.discount_value / 100)
            : activePromo.discount_value;
        } else {
          const targetSubtotal = cart.reduce((sum, item) => {
            const isTarget = activePromo.target_type === 'category' 
              ? activePromo.target_ids.includes(item.menu.category)
              : activePromo.target_ids.includes(item.menu.id.toString());
            return isTarget ? sum + (item.menu.price * item.quantity) : sum;
          }, 0);
          discount = activePromo.discount_type === 'percentage'
            ? targetSubtotal * (activePromo.discount_value / 100)
            : activePromo.discount_value;
        }
      }

      const res = await fetch('/api/orders/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ menuId: item.menu.id, quantity: item.quantity })),
          customerName: customerOrder.name,
          tableNumber: customerOrder.table,
          promoCode: activePromo?.code,
          discountAmount: discount,
          paymentMethod: customerOrder.paymentMethod,
          notes: customerOrder.notes
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCustomerOrderId(data.orderId);
        setLastCustomerOrder({ ...customerOrder });
        
        if (customerOrder.paymentMethod === 'QRIS') {
          setShowQRISModal(true);
        } else {
          setShowCustomerOrderSuccess(true);
        }
        
        setCart([]);
        setCustomerOrder({ name: '', table: '', paymentMethod: 'Cash', notes: '' });
        setActivePromo(null);
        setPromoCode('');
        toast.success('Pesanan berhasil dikirim!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal mengirim pesanan');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      if (res.ok) {
        fetchActiveOrders();
        toast.success(`Orderan ${orderId} berhasil dikonfirmasi dan diselesaikan.`);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  };

  const fetchCustomerHistory = async (name: string) => {
    if (!name) return;
    try {
      const res = await fetch(`/api/public/orders/history/${encodeURIComponent(name)}`);
      if (res.ok) setCustomerOrderHistory(await res.json());
    } catch (error) {
      console.error('Error fetching customer history:', error);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      if (res.ok) {
        fetchActiveOrders();
        const newNotification: Notification = {
          id: Date.now(),
          message: `Orderan ${orderId} telah selesai diproses.`,
          type: 'success',
          time: formatDate(new Date(), 'HH:mm')
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingInvId ? `/api/inventory/${editingInvId}` : '/api/inventory';
    const method = editingInvId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInv)
    });
    setShowInvModal(false);
    setEditingInvId(null);
    setNewInv({ name: '', quantity: 0, unit: 'pcs', min_stock: 0, unit_price: 0, category: 'Bahan', type: 'Bahan' });
    setCalcPurchase({ qty: 1, content: 0, totalPrice: 0 });
    setShowCalculator(false);
    fetchData();
  };

  const handleEditInventory = (item: InventoryItem) => {
    setEditingInvId(item.id);
    setNewInv({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      min_stock: item.min_stock,
      unit_price: item.unit_price,
      category: item.category || 'Bahan',
      type: item.type || 'Bahan'
    });
    setCalcPurchase({ qty: 1, content: 0, totalPrice: 0 });
    setShowCalculator(false);
    setShowInvModal(true);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx)
    });
    setShowTxModal(false);
    setNewTx({ type: 'income', category: 'Sales', amount: 0, description: '' });
    fetchData();
  };

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMenu.ingredients.length === 0) {
      toast.warning('Tambahkan minimal satu bahan!');
      return;
    }
    
    const url = editingMenuId ? `/api/menus/${editingMenuId}` : '/api/menus';
    const method = editingMenuId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMenu)
    });
    
    setShowMenuModal(false);
    setEditingMenuId(null);
    setNewMenu({ name: '', price: 0, size: '', category: 'Kopi', image_url: '', description: '', ingredients: [], type: 'Internal', supplier_name: '', supplier_price: 0 });
    fetchData();
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenuId(menu.id);
    setNewMenu({
      name: menu.name,
      price: menu.price,
      size: menu.size || '',
      category: menu.category || 'Kopi',
      image_url: menu.image_url || '',
      description: menu.description || '',
      type: menu.type || 'Internal',
      supplier_name: menu.supplier_name || '',
      supplier_price: menu.supplier_price || 0,
      ingredients: menu.ingredients.map(ing => ({
        inventory_id: ing.inventory_id,
        quantity: ing.quantity
      }))
    });
    setShowMenuModal(true);
  };

  const handleAddToCart = (menu: Menu) => {
    setCart(prev => {
      const existing = prev.find(item => item.menu.id === menu.id);
      const newQty = existing ? existing.quantity + 1 : 1;
      
      const insufficient = menu.ingredients.filter(ing => 
        (ing.current_stock || 0) < (ing.quantity * newQty)
      );

      if (insufficient.length > 0) {
        toast.error(`Stok bahan tidak mencukupi untuk ${menu.name}:\n${insufficient.map(i => `- ${i.inventory_name} (Kurang ${((i.quantity * newQty) - (i.current_stock || 0)).toFixed(2)} ${i.unit})`).join('\n')}`);
        return prev;
      }

      if (existing) {
        return prev.map(item => 
          item.menu.id === menu.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { menu, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (menuId: number) => {
    setCart(prev => prev.filter(item => item.menu.id !== menuId));
  };

  const handleUpdateCartQuantity = (menuId: number, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.menu.id === menuId);
      if (!item) return prev;

      const newQty = Math.max(1, item.quantity + delta);
      
      if (delta > 0) {
        const insufficient = item.menu.ingredients.filter(ing => 
          (ing.current_stock || 0) < (ing.quantity * newQty)
        );

        if (insufficient.length > 0) {
          toast.error(`Stok bahan tidak mencukupi untuk menambah ${item.menu.name}:\n${insufficient.map(i => `- ${i.inventory_name} (Kurang ${((i.quantity * newQty) - (i.current_stock || 0)).toFixed(2)} ${i.unit})`).join('\n')}`);
          return prev;
        }
      }

      return prev.map(i => i.menu.id === menuId ? { ...i, quantity: newQty } : i);
    });
  };

  const handleUpdateCartOptions = (menuId: number, options: { sugarLevel?: string, iceLevel?: string }) => {
    setCart(prev => prev.map(item => 
      item.menu.id === menuId ? { ...item, ...options } : item
    ));
  };

  const handleReprint = async (orderId?: string) => {
    if (!orderId) {
      if (lastOrder) {
        setShowReceipt(true);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        // Format date to local string if it's ISO from server
        const orderSummary = {
          ...data,
          date: formatDate(new Date(data.date), 'dd MMM yyyy HH:mm')
        };
        setLastOrder(orderSummary);
        setShowReceipt(true);
        toast.success('Struk siap dicetak');
      } else {
        toast.error('Gagal mengambil data order untuk cetak ulang.');
      }
    } catch (err) {
      console.error('Reprint error:', err);
      toast.error('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessOrder = async () => {
    console.log('Processing order...', cart);
    if (!cart || cart.length === 0) {
      toast.warning('Keranjang masih kosong. Silakan pilih menu terlebih dahulu.');
      return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0);
    const tax = Math.round(subtotal * (appSettings.tax_rate / 100));
    const total = subtotal + tax;
    
    setLoading(true);
    try {
      const orderPayload = { 
        items: cart.map(item => ({ 
          menuId: item.menu.id, 
          quantity: item.quantity,
          sugarLevel: item.sugarLevel,
          iceLevel: item.iceLevel
        })),
        paymentMethod,
        customerName: customerName || 'Umum',
        orderId: currentOrderId,
        tax,
        total,
        cashReceived: paymentMethod === 'Cash' ? Number(cashReceived) : 0,
        cashier: user?.username || 'System',
        tableNumber,
        customerId: selectedCustomerId,
        notes: posNotes,
        source: 'POS'
      };
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const orderSummary = {
          orderId: currentOrderId || data.orderId,
          items: [...cart],
          subtotal,
          tax,
          total,
          paymentMethod,
          customerName: customerName || 'Umum',
          cashReceived: paymentMethod === 'Cash' ? Number(cashReceived) : 0,
          change: paymentMethod === 'Cash' ? (Number(cashReceived) - total) : 0,
          cashier: user?.username || 'System',
          notes: posNotes,
          date: formatDate(new Date(), 'dd MMM yyyy HH:mm')
        };
        
        // Add notification
        const newNotification: Notification = {
          id: Date.now(),
          message: `Pembayaran ${paymentMethod} sebesar ${formatIDR(total)} berhasil diterima dari ${customerName || 'Umum'}.`,
          type: 'success',
          time: formatDate(new Date(), 'HH:mm')
        };
        setNotifications(prev => [newNotification, ...prev]);

        setLastOrder(orderSummary);
        setCart([]);
        setCustomerName('');
        setTableNumber('');
        setPosNotes('');
        setSelectedCustomerId(null);
        setCashReceived('');
        await fetchData();
        setShowOrderReview(false);
        setShowReceipt(true);
        setActiveTab('queue');
      } else {
        const errorMsg = data.details 
          ? `${data.error}:\n- ${data.details.join('\n- ')}`
          : data.error || 'Gagal memproses orderan';
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Order error:', err);
      toast.error('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSellMenu = async (menuId: number) => {
    const res = await fetch('/api/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuId })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      fetchData();
    } else {
      const errorMsg = data.details 
        ? `${data.error}:\n- ${data.details.join('\n- ')}`
        : data.error || 'Gagal memproses penjualan';
      toast.error(errorMsg);
    }
  };

  const handleDeleteMenu = async (id: number) => {
    if (confirm('Hapus menu ini?')) {
      await fetch(`/api/menus/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleDeleteInventory = async (id: number) => {
    if (confirm('Hapus item ini?')) {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const updateStock = async (id: number, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    await fetch(`/api/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty })
    });
    fetchData();
  };

  const handlePurchaseStock = async () => {
    if (!purchaseData) return;
    try {
      const response = await fetch('/api/inventory/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryId: purchaseData.id,
          quantity: purchaseData.quantity,
          totalPrice: purchaseData.totalPrice
        })
      });
      if (response.ok) {
        setShowPurchaseModal(false);
        setPurchaseData(null);
        fetchData();
      }
    } catch (error) {
      console.error('Gagal memproses pembelian:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          setLoginError(errorData.message || `Error ${res.status}: Terjadi kesalahan`);
        } catch (e) {
          setLoginError(`Server Error (${res.status}). Silakan cek log CasaOS.`);
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        if (data.user.role === 'cashier') {
          setActiveTab('orders');
        }
      } else {
        setLoginError(data.message);
      }
    } catch (error) {
      setLoginError('Gagal terhubung ke server');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setUser(null);
      setLoginData({ username: '', password: '' });
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const IconComponent = (props: any) => {
    if (appSettings.app_logo_url) {
      return (
        <img 
          src={appSettings.app_logo_url} 
          alt="Logo" 
          className={cn("object-contain transition-transform duration-300 hover:scale-110", props.className)} 
          style={{ width: props.size || 24, height: props.size || 24 }}
          referrerPolicy="no-referrer"
        />
      );
    }
    const icons: any = { Coffee, UtensilsCrossed, ShoppingCart, Package, Wallet };
    const Comp = icons[appSettings.app_icon] || Coffee;
    return <Comp {...props} />;
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    // Artificial delay for better UX feedback
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      // Help: ?
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setShowShortcuts(prev => !prev);
      }

      // Fullscreen: F
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        toggleFullscreen();
      }

      // Refresh: R
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        handleRefresh();
      }

      // Search: /
      if (e.key === '/' && activeTab === 'orders' && orderView === 'pos') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Tab Switching: Alt + 1-5
      if (e.altKey && ['1', '2', '3', '4', '5'].includes(e.key)) {
        const tabs = ['dashboard', 'orders', 'queue', 'inventory', 'reports'] as const;
        const index = parseInt(e.key) - 1;
        if (tabs[index]) {
          setActiveTab(tabs[index]);
          setIsInventoryOpen(false);
          setIsReportsOpen(false);
        }
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        setShowReceipt(false);
        setShowPurchaseModal(false);
        setShowPasswordModal(false);
        setShowMobileCart(false);
        setShowShortcuts(false);
        setMenuSearch('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, orderView, isFullscreen]);

  const [showMobileMore, setShowMobileMore] = useState(false);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-coffee-50">
      <div className="flex flex-col items-center gap-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className={cn(
            "rounded-[2.5rem] shadow-2xl flex items-center justify-center",
            appSettings.app_logo_url ? "" : "bg-coffee-900 p-10 shadow-coffee-900/20"
          )}
        >
          <IconComponent className={appSettings.app_logo_url ? "" : "text-white"} size={appSettings.app_logo_url ? 180 : 100} />
        </motion.div>
        <div className="text-center">
          <p className="text-coffee-500 font-medium mt-2">Menyiapkan Bisnis Anda...</p>
        </div>
      </div>
    </div>
  );

  if (!user && isCustomerMode) {
    const categories = ['Semua', ...new Set(menus.map(m => m.category))];
    const filteredMenus = menus.filter(m => 
      (selectedCategory === 'Semua' || m.category === selectedCategory) &&
      (m.name.toLowerCase().includes(menuSearch.toLowerCase()))
    );

    return (
      <div className="min-h-screen bg-coffee-50 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Ad Carousel (Desktop Only) */}
        <div className="hidden lg:block lg:w-2/5 xl:w-1/2 h-screen sticky top-0">
          <AdCarousel />
        </div>

        {/* Right Side: Ordering Interface */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Header */}
          <header className="bg-white border-b border-coffee-100 sticky top-0 z-30 px-4 py-4 md:px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="bg-coffee-900 p-2.5 rounded-2xl text-white shadow-lg shadow-coffee-200">
                <Coffee size={24} />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-coffee-950">{appSettings.customer_page_title || appSettings.app_name}</h1>
                <p className="text-xs text-coffee-500 font-medium">{appSettings.customer_page_subtitle || 'Menu Pelanggan'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Subtle Login Access (Hidden) */}
              <button 
                onClick={() => setIsCustomerMode(false)}
                className="p-2 text-coffee-950/5 hover:text-coffee-950/20 transition-colors"
                title="Staff Login"
              >
                <Lock size={16} />
              </button>
              
              <button 
                onClick={() => setShowCustomerOrderStatus(true)}
                className="p-3 bg-white border border-coffee-100 text-coffee-600 rounded-2xl shadow-sm hover:bg-coffee-50 transition-all active:scale-95"
              >
                <ClipboardList size={20} />
              </button>

              <button 
                onClick={() => setShowMobileCart(true)}
                className="relative p-3 bg-coffee-900 text-white rounded-2xl shadow-lg shadow-coffee-200"
              >
                <ShoppingCart size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Mobile Ad (Visible on small screens) */}
              <div className="lg:hidden h-64 rounded-[2rem] overflow-hidden shadow-lg">
                <AdCarousel />
              </div>
            {/* Search & Categories */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" size={20} />
                <input 
                  type="text"
                  placeholder="Cari menu favorit Anda..."
                  value={menuSearch}
                  onChange={e => setMenuSearch(e.target.value)}
                  className="w-full bg-white border border-coffee-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all shadow-sm border",
                      selectedCategory === cat 
                        ? "bg-coffee-900 text-white border-coffee-900" 
                        : "bg-white text-coffee-600 border-coffee-100 hover:border-coffee-300"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMenus.map(menu => (
                <motion.div 
                  key={menu.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[1.5rem] overflow-hidden border border-coffee-100 shadow-sm hover:shadow-xl transition-all group flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-coffee-50">
                    {menu.image_url ? (
                      <img 
                        src={menu.image_url} 
                        alt={menu.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-coffee-200">
                        <Coffee size={48} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest text-coffee-900 shadow-sm">
                        {menu.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <div className="mb-2">
                      <h3 className="text-sm font-bold text-coffee-950 mb-0.5 group-hover:text-coffee-600 transition-colors line-clamp-1">{menu.name}</h3>
                      <div className="flex items-center gap-2">
                        {menu.size && <span className="text-[10px] font-bold text-coffee-600 bg-coffee-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{menu.size}</span>}
                        {menu.ingredients && menu.ingredients.length > 0 && (
                          <span className="text-[10px] font-medium text-coffee-400 italic">
                            {menu.ingredients.length} Bahan
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-coffee-500 line-clamp-2 mt-1 leading-tight">{menu.description || 'Tidak ada deskripsi'}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-coffee-50">
                      <span className="text-sm font-bold text-coffee-900">{formatIDR(menu.price)}</span>
                      <button 
                        onClick={() => handleAddToCart(menu)}
                        className="bg-coffee-900 text-white p-2 rounded-xl hover:bg-coffee-800 transition-all shadow-md shadow-coffee-100 active:scale-95"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>

        {/* Cart Modal / Sidebar */}
        {showMobileCart && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileCart(false)}
              className="absolute inset-0 bg-coffee-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-coffee-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-coffee-900 p-2 rounded-xl text-white">
                    <ShoppingCart size={20} />
                  </div>
                  <h2 className="text-xl font-serif font-bold">Keranjang Saya</h2>
                </div>
                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button 
                      onClick={() => {
                        if (window.confirm('Hapus semua item di keranjang?')) {
                          setCart([]);
                        }
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      <Trash2 size={16} />
                      Bersihkan
                    </button>
                  )}
                  <button 
                    onClick={() => setShowMobileCart(false)}
                    className="p-2 hover:bg-coffee-50 rounded-xl transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-24 h-24 bg-coffee-50 rounded-full flex items-center justify-center text-coffee-200 mb-6">
                      <ShoppingCart size={48} />
                    </div>
                    <h3 className="text-lg font-bold text-coffee-950 mb-2">Keranjang Kosong</h3>
                    <p className="text-coffee-500 text-sm">Pilih menu favorit Anda untuk mulai memesan.</p>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {/* Cart Items */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase text-coffee-400 tracking-widest">Item Pesanan</h3>
                      {cart.map(item => (
                        <div key={item.menu.id} className="flex gap-4 p-4 bg-coffee-50 rounded-2xl border border-coffee-100">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                            {item.menu.image_url ? (
                              <img src={item.menu.image_url} alt={item.menu.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-coffee-200">
                                <Coffee size={20} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-coffee-950 truncate text-sm">{item.menu.name}</h4>
                            <p className="text-xs font-bold text-coffee-600 mt-0.5">{formatIDR(item.menu.price)}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <button 
                                onClick={() => handleUpdateCartQuantity(item.menu.id, -1)}
                                className="w-7 h-7 flex items-center justify-center bg-white border border-coffee-200 rounded-lg text-coffee-600 hover:bg-coffee-100 transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => handleUpdateCartQuantity(item.menu.id, 1)}
                                className="w-7 h-7 flex items-center justify-center bg-white border border-coffee-200 rounded-lg text-coffee-600 hover:bg-coffee-100 transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveFromCart(item.menu.id)}
                            className="text-rose-400 hover:text-rose-600 p-1 self-start"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Order Details Form */}
                    <div className="space-y-4 pt-6 border-t border-coffee-100">
                      <h3 className="text-xs font-black uppercase text-coffee-400 tracking-widest">Informasi Pesanan</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-coffee-500 mb-1.5 tracking-widest">Nama Pemesan</label>
                          <input 
                            type="text"
                            value={customerOrder.name}
                            onChange={e => setCustomerOrder({...customerOrder, name: e.target.value})}
                            className="w-full bg-white border border-coffee-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            placeholder="Nama Anda"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-coffee-500 mb-1.5 tracking-widest">Nomor Meja</label>
                          <input 
                            type="text"
                            value={customerOrder.table}
                            onChange={e => setCustomerOrder({...customerOrder, table: e.target.value})}
                            className="w-full bg-white border border-coffee-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            placeholder="Meja 01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-coffee-500 mb-1.5 tracking-widest">Catatan (Opsional)</label>
                        <textarea 
                          value={customerOrder.notes}
                          onChange={e => setCustomerOrder({...customerOrder, notes: e.target.value})}
                          className="w-full bg-white border border-coffee-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 min-h-[80px] resize-none"
                          placeholder="Contoh: Gula dikit, Es dipisah..."
                        />
                      </div>
                    </div>

                    {/* Promo Code Section */}
                    <div className="space-y-3 pt-6 border-t border-coffee-100">
                      <label className="block text-[10px] font-black uppercase text-coffee-400 tracking-widest">Punya Kode Promo?</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={14} />
                          <input 
                            type="text"
                            value={promoCode}
                            onChange={e => setPromoCode(e.target.value.toUpperCase())}
                            placeholder="KODEPROMO"
                            disabled={!!activePromo}
                            className="w-full bg-white border border-coffee-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:bg-coffee-100 disabled:text-coffee-400"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={async () => {
                              if (!promoCode) return;
                              try {
                                const res = await fetch(`/api/public/promos/${promoCode}`);
                                if (res.ok) {
                                  const data = await res.json();
                                  setActivePromo(data);
                                  toast.success(`Promo ${data.code} berhasil dipasang!`);
                                } else {
                                  toast.error('Kode promo tidak valid');
                                }
                              } catch (error) {
                                toast.error('Gagal mengecek promo');
                              }
                            }}
                            disabled={!!activePromo}
                            className="px-4 py-2.5 bg-coffee-900 text-white rounded-xl font-bold text-xs hover:bg-coffee-800 transition-colors disabled:opacity-50"
                          >
                            Pasang
                          </button>
                          {activePromo && (
                            <button 
                              onClick={() => {
                                setActivePromo(null);
                                setPromoCode('');
                                toast.info('Promo dibatalkan');
                              }}
                              className="px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-100 transition-colors"
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      </div>
                      {activePromo && (
                        <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Promo aktif: {activePromo.discount_type === 'percentage' ? `${activePromo.discount_value}%` : formatIDR(activePromo.discount_value)} OFF
                        </p>
                      )}
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-3 pt-6 border-t border-coffee-100">
                      <label className="text-[10px] font-black uppercase text-coffee-400 tracking-widest">Metode Pembayaran</label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setCustomerOrder({ ...customerOrder, paymentMethod: 'Cash' })}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                            customerOrder.paymentMethod === 'Cash' 
                              ? "bg-coffee-900 border-coffee-900 text-white shadow-lg" 
                              : "bg-white border-coffee-100 text-coffee-600 hover:bg-coffee-50"
                          )}
                        >
                          <Wallet size={18} />
                          <span className="text-[10px] font-bold uppercase">Tunai</span>
                        </button>
                        <button
                          onClick={() => setCustomerOrder({ ...customerOrder, paymentMethod: 'QRIS' })}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                            customerOrder.paymentMethod === 'QRIS' 
                              ? "bg-coffee-900 border-coffee-900 text-white shadow-lg" 
                              : "bg-white border-coffee-100 text-coffee-600 hover:bg-coffee-50"
                          )}
                        >
                          <QrCode size={18} />
                          <span className="text-[10px] font-bold uppercase">QRIS</span>
                        </button>
                        <button
                          onClick={() => setCustomerOrder({ ...customerOrder, paymentMethod: 'COD' })}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                            customerOrder.paymentMethod === 'COD' 
                              ? "bg-coffee-900 border-coffee-900 text-white shadow-lg" 
                              : "bg-white border-coffee-100 text-coffee-600 hover:bg-coffee-50"
                          )}
                        >
                          <Truck size={18} />
                          <span className="text-[10px] font-bold uppercase">COD</span>
                        </button>
                      </div>
                    </div>

                    {/* Summary Details */}
                    <div className="space-y-2 pt-6 border-t border-coffee-100">
                      <div className="flex justify-between text-xs">
                        <span className="text-coffee-500">Subtotal</span>
                        <span className="font-bold text-coffee-900">
                          {formatIDR(cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0))}
                        </span>
                      </div>
                      {activePromo && (
                        <div className="flex justify-between text-xs text-emerald-600">
                          <span>Diskon ({activePromo.code})</span>
                          <span className="font-bold">
                            -{formatIDR((() => {
                              const subtotal = cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0);
                              if (activePromo.target_type === 'all') {
                                return activePromo.discount_type === 'percentage' 
                                  ? subtotal * (activePromo.discount_value / 100)
                                  : activePromo.discount_value;
                              }
                              const targetSubtotal = cart.reduce((sum, item) => {
                                const isTarget = activePromo.target_type === 'category' 
                                  ? activePromo.target_ids.includes(item.menu.category)
                                  : activePromo.target_ids.includes(item.menu.id.toString());
                                return isTarget ? sum + (item.menu.price * item.quantity) : sum;
                              }, 0);
                              return activePromo.discount_type === 'percentage'
                                ? targetSubtotal * (activePromo.discount_value / 100)
                                : activePromo.discount_value;
                            })())}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-coffee-500">Pajak ({appSettings.tax_rate}%)</span>
                        <span className="font-bold text-coffee-900">
                          {formatIDR(Math.round((() => {
                            const subtotal = cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0);
                            let discount = 0;
                            if (activePromo) {
                              if (activePromo.target_type === 'all') {
                                discount = activePromo.discount_type === 'percentage' 
                                  ? subtotal * (activePromo.discount_value / 100)
                                  : activePromo.discount_value;
                              } else {
                                const targetSubtotal = cart.reduce((sum, item) => {
                                  const isTarget = activePromo.target_type === 'category' 
                                    ? activePromo.target_ids.includes(item.menu.category)
                                    : activePromo.target_ids.includes(item.menu.id.toString());
                                  return isTarget ? sum + (item.menu.price * item.quantity) : sum;
                                }, 0);
                                discount = activePromo.discount_type === 'percentage'
                                  ? targetSubtotal * (activePromo.discount_value / 100)
                                  : activePromo.discount_value;
                              }
                            }
                            return (subtotal - discount) * (appSettings.tax_rate / 100);
                          })()))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-white border-t border-coffee-100 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-coffee-400 tracking-widest">Total Bayar</span>
                      <span className="text-2xl font-bold text-coffee-950">
                        {formatIDR(calculateCartTotal().total)}
                      </span>
                    </div>
                    <button 
                      onClick={handleCustomerOrder}
                      disabled={loading || !customerOrder.name}
                      className="bg-coffee-900 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Memproses...' : 'Order Sekarang'}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                  {!customerOrder.name && (
                    <p className="text-[10px] text-rose-500 font-bold text-center">Silakan masukkan nama pemesan untuk melanjutkan</p>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Success Modal */}
        {showCustomerOrderSuccess && (
          <div className="fixed inset-0 bg-coffee-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl text-center"
            >
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-coffee-950 mb-4">Pesanan Terkirim!</h2>
              <p className="text-coffee-600 mb-8 leading-relaxed">
                Terima kasih, <span className="font-bold text-coffee-900">{lastCustomerOrder?.name || 'Pelanggan'}</span>! <br/>
                Pesanan Anda dengan ID <span className="font-bold text-coffee-900">#{customerOrderId}</span> sedang kami siapkan.
              </p>
              
              <p className="text-coffee-600 mb-8 leading-relaxed">
                {lastCustomerOrder?.paymentMethod === 'QRIS' 
                  ? "Pembayaran QRIS sedang diverifikasi oleh kasir. Silakan tunjukkan bukti pembayaran Anda."
                  : "Silakan lakukan pembayaran di kasir untuk mengonfirmasi pesanan Anda."}
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowCustomerOrderSuccess(false);
                    setShowCustomerOrderStatus(true);
                  }}
                  className="w-full bg-coffee-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-coffee-200 hover:bg-coffee-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ClipboardList size={20} />
                  LIHAT STATUS PESANAN
                </button>
                <button 
                  onClick={() => setShowCustomerOrderSuccess(false)}
                  className="w-full bg-coffee-50 text-coffee-600 py-4 rounded-2xl font-black hover:bg-coffee-100 transition-all active:scale-95"
                >
                  KEMBALI KE BERANDA
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* QRIS Modal */}
        {showQRISModal && (
          <div className="fixed inset-0 bg-coffee-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-coffee-100 text-coffee-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode size={40} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-coffee-950 mb-2">Pembayaran QRIS</h2>
              <div className="bg-coffee-50 px-4 py-2 rounded-full inline-block mb-4">
                <span className="text-coffee-900 font-bold text-lg">{formatIDR(calculateCartTotal().total)}</span>
              </div>
              <p className="text-coffee-500 text-sm mb-8">Scan kode di bawah untuk melakukan pembayaran</p>
              
              <div className="bg-white p-6 rounded-[2rem] border-2 border-coffee-100 shadow-xl space-y-4 mb-8">
                <img 
                  src={appSettings.payment_qris_url || 'https://picsum.photos/seed/qris/500/500'} 
                  alt="QRIS" 
                  className="w-64 h-64 mx-auto object-contain rounded-2xl shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>

              <p className="text-xs text-coffee-500 mb-8 leading-relaxed italic">
                {appSettings.payment_instructions || 'Silakan tunjukkan bukti bayar ke kasir setelah melakukan scan.'}
              </p>

              <button 
                onClick={() => {
                  setShowQRISModal(false);
                  setShowCustomerOrderSuccess(true);
                }}
                className="w-full bg-coffee-900 text-white py-4 rounded-2xl font-bold hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200 flex items-center justify-center gap-2"
              >
                Saya Sudah Bayar
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundColor: appSettings.login_bg,
          backgroundImage: appSettings.login_bg_image ? `url(${appSettings.login_bg_image})` : 'none'
        }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-coffee-100"
        >
          <div className="text-center mb-8">
            <div className={cn(
              "mx-auto mb-6 flex items-center justify-center",
              appSettings.app_logo_url ? "" : "bg-coffee-900 w-24 h-24 rounded-3xl shadow-xl shadow-coffee-200"
            )}>
              <IconComponent className={appSettings.app_logo_url ? "" : "text-white"} size={appSettings.app_logo_url ? 120 : 48} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-coffee-950 mb-2">{appSettings.login_title}</h2>
            <p className="text-coffee-500 font-medium">{appSettings.login_subtitle}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-coffee-500 mb-2 tracking-widest">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" size={18} />
                <input 
                  required
                  type="text"
                  value={loginData.username}
                  onChange={e => setLoginData({...loginData, username: e.target.value})}
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-all"
                  placeholder="admin / kasir"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-coffee-500 mb-2 tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" size={18} />
                <input 
                  required
                  type="password"
                  value={loginData.password}
                  onChange={e => setLoginData({...loginData, password: e.target.value})}
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-medium flex items-center gap-2 border border-rose-100"
              >
                <AlertCircle size={18} />
                {loginError}
              </motion.div>
            )}

            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-sm font-bold text-coffee-600 hover:text-coffee-900 transition-colors"
              >
                Lupa Password?
              </button>
            </div>

            <button 
              type="submit"
              className="w-full bg-coffee-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
            >
              {t('login')}
            </button>

            <button 
              type="button"
              onClick={() => setIsCustomerMode(true)}
              className="w-full bg-white text-coffee-600 py-4 rounded-2xl font-bold text-lg border-2 border-coffee-100 hover:bg-coffee-50 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Kembali ke Menu Order
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-coffee-50 text-center">
            <p className="text-xs text-coffee-400 font-medium">
              Admin: admin / admin123<br/>
              Kasir: kasir / kasir123
            </p>
          </div>
        </motion.div>

        {showResetModal && (
          <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-2xl font-serif font-bold mb-2">Reset Password</h3>
              <p className="text-coffee-500 text-sm mb-6">Masukkan email yang terdaftar untuk menerima instruksi reset password.</p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Email Terdaftar</label>
                  <input 
                    required
                    type="email" 
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="email@contoh.com"
                  />
                </div>
                <div className="flex gap-3 mt-8">
                  <button 
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-coffee-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                  >
                    Kirim Link
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col md:flex-row bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ 
        backgroundColor: appSettings.main_bg,
        backgroundImage: appSettings.main_bg_image ? `url(${appSettings.main_bg_image})` : 'none'
      }}
    >
      <Toaster position="top-right" richColors closeButton />
      
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        cart={cart}
        activeOrders={activeOrders}
        isReportsOpen={isReportsOpen}
        setIsReportsOpen={setIsReportsOpen}
        isInventoryOpen={isInventoryOpen}
        setIsInventoryOpen={setIsInventoryOpen}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        reportSubTab={reportSubTab}
        setReportSubTab={setReportSubTab}
        invCategoryFilter={invCategoryFilter}
        setInvCategoryFilter={setInvCategoryFilter}
        appSettings={appSettings}
        t={t}
        IconComponent={IconComponent}
        handleLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setShowShortcuts={setShowShortcuts}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        setShowPasswordModal={setShowPasswordModal}
        stats={stats}
      />
      {/* Mobile Header - Sticky */}
      <header className="md:hidden sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-coffee-100 px-6 py-4 flex justify-between items-center no-print">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center",
            appSettings.app_logo_url ? "" : "bg-coffee-900 p-1.5 rounded-lg shadow-sm"
          )}>
            <IconComponent className={appSettings.app_logo_url ? "" : "text-white w-6 h-6"} size={appSettings.app_logo_url ? 32 : 24} />
          </div>
          <span className="font-serif font-black text-coffee-950 text-lg tracking-tight">{appSettings.app_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-coffee-100 text-coffee-600 rounded-xl hover:bg-coffee-200 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} />
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-2.5 bg-coffee-100 text-coffee-600 rounded-xl hover:bg-coffee-200 transition-colors"
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          {activeTab === 'orders' && cart.length > 0 && (
            <button 
              onClick={() => setShowMobileCart(true)}
              className="relative p-2 bg-coffee-100 text-coffee-900 rounded-xl active:scale-95 transition-transform"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-coffee-200 flex items-center justify-center text-coffee-900 font-black text-xs border-2 border-white shadow-sm">
            {user.username[0].toUpperCase()}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-xl border-t border-coffee-100 px-4 py-2 pb-safe no-print">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              activeTab === 'orders' ? "text-coffee-900 scale-110" : "text-coffee-400"
            )}
          >
            <div className={cn("p-1 rounded-lg", activeTab === 'orders' && "bg-coffee-100")}>
              <ShoppingCart size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">POS</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('queue')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              activeTab === 'queue' ? "text-coffee-900 scale-110" : "text-coffee-400"
            )}
          >
            <div className={cn("p-1 rounded-lg relative", activeTab === 'queue' && "bg-coffee-100")}>
              <Clock size={20} />
              {activeOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center font-black">
                  {activeOrders.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Antrian</span>
          </button>

          {user.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-all",
                activeTab === 'dashboard' ? "text-coffee-900 scale-110" : "text-coffee-400"
              )}
            >
              <div className={cn("p-1 rounded-lg", activeTab === 'dashboard' && "bg-coffee-100")}>
                <LayoutDashboard size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter">Stats</span>
            </button>
          )}

          <button 
            onClick={() => setShowMobileMore(true)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              showMobileMore ? "text-coffee-900 scale-110" : "text-coffee-400"
            )}
          >
            <div className={cn("p-1 rounded-lg", showMobileMore && "bg-coffee-100")}>
              <MenuIcon size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile More Menu Overlay */}
      <AnimatePresence>
        {showMobileMore && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMore(false)}
              className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm z-[70] md:hidden"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[80] p-8 pb-12 md:hidden shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-coffee-100 rounded-full mx-auto mb-8" />
              <div className="grid grid-cols-3 gap-6">
                <button 
                  onClick={() => { setActiveTab('reports'); setReportSubTab('transactions'); setShowMobileMore(false); }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-14 h-14 bg-coffee-50 rounded-2xl flex items-center justify-center text-coffee-600 shadow-sm">
                    <Calendar size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-coffee-900 text-center">Laporan Transaksi</span>
                </button>
                
                {user.role === 'admin' && (
                  <>
                    <button 
                      onClick={() => { setActiveTab('reports'); setReportSubTab('financial'); setShowMobileMore(false); }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <TrendingUp size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-coffee-900 text-center">Laporan Keuangan</span>
                    </button>
                    <button 
                      onClick={() => { setActiveTab('transactions'); setShowMobileMore(false); }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                        <Wallet size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-coffee-900 text-center">Catatan Keuangan</span>
                    </button>
                    <button 
                      onClick={() => { setActiveTab('inventory'); setShowMobileMore(false); }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                        <Package size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-coffee-900 text-center">Stok</span>
                    </button>
                    <button 
                      onClick={() => { setActiveTab('menu'); setShowMobileMore(false); }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <Coffee size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-coffee-900 text-center">Menu</span>
                    </button>
                    <button 
                      onClick={() => { setActiveTab('settings'); setShowMobileMore(false); }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm">
                        <Settings size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-coffee-900 text-center">Setting</span>
                    </button>
                  </>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm">
                    <LogOut size={24} />
                  </div>
                  <span className="text-xs font-bold text-coffee-900">Keluar</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-coffee-50/50 relative">
        {/* Global Header - Desktop Only */}
        <div className="hidden md:flex sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-coffee-100 px-6 py-4 justify-between items-center no-print">
          <div className="flex items-center gap-3">
            <div className="md:hidden bg-coffee-900 p-2 rounded-lg">
              <Coffee className="text-white w-5 h-5" />
            </div>
            <h2 className="text-lg font-serif font-bold text-coffee-950 capitalize">{activeTab.replace('_', ' ')}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleFullscreen}
              className="p-2.5 bg-white border border-coffee-100 rounded-xl text-coffee-600 hover:bg-coffee-50 transition-all"
              title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 bg-white border border-coffee-100 rounded-xl text-coffee-600 hover:bg-coffee-50 transition-all relative"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {notifications.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-coffee-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-coffee-50 bg-coffee-50/50 flex justify-between items-center">
                      <h4 className="font-bold text-coffee-950">Notifikasi</h4>
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[10px] font-bold text-coffee-500 uppercase hover:text-rose-500 transition-colors"
                      >
                        Hapus Semua
                      </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-coffee-400">
                          <Bell size={32} className="mx-auto mb-2 opacity-20" />
                          <p className="text-xs">Belum ada notifikasi</p>
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className="p-4 border-b border-coffee-50 hover:bg-coffee-50/50 transition-colors flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                              <Check size={16} />
                            </div>
                            <div>
                              <p className="text-xs text-coffee-900 leading-relaxed">{notif.message}</p>
                              <p className="text-[10px] text-coffee-400 mt-1 font-medium">{notif.time}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-1 bg-coffee-900 rounded-full" />
                    <p className="text-coffee-500 font-black uppercase tracking-[0.2em] text-[10px]">Ringkasan Bisnis</p>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-coffee-950 leading-tight">
                    Dashboard <span className="gradient-text italic">Utama</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-coffee-100 shadow-sm w-full md:w-auto">
                  <Calendar size={16} className="text-coffee-400 ml-2" />
                  <span className="text-xs font-bold text-coffee-900 pr-4">{formatDate(new Date(), 'EEEE, d MMMM yyyy')}</span>
                </div>
              </header>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-xl shadow-emerald-200/50 relative overflow-hidden group"
                >
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <TrendingUp size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <ArrowUpRight size={18} />
                      </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Total Pemasukan</p>
                    <p className="text-lg font-black truncate">{formatIDR(stats?.totalIncome || 0)}</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-4 bg-gradient-to-br from-rose-500 to-rose-600 text-white border-none shadow-xl shadow-rose-200/50 relative overflow-hidden group"
                >
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <ArrowDownLeft size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <ArrowDownLeft size={18} />
                      </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Total Pengeluaran</p>
                    <p className="text-lg font-black truncate">{formatIDR(stats?.totalExpense || 0)}</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none shadow-xl shadow-amber-200/50 relative overflow-hidden group"
                >
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <ShoppingCart size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <ShoppingCart size={18} />
                      </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Terjual Hari Ini</p>
                    <p className="text-lg font-black truncate">{stats?.dailySalesCount || 0} Item</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none shadow-xl shadow-indigo-200/50 relative overflow-hidden group"
                >
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Calendar size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Calendar size={18} />
                      </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Terjual Bulan Ini</p>
                    <p className="text-lg font-black truncate">{stats?.monthlySalesCount || 0} Item</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('queue')}
                  className="glass-card p-4 bg-gradient-to-br from-violet-500 to-violet-600 text-white border-none shadow-xl shadow-violet-200/50 relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Clock size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Clock size={18} />
                      </div>
                      {activeOrders.length > 0 && (
                        <span className="flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Antrian Aktif</p>
                    <p className="text-lg font-black truncate">{activeOrders.length} Pesanan</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-4 bg-gradient-to-br from-slate-700 to-slate-800 text-white border-none shadow-xl shadow-slate-400/50 relative overflow-hidden group"
                >
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <AlertCircle size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <AlertCircle size={18} />
                      </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Stok Menipis</p>
                    <p className="text-lg font-black truncate">{stats?.lowStock.length || 0} Item</p>
                  </div>
                </motion.div>
              </div>

              {/* Charts and Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="glass-card p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl relative overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-coffee-950">Penjualan per Kategori</h3>
                      <p className="text-xs text-coffee-500 font-medium">Distribusi menu yang paling banyak terjual</p>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(
                            transactions
                              .filter(tx => tx.type === 'income' && tx.category === 'Sales')
                              .reduce((acc: any, tx) => {
                                const cat = tx.description.split(' - ')[0] || 'Lainnya';
                                acc[cat] = (acc[cat] || 0) + 1;
                                return acc;
                              }, {})
                          ).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {Object.entries(
                            transactions
                              .filter(tx => tx.type === 'income' && tx.category === 'Sales')
                              .reduce((acc: any, tx) => {
                                const cat = tx.description.split(' - ')[0] || 'Lainnya';
                                acc[cat] = (acc[cat] || 0) + 1;
                                return acc;
                              }, {})
                          ).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="glass-card p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl relative overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 rounded-[40px] border border-coffee-100 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-serif font-bold flex items-center gap-2">
                        <TrendingUp className="text-emerald-500" /> Performa Keuangan
                      </h3>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold text-coffee-400 uppercase">Masuk</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-rose-500" />
                          <span className="text-[10px] font-bold text-coffee-400 uppercase">Keluar</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={
                          stats?.salesBySource && stats.salesBySource.length > 0 
                            ? stats.salesBySource.map((s: any) => ({ name: s.source, value: s.total }))
                            : [
                                { name: 'Pemasukan', value: stats?.totalIncome || 0, fill: '#10b981' },
                                { name: 'Pengeluaran', value: stats?.totalExpense || 0, fill: '#f43f5e' }
                              ]
                        }>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                          />
                          <YAxis hide />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ 
                              borderRadius: '24px', 
                              border: 'none', 
                              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                              padding: '12px 20px'
                            }}
                            formatter={(value: number) => [formatIDR(value), '']}
                          />
                          <Bar dataKey="value" radius={[20, 20, 20, 20]} barSize={80}>
                            { stats?.salesBySource && stats.salesBySource.length > 0 
                              ? stats.salesBySource.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={
                                    entry.source === 'POS' ? '#9a684a' :
                                    entry.source === 'GrabFood' ? '#10b981' :
                                    entry.source === 'GoFood' ? '#f43f5e' :
                                    entry.source === 'ShopeeFood' ? '#f97316' :
                                    '#64748b'
                                  } />
                                ))
                              : [0, 1].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                                ))
                            }
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-8 rounded-[40px] border border-coffee-100 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-serif font-bold flex items-center gap-2">
                      <AlertCircle className="text-amber-500" /> Stok Menipis
                    </h3>
                    <button onClick={() => setActiveTab('inventory')} className="text-coffee-500 text-xs font-black uppercase tracking-widest hover:text-coffee-950 transition-colors">Lihat Semua</button>
                  </div>
                  <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                    {stats?.lowStock.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-coffee-300">
                        <Check size={48} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium italic">Semua stok dalam kondisi aman.</p>
                      </div>
                    ) : (
                      stats?.lowStock.map(item => (
                        <motion.div 
                          key={item.id} 
                          whileHover={{ x: 5 }}
                          className="flex items-center justify-between p-5 bg-amber-50/50 rounded-3xl border border-amber-100/50 group transition-all hover:bg-amber-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">
                              {item.quantity}
                            </div>
                            <div>
                              <p className="font-black text-coffee-950">{item.name}</p>
                              <p className="text-[10px] text-amber-600 font-black uppercase tracking-wider">Sisa: {item.quantity} {item.unit} • Min: {item.min_stock}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setConfirmUpdate({ id: item.id, name: item.name, currentQty: item.quantity, delta: 10 })}
                            className="bg-white text-amber-600 p-3 rounded-2xl shadow-sm border border-amber-100 hover:bg-amber-500 hover:text-white transition-all"
                          >
                            <Plus size={20} />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Recent Transactions */}
              <div className="glass-card p-8">
                <h3 className="text-xl font-serif font-bold mb-6">Transaksi Terakhir</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-coffee-500 text-xs uppercase tracking-widest border-b border-coffee-100">
                        <th className="pb-4 font-bold">Tanggal</th>
                        <th className="pb-4 font-bold">Kategori</th>
                        <th className="pb-4 font-bold">Deskripsi</th>
                        <th className="pb-4 font-bold text-right">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-coffee-50">
                      {stats?.recentTransactions.map(tx => (
                        <tr key={tx.id} className="group">
                          <td className="py-4 text-sm text-coffee-600">{formatDate(new Date(tx.date), 'dd MMM yyyy')}</td>
                          <td className="py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold",
                              tx.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                              {tx.category}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-coffee-900 font-medium">{tx.description}</td>
                          <td className={cn(
                            "py-4 text-sm font-bold text-right",
                            tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {tx.type === 'income' ? '+' : '-'} {formatIDR(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div 
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Sub-navigation for Reports */}
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-coffee-100 shadow-sm w-fit no-print">
                <button 
                  onClick={() => setReportSubTab('transactions')}
                  className={cn(
                    "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                    reportSubTab === 'transactions' ? "bg-coffee-900 text-white shadow-lg" : "text-coffee-500 hover:bg-coffee-50"
                  )}
                >
                  Laporan Transaksi
                </button>
                {user.role === 'admin' && (
                  <>
                    <button 
                      onClick={() => setReportSubTab('financial')}
                      className={cn(
                        "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                        reportSubTab === 'financial' ? "bg-coffee-900 text-white shadow-lg" : "text-coffee-500 hover:bg-coffee-50"
                      )}
                    >
                      Laporan Keuangan
                    </button>
                    <button 
                      onClick={() => setReportSubTab('consignment')}
                      className={cn(
                        "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                        reportSubTab === 'consignment' ? "bg-coffee-900 text-white shadow-lg" : "text-coffee-500 hover:bg-coffee-50"
                      )}
                    >
                      {t('consignment_report')}
                    </button>
                  </>
                )}
              </div>

              {reportSubTab === 'transactions' ? (
                <div className="space-y-8">
                  <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-coffee-500 font-medium uppercase tracking-widest text-xs mb-1">Ringkasan Penjualan</p>
                      <h2 className="text-4xl font-serif font-bold text-coffee-950">Laporan Transaksi</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {user.role === 'admin' && (
                        <button 
                          onClick={handleExportAllReports}
                          className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
                        >
                          <Download size={18} />
                          {t('export_all_reports')}
                        </button>
                      )}
                      <div className="flex bg-white p-1 rounded-2xl border border-coffee-100 shadow-sm">
                        <button 
                          onClick={() => setReportFilter('daily')}
                          className={cn(
                            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                            reportFilter === 'daily' ? "bg-coffee-900 text-white shadow-lg" : "text-coffee-500 hover:bg-coffee-50"
                          )}
                        >
                          Harian
                        </button>
                        <button 
                          onClick={() => setReportFilter('monthly')}
                          className={cn(
                            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                            reportFilter === 'monthly' ? "bg-coffee-900 text-white shadow-lg" : "text-coffee-500 hover:bg-coffee-50"
                          )}
                        >
                          Bulanan
                        </button>
                      </div>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400 pointer-events-none" size={16} />
                        <input 
                          type="date" 
                          value={reportDate}
                          onChange={(e) => {
                            setReportDate(e.target.value);
                            setReportFilter('daily'); // Switch to daily when picking a specific date
                          }}
                          className="bg-white border border-coffee-100 rounded-2xl pl-10 pr-4 py-2 text-sm font-bold text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm"
                        />
                      </div>
                      <button 
                        onClick={() => exportToCSV(
                          transactions.filter(tx => tx.type === 'income' && tx.category === 'Sales' && (
                            reportFilter === 'daily' 
                              ? formatDate(new Date(tx.date), 'yyyy-MM-dd') === reportDate
                              : formatDate(new Date(tx.date), 'yyyy-MM') === formatDate(new Date(reportDate), 'yyyy-MM')
                          )),
                          `laporan_transaksi_${reportFilter}`
                        )}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200/50"
                      >
                        <FileDown size={16} />
                        Export CSV
                      </button>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 bg-emerald-50 border-emerald-100 text-coffee-950">
                      <p className="text-emerald-700 text-xs font-bold uppercase tracking-widest mb-2">Total Penjualan</p>
                      <p className="text-3xl font-bold">
                        {formatIDR(transactions
                          .filter(tx => tx.type === 'income' && tx.category === 'Sales' && (
                            reportFilter === 'daily' 
                              ? formatDate(new Date(tx.date), 'yyyy-MM-dd') === reportDate
                              : formatDate(new Date(tx.date), 'yyyy-MM') === formatDate(new Date(reportDate), 'yyyy-MM')
                          ))
                          .reduce((sum, tx) => sum + tx.amount, 0)
                        )}
                      </p>
                    </div>
                    <div className="glass-card p-6">
                      <p className="text-coffee-400 text-xs font-bold uppercase tracking-widest mb-2">Jumlah Transaksi</p>
                      <p className="text-3xl font-bold text-coffee-950">
                        {transactions
                          .filter(tx => tx.type === 'income' && tx.category === 'Sales' && (
                            reportFilter === 'daily' 
                              ? formatDate(new Date(tx.date), 'yyyy-MM-dd') === reportDate
                              : formatDate(new Date(tx.date), 'yyyy-MM') === formatDate(new Date(reportDate), 'yyyy-MM')
                          )).length
                        } <span className="text-sm font-medium text-coffee-400">Order</span>
                      </p>
                    </div>
                    <div className="glass-card p-6">
                      <p className="text-coffee-400 text-xs font-bold uppercase tracking-widest mb-2">Metode Terpopuler</p>
                      <p className="text-xl font-bold text-coffee-950">
                        {(() => {
                          const sales = transactions.filter(tx => tx.type === 'income' && tx.category === 'Sales' && (
                            reportFilter === 'daily' 
                              ? formatDate(new Date(tx.date), 'yyyy-MM-dd') === reportDate
                              : formatDate(new Date(tx.date), 'yyyy-MM') === formatDate(new Date(reportDate), 'yyyy-MM')
                          ));
                          const counts: any = {};
                          sales.forEach((s: any) => counts[s.payment_method || 'Cash'] = (counts[s.payment_method || 'Cash'] || 0) + 1);
                          const top = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0];
                          return top ? `${top[0]} (${top[1]})` : '-';
                        })()}
                      </p>
                    </div>
                  </div>

                  <div className="glass-card p-8">
                    <h3 className="text-xl font-serif font-bold mb-6">Detail Penjualan ({reportFilter === 'daily' ? formatDate(new Date(reportDate), 'dd MMM yyyy') : formatDate(new Date(reportDate), 'MMMM yyyy')})</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-coffee-500 text-xs uppercase tracking-widest border-b border-coffee-100">
                            <th className="pb-4 font-bold">Waktu</th>
                            <th className="pb-4 font-bold">Menu</th>
                            <th className="pb-4 font-bold">Pelanggan</th>
                            <th className="pb-4 font-bold">Metode</th>
                            <th className="pb-4 font-bold text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-coffee-50">
                          {transactions
                            .filter(tx => tx.type === 'income' && tx.category === 'Sales' && (
                              reportFilter === 'daily' 
                                ? formatDate(new Date(tx.date), 'yyyy-MM-dd') === reportDate
                                : formatDate(new Date(tx.date), 'yyyy-MM') === formatDate(new Date(reportDate), 'yyyy-MM')
                            ))
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((tx) => (
                              <tr key={tx.id} className="hover:bg-coffee-50/50 transition-colors">
                                <td className="py-4 text-sm text-coffee-600">
                                  {formatDate(new Date(tx.date), 'HH:mm')}
                                  <span className="text-[10px] block text-coffee-400">{formatDate(new Date(tx.date), 'dd MMM yyyy')}</span>
                                </td>
                                <td className="py-4">
                                  <p className="text-sm font-bold text-coffee-900">{tx.description?.replace('Order: ', '')}</p>
                                  <p className="text-[10px] text-coffee-400">ID: {tx.order_id || tx.id}</p>
                                </td>
                                <td className="py-4 text-sm text-coffee-600">{tx.customer_name || 'Umum'}</td>
                                <td className="py-4">
                                  <span className="px-2 py-1 bg-coffee-100 rounded text-[10px] font-bold text-coffee-600 uppercase">
                                    {tx.payment_method || 'Cash'}
                                  </span>
                                </td>
                                <td className="py-4 text-sm font-bold text-right text-emerald-600">
                                  {formatIDR(tx.amount)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : reportSubTab === 'financial' ? (
                <div className="space-y-6 pb-20 md:pb-0">
                  <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-coffee-500 font-medium uppercase tracking-widest text-[10px] mb-1">Analisis Keuangan</p>
                      <h2 className="text-3xl md:text-4xl font-serif font-bold text-coffee-950">Laporan Terperinci</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-coffee-100 shadow-sm flex-1 md:flex-none justify-between">
                        <input 
                          type="date" 
                          value={financialRange.startDate}
                          onChange={(e) => setFinancialRange(prev => ({ ...prev, startDate: e.target.value }))}
                          className="bg-transparent border-none text-xs font-bold text-coffee-900 focus:outline-none w-24"
                        />
                        <span className="text-coffee-300 text-[10px] font-bold">s/d</span>
                        <input 
                          type="date" 
                          value={financialRange.endDate}
                          onChange={(e) => setFinancialRange(prev => ({ ...prev, endDate: e.target.value }))}
                          className="bg-transparent border-none text-xs font-bold text-coffee-900 focus:outline-none w-24"
                        />
                      </div>
                      <button 
                        onClick={fetchFinancialData}
                        className="p-3 bg-coffee-900 text-white rounded-2xl hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200 active:scale-95"
                      >
                        <RefreshCw size={18} />
                      </button>
                    </div>
                  </header>

                  {financialData && (
                    <div className="space-y-6">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="glass-card p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                              <ArrowUpRight size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-full">Hari Ini</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-[10px] font-bold text-coffee-400 uppercase tracking-tighter">Pemasukan</p>
                              <p className="text-xl font-bold text-emerald-600">{formatIDR(financialData.summary.daily.income || 0)}</p>
                            </div>
                            <div className="pt-3 border-t border-emerald-100/50">
                              <p className="text-[10px] font-bold text-coffee-400 uppercase tracking-tighter">Pengeluaran</p>
                              <p className="text-lg font-bold text-rose-500">{formatIDR(financialData.summary.daily.expense || 0)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="glass-card p-5 bg-gradient-to-br from-blue-50 to-white border-blue-100">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                              <Calendar size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-full">7 Hari</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-[10px] font-bold text-coffee-400 uppercase tracking-tighter">Pemasukan</p>
                              <p className="text-xl font-bold text-blue-600">{formatIDR(financialData.summary.weekly.income || 0)}</p>
                            </div>
                            <div className="pt-3 border-t border-blue-100/50">
                              <p className="text-[10px] font-bold text-coffee-400 uppercase tracking-tighter">Pengeluaran</p>
                              <p className="text-lg font-bold text-rose-500">{formatIDR(financialData.summary.weekly.expense || 0)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="glass-card p-5 bg-gradient-to-br from-amber-50 to-white border-amber-100">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                              <TrendingUp size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded-full">Bulan Ini</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-[10px] font-bold text-coffee-400 uppercase tracking-tighter">Pemasukan</p>
                              <p className="text-xl font-bold text-amber-600">{formatIDR(financialData.summary.monthly.income || 0)}</p>
                            </div>
                            <div className="pt-3 border-t border-amber-100/50">
                              <p className="text-[10px] font-bold text-coffee-400 uppercase tracking-tighter">Pengeluaran</p>
                              <p className="text-lg font-bold text-rose-500">{formatIDR(financialData.summary.monthly.expense || 0)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Charts */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-card p-6 md:p-8 bg-white border-coffee-100">
                          <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                            <BarChart3 size={20} className="text-coffee-600" />
                            Tren Keuangan
                          </h3>
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={financialData.dailyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                  dataKey="date" 
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fontSize: 10, fill: '#64748b' }}
                                  tickFormatter={(val) => formatDate(new Date(val), 'dd MMM')}
                                />
                                <YAxis 
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fontSize: 10, fill: '#64748b' }}
                                  tickFormatter={(val) => `Rp ${val/1000}k`}
                                />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                  formatter={(val: number) => [formatIDR(val), '']}
                                  labelFormatter={(label) => formatDate(new Date(label), 'dd MMMM yyyy')}
                                />
                                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="glass-card p-6 md:p-8 bg-white border-coffee-100">
                          <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                            <PieChartIcon size={20} className="text-coffee-600" />
                            Distribusi Pengeluaran
                          </h3>
                          <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="h-[250px] w-full md:w-1/2">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={financialData.expenseByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="amount"
                                    nameKey="category"
                                  >
                                    {financialData.expenseByCategory.map((entry: any, index: number) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(val: number) => [formatIDR(val), '']}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2 space-y-3">
                              {financialData.expenseByCategory.map((item: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-3 h-3 rounded-full shadow-sm" 
                                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} 
                                    />
                                    <span className="text-sm font-medium text-slate-600">{item.category}</span>
                                  </div>
                                  <span className="text-sm font-bold text-slate-900">{formatIDR(item.amount)}</span>
                                </div>
                              ))}
                              {financialData.expenseByCategory.length === 0 && (
                                <p className="text-center text-slate-400 text-sm italic py-4">Belum ada data pengeluaran</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Category Breakdown Table */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-card p-6 md:p-8 bg-white border-coffee-100">
                          <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-emerald-600" />
                            Pemasukan per Kategori
                          </h3>
                          <div className="space-y-3">
                            {financialData.incomeByCategory.map((item: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100">
                                <div>
                                  <p className="font-bold text-slate-900">{item.category}</p>
                                  <p className="text-xs text-slate-500">Total Pemasukan</p>
                                </div>
                                <p className="text-lg font-bold text-emerald-600">{formatIDR(item.amount)}</p>
                              </div>
                            ))}
                            {financialData.incomeByCategory.length === 0 && (
                              <p className="text-center text-slate-400 py-8 italic">Belum ada data pemasukan</p>
                            )}
                          </div>
                        </div>

                        <div className="glass-card p-6 md:p-8 bg-white border-coffee-100">
                          <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                            <TrendingDown size={20} className="text-rose-600" />
                            Pengeluaran per Kategori
                          </h3>
                          <div className="space-y-3">
                            {financialData.expenseByCategory.map((item: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100">
                                <div>
                                  <p className="font-bold text-slate-900">{item.category}</p>
                                  <p className="text-xs text-slate-500">Total Pengeluaran</p>
                                </div>
                                <p className="text-lg font-bold text-rose-600">{formatIDR(item.amount)}</p>
                              </div>
                            ))}
                            {financialData.expenseByCategory.length === 0 && (
                              <p className="text-center text-slate-400 py-8 italic">Belum ada data pengeluaran</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-coffee-500 font-medium uppercase tracking-widest text-[10px] mb-1">Laporan Titipan Barang</p>
                      <h2 className="text-3xl md:text-4xl font-serif font-bold text-coffee-950">{t('consignment_report')}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-coffee-100 shadow-sm flex-1 md:flex-none justify-between">
                        <input 
                          type="date" 
                          value={financialRange.startDate}
                          onChange={(e) => setFinancialRange(prev => ({ ...prev, startDate: e.target.value }))}
                          className="bg-transparent border-none text-xs font-bold text-coffee-900 focus:outline-none w-24"
                        />
                        <span className="text-coffee-300 text-[10px] font-bold">s/d</span>
                        <input 
                          type="date" 
                          value={financialRange.endDate}
                          onChange={(e) => setFinancialRange(prev => ({ ...prev, endDate: e.target.value }))}
                          className="bg-transparent border-none text-xs font-bold text-coffee-900 focus:outline-none w-24"
                        />
                      </div>
                      <button 
                        onClick={fetchConsignmentData}
                        className="p-3 bg-coffee-900 text-white rounded-2xl hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200 active:scale-95"
                      >
                        <RefreshCw size={18} />
                      </button>
                    </div>
                  </header>

                  <div className="glass-card p-8 bg-white border-coffee-100">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-coffee-500 text-xs uppercase tracking-widest border-b border-coffee-100">
                            <th className="pb-4 font-bold">{t('supplier_name')}</th>
                            <th className="pb-4 font-bold">Menu</th>
                            <th className="pb-4 font-bold text-center">Terjual</th>
                            <th className="pb-4 font-bold text-right">Total Penjualan</th>
                            <th className="pb-4 font-bold text-right">{t('settlement_amount')}</th>
                            <th className="pb-4 font-bold text-right">{t('profit_share')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-coffee-50">
                          {consignmentData.length > 0 ? consignmentData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-coffee-50/50 transition-colors">
                              <td className="py-4">
                                <p className="text-sm font-bold text-coffee-900">{item.supplier_name}</p>
                              </td>
                              <td className="py-4">
                                <p className="text-sm text-coffee-600">{item.menu_name}</p>
                                <p className="text-[10px] text-coffee-400">Harga Titip: {formatIDR(item.supplier_price)}</p>
                              </td>
                              <td className="py-4 text-center">
                                <span className="px-3 py-1 bg-coffee-100 rounded-full text-xs font-bold text-coffee-700">
                                  {item.total_quantity}
                                </span>
                              </td>
                              <td className="py-4 text-sm font-bold text-right text-coffee-900">
                                {formatIDR(item.total_sales)}
                              </td>
                              <td className="py-4 text-sm font-bold text-right text-amber-600">
                                {formatIDR(item.total_settlement)}
                              </td>
                              <td className="py-4 text-sm font-bold text-right text-emerald-600">
                                {formatIDR(item.total_profit)}
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-coffee-400 italic">
                                Belum ada data penjualan barang titipan untuk periode ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {consignmentData.length > 0 && (
                          <tfoot>
                            <tr className="border-t-2 border-coffee-100 bg-coffee-50/30">
                              <td colSpan={3} className="py-4 px-4 font-serif font-bold text-coffee-900 text-lg">TOTAL</td>
                              <td className="py-4 text-right font-bold text-coffee-900">
                                {formatIDR(consignmentData.reduce((sum, item) => sum + item.total_sales, 0))}
                              </td>
                              <td className="py-4 text-right font-bold text-amber-600">
                                {formatIDR(consignmentData.reduce((sum, item) => sum + item.total_settlement, 0))}
                              </td>
                              <td className="py-4 text-right font-bold text-emerald-600">
                                {formatIDR(consignmentData.reduce((sum, item) => sum + item.total_profit, 0))}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm">
                      <Info size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 mb-1">Informasi Pembayaran Konsinyasi</h4>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        Laporan ini merangkum semua item menu dengan tipe <strong>Konsinyasi</strong> yang terjual dalam periode yang dipilih. 
                        <strong> {t('settlement_amount')}</strong> adalah jumlah uang yang harus diserahkan kepada pemilik barang (supplier), 
                        sedangkan <strong> {t('profit_share')}</strong> adalah keuntungan bersih yang didapatkan oleh usaha Anda.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-center">
                <div>
                  <p className="text-coffee-500 font-medium uppercase tracking-widest text-xs mb-1">Kasir</p>
                  <h2 className="text-4xl font-serif font-bold text-coffee-950">
                    {orderView === 'pos' ? 'Orderan Masuk' : 'Histori Orderan'}
                  </h2>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex bg-coffee-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setOrderView('pos')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                        orderView === 'pos' ? "bg-white text-coffee-900 shadow-sm" : "text-coffee-500 hover:text-coffee-700"
                      )}
                    >
                      POS
                    </button>
                    <button 
                      onClick={() => setOrderView('history')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                        orderView === 'history' ? "bg-white text-coffee-900 shadow-sm" : "text-coffee-500 hover:text-coffee-700"
                      )}
                    >
                      Histori
                    </button>
                  </div>
                </div>
              </header>

              {orderView === 'pos' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Menu Selection Section */}
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-xl font-serif font-bold text-coffee-950">Pilih Menu</h3>
                        <div className="relative w-full md:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={18} />
                          <input 
                            ref={searchInputRef}
                            type="text"
                            placeholder="Cari menu... (/)"
                            value={menuSearch}
                            className="w-full bg-white border border-coffee-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm transition-all"
                            onChange={(e) => setMenuSearch(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Category Tabs */}
                      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                        {[
                          { id: 'Semua', icon: <LayoutDashboard size={16} /> },
                          { id: 'Kopi', icon: <Coffee size={16} /> },
                          { id: 'Non-Kopi', icon: <Milk size={16} /> },
                          { id: 'Makanan', icon: <Utensils size={16} /> },
                          { id: 'Snack', icon: <Cookie size={16} /> }
                        ].map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                              "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black whitespace-nowrap transition-all duration-300 border-2",
                              selectedCategory === cat.id 
                                ? "bg-coffee-900 border-coffee-900 text-white shadow-xl shadow-coffee-200 -translate-y-1" 
                                : "bg-white border-coffee-50 text-coffee-400 hover:border-coffee-200 hover:text-coffee-600"
                            )}
                          >
                            {cat.icon}
                            {cat.id}
                          </button>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar pb-4">
                        {menus
                          .filter(m => {
                            const matchSearch = m.name.toLowerCase().includes(menuSearch.toLowerCase());
                            const matchCategory = selectedCategory === 'Semua' || m.category === selectedCategory;
                            return matchSearch && matchCategory;
                          })
                          .map(menu => {
                            const available = isMenuAvailable(menu);
                            const inCart = cart.find(c => c.menu.id === menu.id);
                            return (
                              <button
                                key={menu.id}
                                disabled={!available}
                                onClick={() => handleAddToCart(menu)}
                                className={cn(
                                  "glass-card p-0 text-left transition-all group relative overflow-hidden flex flex-col h-full border-2",
                                  available 
                                    ? "hover:border-coffee-400 active:scale-95 bg-white" 
                                    : "opacity-60 grayscale cursor-not-allowed bg-slate-50",
                                  inCart ? "border-coffee-600 bg-coffee-50/30" : "border-transparent"
                                )}
                              >
                                {/* Image Section */}
                                <div className="relative aspect-square overflow-hidden bg-coffee-50">
                                  {menu.image_url ? (
                                    <img 
                                      src={menu.image_url} 
                                      alt={menu.name} 
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-coffee-200">
                                      <Coffee size={48} />
                                    </div>
                                  )}
                                  
                                  {/* Overlay for actions */}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                  
                                  {!available && (
                                    <div className="absolute top-2 right-2 bg-rose-500 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
                                      Habis
                                    </div>
                                  )}
                                  
                                  {available && !inCart && (
                                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-coffee-900 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg">
                                      <Plus size={18} />
                                    </div>
                                  )}

                                  {inCart && (
                                    <motion.div 
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="absolute top-2 left-2 bg-coffee-900 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center shadow-xl border-2 border-white z-10"
                                    >
                                      {inCart.quantity}
                                    </motion.div>
                                  )}
                                </div>

                                <div className="p-4 flex-1 flex flex-col">
                                  <div className="flex justify-between items-start mb-1">
                                    <p className="text-[10px] font-black text-coffee-400 uppercase tracking-widest">{menu.category || 'Menu'}</p>
                                  </div>
                                  <h4 className="font-bold text-coffee-950 text-sm mb-2 line-clamp-2 leading-tight group-hover:text-coffee-700 transition-colors">{menu.name}</h4>
                                  <div className="mt-auto flex justify-between items-center">
                                    <p className="text-sm text-coffee-900 font-black">{formatIDR(menu.price)}</p>
                                    <div className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                      inCart ? "bg-coffee-900 text-white" : "bg-coffee-50 text-coffee-400 group-hover:bg-coffee-100"
                                    )}>
                                      {inCart ? <Check size={16} /> : <Coffee size={16} />}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Sidebar Summary - Hidden on Mobile */}
                  <div className="hidden lg:block space-y-6">
                    {/* Desktop Cart Section - Moved to Right Column */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-serif font-bold text-coffee-950">Daftar Orderan</h3>
                      {cart.length === 0 ? (
                        <div className="glass-card p-8 flex flex-col items-center justify-center text-center bg-white/50 border-dashed border-2">
                          <div className="bg-coffee-50 p-4 rounded-full mb-3">
                            <ShoppingCart size={32} className="text-coffee-200" />
                          </div>
                          <p className="text-sm text-coffee-500 font-medium">Keranjang Kosong</p>
                        </div>
                      ) : (
                        <div className="glass-card overflow-hidden bg-white shadow-sm border-coffee-100">
                          <div className="max-h-[calc(100vh-450px)] overflow-y-auto custom-scrollbar">
                            <table className="w-full">
                              <thead className="sticky top-0 z-10">
                                <tr className="border-b border-coffee-100 bg-coffee-50/90 backdrop-blur-sm">
                                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-coffee-400">Item</th>
                                  <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-coffee-400">Qty</th>
                                  <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-coffee-400">Subtotal</th>
                                  <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-coffee-400"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-coffee-50">
                                {cart.map((item) => (
                                  <tr key={item.menu.id} className="hover:bg-coffee-50/30 transition-colors">
                                    <td className="px-4 py-3">
                                      <div>
                                        <p className="font-bold text-coffee-950 text-xs">{item.menu.name}</p>
                                        <p className="text-[10px] text-coffee-500">{formatIDR(item.menu.price)}</p>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center justify-center gap-2">
                                        <button 
                                          onClick={() => handleUpdateCartQuantity(item.menu.id, -1)}
                                          className="w-6 h-6 flex items-center justify-center rounded-md border border-coffee-200 text-coffee-600 hover:bg-coffee-50 text-xs"
                                        >
                                          -
                                        </button>
                                        <span className="font-bold text-coffee-900 text-xs w-4 text-center">{item.quantity}</span>
                                        <button 
                                          onClick={() => handleUpdateCartQuantity(item.menu.id, 1)}
                                          className="w-6 h-6 flex items-center justify-center rounded-md border border-coffee-200 text-coffee-600 hover:bg-coffee-50 text-xs"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-coffee-950 text-xs">
                                      {formatIDR(item.menu.price * item.quantity)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <button 
                                        onClick={() => handleRemoveFromCart(item.menu.id)}
                                        className="text-coffee-300 hover:text-rose-500 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="glass-card p-6 bg-coffee-950 text-white border-none sticky top-24 shadow-2xl shadow-coffee-900/20 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
                      <h3 className="text-lg font-serif font-bold mb-6">Ringkasan Order</h3>
                      
                      <div className="mb-6">
                        <label className="block text-[10px] font-bold uppercase text-coffee-400 mb-3 tracking-widest">Nama Pembeli</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={14} />
                          <input 
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Nama pembeli..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-coffee-100 focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-all placeholder:text-coffee-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-coffee-400 mb-3 tracking-widest">No. Meja</label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={14} />
                            <input 
                              type="text"
                              value={tableNumber}
                              onChange={(e) => setTableNumber(e.target.value)}
                              placeholder="Meja..."
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-coffee-100 focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-all placeholder:text-coffee-600"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-coffee-400 mb-3 tracking-widest">Loyalty</label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={14} />
                            <select 
                              value={selectedCustomerId || ''}
                              onChange={(e) => {
                                const id = e.target.value ? Number(e.target.value) : null;
                                setSelectedCustomerId(id);
                                if (id) {
                                  const cust = customers.find(c => c.id === id);
                                  if (cust) setCustomerName(cust.name);
                                }
                              }}
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-coffee-100 focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-all appearance-none"
                            >
                              <option value="" className="bg-coffee-950">Umum</option>
                              {customers.map(c => (
                                <option key={c.id} value={c.id} className="bg-coffee-950">{c.name} ({c.points} pts)</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-coffee-400 text-sm">
                          <span>Total Item</span>
                          <span className="text-white font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div className="flex justify-between items-baseline">
                          <span className="text-coffee-400 text-sm">Total Bayar</span>
                          <span className="text-3xl font-bold text-white">
                            {formatIDR(cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0))}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/20"
                        disabled={loading || cart.length === 0}
                      >
                        <CreditCard size={20} />
                        Pilih Pembayaran
                      </button>

                      {lastOrder && (
                        <button 
                          onClick={() => handleReprint()}
                          className="w-full mt-3 bg-coffee-100 text-coffee-900 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-coffee-200 transition-all"
                        >
                          <Printer size={16} />
                          Cetak Ulang Struk Terakhir
                        </button>
                      )}
                    </div>

                    <div className="glass-card p-6 border-dashed border-2 border-coffee-200 bg-transparent">
                      <p className="text-xs font-bold uppercase tracking-widest text-coffee-400 mb-4 flex items-center gap-2">
                        <AlertCircle size={14} /> Catatan Kasir
                      </p>
                      <p className="text-sm text-coffee-600 italic">
                        "Pastikan stok bahan baku mencukupi sebelum memproses pembayaran. Sistem akan memvalidasi stok secara otomatis."
                      </p>
                    </div>
                  </div>

                  {/* Mobile Floating Cart Button */}
                  {cart.length > 0 && (
                    <motion.button
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      onClick={() => setShowMobileCart(true)}
                      className="lg:hidden fixed bottom-24 right-6 z-40 bg-coffee-900 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 border-4 border-white active:scale-90 transition-transform"
                    >
                      <div className="relative">
                        <ShoppingCart size={24} />
                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-coffee-900">
                          {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                      <span className="font-bold text-sm pr-2">
                        {formatIDR(cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0))}
                      </span>
                    </motion.button>
                  )}

                  {/* Mobile Cart Slide-over */}
                  <AnimatePresence>
                    {showMobileCart && (
                      <div className="fixed inset-0 z-[60] lg:hidden">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowMobileCart(false)}
                          className="absolute inset-0 bg-coffee-950/60 backdrop-blur-sm"
                        />
                        <motion.div 
                          initial={{ y: "100%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "100%" }}
                          transition={{ type: "spring", damping: 25, stiffness: 200 }}
                          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                          <div className="p-6 border-b border-coffee-100 flex justify-between items-center bg-coffee-50/50">
                            <div className="flex items-center gap-3">
                              <div className="bg-coffee-900 text-white p-2 rounded-xl">
                                <ShoppingCart size={20} />
                              </div>
                              <h3 className="text-xl font-serif font-bold text-coffee-950">Keranjang Saya</h3>
                            </div>
                            <button 
                              onClick={() => setShowMobileCart(false)}
                              className="w-10 h-10 rounded-full bg-white border border-coffee-100 flex items-center justify-center text-coffee-400 hover:text-coffee-900"
                            >
                              <X size={20} />
                            </button>
                          </div>

                          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            <div className="space-y-4">
                              {cart.map((item) => (
                                <div key={item.menu.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                  <div className="bg-white p-3 rounded-xl shadow-sm">
                                    <Coffee size={20} className="text-coffee-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-coffee-950 text-sm">{item.menu.name}</h4>
                                    <p className="text-xs text-coffee-500">{formatIDR(item.menu.price)}</p>
                                  </div>
                                  <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200">
                                    <button 
                                      onClick={() => handleUpdateCartQuantity(item.menu.id, -1)}
                                      className="w-8 h-8 flex items-center justify-center rounded-lg text-coffee-600 hover:bg-coffee-50 active:bg-coffee-100"
                                    >
                                      -
                                    </button>
                                    <span className="font-bold text-coffee-900 w-4 text-center">{item.quantity}</span>
                                    <button 
                                      onClick={() => handleUpdateCartQuantity(item.menu.id, 1)}
                                      className="w-8 h-8 flex items-center justify-center rounded-lg text-coffee-600 hover:bg-coffee-50 active:bg-coffee-100"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="space-y-4">
                              <div className="bg-coffee-50 p-6 rounded-3xl space-y-4 border border-coffee-100">
                                <div className="space-y-2">
                                  <label className="block text-[10px] font-black uppercase text-coffee-400 tracking-widest">Nama Pembeli</label>
                                  <input 
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Ketik nama pembeli..."
                                    className="w-full bg-white border border-coffee-200 rounded-2xl px-4 py-3 text-sm text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 bg-white border-t border-coffee-100 space-y-4">
                            <div className="flex justify-between items-baseline px-2">
                              <span className="text-coffee-950 font-serif font-bold text-lg">Total Bayar</span>
                              <span className="text-2xl font-black text-coffee-900">
                                {formatIDR(cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0))}
                              </span>
                            </div>
                            <button 
                              onClick={() => {
                                setShowMobileCart(false);
                                setShowPaymentModal(true);
                              }}
                              className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-emerald-200"
                              disabled={loading || cart.length === 0}
                            >
                              <CreditCard size={20} />
                              LANJUT PEMBAYARAN
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="glass-card p-4 md:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif font-bold text-coffee-950">Riwayat Penjualan</h3>
                  </div>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-coffee-500 text-xs uppercase tracking-widest border-b border-coffee-100">
                          <th className="pb-4 font-bold">Waktu</th>
                          <th className="pb-4 font-bold">Metode</th>
                          <th className="pb-4 font-bold">Deskripsi</th>
                          <th className="pb-4 font-bold text-right">Total</th>
                          <th className="pb-4 font-bold text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-coffee-50">
                        {transactions
                          .filter(tx => tx.type === 'income' && tx.category === 'Sales')
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(tx => (
                            <tr key={tx.id} className="hover:bg-coffee-50/50 transition-colors">
                              <td className="py-4 text-sm text-coffee-600">
                                {formatDate(new Date(tx.date), 'HH:mm')}
                                <span className="text-[10px] block text-coffee-400">{formatDate(new Date(tx.date), 'dd MMM yyyy')}</span>
                              </td>
                              <td className="py-4">
                                <span className="px-2 py-1 bg-coffee-100 rounded text-[10px] font-bold text-coffee-600 uppercase">
                                  {tx.payment_method || 'Cash'}
                                </span>
                              </td>
                              <td className="py-4 text-sm text-coffee-900 font-medium">{tx.description}</td>
                              <td className="py-4 text-sm font-bold text-right text-emerald-600">
                                {formatIDR(tx.amount)}
                              </td>
                              <td className="py-4 text-right">
                                {tx.order_id && (
                                  <button
                                    onClick={() => handleReprint(tx.order_id)}
                                    className="p-2 text-coffee-400 hover:text-coffee-900 hover:bg-coffee-100 rounded-lg transition-all"
                                    title="Cetak Ulang Struk"
                                  >
                                    <Printer size={16} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile List */}
                  <div className="md:hidden space-y-4">
                    {transactions
                      .filter(tx => tx.type === 'income' && tx.category === 'Sales')
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(tx => (
                        <div key={tx.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-coffee-900">{formatDate(new Date(tx.date), 'HH:mm')}</span>
                              <span className="px-1.5 py-0.5 bg-coffee-100 rounded text-[8px] font-black text-coffee-600 uppercase">
                                {tx.payment_method || 'Cash'}
                              </span>
                            </div>
                            <p className="text-xs text-coffee-600 font-medium line-clamp-1">{tx.description}</p>
                            <p className="text-[10px] text-coffee-400">{formatDate(new Date(tx.date), 'dd MMM yyyy')}</p>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-sm font-black text-emerald-600">{formatIDR(tx.amount)}</p>
                            {tx.order_id && (
                              <button 
                                onClick={() => handleReprint(tx.order_id)}
                                className="p-2 bg-white border border-coffee-100 text-coffee-600 rounded-xl shadow-sm active:scale-90 transition-transform"
                              >
                                <Printer size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div 
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-center">
                <div>
                  <p className="text-coffee-500 font-medium uppercase tracking-widest text-xs mb-1">Manajemen Barang</p>
                  <h2 className="text-4xl font-serif font-bold text-coffee-950">
                    Inventory {invCategoryFilter === 'Semua' ? 'Stok' : (invCategoryFilter === 'Bahan' ? t('raw_material') : (invCategoryFilter === 'Barang' ? t('goods') : invCategoryFilter))}
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex bg-white p-1 rounded-2xl border border-coffee-100 shadow-sm no-print">
                    {(['Semua', 'Bahan', 'Barang'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setInvCategoryFilter(type)}
                        className={cn(
                          "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                          invCategoryFilter === type ? "bg-coffee-900 text-white shadow-lg" : "text-coffee-500 hover:bg-coffee-50"
                        )}
                      >
                        {type === 'Semua' ? 'Semua' : (type === 'Bahan' ? t('raw_material') : t('goods'))}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      setEditingInvId(null);
                      setNewInv({ name: '', quantity: 0, unit: 'pcs', min_stock: 0, unit_price: 0, category: 'Bahan', type: (invCategoryFilter === 'Bahan' || invCategoryFilter === 'Barang') ? invCategoryFilter : 'Bahan' });
                      setCalcPurchase({ qty: 1, content: 0, totalPrice: 0 });
                      setShowCalculator(false);
                      setShowInvModal(true);
                    }}
                    className="bg-coffee-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
                  >
                    <Plus size={20} />
                    <span className="font-bold">Tambah Item</span>
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inventory
                  .filter(item => invCategoryFilter === 'Semua' || item.type === invCategoryFilter || item.category === invCategoryFilter)
                  .map(item => (
                  <div key={item.id} className="glass-card p-6 group hover:border-coffee-400 transition-colors relative">
                    <div className="absolute top-4 right-16 flex gap-2">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md",
                        item.type === 'Barang' ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {item.type === 'Bahan' ? t('raw_material') : t('goods')}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-coffee-100 text-coffee-600"
                      )}>
                        {item.category || 'Bahan'}
                      </span>
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-coffee-100 p-3 rounded-2xl group-hover:bg-coffee-200 transition-colors">
                        <Package className="text-coffee-600" />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditInventory(item)}
                          className="text-coffee-300 hover:text-coffee-600 transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteInventory(item.id)}
                          className="text-coffee-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-coffee-950 mb-1">{item.name}</h4>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-coffee-900">{item.quantity}</span>
                      <span className="text-coffee-500 font-medium">{item.unit}</span>
                    </div>
                    <p className="text-xs font-bold text-coffee-400 mb-4">
                      Harga: {formatIDR(item.unit_price)} / {item.unit}
                    </p>
                    
                    <div className="space-y-4">
                      <div className="w-full bg-coffee-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500",
                            item.quantity <= item.min_stock ? "bg-amber-500" : "bg-coffee-600"
                          )}
                          style={{ width: `${Math.min(100, (item.quantity / (item.min_stock * 3)) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                        <span className="text-coffee-400">Min: {item.min_stock} {item.unit}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setConfirmUpdate({ id: item.id, name: item.name, currentQty: item.quantity, delta: -1 })}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-coffee-200 text-coffee-600 hover:bg-coffee-50"
                          >
                            -
                          </button>
                          <button 
                            onClick={() => setConfirmUpdate({ id: item.id, name: item.name, currentQty: item.quantity, delta: 1 })}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-coffee-200 text-coffee-600 hover:bg-coffee-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setPurchaseData({ id: item.id, name: item.name, unit: item.unit, quantity: 1, totalPrice: item.unit_price });
                        setShowPurchaseModal(true);
                      }}
                      className="w-full mt-4 bg-emerald-50 text-emerald-600 py-2 rounded-xl font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Beli Stok
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'queue' && (
            <motion.div 
              key="queue"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-center">
                <div>
                  <p className="text-coffee-500 font-medium uppercase tracking-widest text-xs mb-1">Antrian Pesanan</p>
                  <h2 className="text-4xl font-serif font-bold text-coffee-950">Pesanan Diproses</h2>
                </div>
                <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                  <Clock size={16} />
                  {activeOrders.length} Pesanan Menunggu
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeOrders.length === 0 ? (
                  <div className="col-span-full glass-card p-12 text-center">
                    <div className="w-20 h-20 bg-coffee-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="text-coffee-300" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-coffee-950 mb-2">Semua Pesanan Selesai!</h3>
                    <p className="text-coffee-500">Belum ada pesanan baru yang masuk ke antrian.</p>
                  </div>
                ) : (
                  activeOrders.map(order => (
                    <div key={order.orderId} className="glass-card overflow-hidden border-l-4 border-l-amber-500">
                      <div className="p-6 bg-coffee-50 border-b border-coffee-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-white",
                            order.source === 'GrabFood' ? "bg-emerald-500" :
                            order.source === 'GoFood' ? "bg-rose-500" :
                            order.source === 'ShopeeFood' ? "bg-orange-500" :
                            "bg-coffee-900"
                          )}>
                            {order.source === 'GrabFood' ? <ShoppingBag size={20} /> :
                             order.source === 'GoFood' ? <ShoppingBag size={20} /> :
                             order.source === 'ShopeeFood' ? <ShoppingBag size={20} /> :
                             <Store size={20} />}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-coffee-400">Order ID</p>
                            <h4 className="font-mono font-bold text-coffee-950">{order.orderId}</h4>
                          </div>
                        </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-coffee-400">Customer</p>
                            <h4 className="font-bold text-coffee-950">{order.customerName} {order.tableNumber && `(Meja ${order.tableNumber})`}</h4>
                            <div className="flex flex-col items-end gap-1 mt-1">
                              {order.status === 'pending' && (
                                <span className="inline-block bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                  Belum Bayar
                                </span>
                              )}
                              <span className="inline-block bg-coffee-50 text-coffee-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {order.paymentMethod || 'Tunai'}
                              </span>
                            </div>
                          </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-coffee-50 last:border-0">
                              <span className="text-coffee-900 font-medium">{item.name}</span>
                              <span className="bg-coffee-100 text-coffee-700 px-2 py-1 rounded-lg text-xs font-bold">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        {order.notes && (
                          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1 flex items-center gap-1">
                              <Info size={10} /> Catatan
                            </p>
                            <p className="text-xs text-amber-900 italic">"{order.notes}"</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-coffee-400 font-bold uppercase tracking-wider mb-4">
                          <Clock size={12} />
                          Dipesan pada {formatDate(new Date(order.date), 'HH:mm')}
                        </div>
                        {order.status === 'pending' ? (
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => {
                                // Load order into cart and open payment
                                fetch(`/api/orders/${order.orderId}`)
                                  .then(res => res.json())
                                  .then(data => {
                                    setCart(data.items);
                                    setCustomerName(data.customerName || '');
                                    setTableNumber(data.tableNumber || '');
                                    setCurrentOrderId(order.orderId);
                                    setPaymentMethod(data.paymentMethod || 'Tunai');
                                    setShowPaymentModal(true);
                                  });
                              }}
                              className="w-full bg-coffee-100 text-coffee-700 py-3 rounded-xl font-bold hover:bg-coffee-200 transition-all flex items-center justify-center gap-2"
                            >
                              <Edit size={16} />
                              Edit & Bayar
                            </button>
                            <button 
                              onClick={() => handleConfirmPayment(order.orderId)}
                              className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-100"
                            >
                              <CheckCircle2 size={18} />
                              Konfirmasi & Selesaikan
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleCompleteOrder(order.orderId)}
                            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                          >
                            <CheckCircle2 size={18} />
                            Selesaikan
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-center">
                <div>
                  <p className="text-coffee-500 font-medium uppercase tracking-widest text-xs mb-1">Daftar Jualan</p>
                  <h2 className="text-4xl font-serif font-bold text-coffee-950">Menu</h2>
                </div>
                <button 
                  onClick={() => {
                    setEditingMenuId(null);
                    setNewMenu({ name: '', price: 0, size: '', description: '', category: 'Kopi', image_url: '', ingredients: [], type: 'Internal', supplier_name: '', supplier_price: 0 });
                    setShowMenuModal(true);
                  }}
                  className="bg-coffee-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
                >
                  <Plus size={20} />
                  <span className="font-bold">Tambah Menu</span>
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menus.map(menu => (
                  <div key={menu.id} className="glass-card overflow-hidden group hover:border-coffee-400 transition-colors flex flex-col">
                    <div className="relative h-48 bg-coffee-50 overflow-hidden">
                      {menu.image_url ? (
                        <img 
                          src={menu.image_url} 
                          alt={menu.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-coffee-200">
                          <Coffee size={48} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="bg-white/90 backdrop-blur-sm text-coffee-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-coffee-100 w-fit">
                          {menu.category || 'Menu'}
                        </span>
                        {menu.type === 'Consignment' && (
                          <span className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-amber-400 w-fit">
                            {t('consignment')}
                          </span>
                        )}
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditMenu(menu)}
                          className="bg-white text-coffee-600 p-2 rounded-xl shadow-lg hover:bg-coffee-900 hover:text-white transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteMenu(menu.id)}
                          className="bg-white text-rose-600 p-2 rounded-xl shadow-lg hover:bg-rose-600 hover:text-white transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-bold text-coffee-950">{menu.name}</h4>
                        {menu.size && (
                          <span className="bg-coffee-50 text-coffee-600 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-coffee-100">
                            {menu.size}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-coffee-500 mb-4 line-clamp-2 flex-1">{menu.description}</p>
                      <div className="flex justify-between items-end mb-6">
                        <p className="text-2xl font-bold text-coffee-900">{formatIDR(menu.price)}</p>
                        <div className="text-right">
                          {menu.type === 'Consignment' ? (
                            <>
                              <p className="text-[10px] font-bold text-coffee-400 uppercase tracking-widest">
                                {t('supplier_price')}: {formatIDR(menu.supplier_price || 0)}
                              </p>
                              <p className={cn(
                                "text-xs font-bold uppercase tracking-widest",
                                (menu.price - (menu.supplier_price || 0)) > 0 ? "text-emerald-600" : "text-rose-600"
                              )}>
                                {t('profit_share')}: {formatIDR(menu.price - (menu.supplier_price || 0))}
                                {menu.price > 0 && (
                                  <span className="text-[10px] ml-1 opacity-70">
                                    ({Math.round(((menu.price - (menu.supplier_price || 0)) / menu.price) * 100)}%)
                                  </span>
                                )}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-[10px] font-bold text-coffee-400 uppercase tracking-widest">
                                Modal: {formatIDR(menu.ingredients.reduce((sum, ing) => sum + (ing.unit_price || 0) * ing.quantity, 0))}
                              </p>
                              <p className={cn(
                                "text-xs font-bold uppercase tracking-widest",
                                (menu.price - menu.ingredients.reduce((sum, ing) => sum + (ing.unit_price || 0) * ing.quantity, 0)) > 0 ? "text-emerald-600" : "text-rose-600"
                              )}>
                                Margin: {formatIDR(menu.price - menu.ingredients.reduce((sum, ing) => sum + (ing.unit_price || 0) * ing.quantity, 0))}
                                {menu.price > 0 && (
                                  <span className="text-[10px] ml-1 opacity-70">
                                    ({Math.round(((menu.price - menu.ingredients.reduce((sum, ing) => sum + (ing.unit_price || 0) * ing.quantity, 0)) / menu.price) * 100)}%)
                                  </span>
                                )}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {menu.type === 'Internal' ? (
                        <div className="space-y-3 mb-6">
                          <p className="text-xs font-bold uppercase tracking-widest text-coffee-400 flex items-center gap-2">
                            <Info size={14} /> Resep & Takaran
                          </p>
                          <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                            {menu.ingredients.map(ing => (
                              <div key={ing.id} className="flex justify-between text-sm mb-2 last:mb-0">
                                <div className="flex flex-col">
                                  <span className="text-coffee-600">{ing.inventory_name}</span>
                                  <span className="text-[10px] text-coffee-400 italic">
                                    {ing.quantity} {ing.unit} x {formatIDR(ing.unit_price || 0)}
                                  </span>
                                </div>
                                <span className="font-bold text-coffee-900">{formatIDR((ing.quantity || 0) * (ing.unit_price || 0))}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
                            <Info size={14} /> Info Penitip
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-amber-900">{menu.supplier_name}</span>
                            <span className="text-[10px] font-bold text-amber-600 bg-white px-2 py-1 rounded border border-amber-200">
                              {t('consignment')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleAddToCart(menu)}
                      className="w-full bg-coffee-100 text-coffee-900 py-4 font-bold flex items-center justify-center gap-2 hover:bg-coffee-900 hover:text-white transition-all border-t border-coffee-200"
                    >
                      <Plus size={18} />
                      Tambah ke Order
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div 
              key="transactions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-center">
                <div>
                  <p className="text-coffee-500 font-medium uppercase tracking-widest text-xs mb-1">Catatan Keuangan</p>
                  <h2 className="text-4xl font-serif font-bold text-coffee-950">Pemasukan & Pengeluaran</h2>
                </div>
                <button 
                  onClick={() => setShowTxModal(true)}
                  className="bg-coffee-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
                >
                  <Plus size={20} />
                  <span className="font-bold">Catat Transaksi</span>
                </button>
              </header>

              {/* Filters & Search */}
              <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-3xl border border-coffee-100 shadow-sm">
                <div className="flex-1 min-w-[200px] relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Cari ID Order atau Nama Customer..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="w-full bg-coffee-50 border border-coffee-100 rounded-xl pl-12 pr-4 py-2 text-sm font-medium text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-coffee-400">Tipe:</span>
                  <select 
                    value={txFilter.type}
                    onChange={e => setTxFilter({...txFilter, type: e.target.value})}
                    className="bg-coffee-50 border border-coffee-100 rounded-xl px-3 py-2 text-sm font-medium text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-coffee-400">Kategori:</span>
                  <select 
                    value={txFilter.category}
                    onChange={e => setTxFilter({...txFilter, category: e.target.value})}
                    className="bg-coffee-50 border border-coffee-100 rounded-xl px-3 py-2 text-sm font-medium text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  >
                    <option value="">Semua Kategori</option>
                    {txFilter.type === 'income' ? (
                      <>
                        <option value="Sales">Sales</option>
                        <option value="Catering">Catering</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    ) : txFilter.type === 'expense' ? (
                      <>
                        <option value="Supplies">Supplies</option>
                        <option value="Rent">Rent</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="Sales">Sales</option>
                        <option value="Catering">Catering</option>
                        <option value="Supplies">Supplies</option>
                        <option value="Rent">Rent</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    )}
                  </select>
                </div>
                <button 
                  onClick={() => setTxFilter({ type: '', category: '' })}
                  className="text-xs font-bold text-coffee-400 hover:text-coffee-600 transition-colors ml-auto"
                >
                  Reset Filter
                </button>
              </div>

              <div className="glass-card p-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-coffee-500 text-xs uppercase tracking-widest border-b border-coffee-100">
                        <th className="pb-4 font-bold">Waktu</th>
                        <th className="pb-4 font-bold">ID Order</th>
                        <th className="pb-4 font-bold">Tipe</th>
                        <th className="pb-4 font-bold">Kategori</th>
                        <th className="pb-4 font-bold">Deskripsi</th>
                        <th className="pb-4 font-bold text-right">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-coffee-50">
                      {transactions
                        .filter(tx => {
                          if (!txSearch) return true;
                          const search = txSearch.toLowerCase();
                          return (
                            (tx.order_id && tx.order_id.toLowerCase().includes(search)) ||
                            (tx.customer_name && tx.customer_name.toLowerCase().includes(search)) ||
                            (tx.description && tx.description.toLowerCase().includes(search))
                          );
                        })
                        .map(tx => (
                        <tr key={tx.id} className="hover:bg-coffee-50/50 transition-colors">
                          <td className="py-4 text-sm text-coffee-600">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              {formatDate(new Date(tx.date), 'dd/MM/yy HH:mm')}
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-xs font-mono font-bold text-coffee-400">{tx.order_id || '-'}</span>
                          </td>
                          <td className="py-4">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              tx.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                            )}>
                              {tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-sm font-bold text-coffee-900">{tx.category}</span>
                          </td>
                          <td className="py-4 text-sm text-coffee-600 italic">{tx.description || '-'}</td>
                          <td className={cn(
                            "py-4 text-sm font-bold text-right",
                            tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {tx.type === 'income' ? '+' : '-'} {formatIDR(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && user.role === 'admin' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-center">
                <div>
                  <p className="text-coffee-500 font-medium uppercase tracking-widest text-xs mb-1">Pengaturan Sistem</p>
                  <h2 className="text-4xl font-serif font-bold text-coffee-950">Manajemen User</h2>
                </div>
                <button 
                  onClick={() => {
                    setEditingUserId(null);
                    setNewUserData({ username: '', password: '', role: 'cashier' });
                    setShowUserModal(true);
                  }}
                  className="bg-coffee-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
                >
                  <Plus size={20} />
                  <span className="font-bold">Tambah User</span>
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(u => (
                  <div key={u.id} className="glass-card p-6 group hover:border-coffee-400 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-coffee-100 p-3 rounded-2xl group-hover:bg-coffee-200 transition-colors">
                        <User className="text-coffee-600" />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingUserId(u.id);
                            setNewUserData({ username: u.username, password: '', role: u.role });
                            setShowUserModal(true);
                          }}
                          className="text-coffee-300 hover:text-coffee-600 transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-coffee-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-coffee-950 mb-1">{u.username}</h4>
                    <p className="text-xs font-bold text-coffee-500 uppercase tracking-widest bg-coffee-50 inline-block px-2 py-1 rounded-lg">
                      {u.role}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'loyalty' && (
            <motion.div 
              key="loyalty"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-coffee-500 font-medium uppercase tracking-widest text-xs mb-1">Customer Relationship</p>
                  <h2 className="text-4xl font-serif font-bold text-coffee-950">Loyalty Program</h2>
                </div>
                <button 
                  onClick={() => {
                    setEditingCustomerId(null);
                    setNewCustomer({ name: '', phone: '', email: '' });
                    setShowCustomerModal(true);
                  }}
                  className="flex items-center gap-2 bg-coffee-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
                >
                  <Plus size={20} />
                  Tambah Customer
                </button>
              </header>

              <div className="glass-card overflow-hidden border-coffee-100 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-coffee-50 border-b border-coffee-100">
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500">Nama</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500">Kontak</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500">Poin</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500">Terdaftar</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-coffee-50">
                      {customers.map(cust => (
                        <tr key={cust.id} className="hover:bg-coffee-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-coffee-950">{cust.name}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-coffee-600">{cust.phone || '-'}</p>
                            <p className="text-xs text-coffee-400">{cust.email || '-'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Star size={14} className="text-amber-500 fill-amber-500" />
                              <span className="font-bold text-coffee-950">{cust.points} pts</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-coffee-500">{formatDate(new Date(cust.created_at), 'dd MMM yyyy')}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setEditingCustomerId(cust.id);
                                  setNewCustomer({ name: cust.name, phone: cust.phone || '', email: cust.email || '' });
                                  setShowCustomerModal(true);
                                }}
                                className="p-2 text-coffee-400 hover:text-coffee-600 hover:bg-coffee-100 rounded-xl transition-all"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteCustomer(cust.id)}
                                className="p-2 text-coffee-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && user.role === 'admin' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <p className="text-coffee-500 font-medium uppercase tracking-widest text-xs mb-1">Kustomisasi Aplikasi</p>
                  <h2 className="text-4xl font-serif font-bold text-coffee-950">Pengaturan</h2>
                </div>
                <div className="flex bg-coffee-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
                  {[
                    { id: 'general', label: t('general'), icon: Settings },
                    { id: 'theme', label: t('theme'), icon: Palette },
                    { id: 'ads', label: 'Iklan', icon: ImageIcon },
                    { id: 'promos', label: 'Promo', icon: Tag },
                    { id: 'email', label: t('email'), icon: Bell },
                    { id: 'payment', label: t('payment'), icon: CreditCard },
                    { id: 'delivery', label: t('delivery'), icon: ShoppingBag },
                    { id: 'receipt', label: t('receipt'), icon: Printer },
                    { id: 'webhook', label: t('webhook'), icon: Settings },
                    { id: 'backup', label: t('backup'), icon: Database },
                    { id: 'shortcuts', label: t('shortcuts'), icon: Keyboard },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsSubTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                        settingsSubTab === tab.id 
                          ? "bg-white text-coffee-900 shadow-sm" 
                          : "text-coffee-500 hover:text-coffee-700"
                      )}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </header>

              <div className="space-y-8">
                {settingsSubTab === 'ads' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-coffee-950">Manajemen Iklan</h3>
                        <p className="text-coffee-500 text-sm">Kelola konten promosi di sisi kiri layar customer.</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingAd(null);
                          setNewAd({ type: 'image', url: '', title: '', subtitle: '', active: true });
                          setShowAdModal(true);
                        }}
                        className="flex items-center gap-2 bg-coffee-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
                      >
                        <Plus size={20} />
                        Tambah Iklan
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {ads.map((ad) => (
                        <div key={ad.id} className="glass-card overflow-hidden group">
                          <div className="aspect-video relative bg-coffee-50">
                            {ad.type === 'video' ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <Monitor size={48} className="text-coffee-300" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <Play size={32} className="text-white" />
                                </div>
                              </div>
                            ) : (
                              <img src={ad.url} alt={ad.title} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                              <button
                                onClick={() => {
                                  setEditingAd(ad);
                                  setNewAd({ ...ad });
                                  setShowAdModal(true);
                                }}
                                className="p-2 bg-white/90 backdrop-blur rounded-xl text-coffee-600 hover:bg-white shadow-lg"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('Hapus iklan ini?')) {
                                    await fetch(`/api/ads/${ad.id}`, {
                                      method: 'DELETE',
                                      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                    });
                                    fetchAds();
                                  }
                                }}
                                className="p-2 bg-white/90 backdrop-blur rounded-xl text-rose-600 hover:bg-white shadow-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="absolute bottom-4 left-4">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${ad.active ? 'bg-emerald-500 text-white' : 'bg-coffee-200 text-coffee-700'}`}>
                                {ad.active ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-coffee-950 truncate flex-1">{ad.title}</h4>
                              <span className="text-[10px] font-black text-coffee-400 uppercase tracking-widest ml-2">{ad.type}</span>
                            </div>
                            <p className="text-sm text-coffee-500 truncate">{ad.subtitle || '-'}</p>
                          </div>
                        </div>
                      ))}
                      {ads.length === 0 && (
                        <div className="col-span-full py-20 text-center glass-card">
                          <ImageIcon size={48} className="mx-auto text-coffee-200 mb-4" />
                          <p className="text-coffee-500 font-medium">Belum ada iklan yang ditambahkan.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {settingsSubTab === 'promos' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-coffee-950">Manajemen Promo</h3>
                        <p className="text-coffee-500 text-sm">Buat kode promo untuk diskon menu atau kategori.</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingPromo(null);
                          setNewPromo({ code: '', discount_type: 'percentage', discount_value: 0, target_type: 'all', target_ids: [], active: true });
                          setShowPromoModal(true);
                        }}
                        className="flex items-center gap-2 bg-coffee-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
                      >
                        <Plus size={20} />
                        Tambah Promo
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {promos.map((promo) => (
                        <div key={promo.id} className="glass-card p-8 group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                          
                          <div className="relative flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl">
                                <Tag size={32} />
                              </div>
                              <div>
                                <h4 className="font-black text-3xl text-coffee-950 tracking-tighter">{promo.code}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-bold text-indigo-600">
                                    {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `${formatIDR(promo.discount_value)} OFF`}
                                  </span>
                                  <span className="text-coffee-300">•</span>
                                  <span className="text-xs font-bold text-coffee-400 uppercase tracking-widest">{promo.target_type}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button
                                onClick={() => {
                                  setEditingPromo(promo);
                                  setNewPromo({ ...promo });
                                  setShowPromoModal(true);
                                }}
                                className="p-2 text-coffee-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              >
                                <Edit size={20} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('Hapus promo ini?')) {
                                    await fetch(`/api/promos/${promo.id}`, {
                                      method: 'DELETE',
                                      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                    });
                                    fetchPromos();
                                  }
                                }}
                                className="p-2 text-coffee-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-8 flex items-center justify-between pt-6 border-t border-coffee-50">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${promo.active ? 'bg-emerald-500 animate-pulse' : 'bg-coffee-300'}`} />
                              <span className={`text-xs font-bold uppercase tracking-widest ${promo.active ? 'text-emerald-600' : 'text-coffee-400'}`}>
                                {promo.active ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </div>
                            <div className="flex -space-x-2">
                              {/* Visual representation of targets if any */}
                              <div className="w-8 h-8 rounded-full bg-coffee-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-coffee-600">
                                {promo.target_type === 'all' ? 'All' : promo.target_ids.length}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {promos.length === 0 && (
                        <div className="col-span-full py-20 text-center glass-card">
                          <Gift size={48} className="mx-auto text-coffee-200 mb-4" />
                          <p className="text-coffee-500 font-medium">Belum ada promo yang ditambahkan.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {settingsSubTab === 'general' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* App Identity */}
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="bg-coffee-100 p-3 rounded-2xl text-coffee-900">
                          <TypeIcon size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold">{t('app_identity')}</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">{t('app_name')}</label>
                          <input 
                            type="text" 
                            value={appSettings.app_name}
                            onChange={e => setAppSettings({...appSettings, app_name: e.target.value})}
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">{t('customer_page_title')}</label>
                          <input 
                            type="text" 
                            value={appSettings.customer_page_title}
                            onChange={e => setAppSettings({...appSettings, customer_page_title: e.target.value})}
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            placeholder="Contoh: MOPI Coffee"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">{t('customer_page_subtitle')}</label>
                          <input 
                            type="text" 
                            value={appSettings.customer_page_subtitle}
                            onChange={e => setAppSettings({...appSettings, customer_page_subtitle: e.target.value})}
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            placeholder="Contoh: Menu Pelanggan"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">{t('app_icon')}</label>
                          <select 
                            value={appSettings.app_icon}
                            onChange={e => setAppSettings({...appSettings, app_icon: e.target.value})}
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          >
                            <option value="Coffee">Coffee</option>
                            <option value="UtensilsCrossed">Utensils</option>
                            <option value="ShoppingCart">Cart</option>
                            <option value="Package">Package</option>
                            <option value="Wallet">Wallet</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">{t('timezone')}</label>
                          <select 
                            value={appSettings.timezone}
                            onChange={e => setAppSettings({...appSettings, timezone: e.target.value})}
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          >
                            <option value="Asia/Jakarta">WIB (UTC+7)</option>
                            <option value="Asia/Makassar">WITA (UTC+8)</option>
                            <option value="Asia/Jayapura">WIT (UTC+9)</option>
                            <option value="Asia/Singapore">Singapore (UTC+8)</option>
                            <option value="Asia/Bangkok">Bangkok (UTC+7)</option>
                            <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                            <option value="Asia/Seoul">Seoul (UTC+9)</option>
                            <option value="Asia/Dubai">Dubai (UTC+4)</option>
                            <option value="Europe/London">London (UTC+0/+1)</option>
                            <option value="Europe/Paris">Paris (UTC+1/+2)</option>
                            <option value="America/New_York">New York (UTC-5/-4)</option>
                            <option value="America/Los_Angeles">Los Angeles (UTC-8/-7)</option>
                            <option value="Australia/Sydney">Sydney (UTC+10/+11)</option>
                            <option value="UTC">UTC</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">{t('language')}</label>
                          <select 
                            value={appSettings.language}
                            onChange={e => setAppSettings({...appSettings, language: e.target.value})}
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          >
                            <option value="id">Bahasa Indonesia</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                        <button 
                          onClick={() => handleUpdateSettings({ 
                            app_name: appSettings.app_name, 
                            customer_page_title: appSettings.customer_page_title,
                            customer_page_subtitle: appSettings.customer_page_subtitle,
                            app_icon: appSettings.app_icon,
                            timezone: appSettings.timezone,
                            language: appSettings.language
                          })}
                          className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                        >
                          {t('save_settings')}
                        </button>
                      </div>
                    </div>

                    {/* Reset Order ID */}
                    <div className="glass-card p-8 border-rose-100 bg-rose-50/30">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-rose-100 p-3 rounded-2xl text-rose-600">
                          <RefreshCw size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-rose-950">{t('reset_order_id')}</h3>
                      </div>
                      <p className="text-sm text-rose-600 mb-6 font-medium">
                        {t('reset_order_id_desc')}
                      </p>
                      <button 
                        onClick={handleResetOrderId}
                        className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={18} />
                        {t('reset_order_id')} ke 01
                      </button>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'backup' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Database Backup */}
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-coffee-100 p-3 rounded-2xl text-coffee-900">
                          <Database size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold">{t('backup_database')}</h3>
                      </div>
                      <p className="text-sm text-coffee-600 mb-8">
                        {t('backup_desc')}
                      </p>
                      <div className="space-y-4">
                        <button 
                          onClick={() => handleBackup('database')}
                          className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={18} />
                          {t('backup_database')}
                        </button>
                        
                        <div className="pt-6 border-t border-coffee-100">
                          <h4 className="text-xs font-bold uppercase text-coffee-500 mb-4">{t('restore_database')}</h4>
                          <p className="text-[10px] text-rose-500 font-bold mb-4 uppercase tracking-widest">{t('restore_warning')}</p>
                          <div className="space-y-4">
                            <input 
                              type="file" 
                              accept=".json"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setDbRestoreFile(file);
                              }}
                              className="block w-full text-sm text-coffee-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-coffee-100 file:text-coffee-700 hover:file:bg-coffee-200"
                            />
                            {dbRestoreFile && (
                              <button 
                                onClick={() => handleRestore('database', dbRestoreFile)}
                                className="w-full bg-rose-600 text-white py-2 rounded-xl font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                              >
                                <Check size={16} />
                                {appSettings.language === 'id' ? 'Terapkan Restore Database' : 'Apply Database Restore'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Settings Backup */}
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-coffee-100 p-3 rounded-2xl text-coffee-900">
                          <Settings size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold">{t('backup_settings')}</h3>
                      </div>
                      <p className="text-sm text-coffee-600 mb-8">
                        {t('settings_backup_desc')}
                      </p>
                      <div className="space-y-4">
                        <button 
                          onClick={() => handleBackup('settings')}
                          className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={18} />
                          {t('backup_settings')}
                        </button>

                        <div className="pt-6 border-t border-coffee-100">
                          <h4 className="text-xs font-bold uppercase text-coffee-500 mb-4">{t('restore_settings')}</h4>
                          <p className="text-[10px] text-rose-500 font-bold mb-4 uppercase tracking-widest">{t('restore_warning')}</p>
                          <div className="space-y-4">
                            <input 
                              type="file" 
                              accept=".json"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setSettingsRestoreFile(file);
                              }}
                              className="block w-full text-sm text-coffee-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-coffee-100 file:text-coffee-700 hover:file:bg-coffee-200"
                            />
                            {settingsRestoreFile && (
                              <button 
                                onClick={() => handleRestore('settings', settingsRestoreFile)}
                                className="w-full bg-rose-600 text-white py-2 rounded-xl font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                              >
                                <Check size={16} />
                                {appSettings.language === 'id' ? 'Terapkan Restore Pengaturan' : 'Apply Settings Restore'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'shortcuts' && (
                  <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="bg-coffee-100 p-3 rounded-2xl text-coffee-900">
                          <Keyboard size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold">{t('keyboard_shortcuts')}</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-coffee-50 rounded-2xl">
                          <span className="font-medium text-coffee-700">{t('fullscreen')}</span>
                          <kbd className="px-3 py-1 bg-white border border-coffee-200 rounded-lg text-xs font-bold shadow-sm">F</kbd>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-coffee-50 rounded-2xl">
                          <span className="font-medium text-coffee-700">{t('search_pos')}</span>
                          <kbd className="px-3 py-1 bg-white border border-coffee-200 rounded-lg text-xs font-bold shadow-sm">/</kbd>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-coffee-50 rounded-2xl">
                          <span className="font-medium text-coffee-700">{t('switch_tab')}</span>
                          <kbd className="px-3 py-1 bg-white border border-coffee-200 rounded-lg text-xs font-bold shadow-sm">Alt + 1-5</kbd>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-coffee-50 rounded-2xl">
                          <span className="font-medium text-coffee-700">{t('close_modal')}</span>
                          <kbd className="px-3 py-1 bg-white border border-coffee-200 rounded-lg text-xs font-bold shadow-sm">Esc</kbd>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-coffee-50 rounded-2xl">
                          <span className="font-medium text-coffee-700">{t('refresh_data')}</span>
                          <kbd className="px-3 py-1 bg-white border border-coffee-200 rounded-lg text-xs font-bold shadow-sm">R</kbd>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-coffee-50 rounded-2xl">
                          <span className="font-medium text-coffee-700">{t('shortcut_help')}</span>
                          <kbd className="px-3 py-1 bg-white border border-coffee-200 rounded-lg text-xs font-bold shadow-sm">?</kbd>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'theme' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Logo & Branding */}
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="bg-coffee-100 p-3 rounded-2xl text-coffee-900">
                          <ImageIcon size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold">Logo & Branding</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Logo Aplikasi</label>
                          <div className="flex flex-col gap-4">
                            {appSettings.app_logo_url && (
                              <div className="relative w-32 h-32 bg-white rounded-2xl border border-coffee-100 flex items-center justify-center overflow-hidden group shadow-inner">
                                <img src={appSettings.app_logo_url} alt="Logo Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                                <button 
                                  onClick={() => handleUpdateSettings({ app_logo_url: '' })}
                                  className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <Trash2 size={24} />
                                </button>
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await handleFileUpload(file);
                                  if (url) handleUpdateSettings({ app_logo_url: url });
                                }
                              }}
                              className="block w-full text-sm text-coffee-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-coffee-100 file:text-coffee-700 hover:file:bg-coffee-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Warna Tema (Primary)</label>
                          <div className="flex gap-3">
                            <input 
                              type="color" 
                              value={appSettings.primary_color}
                              onChange={e => setAppSettings({...appSettings, primary_color: e.target.value})}
                              className="w-12 h-12 rounded-lg cursor-pointer border-none"
                            />
                            <input 
                              type="text" 
                              value={appSettings.primary_color}
                              onChange={e => setAppSettings({...appSettings, primary_color: e.target.value})}
                              className="flex-1 bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            />
                          </div>
                        </div>
                        <button 
                          onClick={() => handleUpdateSettings({ primary_color: appSettings.primary_color })}
                          className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                        >
                          Simpan Branding
                        </button>
                      </div>
                    </div>

                    {/* Login Screen Theme */}
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="bg-coffee-100 p-3 rounded-2xl text-coffee-900">
                          <Lock size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold">Tema Layar Login</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Background Login (Gambar)</label>
                          <div className="flex flex-col gap-4">
                            {appSettings.login_bg_image && (
                              <div className="relative w-full h-32 bg-coffee-50 rounded-2xl border border-coffee-100 flex items-center justify-center overflow-hidden group">
                                <img src={appSettings.login_bg_image} alt="Login BG Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <button 
                                  onClick={() => handleUpdateSettings({ login_bg_image: '' })}
                                  className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <Trash2 size={24} />
                                </button>
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await handleFileUpload(file);
                                  if (url) handleUpdateSettings({ login_bg_image: url });
                                }
                              }}
                              className="block w-full text-sm text-coffee-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-coffee-100 file:text-coffee-700 hover:file:bg-coffee-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Warna Background Login (Fallback)</label>
                          <div className="flex gap-3">
                            <input 
                              type="color" 
                              value={appSettings.login_bg}
                              onChange={e => setAppSettings({...appSettings, login_bg: e.target.value})}
                              className="w-12 h-12 rounded-lg cursor-pointer border-none"
                            />
                            <input 
                              type="text" 
                              value={appSettings.login_bg}
                              onChange={e => setAppSettings({...appSettings, login_bg: e.target.value})}
                              className="flex-1 bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Judul Login</label>
                            <input 
                              type="text" 
                              value={appSettings.login_title}
                              onChange={e => setAppSettings({...appSettings, login_title: e.target.value})}
                              className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Sub-judul Login</label>
                            <input 
                              type="text" 
                              value={appSettings.login_subtitle}
                              onChange={e => setAppSettings({...appSettings, login_subtitle: e.target.value})}
                              className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={() => handleUpdateSettings({ 
                            login_bg: appSettings.login_bg, 
                            login_title: appSettings.login_title, 
                            login_subtitle: appSettings.login_subtitle 
                          })}
                          className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                        >
                          Simpan Tema Login
                        </button>
                      </div>
                    </div>

                    {/* Main App Theme */}
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="bg-coffee-100 p-3 rounded-2xl text-coffee-900">
                          <LayoutDashboard size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold">Tema Aplikasi Utama</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Background Utama (Gambar)</label>
                          <div className="flex flex-col gap-4">
                            {appSettings.main_bg_image && (
                              <div className="relative w-full h-32 bg-coffee-50 rounded-2xl border border-coffee-100 flex items-center justify-center overflow-hidden group">
                                <img src={appSettings.main_bg_image} alt="Main BG Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <button 
                                  onClick={() => handleUpdateSettings({ main_bg_image: '' })}
                                  className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <Trash2 size={24} />
                                </button>
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await handleFileUpload(file);
                                  if (url) handleUpdateSettings({ main_bg_image: url });
                                }
                              }}
                              className="block w-full text-sm text-coffee-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-coffee-100 file:text-coffee-700 hover:file:bg-coffee-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Warna Background Utama (Fallback)</label>
                          <div className="flex gap-3">
                            <input 
                              type="color" 
                              value={appSettings.main_bg}
                              onChange={e => setAppSettings({...appSettings, main_bg: e.target.value})}
                              className="w-12 h-12 rounded-lg cursor-pointer border-none"
                            />
                            <input 
                              type="text" 
                              value={appSettings.main_bg}
                              onChange={e => setAppSettings({...appSettings, main_bg: e.target.value})}
                              className="flex-1 bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={() => handleUpdateSettings({ main_bg: appSettings.main_bg })}
                          className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                        >
                          Simpan Tema Utama
                        </button>
                      </div>
                    </div>

                    {/* Reset Theme */}
                    <div className="glass-card p-8 border-rose-100 bg-rose-50/30">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-rose-100 p-3 rounded-2xl text-rose-600">
                          <Palette size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-rose-950">Reset Tema</h3>
                      </div>
                      <p className="text-sm text-rose-600 mb-6 font-medium">
                        Kembalikan semua pengaturan visual (warna, logo, background) ke pengaturan bawaan sistem.
                      </p>
                      <button 
                        onClick={handleResetTheme}
                        className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={18} />
                        Reset Tema ke Default
                      </button>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'email' && (
                  <div className="max-w-4xl">
                    {/* Email Settings (SMTP) */}
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="bg-coffee-100 p-3 rounded-2xl text-coffee-900">
                          <Bell size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold">Pengaturan Email (SMTP)</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">SMTP Host</label>
                            <input 
                              type="text" 
                              value={appSettings.smtp_host}
                              onChange={e => setAppSettings({...appSettings, smtp_host: e.target.value})}
                              placeholder="smtp.gmail.com"
                              className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">SMTP Port</label>
                            <input 
                              type="text" 
                              value={appSettings.smtp_port}
                              onChange={e => setAppSettings({...appSettings, smtp_port: e.target.value})}
                              placeholder="587"
                              className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">SMTP User (Email)</label>
                          <input 
                            type="text" 
                            value={appSettings.smtp_user}
                            onChange={e => setAppSettings({...appSettings, smtp_user: e.target.value})}
                            placeholder="your-email@gmail.com"
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">SMTP Password / App Password</label>
                          <input 
                            type="password" 
                            value={appSettings.smtp_pass}
                            onChange={e => setAppSettings({...appSettings, smtp_pass: e.target.value})}
                            placeholder="••••••••••••"
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Sender Email (From)</label>
                          <input 
                            type="text" 
                            value={appSettings.smtp_from}
                            onChange={e => setAppSettings({...appSettings, smtp_from: e.target.value})}
                            placeholder="MOPI POS <noreply@mopi.com>"
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                        
                        <div className="pt-4 border-t border-coffee-100">
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Test Pengiriman Email</label>
                          <div className="flex gap-3">
                            <input 
                              type="email" 
                              value={testEmailTo}
                              onChange={e => setTestEmailTo(e.target.value)}
                              placeholder="Email tujuan test"
                              className="flex-1 bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            />
                            <button 
                              onClick={handleTestEmail}
                              disabled={isTestingEmail}
                              className="bg-coffee-100 text-coffee-900 px-6 py-3 rounded-xl font-bold hover:bg-coffee-200 transition-all disabled:opacity-50"
                            >
                              {isTestingEmail ? 'Mengirim...' : 'Test'}
                            </button>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleUpdateSettings({ 
                            smtp_host: appSettings.smtp_host,
                            smtp_port: appSettings.smtp_port,
                            smtp_user: appSettings.smtp_user,
                            smtp_pass: appSettings.smtp_pass,
                            smtp_from: appSettings.smtp_from
                          })}
                          className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                        >
                          Simpan Pengaturan Email
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'payment' && (
                  <div className="max-w-4xl">
                    {/* Payment Methods Settings */}
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="bg-coffee-100 p-3 rounded-2xl text-coffee-900">
                          <CreditCard size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold">Metode Pembayaran (QRIS & E-Wallet)</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">QRIS (Upload)</label>
                            <div className="flex flex-col gap-4">
                              {appSettings.payment_qris_url && (
                                <img src={appSettings.payment_qris_url} alt="QRIS Preview" className="h-48 object-contain border border-coffee-100 rounded-lg" referrerPolicy="no-referrer" />
                              )}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await handleFileUpload(file);
                                    if (url) handleUpdateSettings({ payment_qris_url: url }, true);
                                  }
                                }}
                                className="block w-full text-sm text-coffee-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-coffee-100 file:text-coffee-700 hover:file:bg-coffee-200"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">DANA (Upload)</label>
                            <div className="flex flex-col gap-4">
                              {appSettings.payment_dana_url && (
                                <img src={appSettings.payment_dana_url} alt="DANA Preview" className="h-48 object-contain border border-coffee-100 rounded-lg" referrerPolicy="no-referrer" />
                              )}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await handleFileUpload(file);
                                    if (url) handleUpdateSettings({ payment_dana_url: url }, true);
                                  }
                                }}
                                className="block w-full text-sm text-coffee-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-coffee-100 file:text-coffee-700 hover:file:bg-coffee-200"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">OVO (Upload)</label>
                            <div className="flex flex-col gap-4">
                              {appSettings.payment_ovo_url && (
                                <img src={appSettings.payment_ovo_url} alt="OVO Preview" className="h-48 object-contain border border-coffee-100 rounded-lg" referrerPolicy="no-referrer" />
                              )}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await handleFileUpload(file);
                                    if (url) handleUpdateSettings({ payment_ovo_url: url }, true);
                                  }
                                }}
                                className="block w-full text-sm text-coffee-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-coffee-100 file:text-coffee-700 hover:file:bg-coffee-200"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">ShopeePay (Upload)</label>
                            <div className="flex flex-col gap-4">
                              {appSettings.payment_shopeepay_url && (
                                <img src={appSettings.payment_shopeepay_url} alt="ShopeePay Preview" className="h-48 object-contain border border-coffee-100 rounded-lg" referrerPolicy="no-referrer" />
                              )}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await handleFileUpload(file);
                                    if (url) handleUpdateSettings({ payment_shopeepay_url: url }, true);
                                  }
                                }}
                                className="block w-full text-sm text-coffee-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-coffee-100 file:text-coffee-700 hover:file:bg-coffee-200"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Instruksi Pembayaran</label>
                          <textarea 
                            value={appSettings.payment_instructions}
                            onChange={e => setAppSettings({...appSettings, payment_instructions: e.target.value})}
                            rows={3}
                            placeholder="Contoh: Silakan scan QRIS di atas dan tunjukkan bukti bayar ke kasir."
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>

                        <button 
                          onClick={() => handleUpdateSettings({ 
                            payment_instructions: appSettings.payment_instructions,
                            payment_qris_url: appSettings.payment_qris_url,
                            payment_dana_url: appSettings.payment_dana_url,
                            payment_ovo_url: appSettings.payment_ovo_url,
                            payment_shopeepay_url: appSettings.payment_shopeepay_url
                          })}
                          className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                        >
                          Simpan Pengaturan Pembayaran
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'delivery' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                          <ShoppingBag size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-serif font-bold">Integrasi Delivery</h3>
                          <p className="text-sm text-coffee-500">Hubungkan POS Anda dengan GrabFood, GoFood, dan ShopeeFood</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[
                          { name: 'GrabFood', color: 'bg-emerald-500', icon: 'GF' },
                          { name: 'GoFood', color: 'bg-rose-500', icon: 'GF' },
                          { name: 'ShopeeFood', color: 'bg-orange-500', icon: 'SF' }
                        ].map(platform => (
                          <div key={platform.name} className="p-6 rounded-3xl border border-coffee-100 bg-coffee-50/30 flex flex-col items-center text-center">
                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-4", platform.color)}>
                              {platform.icon}
                            </div>
                            <h4 className="font-bold text-coffee-950 mb-1">{platform.name}</h4>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Siap Terhubung</p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-6 bg-coffee-50/50 p-6 rounded-3xl border border-coffee-100">
                        <div>
                          <label className="block text-xs font-black text-coffee-500 uppercase tracking-widest mb-2">Webhook URL</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              readOnly
                              value={`${window.location.origin}/api/webhooks/delivery-order`}
                              className="flex-1 bg-white border border-coffee-100 rounded-xl px-4 py-3 text-sm font-mono text-coffee-600 focus:outline-none"
                            />
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/delivery-order`);
                                alert('URL Webhook disalin!');
                              }}
                              className="px-4 py-2 bg-coffee-900 text-white rounded-xl text-xs font-bold hover:bg-coffee-800 transition-all"
                            >
                              Salin
                            </button>
                          </div>
                          <p className="mt-2 text-[10px] text-coffee-400 italic">Gunakan URL ini di dashboard mitra delivery Anda (atau via middleware seperti Deliverect/Hubster).</p>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-coffee-500 uppercase tracking-widest mb-2">Webhook Secret Key</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={appSettings.delivery_webhook_secret || ''}
                              onChange={(e) => setAppSettings(prev => ({ ...prev, delivery_webhook_secret: e.target.value }))}
                              className="flex-1 bg-white border border-coffee-100 rounded-xl px-4 py-3 text-sm font-mono text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                              placeholder="Masukkan secret key untuk keamanan"
                            />
                            <button 
                              onClick={() => {
                                const newSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                                setAppSettings(prev => ({ ...prev, delivery_webhook_secret: newSecret }));
                              }}
                              className="px-4 py-2 bg-coffee-100 text-coffee-600 rounded-xl text-xs font-bold hover:bg-coffee-200 transition-all"
                            >
                              Generate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-8 border-l-4 border-l-amber-500">
                      <div className="flex gap-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl h-fit">
                          <Info size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-coffee-950 mb-2">Cara Kerja Integrasi</h4>
                          <ul className="text-sm text-coffee-600 space-y-2 list-disc pl-4">
                            <li>Sistem akan menerima orderan otomatis dari platform delivery.</li>
                            <li>Menu di platform delivery harus memiliki <b>Nama yang Sama Persis</b> dengan menu di POS ini.</li>
                            <li>Orderan otomatis masuk ke <b>Antrian Pesanan</b> dan stok bahan baku akan berkurang secara real-time.</li>
                            <li>Transaksi akan tercatat dengan sumber (GrabFood/GoFood/ShopeeFood) untuk laporan yang akurat.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {settingsSubTab === 'receipt' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Settings Form */}
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="bg-coffee-100 p-3 rounded-2xl text-coffee-900">
                          <Printer size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold">{t('receipt_settings')}</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">{t('receipt_name')}</label>
                          <input 
                            type="text" 
                            value={appSettings.receipt_name}
                            onChange={e => setAppSettings({...appSettings, receipt_name: e.target.value})}
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">{t('receipt_address')}</label>
                          <textarea 
                            value={appSettings.receipt_address}
                            onChange={e => setAppSettings({...appSettings, receipt_address: e.target.value})}
                            rows={3}
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">{t('receipt_phone')}</label>
                          <input 
                            type="text" 
                            value={appSettings.receipt_phone}
                            onChange={e => setAppSettings({...appSettings, receipt_phone: e.target.value})}
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">{t('receipt_footer')}</label>
                          <textarea 
                            value={appSettings.receipt_footer}
                            onChange={e => setAppSettings({...appSettings, receipt_footer: e.target.value})}
                            rows={3}
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">{t('receipt_contact')}</label>
                          <textarea 
                            value={appSettings.receipt_contact}
                            onChange={e => setAppSettings({...appSettings, receipt_contact: e.target.value})}
                            rows={2}
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">{t('tax_rate')} (%)</label>
                          <input 
                            type="number" 
                            value={appSettings.tax_rate}
                            onChange={e => setAppSettings({...appSettings, tax_rate: Number(e.target.value)})}
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                        
                        <button 
                          onClick={() => handleUpdateSettings({ 
                            receipt_name: appSettings.receipt_name,
                            receipt_address: appSettings.receipt_address,
                            receipt_phone: appSettings.receipt_phone,
                            receipt_footer: appSettings.receipt_footer,
                            receipt_contact: appSettings.receipt_contact,
                            tax_rate: appSettings.tax_rate
                          })}
                          className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                        >
                          {t('save_receipt_settings')}
                        </button>
                      </div>
                    </div>

                    {/* Receipt Preview */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-bold uppercase text-coffee-500 tracking-widest px-2">{t('receipt_preview')}</h4>
                      <div className="bg-white rounded-xl shadow-xl p-8 border border-coffee-100 max-w-sm mx-auto w-full relative overflow-hidden">
                        {/* Paper Texture/Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-b from-coffee-100 to-transparent opacity-50" />
                        
                        <div className="text-center font-mono text-xs space-y-4 text-coffee-950">
                          {/* Header */}
                          <div className="space-y-1">
                            <h5 className="text-lg font-bold uppercase tracking-tighter">{appSettings.receipt_name || 'COFFEE SHOP'}</h5>
                            <p className="whitespace-pre-line text-[10px] leading-tight opacity-70">{appSettings.receipt_address || 'Jl. Contoh No. 123'}</p>
                            <p className="text-[10px] opacity-70">{appSettings.receipt_phone || '0812-3456-7890'}</p>
                          </div>

                          <div className="border-t border-dashed border-coffee-200 my-4 pt-4">
                            <div className="flex justify-between text-[10px] opacity-60">
                              <span>Cashier: {user?.username || 'Admin'}</span>
                              <span>{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] opacity-60">
                              <span>Customer: {customerName || 'Umum'}</span>
                              <span>{new Date().toLocaleTimeString()}</span>
                            </div>
                          </div>

                          <div className="border-t border-dashed border-coffee-200 my-4" />

                          {/* Items List */}
                          <div className="space-y-2 text-left">
                            <div className="flex justify-between">
                              <span>1x Kopi Susu Gula Aren</span>
                              <span>Rp 18.000</span>
                            </div>
                            <div className="flex justify-between">
                              <span>2x Croissant</span>
                              <span>Rp 30.000</span>
                            </div>
                          </div>

                          <div className="border-t border-dashed border-coffee-200 my-4" />

                          {/* Total */}
                          <div className="space-y-1">
                            <div className="flex justify-between opacity-70">
                              <span>Subtotal</span>
                              <span>Rp 48.000</span>
                            </div>
                            <div className="flex justify-between opacity-70">
                              <span>Pajak ({appSettings.tax_rate}%)</span>
                              <span>{formatIDR(Math.round(48000 * (appSettings.tax_rate / 100)))}</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm pt-2">
                              <span>TOTAL</span>
                              <span>{formatIDR(Math.round(48000 * (1 + appSettings.tax_rate / 100)))}</span>
                            </div>
                          </div>

                          <div className="border-t border-dashed border-coffee-200 my-4" />

                          {/* Footer */}
                          <div className="space-y-2">
                            <p className="whitespace-pre-line leading-tight italic opacity-70">{appSettings.receipt_footer || 'Terima kasih atas kunjungan Anda!'}</p>
                            {appSettings.receipt_contact && (
                              <p className="text-[10px] italic opacity-60 pt-2 border-t border-coffee-50">{appSettings.receipt_contact}</p>
                            )}
                            <div className="flex justify-center pt-2">
                              {/* Fake Barcode */}
                              <div className="flex gap-0.5 h-8 items-end">
                                {[1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 1, 2].map((w, i) => (
                                  <div key={i} className="bg-coffee-900" style={{ width: `${w}px`, height: '100%' }} />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Jagged Edge Effect */}
                        <div className="absolute bottom-0 left-0 w-full flex overflow-hidden h-2">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="w-4 h-4 bg-coffee-50 rotate-45 -mb-2 shrink-0" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'webhook' && (
                  <div className="max-w-4xl">
                    {/* Webhook Settings */}
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="bg-coffee-100 p-3 rounded-2xl text-coffee-900">
                          <Settings size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold">Pengaturan Webhook</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Webhook URL (Copy ke Payment Gateway)</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              readOnly
                              value={`${window.location.origin}/api/payment/webhook`}
                              className="flex-1 bg-coffee-100 border border-coffee-200 rounded-xl px-4 py-3 text-sm text-coffee-600 focus:outline-none"
                            />
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/api/payment/webhook`);
                                alert('Webhook URL disalin!');
                              }}
                              className="bg-coffee-200 text-coffee-900 px-4 rounded-xl hover:bg-coffee-300 transition-all"
                            >
                              Salin
                            </button>
                          </div>
                          <p className="text-[10px] text-coffee-400 mt-1 italic">*Gunakan URL ini di dashboard Payment Gateway Anda (Midtrans/Xendit/dll).</p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Webhook Secret / Key (Opsional)</label>
                          <input 
                            type="password" 
                            value={appSettings.payment_webhook_secret}
                            onChange={e => setAppSettings({...appSettings, payment_webhook_secret: e.target.value})}
                            placeholder="Masukkan secret key untuk validasi webhook"
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>

                        <button 
                          onClick={() => handleUpdateSettings({ 
                            payment_webhook_secret: appSettings.payment_webhook_secret
                          })}
                          className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                        >
                          Simpan Pengaturan Webhook
                        </button>
                      </div>
                    </div>
                  </div>
                )}


              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </main>

      {/* Modals */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-coffee-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-0 w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-8 bg-coffee-50 border-b border-coffee-100 text-center">
              <div className="w-16 h-16 bg-coffee-100 text-coffee-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-coffee-950">Pilih Pembayaran</h3>
              <p className="text-coffee-500 text-sm">Silakan pilih metode pembayaran yang diinginkan</p>
            </div>

            <div className="p-8 bg-white">
              <div className="grid grid-cols-2 gap-4">
                {(['Cash', 'QRIS'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                      paymentMethod === method 
                        ? "bg-coffee-50 border-coffee-600 text-coffee-950 shadow-md" 
                        : "bg-white border-coffee-100 text-coffee-400 hover:border-coffee-200"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      paymentMethod === method ? "bg-coffee-600 text-white" : "bg-coffee-50 text-coffee-400"
                    )}>
                      {method === 'Cash' && <Wallet size={20} />}
                      {method === 'QRIS' && <CreditCard size={20} />}
                    </div>
                    <span className="font-bold text-sm">{method}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-coffee-50 flex gap-3">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-100 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  setShowPaymentModal(false);
                  setShowOrderReview(true);
                }}
                className="flex-1 bg-coffee-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
              >
                Lanjutkan
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
              <Lock className="text-coffee-900" /> Ganti Password
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Password Lama</label>
                <input 
                  required
                  type="password" 
                  value={passwordData.oldPassword}
                  onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Password Baru</label>
                <input 
                  required
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Konfirmasi Password Baru</label>
                <input 
                  required
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-coffee-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-2xl font-serif font-bold mb-6">
              {editingUserId ? 'Edit User' : 'Tambah User Baru'}
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Username</label>
                <input 
                  required
                  type="text" 
                  value={newUserData.username}
                  onChange={e => setNewUserData({...newUserData, username: e.target.value})}
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Email</label>
                <input 
                  required
                  type="email" 
                  value={newUserData.email}
                  onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  placeholder="email@contoh.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">
                  {editingUserId ? 'Password (Kosongkan jika tidak diubah)' : 'Password'}
                </label>
                <input 
                  required={!editingUserId}
                  type="password" 
                  value={newUserData.password}
                  onChange={e => setNewUserData({...newUserData, password: e.target.value})}
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Role</label>
                <select 
                  required
                  value={newUserData.role}
                  onChange={e => setNewUserData({...newUserData, role: e.target.value as 'admin' | 'cashier'})}
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                >
                  <option value="cashier">Kasir</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUserId(null);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-coffee-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showCustomerModal && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl border border-coffee-100"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif font-bold text-coffee-950">
                {editingCustomerId ? 'Edit Customer' : 'Tambah Customer Baru'}
              </h3>
              <button onClick={() => setShowCustomerModal(false)} className="p-2 hover:bg-coffee-50 rounded-full transition-colors">
                <X size={20} className="text-coffee-400" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-coffee-500 mb-2 tracking-widest">Nama Lengkap</label>
                <input 
                  required
                  type="text" 
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full bg-coffee-50 border border-coffee-100 rounded-2xl px-5 py-4 text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-all"
                  placeholder="Contoh: John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-coffee-500 mb-2 tracking-widest">Nomor HP</label>
                <input 
                  required
                  type="tel" 
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full bg-coffee-50 border border-coffee-100 rounded-2xl px-5 py-4 text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-all"
                  placeholder="0812xxxx"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-coffee-500 mb-2 tracking-widest">Email (Opsional)</label>
                <input 
                  type="email" 
                  value={newCustomer.email}
                  onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full bg-coffee-50 border border-coffee-100 rounded-2xl px-5 py-4 text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-coffee-600 hover:bg-coffee-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-coffee-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
                >
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showInvModal && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-2xl font-serif font-bold mb-6">
              {editingInvId ? 'Edit Item Inventory' : 'Tambah Item Baru'}
            </h3>
            <form onSubmit={handleAddInventory} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">{t('inventory_type')}</label>
                  <div className="flex bg-coffee-50 p-1 rounded-xl">
                    {(['Bahan', 'Barang'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewInv({...newInv, type})}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                          newInv.type === type ? "bg-white text-coffee-900 shadow-sm" : "text-coffee-500"
                        )}
                      >
                        {type === 'Bahan' ? t('raw_material') : t('goods')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Kategori</label>
                  <select 
                    required
                    value={newInv.category}
                    onChange={e => setNewInv({...newInv, category: e.target.value})}
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  >
                    <option value="Bahan">Bahan</option>
                    <option value="Alat">Alat</option>
                    <option value="Kemasan">Kemasan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Nama Barang</label>
                <input 
                  required
                  type="text" 
                  value={newInv.name}
                  onChange={e => setNewInv({...newInv, name: e.target.value})}
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  placeholder="Contoh: Biji Kopi Arabika"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Jumlah</label>
                  <input 
                    required
                    type="number" 
                    value={newInv.quantity}
                    onChange={e => setNewInv({...newInv, quantity: Number(e.target.value)})}
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Satuan</label>
                  <select 
                    required
                    value={newInv.unit}
                    onChange={e => setNewInv({...newInv, unit: e.target.value})}
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  >
                    <option value="pcs">pcs</option>
                    <option value="gram">gram (g)</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="liter">liter (L)</option>
                    <option value="sachet">sachet</option>
                    <option value="box">box</option>
                  </select>
                </div>
              </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Stok Minimum (Peringatan)</label>
                  <input 
                    required
                    type="number" 
                    value={newInv.min_stock}
                    onChange={e => setNewInv({...newInv, min_stock: Number(e.target.value)})}
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Harga per {newInv.unit} (IDR)</label>
                  <input 
                    required
                    type="number" 
                    value={newInv.unit_price}
                    onChange={e => setNewInv({...newInv, unit_price: Number(e.target.value)})}
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="0"
                  />
                  <div className="mt-2">
                    <button 
                      type="button"
                      onClick={() => setShowCalculator(!showCalculator)}
                      className="text-[10px] font-bold text-coffee-600 uppercase tracking-widest hover:text-coffee-800 flex items-center gap-1"
                    >
                      <Plus size={10} /> {showCalculator ? 'Tutup Kalkulator' : 'Bantu Hitung Harga Satuan'}
                    </button>
                  </div>

                  {showCalculator && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-4 bg-coffee-50 rounded-2xl border border-coffee-100 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-coffee-400 mb-1">Beli Berapa Pcs?</label>
                          <input 
                            type="number" 
                            value={calcPurchase.qty}
                            onChange={e => {
                              const qty = Number(e.target.value);
                              setCalcPurchase({...calcPurchase, qty});
                              if (qty > 0 && calcPurchase.content > 0) {
                                const totalQty = qty * calcPurchase.content;
                                setNewInv(prev => ({
                                  ...prev,
                                  quantity: totalQty,
                                  unit_price: calcPurchase.totalPrice / totalQty
                                }));
                              }
                            }}
                            className="w-full bg-white border border-coffee-200 rounded-lg px-3 py-2 text-xs"
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-coffee-400 mb-1">Isi per Pcs ({newInv.unit})</label>
                          <input 
                            type="number" 
                            value={calcPurchase.content}
                            onChange={e => {
                              const content = Number(e.target.value);
                              setCalcPurchase({...calcPurchase, content});
                              if (calcPurchase.qty > 0 && content > 0) {
                                const totalQty = calcPurchase.qty * content;
                                setNewInv(prev => ({
                                  ...prev,
                                  quantity: totalQty,
                                  unit_price: calcPurchase.totalPrice / totalQty
                                }));
                              }
                            }}
                            className="w-full bg-white border border-coffee-200 rounded-lg px-3 py-2 text-xs"
                            placeholder="Misal: 230"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-coffee-400 mb-1">Total Harga Beli (IDR)</label>
                        <input 
                          type="number" 
                          value={calcPurchase.totalPrice}
                          onChange={e => {
                            const price = Number(e.target.value);
                            setCalcPurchase({...calcPurchase, totalPrice: price});
                            const totalQty = calcPurchase.qty * calcPurchase.content;
                            if (totalQty > 0) {
                              setNewInv(prev => ({
                                ...prev,
                                unit_price: price / totalQty
                              }));
                            }
                          }}
                          className="w-full bg-white border border-coffee-200 rounded-lg px-3 py-2 text-xs"
                          placeholder="Total Bayar"
                        />
                      </div>
                      <div className="pt-2 border-t border-coffee-100">
                        <p className="text-[10px] text-coffee-500 italic">
                          Hasil: {calcPurchase.qty * calcPurchase.content} {newInv.unit} @ {formatIDR(calcPurchase.totalPrice / (calcPurchase.qty * calcPurchase.content || 1))} / {newInv.unit}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => {
                    setShowInvModal(false);
                    setEditingInvId(null);
                    setCalcPurchase({ qty: 1, content: 0, totalPrice: 0 });
                    setShowCalculator(false);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-coffee-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showTxModal && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-2xl font-serif font-bold mb-6">Catat Transaksi</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="flex bg-coffee-50 p-1 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'income', category: 'Sales'})}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                    newTx.type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-coffee-500"
                  )}
                >
                  Pemasukan
                </button>
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'expense', category: 'Supplies'})}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                    newTx.type === 'expense' ? "bg-white text-rose-600 shadow-sm" : "text-coffee-500"
                  )}
                >
                  Pengeluaran
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Kategori</label>
                <select 
                  value={newTx.category}
                  onChange={e => setNewTx({...newTx, category: e.target.value})}
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                >
                  {newTx.type === 'income' ? (
                    <>
                      <option>Sales</option>
                      <option>Catering</option>
                      <option>Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option>Supplies</option>
                      <option>Rent</option>
                      <option>Electricity</option>
                      <option>Marketing</option>
                      <option>Lainnya</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Jumlah (IDR)</label>
                <input 
                  required
                  type="number" 
                  value={newTx.amount}
                  onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})}
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Deskripsi</label>
                <textarea 
                  value={newTx.description}
                  onChange={e => setNewTx({...newTx, description: e.target.value})}
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500 h-24 resize-none"
                  placeholder="Keterangan tambahan..."
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className={cn(
                    "flex-1 text-white px-6 py-3 rounded-xl font-bold transition-all",
                    newTx.type === 'income' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  )}
                >
                  Simpan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showMenuModal && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <h3 className="text-2xl font-serif font-bold mb-6">
              {editingMenuId ? 'Edit Menu' : 'Tambah Menu Baru'}
            </h3>
            <form onSubmit={handleAddMenu} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Foto Menu</label>
                    <div className="flex items-center gap-4">
                      {newMenu.image_url ? (
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-coffee-100 shadow-sm group">
                          <img 
                            src={newMenu.image_url} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            type="button"
                            onClick={() => setNewMenu({...newMenu, image_url: ''})}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-coffee-200 flex flex-col items-center justify-center text-coffee-400 hover:border-coffee-400 hover:text-coffee-600 cursor-pointer transition-all bg-coffee-50/50">
                          <Camera size={20} />
                          <span className="text-[10px] font-bold mt-1">Upload</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await handleFileUpload(file);
                                if (url) setNewMenu({...newMenu, image_url: url});
                              }
                            }}
                          />
                        </label>
                      )}
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={newMenu.image_url}
                          onChange={e => setNewMenu({...newMenu, image_url: e.target.value})}
                          className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          placeholder="Atau tempel URL gambar di sini..."
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">{t('menu_type')}</label>
                    <div className="flex bg-coffee-50 p-1 rounded-xl">
                      {(['Internal', 'Consignment'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewMenu({...newMenu, type})}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                            newMenu.type === type ? "bg-white text-coffee-900 shadow-sm" : "text-coffee-500"
                          )}
                        >
                          {type === 'Internal' ? t('internal') : t('consignment')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {newMenu.type === 'Consignment' && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <div>
                        <label className="block text-xs font-bold uppercase text-amber-600 mb-1">{t('supplier_name')}</label>
                        <input 
                          required
                          type="text" 
                          value={newMenu.supplier_name}
                          onChange={e => setNewMenu({...newMenu, supplier_name: e.target.value})}
                          className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="Nama Penitip"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-amber-600 mb-1">{t('supplier_price')}</label>
                        <input 
                          required
                          type="number" 
                          value={newMenu.supplier_price}
                          onChange={e => setNewMenu({...newMenu, supplier_price: Number(e.target.value)})}
                          className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Nama Menu</label>
                    <input 
                      required
                      type="text" 
                      value={newMenu.name}
                      onChange={e => setNewMenu({...newMenu, name: e.target.value})}
                      className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      placeholder="Contoh: Cappuccino"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Harga Jual (IDR)</label>
                    <input 
                      required
                      type="number" 
                      value={newMenu.price}
                      onChange={e => setNewMenu({...newMenu, price: Number(e.target.value)})}
                      className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Kategori</label>
                    <select 
                      required
                      value={newMenu.category}
                      onChange={e => setNewMenu({...newMenu, category: e.target.value})}
                      className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    >
                      <option value="Kopi">Kopi</option>
                      <option value="Non-Kopi">Non-Kopi</option>
                      <option value="Makanan">Makanan</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Ukuran (Opsional)</label>
                    <input 
                      type="text" 
                      value={newMenu.size}
                      onChange={e => setNewMenu({...newMenu, size: e.target.value})}
                      className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      placeholder="Contoh: 250 ml, 1 Liter"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Deskripsi</label>
                    <textarea 
                      value={newMenu.description}
                      onChange={e => setNewMenu({...newMenu, description: e.target.value})}
                      className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500 h-24 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Bahan & Takaran</label>
                  <div className="space-y-3">
                    {newMenu.ingredients.map((ing, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 flex gap-2 items-center">
                            <select 
                              value={ing.inventory_id}
                              onChange={e => {
                                const updated = [...newMenu.ingredients];
                                updated[idx].inventory_id = Number(e.target.value);
                                setNewMenu({...newMenu, ingredients: updated});
                              }}
                              className="flex-1 bg-coffee-50 border border-coffee-200 rounded-lg px-2 py-2 text-sm"
                            >
                              <option value="">Pilih Bahan</option>
                              {inventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                            {ing.inventory_id > 0 && (
                              <span className="text-[10px] font-bold text-coffee-400 bg-coffee-50 px-2 py-1 rounded border border-coffee-100">
                                {inventory.find(i => i.id === ing.inventory_id)?.unit}
                              </span>
                            )}
                          </div>
                          <input 
                            type="number"
                            step="0.1"
                            value={ing.quantity}
                            onChange={e => {
                              const updated = [...newMenu.ingredients];
                              updated[idx].quantity = Number(e.target.value);
                              setNewMenu({...newMenu, ingredients: updated});
                            }}
                            className="w-20 bg-coffee-50 border border-coffee-200 rounded-lg px-2 py-2 text-sm"
                            placeholder="Qty"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const updated = newMenu.ingredients.filter((_, i) => i !== idx);
                              setNewMenu({...newMenu, ingredients: updated});
                            }}
                            className="text-rose-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {ing.inventory_id > 0 && (
                          <div className="flex justify-end px-2">
                            <p className="text-[10px] text-coffee-400 italic">
                              Subtotal: {formatIDR((inventory.find(i => i.id === ing.inventory_id)?.unit_price || 0) * ing.quantity)}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => setNewMenu({...newMenu, ingredients: [...newMenu.ingredients, { inventory_id: 0, quantity: 0 }]})}
                      className="w-full py-2 border-2 border-dashed border-coffee-200 rounded-xl text-coffee-400 text-sm font-bold hover:border-coffee-400 hover:text-coffee-600 transition-all"
                    >
                      + Tambah Bahan
                    </button>
                  </div>
                </div>
              </div>

              {/* COGS Summary */}
              <div className="bg-coffee-50 p-6 rounded-2xl space-y-3 border border-coffee-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-coffee-400 uppercase tracking-widest">Estimasi Modal (COGS)</span>
                  <span className="text-lg font-bold text-coffee-900">
                    {formatIDR(newMenu.ingredients.reduce((sum, ing) => {
                      const item = inventory.find(i => i.id === ing.inventory_id);
                      return sum + (item?.unit_price || 0) * ing.quantity;
                    }, 0))}
                  </span>
                </div>
                <div className="h-px bg-coffee-200/50" />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-coffee-400 uppercase tracking-widest">Estimasi Margin Keuntungan</span>
                  <div className="text-right">
                    <span className={cn(
                      "text-xl font-bold",
                      (newMenu.price - newMenu.ingredients.reduce((sum, ing) => {
                        const item = inventory.find(i => i.id === ing.inventory_id);
                        return sum + (item?.unit_price || 0) * ing.quantity;
                      }, 0)) > 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {formatIDR(newMenu.price - newMenu.ingredients.reduce((sum, ing) => {
                        const item = inventory.find(i => i.id === ing.inventory_id);
                        return sum + (item?.unit_price || 0) * ing.quantity;
                      }, 0))}
                    </span>
                    {newMenu.price > 0 && (
                      <p className="text-[10px] font-bold text-coffee-400 mt-1">
                        ({Math.round(((newMenu.price - newMenu.ingredients.reduce((sum, ing) => {
                          const item = inventory.find(i => i.id === ing.inventory_id);
                          return sum + (item?.unit_price || 0) * ing.quantity;
                        }, 0)) / newMenu.price) * 100)}% dari harga jual)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowMenuModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-coffee-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                >
                  {editingMenuId ? 'Simpan Perubahan' : 'Simpan Menu'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {confirmUpdate && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <div className="bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="text-amber-600 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-2">Konfirmasi Update Stok</h3>
            <p className="text-coffee-600 mb-8">
              Apakah Anda yakin ingin {confirmUpdate.delta > 0 ? 'menambah' : 'mengurangi'} stok <strong>{confirmUpdate.name}</strong> sebanyak <strong>{Math.abs(confirmUpdate.delta)}</strong>?
              <br />
              <span className="text-sm italic mt-2 block">
                Stok saat ini: {confirmUpdate.currentQty} → Baru: {Math.max(0, confirmUpdate.currentQty + confirmUpdate.delta)}
              </span>
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmUpdate(null)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={async () => {
                  await updateStock(confirmUpdate.id, confirmUpdate.currentQty, confirmUpdate.delta);
                  setConfirmUpdate(null);
                }}
                className="flex-1 bg-coffee-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
              >
                Ya, Update
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {showAdModal && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl border border-coffee-100 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-serif font-bold text-coffee-950">{editingAd ? 'Edit Iklan' : 'Tambah Iklan Baru'}</h3>
                <p className="text-coffee-500 text-sm">Konten visual untuk promosi customer.</p>
              </div>
              <button 
                onClick={() => setShowAdModal(false)}
                className="p-3 hover:bg-coffee-50 rounded-2xl transition-colors text-coffee-400"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const method = editingAd ? 'PUT' : 'POST';
              const url = editingAd ? `/api/ads/${editingAd.id}` : '/api/ads';
              
              await fetch(url, {
                method,
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newAd)
              });
              
              setShowAdModal(false);
              fetchAds();
            }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-coffee-400 tracking-widest">Tipe Konten</label>
                  <div className="flex bg-coffee-50 p-1 rounded-xl border border-coffee-100">
                    <button
                      type="button"
                      onClick={() => setNewAd({ ...newAd, type: 'image' })}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                        newAd.type === 'image' ? "bg-white text-coffee-900 shadow-sm" : "text-coffee-400"
                      )}
                    >
                      Gambar
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAd({ ...newAd, type: 'video' })}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                        newAd.type === 'video' ? "bg-white text-coffee-900 shadow-sm" : "text-coffee-400"
                      )}
                    >
                      Video
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-coffee-400 tracking-widest">Status</label>
                  <div className="flex bg-coffee-50 p-1 rounded-xl border border-coffee-100">
                    <button
                      type="button"
                      onClick={() => setNewAd({ ...newAd, active: true })}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                        newAd.active ? "bg-emerald-500 text-white shadow-sm" : "text-coffee-400"
                      )}
                    >
                      Aktif
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAd({ ...newAd, active: false })}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                        !newAd.active ? "bg-coffee-200 text-coffee-700 shadow-sm" : "text-coffee-400"
                      )}
                    >
                      Nonaktif
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-coffee-400 tracking-widest">URL Konten</label>
                  <span className="text-[9px] font-bold text-coffee-400 italic">
                    {newAd.type === 'video' ? 'Rekomendasi: 16:9 (Landscape) / 9:16 (Portrait)' : 'Rekomendasi: 1920x1080px'}
                  </span>
                </div>
                <div className="relative group">
                  <input 
                    type="text" 
                    required
                    value={newAd.url}
                    onChange={e => setNewAd({ ...newAd, url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-2xl px-5 py-4 text-coffee-950 focus:outline-none focus:ring-4 focus:ring-coffee-500/10 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <button 
                      type="button"
                      onClick={async () => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = newAd.type === 'video' ? 'video/*' : 'image/*';
                        input.onchange = async (e: any) => {
                          const file = e.target.files[0];
                          if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            const res = await fetch('/api/upload', {
                              method: 'POST',
                              body: formData
                            });
                            const data = await res.json();
                            setNewAd({ ...newAd, url: data.url });
                          }
                        };
                        input.click();
                      }}
                      className="p-2 text-coffee-400 hover:text-coffee-600 hover:bg-coffee-100 rounded-xl transition-all"
                    >
                      <Camera size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-coffee-400 tracking-widest">Judul Iklan</label>
                <input 
                  type="text" 
                  required
                  value={newAd.title}
                  onChange={e => setNewAd({ ...newAd, title: e.target.value })}
                  placeholder="Contoh: Promo Spesial Weekend"
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-2xl px-5 py-4 text-coffee-950 focus:outline-none focus:ring-4 focus:ring-coffee-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-coffee-400 tracking-widest">Sub-judul / Deskripsi</label>
                <input 
                  type="text" 
                  value={newAd.subtitle}
                  onChange={e => setNewAd({ ...newAd, subtitle: e.target.value })}
                  placeholder="Contoh: Diskon 20% untuk semua menu kopi"
                  className="w-full bg-coffee-50 border border-coffee-200 rounded-2xl px-5 py-4 text-coffee-950 focus:outline-none focus:ring-4 focus:ring-coffee-500/10 transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAdModal(false)}
                  className="flex-1 px-8 py-4 rounded-2xl font-bold text-coffee-600 hover:bg-coffee-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-coffee-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-coffee-800 transition-all shadow-xl shadow-coffee-200"
                >
                  {editingAd ? 'Simpan Perubahan' : 'Tambah Iklan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showPromoModal && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl border border-coffee-100 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-serif font-bold text-coffee-950">{editingPromo ? 'Edit Promo' : 'Tambah Promo Baru'}</h3>
                <p className="text-coffee-500 text-sm">Atur diskon dan target promosi.</p>
              </div>
              <button 
                onClick={() => setShowPromoModal(false)}
                className="p-3 hover:bg-coffee-50 rounded-2xl transition-colors text-coffee-400"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const method = editingPromo ? 'PUT' : 'POST';
              const url = editingPromo ? `/api/promos/${editingPromo.id}` : '/api/promos';
              
              await fetch(url, {
                method,
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newPromo)
              });
              
              setShowPromoModal(false);
              fetchPromos();
            }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-coffee-400 tracking-widest">Kode Promo</label>
                  <input 
                    type="text" 
                    required
                    value={newPromo.code}
                    onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                    placeholder="COFFEE20"
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-2xl px-5 py-4 text-coffee-950 font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-coffee-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-coffee-400 tracking-widest">Status</label>
                  <div className="flex bg-coffee-50 p-1 rounded-xl border border-coffee-100">
                    <button
                      type="button"
                      onClick={() => setNewPromo({ ...newPromo, active: true })}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                        newPromo.active ? "bg-emerald-500 text-white shadow-sm" : "text-coffee-400"
                      )}
                    >
                      Aktif
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPromo({ ...newPromo, active: false })}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                        !newPromo.active ? "bg-coffee-200 text-coffee-700 shadow-sm" : "text-coffee-400"
                      )}
                    >
                      Nonaktif
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-coffee-400 tracking-widest">Tipe Diskon</label>
                  <select 
                    value={newPromo.discount_type}
                    onChange={e => setNewPromo({ ...newPromo, discount_type: e.target.value })}
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-2xl px-5 py-4 text-coffee-950 focus:outline-none focus:ring-4 focus:ring-coffee-500/10 transition-all"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal (IDR)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-coffee-400 tracking-widest">Nilai Diskon</label>
                  <input 
                    type="number" 
                    required
                    value={newPromo.discount_value}
                    onChange={e => setNewPromo({ ...newPromo, discount_value: Number(e.target.value) })}
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-2xl px-5 py-4 text-coffee-950 focus:outline-none focus:ring-4 focus:ring-coffee-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-coffee-400 tracking-widest">Target Promo</label>
                <div className="flex bg-coffee-50 p-1 rounded-xl border border-coffee-100 mb-4">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'category', label: 'Kategori' },
                    { id: 'menu', label: 'Menu' },
                  ].map(target => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setNewPromo({ ...newPromo, target_type: target.id, target_ids: [] })}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                        newPromo.target_type === target.id ? "bg-white text-coffee-900 shadow-sm" : "text-coffee-400"
                      )}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>

                {newPromo.target_type !== 'all' && (
                  <div className="max-h-[150px] overflow-y-auto p-4 bg-coffee-50 rounded-2xl border border-coffee-100 grid grid-cols-2 gap-2 custom-scrollbar">
                    {newPromo.target_type === 'category' ? (
                      Array.from(new Set(menus.map(m => m.category))).map(cat => (
                        <label key={cat} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                          <input 
                            type="checkbox"
                            checked={newPromo.target_ids.includes(cat)}
                            onChange={e => {
                              const ids = e.target.checked 
                                ? [...newPromo.target_ids, cat]
                                : newPromo.target_ids.filter((id: string) => id !== cat);
                              setNewPromo({ ...newPromo, target_ids: ids });
                            }}
                            className="rounded border-coffee-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs font-bold text-coffee-700">{cat}</span>
                        </label>
                      ))
                    ) : (
                      menus.map(menu => (
                        <label key={menu.id} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                          <input 
                            type="checkbox"
                            checked={newPromo.target_ids.includes(menu.id.toString())}
                            onChange={e => {
                              const ids = e.target.checked 
                                ? [...newPromo.target_ids, menu.id.toString()]
                                : newPromo.target_ids.filter((id: string) => id !== menu.id.toString());
                              setNewPromo({ ...newPromo, target_ids: ids });
                            }}
                            className="rounded border-coffee-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs font-bold text-coffee-700 truncate">{menu.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="flex-1 px-8 py-4 rounded-2xl font-bold text-coffee-600 hover:bg-coffee-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-coffee-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-coffee-800 transition-all shadow-xl shadow-coffee-200"
                >
                  {editingPromo ? 'Simpan Perubahan' : 'Tambah Promo'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showOrderReview && (
        <div className="fixed inset-0 bg-coffee-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 no-print">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-0 w-full max-w-sm shadow-2xl overflow-hidden"
          >
            <div className="p-8 bg-coffee-50 border-b border-coffee-100 text-center">
              <div className="w-16 h-16 bg-coffee-100 text-coffee-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-coffee-950">Review Pesanan</h3>
              <p className="text-coffee-500 text-sm">Periksa kembali pesanan sebelum bayar</p>
            </div>

            <div className="p-8 bg-white font-mono text-sm max-h-[400px] overflow-y-auto custom-scrollbar">
              <div className="space-y-3 mb-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-bold">{item.menu.name}</p>
                        <p className="text-[10px] text-coffee-500">{item.quantity} x {formatIDR(item.menu.price)}</p>
                      </div>
                      <p className="font-bold">{formatIDR(item.menu.price * item.quantity)}</p>
                    </div>
                    {(item.sugarLevel || item.iceLevel) && (
                      <div className="flex gap-2 text-[9px] text-coffee-400 italic">
                        {item.sugarLevel && <span>Sugar: {item.sugarLevel}</span>}
                        {item.iceLevel && <span>Ice: {item.iceLevel}</span>}
                      </div>
                    )}
                    {/* Level Selection */}
                    {item.menu.category !== 'Makanan' && item.menu.category !== 'Snack' && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] uppercase font-bold text-coffee-300">{t('sugar_level')}</span>
                          <div className="flex gap-1">
                            {['Normal', 'Less Sweet', 'No Sugar'].map(level => (
                              <button
                                key={level}
                                onClick={() => handleUpdateCartOptions(item.menu.id, { sugarLevel: level })}
                                className={cn(
                                  "px-2 py-0.5 rounded text-[8px] border transition-all",
                                  item.sugarLevel === level ? "bg-coffee-900 border-coffee-900 text-white" : "bg-white border-coffee-200 text-coffee-400"
                                )}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] uppercase font-bold text-coffee-300">{t('ice_level')}</span>
                          <div className="flex gap-1">
                            {['Normal', 'Less Ice', 'No Ice'].map(level => (
                              <button
                                key={level}
                                onClick={() => handleUpdateCartOptions(item.menu.id, { iceLevel: level })}
                                className={cn(
                                  "px-2 py-0.5 rounded text-[8px] border transition-all",
                                  item.iceLevel === level ? "bg-coffee-900 border-coffee-900 text-white" : "bg-white border-coffee-200 text-coffee-400"
                                )}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-coffee-200 my-4" />

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatIDR(cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0))}</span>
                </div>
                <div className="flex justify-between text-coffee-500">
                  <span>Pajak ({appSettings.tax_rate}%)</span>
                  <span>{formatIDR(Math.round(cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0) * (appSettings.tax_rate / 100)))}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-coffee-50 mt-2">
                  <span>TOTAL BAYAR</span>
                  <span>{formatIDR(Math.round(cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0) * (1 + appSettings.tax_rate / 100)))}</span>
                </div>
                
                {paymentMethod === 'Cash' && (
                  <div className="mt-4 space-y-3 pt-4 border-t border-coffee-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-coffee-400">{t('cash_received')}</label>
                      <input 
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        placeholder="0"
                        className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      />
                    </div>
                    {Number(cashReceived) > 0 && (
                      <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-700">{t('change')}</span>
                        <span className="text-lg font-bold text-emerald-700">
                          {formatIDR(Math.max(0, Number(cashReceived) - Math.round(cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0) * (1 + appSettings.tax_rate / 100))))}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between text-xs pt-4 text-coffee-500">
                  <span>Metode</span>
                  <span className="font-bold text-coffee-900">{paymentMethod}</span>
                </div>

                <div className="mt-4 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-coffee-400">Catatan Pesanan</label>
                  <textarea 
                    value={posNotes}
                    onChange={(e) => setPosNotes(e.target.value)}
                    placeholder="Contoh: Gula dikit, es dipisah..."
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-coffee-500 min-h-[60px] resize-none"
                  />
                </div>
              </div>

              {/* Payment Image Display */}
              {(paymentMethod === 'QRIS' || paymentMethod === 'DANA' || paymentMethod === 'OVO' || paymentMethod === 'ShopeePay') && (
                <div className="mt-6 pt-6 border-t border-coffee-100 text-center">
                  <p className="text-[10px] font-bold uppercase text-coffee-400 mb-3 tracking-widest">Scan untuk Bayar</p>
                  <div className="bg-white p-4 rounded-2xl border border-coffee-100 inline-block">
                    {paymentMethod === 'QRIS' && appSettings.payment_qris_url && (
                      <img src={appSettings.payment_qris_url} alt="QRIS" className="w-48 h-48 object-contain mx-auto" referrerPolicy="no-referrer" />
                    )}
                    {paymentMethod === 'DANA' && appSettings.payment_dana_url && (
                      <img src={appSettings.payment_dana_url} alt="DANA" className="w-48 h-48 object-contain mx-auto" referrerPolicy="no-referrer" />
                    )}
                    {paymentMethod === 'OVO' && appSettings.payment_ovo_url && (
                      <img src={appSettings.payment_ovo_url} alt="OVO" className="w-48 h-48 object-contain mx-auto" referrerPolicy="no-referrer" />
                    )}
                    {paymentMethod === 'ShopeePay' && appSettings.payment_shopeepay_url && (
                      <img src={appSettings.payment_shopeepay_url} alt="ShopeePay" className="w-48 h-48 object-contain mx-auto" referrerPolicy="no-referrer" />
                    )}
                    {(!appSettings.payment_qris_url && paymentMethod === 'QRIS') || 
                     (!appSettings.payment_dana_url && paymentMethod === 'DANA') || 
                     (!appSettings.payment_ovo_url && paymentMethod === 'OVO') || 
                     (!appSettings.payment_shopeepay_url && paymentMethod === 'ShopeePay') ? (
                      <div className="w-48 h-48 flex items-center justify-center text-coffee-300 text-xs italic">
                        QR Code belum diatur
                      </div>
                    ) : null}
                  </div>
                  {appSettings.payment_instructions && (
                    <p className="mt-3 text-[10px] text-coffee-500 italic px-4 leading-relaxed">
                      {appSettings.payment_instructions}
                    </p>
                  )}
                  
                  {/* Manual Verification Instructions */}
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-left">
                    <p className="text-[10px] font-bold text-amber-800 uppercase mb-1">Verifikasi Manual</p>
                    <p className="text-[10px] text-amber-700 leading-relaxed">
                      Silakan cek aplikasi <strong>{paymentMethod} / GoPay</strong> Anda secara manual untuk memastikan dana telah masuk sebelum menekan tombol konfirmasi di bawah.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-coffee-50 flex gap-3">
              <button 
                onClick={() => setShowOrderReview(false)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-100 transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button 
                onClick={handleProcessOrder}
                className={`flex-1 ${(paymentMethod === 'QRIS' || paymentMethod === 'DANA' || paymentMethod === 'OVO' || paymentMethod === 'ShopeePay') ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2`}
                disabled={loading}
              >
                {loading ? 'Memproses...' : (
                  <>
                    <CreditCard size={18} />
                    {(paymentMethod === 'QRIS' || paymentMethod === 'DANA' || paymentMethod === 'OVO' || paymentMethod === 'ShopeePay') ? 'Konfirmasi (Sudah Bayar)' : 'Bayar Sekarang'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {showShortcuts && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl border border-coffee-100"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-coffee-950 flex items-center gap-3">
                <Keyboard className="text-coffee-600" /> Shortcut Keyboard
              </h3>
              <button onClick={() => setShowShortcuts(false)} className="p-2 hover:bg-coffee-50 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-coffee-50 rounded-2xl">
                <span className="text-sm font-medium text-coffee-600">Layar Penuh</span>
                <kbd className="px-3 py-1 bg-white border border-coffee-200 rounded-lg text-xs font-bold shadow-sm">F</kbd>
              </div>
              <div className="flex justify-between items-center p-3 bg-coffee-50 rounded-2xl">
                <span className="text-sm font-medium text-coffee-600">Cari Menu (POS)</span>
                <kbd className="px-3 py-1 bg-white border border-coffee-200 rounded-lg text-xs font-bold shadow-sm">/</kbd>
              </div>
              <div className="flex justify-between items-center p-3 bg-coffee-50 rounded-2xl">
                <span className="text-sm font-medium text-coffee-600">Pindah Tab</span>
                <kbd className="px-3 py-1 bg-white border border-coffee-200 rounded-lg text-xs font-bold shadow-sm">Alt + 1-5</kbd>
              </div>
              <div className="flex justify-between items-center p-3 bg-coffee-50 rounded-2xl">
                <span className="text-sm font-medium text-coffee-600">Tutup Modal / Batal</span>
                <kbd className="px-3 py-1 bg-white border border-coffee-200 rounded-lg text-xs font-bold shadow-sm">Esc</kbd>
              </div>
              <div className="flex justify-between items-center p-3 bg-coffee-50 rounded-2xl">
                <span className="text-sm font-medium text-coffee-600">Refresh Data</span>
                <kbd className="px-3 py-1 bg-white border border-coffee-200 rounded-lg text-xs font-bold shadow-sm">R</kbd>
              </div>
              <div className="flex justify-between items-center p-3 bg-coffee-50 rounded-2xl">
                <span className="text-sm font-medium text-coffee-600">Bantuan Shortcut</span>
                <kbd className="px-3 py-1 bg-white border border-coffee-200 rounded-lg text-xs font-bold shadow-sm">?</kbd>
              </div>
            </div>

            <button 
              onClick={() => setShowShortcuts(false)}
              className="w-full mt-8 bg-coffee-900 text-white py-4 rounded-2xl font-bold hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
            >
              Mengerti
            </button>
          </motion.div>
        </div>
      )}

      {showReceipt && lastOrder && (
        <div className="fixed inset-0 bg-coffee-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 no-print">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-0 w-full max-w-sm shadow-2xl overflow-hidden"
          >
            <div className="p-8 bg-coffee-50 border-b border-coffee-100 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-coffee-950">Pembayaran Berhasil</h3>
              <p className="text-coffee-500 text-sm">Transaksi telah dicatat ke sistem</p>
            </div>

            <div id="receipt-content" className="p-8 bg-white font-mono text-sm print:p-0">
              <div className="text-center mb-6">
                {appSettings.app_logo_url && (
                  <img src={appSettings.app_logo_url} alt="Logo" className="w-16 h-16 object-contain mx-auto mb-3" referrerPolicy="no-referrer" />
                )}
                <h4 className="font-bold text-lg uppercase tracking-widest">{appSettings.receipt_name}</h4>
                <p className="text-[10px] text-coffee-500 whitespace-pre-line">{appSettings.receipt_address}</p>
                <p className="text-[10px] text-coffee-500">{appSettings.receipt_phone}</p>
                <div className="border-t border-coffee-100 my-2 pt-2">
                  <p className="text-[10px] text-coffee-500">{lastOrder.date}</p>
                  <p className="text-[10px] font-bold text-coffee-900 uppercase tracking-wider">ID: {lastOrder.orderId || '-'}</p>
                  <p className="text-[10px] font-bold text-coffee-900 uppercase tracking-wider">Cashier: {lastOrder.cashier || '-'}</p>
                  <p className="text-[10px] font-bold text-coffee-900 uppercase tracking-wider">Customer: {lastOrder.customerName || 'Umum'}</p>
                </div>
              </div>

              <div className="border-t border-dashed border-coffee-200 my-4" />

              <div className="space-y-2 mb-4">
                {lastOrder.items.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-bold">{item.menu.name}</p>
                        <p className="text-[10px] text-coffee-500">{item.quantity} x {formatIDR(item.menu.price)}</p>
                      </div>
                      <p className="font-bold">{formatIDR(item.menu.price * item.quantity)}</p>
                    </div>
                    {(item.sugarLevel || item.iceLevel) && (
                      <div className="flex gap-2 text-[8px] text-coffee-400 italic">
                        {item.sugarLevel && <span>Sugar: {item.sugarLevel}</span>}
                        {item.iceLevel && <span>Ice: {item.iceLevel}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-coffee-200 my-4" />

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatIDR(lastOrder.subtotal || lastOrder.total)}</span>
                </div>
                {lastOrder.tax > 0 && (
                  <div className="flex justify-between text-coffee-500">
                    <span>Pajak</span>
                    <span>{formatIDR(lastOrder.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2">
                  <span>TOTAL</span>
                  <span>{formatIDR(lastOrder.total)}</span>
                </div>
                {lastOrder.paymentMethod === 'Cash' && lastOrder.cashReceived > 0 && (
                  <>
                    <div className="flex justify-between text-xs pt-2">
                      <span>Tunai</span>
                      <span>{formatIDR(lastOrder.cashReceived)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span>Kembali</span>
                      <span>{formatIDR(lastOrder.change)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-coffee-100 text-[10px] text-center text-coffee-400">
                <p>Metode Pembayaran: {lastOrder.paymentMethod}</p>
                {lastOrder.notes && (
                  <p className="mt-2 bg-coffee-50 p-2 rounded border border-coffee-100 italic">
                    Catatan: {lastOrder.notes}
                  </p>
                )}
                <p className="mt-2 whitespace-pre-line">{appSettings.receipt_footer}</p>
                {appSettings.receipt_contact && (
                  <p className="mt-2 pt-2 border-t border-coffee-50 italic">{appSettings.receipt_contact}</p>
                )}
              </div>
            </div>

            <div className="p-6 bg-coffee-50 flex gap-3">
              <button 
                onClick={() => setShowReceipt(false)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-100 transition-colors"
              >
                Tutup
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-coffee-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Cetak Struk
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showPurchaseModal && purchaseData && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Package className="text-emerald-600 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-2">Beli Stok Bahan</h3>
            <p className="text-coffee-600 mb-6">
              Input jumlah pembelian untuk <strong>{purchaseData.name}</strong>.
            </p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-coffee-400 uppercase tracking-widest mb-2">Jumlah Pembelian ({purchaseData.unit})</label>
                <input 
                  type="number"
                  value={purchaseData.quantity}
                  onChange={(e) => setPurchaseData({ ...purchaseData, quantity: Number(e.target.value), totalPrice: Number(e.target.value) * (inventory.find(i => i.id === purchaseData.id)?.unit_price || 0) })}
                  className="w-full bg-coffee-50 border border-coffee-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-coffee-400 uppercase tracking-widest mb-2">Total Biaya (Rp)</label>
                <input 
                  type="number"
                  value={purchaseData.totalPrice}
                  onChange={(e) => setPurchaseData({ ...purchaseData, totalPrice: Number(e.target.value) })}
                  className="w-full bg-coffee-50 border border-coffee-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500 font-bold"
                />
                <p className="text-[10px] text-coffee-400 mt-1 italic">
                  * Otomatis terisi berdasarkan harga satuan terakhir
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handlePurchaseStock}
                className="flex-1 bg-coffee-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
              >
                Simpan & Catat
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Customer Order Status Modal */}
      <AnimatePresence>
        {showCustomerOrderStatus && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomerOrderStatus(false)}
              className="absolute inset-0 bg-coffee-950/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-coffee-100 flex items-center justify-between bg-coffee-50/50">
                <div className="flex items-center gap-4">
                  <div className="bg-coffee-900 p-3 rounded-2xl text-white shadow-lg shadow-coffee-200">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-coffee-950">Status Pesanan</h2>
                    <div className="flex gap-4 mt-1">
                      <button 
                        onClick={() => setCustomerHistoryTab('active')}
                        className={cn(
                          "text-xs font-bold uppercase tracking-wider transition-all",
                          customerHistoryTab === 'active' ? "text-coffee-900 border-b-2 border-coffee-900 pb-0.5" : "text-coffee-400 hover:text-coffee-600"
                        )}
                      >
                        Aktif
                      </button>
                      <button 
                        onClick={() => {
                          setCustomerHistoryTab('history');
                          if (customerOrder.name) fetchCustomerHistory(customerOrder.name);
                        }}
                        className={cn(
                          "text-xs font-bold uppercase tracking-wider transition-all",
                          customerHistoryTab === 'history' ? "text-coffee-900 border-b-2 border-coffee-900 pb-0.5" : "text-coffee-400 hover:text-coffee-600"
                        )}
                      >
                        Riwayat
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCustomerOrderStatus(false)}
                  className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-90"
                >
                  <X size={24} className="text-coffee-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {customerHistoryTab === 'active' ? (
                  customerActiveOrders.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-20 h-20 bg-coffee-50 rounded-full flex items-center justify-center mx-auto text-coffee-200">
                        <ClipboardList size={40} />
                      </div>
                      <p className="text-coffee-500 font-medium">Belum ada pesanan aktif.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {customerActiveOrders.map(order => (
                        <div key={order.id} className="bg-coffee-50/50 border border-coffee-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-black text-coffee-900">#{order.id.toString().slice(-4)}</span>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                order.status === 'pending' ? "bg-amber-100 text-amber-600" :
                                order.status === 'processing' ? "bg-blue-100 text-blue-600" :
                                "bg-emerald-100 text-emerald-600"
                              )}>
                                {order.status === 'pending' ? 'Menunggu' : order.status === 'processing' ? 'Diproses' : 'Selesai'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-coffee-500 font-medium">
                              <span className="flex items-center gap-1.5"><User size={14} /> {order.customer_name}</span>
                              <span className="flex items-center gap-1.5"><LayoutDashboard size={14} /> Meja {order.table_number}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item: any, idx: number) => (
                              <span key={idx} className="bg-white border border-coffee-100 px-3 py-1.5 rounded-xl text-[10px] font-bold text-coffee-700 shadow-sm">
                                {item.quantity}x {item.menu_name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  customerOrderHistory.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-20 h-20 bg-coffee-50 rounded-full flex items-center justify-center mx-auto text-coffee-200">
                        <History size={40} />
                      </div>
                      <p className="text-coffee-500 font-medium">Belum ada riwayat pesanan.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {customerOrderHistory.map(order => (
                        <div key={order.orderId} className="bg-white border border-coffee-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-black text-coffee-900">#{order.orderId.toString().slice(-4)}</span>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                order.status === 'completed' ? "bg-emerald-100 text-emerald-600" : "bg-coffee-100 text-coffee-600"
                              )}>
                                {order.status === 'completed' ? 'Selesai' : order.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-coffee-400 font-bold uppercase tracking-wider">
                              {formatDate(new Date(order.date), 'dd MMM yyyy, HH:mm')}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item: any, idx: number) => (
                              <span key={idx} className="bg-coffee-50 px-3 py-1.5 rounded-xl text-[10px] font-bold text-coffee-700">
                                {item.quantity}x {item.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              <div className="p-8 bg-coffee-50/50 border-t border-coffee-100">
                <button 
                  onClick={() => setShowCustomerOrderStatus(false)}
                  className="w-full bg-coffee-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-coffee-200 hover:bg-coffee-800 transition-all active:scale-95"
                >
                  TUTUP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Print-only Receipt (Optimized for Thermal Printer) */}
      <div className="hidden print-section font-mono text-[12px] leading-tight text-black">
        {lastOrder && (
          <div className="w-[280px] mx-auto py-4">
            <div className="text-center mb-4">
              {appSettings.app_logo_url && (
                <img src={appSettings.app_logo_url} alt="Logo" className="w-14 h-14 object-contain mx-auto mb-2" referrerPolicy="no-referrer" />
              )}
              <h4 className="font-bold text-sm uppercase tracking-widest">{appSettings.receipt_name}</h4>
              <p className="text-[10px] whitespace-pre-line">{appSettings.receipt_address}</p>
              <p className="text-[10px]">{appSettings.receipt_phone}</p>
              <div className="mt-1">
                <p className="text-[10px]">{lastOrder.date}</p>
                <p className="text-[10px] font-bold">ID: {lastOrder.orderId || '-'}</p>
                <p className="text-[10px] font-bold">Customer: {lastOrder.customerName || 'Umum'}</p>
              </div>
            </div>
            
            <div className="border-t border-dashed border-black my-2" />
            
            <div className="space-y-1 mb-2">
              {lastOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <p className="font-bold">{item.menu.name}</p>
                    <p className="text-[10px]">{item.quantity} x {formatIDR(item.menu.price)}</p>
                  </div>
                  <p className="font-bold whitespace-nowrap">{formatIDR(item.menu.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-dashed border-black my-2" />
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatIDR(lastOrder.total)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1">
                <span>TOTAL</span>
                <span>{formatIDR(lastOrder.total)}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-2 border-t border-dashed border-black text-[10px] text-center">
              <p>Metode Pembayaran: {lastOrder.paymentMethod}</p>
              <p className="mt-2 font-bold whitespace-pre-line">{appSettings.receipt_footer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
