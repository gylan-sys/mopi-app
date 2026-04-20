import React, { useState, useEffect, useRef } from 'react';
import chroma from 'chroma-js';
import { io } from 'socket.io-client';
import { 
  MessageSquare,
  LayoutDashboard, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Trash2, 
  Edit,
  AlertCircle,
  AlertTriangle,
  Coffee,
  TrendingUp,
  Lightbulb,
  Wallet,
  Calendar,
  UtensilsCrossed,
  ShoppingCart,
  Info,
  LogOut,
  User,
  Lock,
  Check,
  X,
  Copy,
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
  Send,
  Truck,
  Milk,
  Utensils,
  Cookie,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
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
  MapPin,
  Navigation,
  Phone,
  FileDown,
  QrCode,
  History,
  Zap,
  Flame,
  Mic
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
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { id } from 'date-fns/locale';
import { Toaster, toast } from 'sonner';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
const DefaultIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #9a684a; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24]
});

L.Marker.prototype.options.icon = DefaultIcon;

import { formatIDR, formatDate, CHART_COLORS } from './utils';
import { cn } from './types';
import type { InventoryItem, Transaction, DashboardStats, Menu, UserAccount, Customer, Driver, CartItem } from './types';
import Sidebar from './components/Sidebar';
import DriverMap from './components/DriverMap';
import DriverDashboard from './components/DriverDashboard';
import DashboardTab from './components/DashboardTab';
import DeliveryTab from './components/DeliveryTab';
import ReportsTab from './components/ReportsTab';
import OrdersTab from './components/OrdersTab';
import InventoryTab from './components/InventoryTab';
import QueueTab from './components/QueueTab';
import MenuTab from './components/MenuTab';
import TransactionsTab from './components/TransactionsTab';
import UsersTab from './components/UsersTab';
import LoyaltyTab from './components/LoyaltyTab';
import KitchenTab from './components/KitchenTab';
import { translations } from './translations';

const isMenuAvailable = (menu: Menu) => {
  if (!menu.ingredients || menu.ingredients.length === 0) return true;
  return menu.ingredients.every(ing => (ing.current_stock || 0) >= ing.quantity);
};

const THEMES = {
  coffee: {
    50: '#ffffff',
    100: '#fdfaf9',
    200: '#f9f3f1',
    300: '#e6d5cf',
    400: '#c9ada1',
    500: '#a88a7d',
    600: '#7d5f44',
    700: '#5e4632',
    800: '#4a3728',
    900: '#3a2a22',
    950: '#241b14',
  },
  ocean: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  forest: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  royal: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  midnight: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  }
};

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
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
    <div className="relative w-full h-full overflow-hidden bg-coffee-700">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {currentAd.type === 'video' ? (
            <video 
              src={currentAd.url} 
              autoPlay 
              muted 
              loop 
              playsInline
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <img 
              src={currentAd.url} 
              alt={currentAd.title}
              className="w-full h-full object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-coffee-900/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-2"
            >
              {currentAd.title}
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/80 font-medium"
            >
              {currentAd.subtitle}
            </motion.p>
            
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-12 px-10 py-5 bg-white text-coffee-950 rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-accent-500 hover:text-white transition-all active:scale-95"
            >
              Lihat Penawaran
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute bottom-10 left-16 flex gap-3">
        {ads.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "h-1.5 transition-all duration-700 rounded-full",
              currentIndex === idx ? "w-12 bg-accent-500" : "w-4 bg-white/30 hover:bg-white/50"
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'transactions' | 'menu' | 'orders' | 'reports' | 'users' | 'settings' | 'queue' | 'loyalty' | 'delivery'>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
  const [tableNumber, setTableNumber] = useState('');
  const [reportSubTab, setReportSubTab] = useState<'transactions' | 'financial' | 'consignment' | 'daily-summary'>('transactions');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS'>('Cash');
  const [deliveryMethod, setDeliveryMethod] = useState<'dine_in' | 'takeaway' | 'delivery'>('takeaway');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLat, setCustomerLat] = useState<number | null>(null);
  const [customerLng, setCustomerLng] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [posNotes, setPosNotes] = useState('');
  const [cashReceived, setCashReceived] = useState<number | string>('');
  const [txPage, setTxPage] = useState(1);
  const [invPage, setInvPage] = useState(1);
  const [menuPage, setMenuPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  const [appSettings, setAppSettings] = useState({
    app_name: 'MOPI',
    app_icon: 'Coffee',
    app_logo_url: '',
    theme_name: 'coffee',
    customer_page_title: 'MOPI',
    customer_page_subtitle: 'Premium Coffee Experience',
    customer_bg_color: '#ffffff',
    customer_bg_image: '',
    login_bg: '#ffffff',
    login_bg_image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000',
    login_title: 'MOPI',
    login_subtitle: 'Welcome to the Premium Experience',
    main_bg: '#ffffff',
    main_bg_image: '',
    primary_color: '#7d5f44',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
    payment_qris_url: '',
    payment_dana_url: '',
    payment_ovo_url: '',
    payment_shopeepay_url: '',
    payment_loading_gif_url: '',
    payment_instructions: 'Silakan scan QRIS atau transfer ke nomor yang tertera.',
    payment_webhook_secret: '',
    receipt_name: 'COFFEE SHOP',
    receipt_address: 'Jl. Kopi Nikmat No. 123, Jakarta',
    receipt_phone: '0812-3456-7890',
    receipt_footer: 'Terima kasih atas kunjungan Anda!',
    receipt_contact: 'Kritik & Saran: coffee@example.com / WA: 0812-3456-7890',
    tax_rate: 10,
    timezone: 'Asia/Jakarta',
    language: 'id',
    enable_delivery: false
  });
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'theme' | 'email' | 'payment' | 'delivery' | 'webhook' | 'receipt' | 'shortcuts' | 'backup' | 'mobile'>('general');
  const [usersSubTab, setUsersSubTab] = useState<'staff' | 'driver'>('staff');
  const [testEmailTo, setTestEmailTo] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dashboardExtra, setDashboardExtra] = useState<{
    dailySummary: any,
    financialTrend: any[],
    topItems: any[]
  }>({
    dailySummary: null,
    financialTrend: [],
    topItems: []
  });
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

    // Update apple-touch-icon
    let appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.getElementsByTagName('head')[0].appendChild(appleIcon);
    }
    appleIcon.href = appSettings.app_logo_url || 'https://cdn-icons-png.flaticon.com/512/924/924514.png';

    // Update theme-color
    let themeColor = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      document.getElementsByTagName('head')[0].appendChild(themeColor);
    }
    themeColor.content = appSettings.primary_color || '#9a684a';
  }, [appSettings.app_name, appSettings.app_logo_url, appSettings.primary_color]);

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

  const [dailySummary, setDailySummary] = useState<any>(null);

  const fetchDailySummary = async () => {
    try {
      const res = await fetch('/api/reports/daily-summary', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setDailySummary(await res.json());
    } catch (error) {
      console.error('Error fetching daily summary:', error);
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
      } else if (reportSubTab === 'daily-summary') {
        fetchDailySummary();
      }
    }
  }, [activeTab, reportSubTab, financialRange]);

  const getDailyInsights = (summary: any) => {
    if (!summary) return [];
    const insights = [];
    
    if (summary.totalRevenue > 0) {
      if (summary.topItems && summary.topItems.length > 0) {
        insights.push({
          type: 'success',
          title: 'Produk Terlaris',
          message: `${summary.topItems[0].name} adalah menu paling populer hari ini. Pastikan stok bahan baku untuk menu ini selalu tersedia.`
        });
      }
      
      const qrisSales = summary.salesByPayment?.find((s: any) => s.payment_method === 'QRIS')?.total || 0;
      const cashSales = summary.salesByPayment?.find((s: any) => s.payment_method === 'Cash')?.total || 0;
      
      if (qrisSales > cashSales) {
        insights.push({
          type: 'info',
          title: 'Tren Pembayaran Digital',
          message: 'Pelanggan lebih banyak menggunakan QRIS hari ini. Pastikan koneksi internet stabil untuk kelancaran transaksi.'
        });
      }
    } else {
      insights.push({
        type: 'warning',
        title: 'Belum Ada Penjualan',
        message: 'Belum ada transaksi yang tercatat hari ini. Coba tawarkan promo menarik atau update status menu di media sosial.'
      });
    }
    
    return insights;
  };

  const getFinancialInsights = (data: any) => {
    if (!data) return [];
    const insights = [];
    
    const monthlyIncome = data.summary?.monthly?.income || 0;
    const monthlyExpense = data.summary?.monthly?.expense || 0;
    
    if (monthlyIncome > 0) {
      const profitMargin = ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100;
      if (profitMargin < 20 && profitMargin > 0) {
        insights.push({
          type: 'warning',
          title: 'Margin Keuntungan Rendah',
          message: `Margin keuntungan bulan ini sekitar ${profitMargin.toFixed(1)}%. Pertimbangkan untuk meninjau kembali harga menu atau menekan biaya operasional.`
        });
      } else if (profitMargin > 50) {
        insights.push({
          type: 'success',
          title: 'Performa Keuangan Luar Biasa',
          message: `Margin keuntungan sangat sehat (${profitMargin.toFixed(1)}%). Ini waktu yang tepat untuk mempertimbangkan ekspansi atau investasi pada peralatan baru.`
        });
      }
    }
    
    if (monthlyExpense > monthlyIncome && monthlyIncome > 0) {
      insights.push({
        type: 'danger',
        title: 'Defisit Anggaran',
        message: 'Pengeluaran bulan ini melebihi pemasukan. Segera lakukan audit pada biaya bahan baku dan operasional.'
      });
    }
    
    return insights;
  };

  const getTransactionInsights = (txs: any[], filter: string, date: string) => {
    const filtered = txs.filter(tx => tx.type === 'income' && tx.category === 'Sales' && (
      filter === 'daily' 
        ? formatDate(new Date(tx.date), 'yyyy-MM-dd') === date
        : formatDate(new Date(tx.date), 'yyyy-MM') === formatDate(new Date(date), 'yyyy-MM')
    ));
    
    if (filtered.length === 0) return [];
    
    const insights = [];
    
    // Calculate peak hour
    const hours: any = {};
    filtered.forEach(tx => {
      const hour = new Date(tx.date).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });
    
    const peakHour = Object.entries(hours).sort((a: any, b: any) => b[1] - a[1])[0];
    if (peakHour) {
      insights.push({
        type: 'info',
        title: 'Jam Sibuk',
        message: `Puncak transaksi terjadi pada pukul ${peakHour[0]}:00. Pastikan staf tambahan tersedia di jam-jam tersebut untuk menjaga kualitas layanan.`
      });
    }

    // Average transaction value
    const totalRevenue = filtered.reduce((sum, tx) => sum + tx.amount, 0);
    const avgValue = totalRevenue / filtered.length;
    if (avgValue > 0) {
      insights.push({
        type: 'success',
        title: 'Rata-rata Transaksi',
        message: `Rata-rata nilai per transaksi adalah ${formatIDR(avgValue)}. Gunakan teknik upselling untuk meningkatkan nilai ini.`
      });
    }
    
    return insights;
  };

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
  const [customerOrder, setCustomerOrder] = useState({ 
    name: '', 
    table: '', 
    paymentMethod: 'Cash', 
    notes: '', 
    deliveryMethod: 'dine_in' as 'dine_in' | 'takeaway' | 'delivery', 
    deliveryAddress: '',
    phone: '',
    lat: null as number | null,
    lng: null as number | null
  });
  const [lastCustomerOrder, setLastCustomerOrder] = useState<any>(null);
  const [showCustomerOrderSuccess, setShowCustomerOrderSuccess] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showQRISModal, setShowQRISModal] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const [qrisAmount, setQrisAmount] = useState(0);
  const [isQRISLoading, setIsQRISLoading] = useState(false);
  const [customerOrderId, setCustomerOrderId] = useState('');
  const [customerDisplayId, setCustomerDisplayId] = useState('');
  const [showCustomerOrderStatus, setShowCustomerOrderStatus] = useState(false);
  const [flyingItems, setFlyingItems] = useState<{ id: number; x: number; y: number; image?: string }[]>([]);
  const [customerOrderHistory, setCustomerOrderHistory] = useState<any[]>([]);
  const [customerHistoryTab, setCustomerHistoryTab] = useState<'active' | 'history'>('active');
  const [customerActiveOrders, setCustomerActiveOrders] = useState<any[]>([]);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean, title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string, isDestructive?: boolean } | null>(null);

  // Forms
  const [showInvModal, setShowInvModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [editingInvId, setEditingInvId] = useState<number | null>(null);
  
  const [newInv, setNewInv] = useState({ name: '', quantity: 0, unit: 'pcs', min_stock: 0, unit_price: 0, category: 'Biji Kopi', type: 'Bahan' as 'Bahan' | 'Barang', expiration_date: '' });
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
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: number, name: string, quantity: number, sugarLevel: string, iceLevel: string, notes: string } | null>(null);
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

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [showDriverMapModal, setShowDriverMapModal] = useState(false);
  const [selectedDriverForMap, setSelectedDriverForMap] = useState<number | null>(null);
  const [isDriverMode, setIsDriverMode] = useState(false);
  const [driverUser, setDriverUser] = useState<{ id: number; username: string; full_name: string } | null>(null);
  const [loginType, setLoginType] = useState<'staff' | 'driver'>('staff');

  useEffect(() => {
    // Initialize socket once
    socketRef.current = io();
    
    const handlePaymentSuccess = (data: any) => {
      console.log('Payment success received:', data);
      // If in customer mode and waiting for QRIS
      if (isCustomerMode && showQRISModal) {
        setShowQRISModal(false);
        setShowCustomerOrderSuccess(true);
        toast.success("Pembayaran Berhasil! Pesanan Anda sedang diproses.");
        
        // Clear cart for customer
        setCart([]);
        setCustomerOrder({ name: '', table: '', notes: '', paymentMethod: 'Cash' });
        setActivePromo(null);
      }
    };

    const handleLowStockAlert = (data: any) => {
      toast.warning(`Stok Menipis: ${data.name} sisa ${data.quantity} ${data.unit}`, {
        description: `Batas minimum: ${data.min_stock} ${data.unit}`,
        duration: 5000,
      });
      
      const newNotification: Notification = {
        id: Date.now() + Math.random(),
        message: `Stok ${data.name} menipis (${data.quantity} ${data.unit})`,
        type: 'warning',
        time: formatDate(new Date(), 'HH:mm')
      };
      setNotifications(prev => [newNotification, ...prev]);
      fetchData();
    };

    const handleOrderUpdate = () => {
      fetchActiveOrders();
      if (isCustomerMode) {
        fetchCustomerActiveOrders();
        // Use a ref or a way to get the current customer name if needed, 
        // but for now we'll just refresh the active orders list which is usually enough.
        // If we really need the history, we can't easily get it here without stale closure issues
        // unless we use a ref for customerOrder.name
      } else {
        // Cashier notification
        toast.info("Ada orderan baru atau pembaruan antrian!", {
          position: "top-right",
          icon: <Bell className="text-amber-500" />,
          duration: 5000
        });
        
        const newNotification: Notification = {
          id: Date.now() + Math.random(),
          message: "Antrian pesanan telah diperbarui.",
          type: 'info',
          time: formatDate(new Date(), 'HH:mm')
        };
        setNotifications(prev => [newNotification, ...prev]);
        fetchData(); // Refresh all data for cashier
      }
    };

    const handleDriverLocationUpdated = (data: { driver_id: number, latitude: number, longitude: number }) => {
      setDrivers(prev => prev.map(d => d.id === data.driver_id ? { ...d, latitude: data.latitude, longitude: data.longitude } : d));
    };

    socketRef.current.on('PAYMENT_SUCCESS', handlePaymentSuccess);
    socketRef.current.on('LOW_STOCK_ALERT', handleLowStockAlert);
    socketRef.current.on('ORDER_UPDATED', handleOrderUpdate);
    socketRef.current.on('DRIVER_LOCATION_UPDATED', handleDriverLocationUpdated);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('PAYMENT_SUCCESS', handlePaymentSuccess);
        socketRef.current.off('LOW_STOCK_ALERT', handleLowStockAlert);
        socketRef.current.off('ORDER_UPDATED', handleOrderUpdate);
        socketRef.current.off('DRIVER_LOCATION_UPDATED', handleDriverLocationUpdated);
        socketRef.current.disconnect();
      }
    };
  }, [isCustomerMode, showQRISModal]); // We need these to handle the logic inside listeners correctly if they change

  useEffect(() => {
    if (showOrderReview && !currentOrderId) {
      const newId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setCurrentOrderId(newId);
      if (socketRef.current) socketRef.current.emit('join_order', newId);
    } else if (!showOrderReview) {
      setCurrentOrderId(null);
    }
  }, [showOrderReview]);

  // User Management States
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userSort, setUserSort] = useState<'username' | 'role'>('username');
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'cashier'>('all');
  
  const [driverSearch, setDriverSearch] = useState('');
  const [driverSort, setDriverSort] = useState<'full_name' | 'status' | 'active_deliveries'>('full_name');
  const [driverFilter, setDriverFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [newDriverData, setNewDriverData] = useState({ username: '', password: '', full_name: '', phone: '', vehicle_info: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newUserData, setNewUserData] = useState({ username: '', password: '', email: '', role: 'cashier' as 'admin' | 'cashier' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [reportDate, setReportDate] = useState(formatDate(new Date(), 'yyyy-MM-dd', appSettings.timezone));

  const fetchPublicSettings = async () => {
    try {
      const res = await fetch('/api/settings/public');
      if (res.ok) {
        const settingsData = await res.json();
        if (settingsData) {
          if (settingsData.tax_rate !== undefined) {
            settingsData.tax_rate = Number(settingsData.tax_rate);
          }
          setAppSettings(prev => ({ ...prev, ...settingsData }));
        }
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

  const handleUpdateDriverStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/drivers/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Status driver berhasil diupdate ke ${status}`);
        fetchData();
      } else {
        toast.error('Gagal mengupdate status driver');
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast.error('Terjadi kesalahan saat mengupdate status driver');
    }
  };

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
    const theme = THEMES[appSettings.theme_name as keyof typeof THEMES] || THEMES.coffee;
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--color-coffee-${key}`, value as string);
    });
  }, [appSettings.theme_name]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const isAdmin = user.role === 'admin';

      const [statsRes, invRes, txRes, menuRes, usersRes, settingsRes, custRes, driversRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/inventory'),
        fetch('/api/transactions'), // No filters here
        fetch('/api/menus'),
        isAdmin ? fetch('/api/users') : Promise.resolve({ ok: false, status: 403, json: () => Promise.resolve([]) } as any),
        fetch('/api/settings'),
        fetch('/api/customers'),
        isAdmin ? fetch('/api/admin/drivers') : Promise.resolve({ ok: false, status: 403, json: () => Promise.resolve([]) } as any)
      ]);

      // Also fetch active orders to keep queue updated
      fetchActiveOrders();

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
      if (driversRes.ok) setDrivers(await driversRes.json());
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData) {
          if (settingsData.tax_rate !== undefined) {
            settingsData.tax_rate = Number(settingsData.tax_rate);
          }
          if (!settingsData.theme_name) {
            settingsData.theme_name = 'coffee';
          }
          setAppSettings(prev => ({ ...prev, ...settingsData }));
        }
      }

      // Fetch extra dashboard data if admin
      if (isAdmin) {
        const [dailySumRes, financialRes] = await Promise.all([
          fetch('/api/reports/daily-summary'),
          fetch('/api/reports/financial')
        ]);
        
        if (dailySumRes.ok && financialRes.ok) {
          const dailySum = await dailySumRes.json();
          const financial = await financialRes.json();
          setDashboardExtra({
            dailySummary: dailySum,
            financialTrend: financial.dailyData || [],
            topItems: dailySum.topItems || []
          });
        }
      }

      fetchActiveOrders();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'reports' || activeTab === 'orders' || activeTab === 'inventory') {
      fetchData();
    }
  }, [activeTab]);

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

  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/driver/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDriverData)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Pendaftaran driver berhasil! Silakan tunggu verifikasi admin.');
        setShowDriverModal(false);
        setNewDriverData({ username: '', password: '', full_name: '', phone: '', vehicle_info: '' });
        fetchData();
      } else {
        toast.error(data.error || 'Gagal mendaftar driver');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mendaftar');
    }
  };

  const handleUpdateSettings = async (updates: any, silent = false) => {
    if (updates.theme_name) toast.info('Mengganti tema ke: ' + updates.theme_name);
    const previousSettings = { ...appSettings };
    setAppSettings(prev => ({ ...prev, ...updates }));

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update settings');
      
      if (!silent) toast.success(t('save_settings') + ' ' + (appSettings.language === 'id' ? 'berhasil' : 'successful'));
    } catch (error) {
      setAppSettings(previousSettings);
      toast.error(t('save_settings') + ' ' + (appSettings.language === 'id' ? 'gagal' : 'failed'));
    }
  };

  const handleResetOrderId = async () => {
    setConfirmDialog({
      show: true,
      title: t('reset_order_id'),
      message: t('reset_order_id_desc'),
      onConfirm: async () => {
        try {
          const res = await fetch('/api/settings/reset-order-id', { method: 'POST' });
          if (res.ok) {
            toast.success(t('reset_order_id') + ' ' + (appSettings.language === 'id' ? 'berhasil direset' : 'successfully reset'));
          }
        } catch (error) {
          toast.error(t('reset_order_id') + ' ' + (appSettings.language === 'id' ? 'gagal direset' : 'failed to reset'));
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleResetTheme = async () => {
    setConfirmDialog({
      show: true,
      title: 'Reset Tema',
      message: 'Apakah Anda yakin ingin mereset tema ke pengaturan awal?',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/settings/reset-theme', { method: 'POST' });
          if (res.ok) {
            await fetchData();
            toast.success('Tema berhasil direset ke pengaturan awal');
          }
        } catch (error) {
          toast.error('Gagal mereset tema');
        }
        setConfirmDialog(null);
      }
    });
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
    setConfirmDialog({
      show: true,
      title: t('confirm_restore'),
      message: t('confirm_restore') + file.name + '? ' + t('restore_warning'),
      isDestructive: true,
      onConfirm: async () => {
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
        setConfirmDialog(null);
      }
    });
  };

  const handleResetTransactions = async () => {
    setConfirmDialog({
      show: true,
      title: appSettings.language === 'id' ? 'Reset Transaksi' : 'Reset Transactions',
      message: appSettings.language === 'id' ? 'PERINGATAN: Ini akan menghapus SEMUA data transaksi. Data menu dan inventory tetap aman. Lanjutkan?' : 'WARNING: This will delete ALL transaction data. Menu and inventory data will remain safe. Continue?',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/reset-transactions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await res.json();
          if (res.ok) {
            toast.success(data.message);
            fetchData();
          } else {
            toast.error(data.error);
          }
        } catch (error) {
          toast.error('Gagal mereset transaksi');
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleResetDatabase = async () => {
    setConfirmDialog({
      show: true,
      title: appSettings.language === 'id' ? 'Reset Database' : 'Reset Database',
      message: appSettings.language === 'id' ? 'PERINGATAN: Ini akan menghapus SEMUA data (transaksi, menu, inventory, dll). Lanjutkan?' : 'WARNING: This will delete ALL data (transactions, menu, inventory, etc). Continue?',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/reset-database', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await res.json();
          if (res.ok) {
            toast.success(data.message);
            fetchData();
          } else {
            toast.error(data.error);
          }
        } catch (error) {
          toast.error('Gagal mereset database');
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleLoadDemoData = async () => {
    setConfirmDialog({
      show: true,
      title: appSettings.language === 'id' ? 'Muat Data Demo' : 'Load Demo Data',
      message: appSettings.language === 'id' ? 'Ini akan menghapus data saat ini dan memuat data demo. Lanjutkan?' : 'This will clear current data and load demo data. Continue?',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/load-demo-data', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await res.json();
          if (res.ok) {
            toast.success(data.message);
            fetchData();
          } else {
            toast.error(data.error);
          }
        } catch (error) {
          toast.error('Gagal memuat data demo');
        }
        setConfirmDialog(null);
      }
    });
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
    if (user && (activeTab === 'transactions' || activeTab === 'reports')) {
      fetchData();
    }
  }, [user, activeTab, reportSubTab]);

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
          notes: customerOrder.notes,
          deliveryMethod: customerOrder.deliveryMethod,
          deliveryAddress: customerOrder.deliveryMethod === 'delivery' ? customerOrder.deliveryAddress : null,
          customerPhone: customerOrder.deliveryMethod === 'delivery' ? customerOrder.phone : null,
          customerLat: customerOrder.deliveryMethod === 'delivery' ? customerOrder.lat : null,
          customerLng: customerOrder.deliveryMethod === 'delivery' ? customerOrder.lng : null
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCustomerOrderId(data.orderId);
        setCustomerDisplayId(data.displayId);
        setLastCustomerOrder({ ...customerOrder });
        
        // Join the order room for real-time payment updates
        if (socketRef.current) {
          socketRef.current.emit('join_order', data.orderId);
        }
        
        const totalAmount = calculateCartTotal().total;
        setQrisAmount(totalAmount);

        if (customerOrder.paymentMethod === 'QRIS') {
          setIsQRISLoading(true);
          setShowQRISModal(true);
          setTimeout(() => {
            setIsQRISLoading(false);
          }, 3000); // 3 seconds loading
        } else {
          setShowSuccessAnimation(true);
          setTimeout(() => {
            setShowSuccessAnimation(false);
            setShowCustomerOrderSuccess(true);
          }, 2000);
        }
        
        setCart([]);
        setCustomerOrder({ name: '', table: '', paymentMethod: 'Cash', notes: '', deliveryMethod: 'dine_in', deliveryAddress: '' });
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
      const order = activeOrders.find(o => o.orderId === orderId);
      // If pending or awaiting_confirmation, move to processing (paid)
      // If already processing, move to completed
      const nextStatus = (order?.status === 'pending' || order?.status === 'awaiting_confirmation') 
        ? 'processing' 
        : 'completed';
      
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchActiveOrders();
        toast.success(nextStatus === 'processing' ? `Pembayaran orderan ${orderId} berhasil dikonfirmasi.` : `Orderan ${orderId} telah selesai.`);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Gagal memproses status pesanan');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setConfirmDialog({
      show: true,
      title: 'Hapus Pesanan',
      message: 'Apakah Anda yakin ingin menghapus seluruh pesanan ini? Stok bahan akan dikembalikan.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            toast.success('Pesanan berhasil dihapus');
            fetchActiveOrders();
          } else {
            const data = await res.json();
            toast.error(data.error || 'Gagal menghapus pesanan');
          }
        } catch (error) {
          toast.error('Terjadi kesalahan saat menghapus pesanan');
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleDeleteItem = async (txId: number) => {
    setConfirmDialog({
      show: true,
      title: 'Hapus Menu',
      message: 'Apakah Anda yakin ingin menghapus menu ini dari pesanan? Stok bahan akan dikembalikan.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/transactions/${txId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            toast.success('Menu berhasil dihapus');
            fetchActiveOrders();
          } else {
            const data = await res.json();
            toast.error(data.error || 'Gagal menghapus menu');
          }
        } catch (error) {
          toast.error('Terjadi kesalahan saat menghapus menu');
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch(`/api/transactions/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          quantity: editingItem.quantity,
          sugar_level: editingItem.sugarLevel,
          ice_level: editingItem.iceLevel,
          notes: editingItem.notes
        })
      });
      if (res.ok) {
        toast.success('Menu berhasil diperbarui');
        setShowEditItemModal(false);
        fetchActiveOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal memperbarui menu');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memperbarui menu');
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

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Status pesanan diperbarui ke ${status}`);
        fetchActiveOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal memperbarui status');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi');
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
          id: Date.now() + Math.random(),
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
    setNewInv({ name: '', quantity: 0, unit: 'pcs', min_stock: 0, unit_price: 0, category: 'Bahan', type: 'Bahan', expiration_date: '' });
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
      type: item.type || 'Bahan',
      expiration_date: item.expiration_date || ''
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

  const handleAddToCart = (menu: Menu, e?: React.MouseEvent) => {
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

      // Add flying animation
      if (e) {
        const id = Date.now() + Math.random();
        setFlyingItems(prevFlying => [...prevFlying, {
          id,
          x: e.clientX,
          y: e.clientY,
          image: menu.image_url
        }]);
        
        // Pulse effect
        setCartPulse(true);
        setTimeout(() => setCartPulse(false), 300);
        
        toast.success(`${menu.name} ditambahkan`, {
          icon: <ShoppingCart size={16} className="text-emerald-500" />,
          duration: 1500,
          position: 'bottom-right'
        });
        
        // Remove item after animation completes
        setTimeout(() => {
          setFlyingItems(prevFlying => prevFlying.filter(item => item.id !== id));
        }, 800);
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
    const delivery_fee = deliveryMethod === 'delivery' ? deliveryFee : 0;
    const total = subtotal + tax + delivery_fee;
    
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
        source: 'POS',
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : null,
        deliveryFee: delivery_fee,
        customerPhone: deliveryMethod === 'delivery' ? customerPhone : null,
        customerLat: deliveryMethod === 'delivery' ? customerLat : null,
        customerLng: deliveryMethod === 'delivery' ? customerLng : null
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
          id: Date.now() + Math.random(),
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
      const endpoint = loginType === 'driver' ? '/api/driver/login' : '/api/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          setLoginError(errorData.error || errorData.message || `Error ${res.status}: Terjadi kesalahan`);
        } catch (e) {
          setLoginError(`Server Error (${res.status}). Silakan cek log CasaOS.`);
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        if (loginType === 'driver') {
          setDriverUser(data.driver);
          setIsDriverMode(true);
          toast.success(`Selamat datang, ${data.driver.full_name}!`);
        } else {
          setUser(data.user);
          if (data.user.role === 'cashier') {
            setActiveTab('orders');
          }
        }
      } else {
        setLoginError(data.message || data.error);
      }
    } catch (error) {
      setLoginError('Gagal terhubung ke server');
    }
  };

  const handleDriverLogout = async () => {
    try {
      await fetch('/api/driver/logout', { method: 'POST' });
      setDriverUser(null);
      setIsDriverMode(false);
      setLoginData({ username: '', password: '' });
      toast.info('Anda telah keluar dari akun Driver');
    } catch (error) {
      console.error('Logout failed:', error);
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


  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        {appSettings.payment_loading_gif_url ? (
          <motion.img 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            src={appSettings.payment_loading_gif_url}
            alt="Loading..."
            className="w-48 h-48 object-contain"
            referrerPolicy="no-referrer"
          />
        ) : (
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
        )}
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
      <div 
        className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ 
          backgroundColor: appSettings.customer_bg_color,
          backgroundImage: appSettings.customer_bg_image ? `url(${appSettings.customer_bg_image})` : 'none'
        }}
      >
        {/* Left Side: Ad Carousel (Desktop Only) */}
        <div className="hidden lg:block lg:w-2/5 xl:w-1/2 h-screen sticky top-0">
          <AdCarousel />
        </div>

        {/* Right Side: Ordering Interface */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-2xl border-b border-coffee-100 sticky top-0 z-30 px-4 py-4 md:px-12 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-10 rounded-full shadow-lg shadow-coffee-900/10 flex items-center justify-center relative group shrink-0",
                appSettings.app_logo_url ? "bg-white" : "bg-coffee-900 text-white"
              )}>
                <IconComponent size={18} />
                <div className="absolute inset-0 bg-coffee-900/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h1 className="text-lg font-serif font-black text-coffee-950 tracking-tight leading-none">{appSettings.customer_page_title || appSettings.app_name}</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Subtle Login Access (Hidden) */}
              <button 
                onClick={() => setIsCustomerMode(false)}
                className="p-3 text-coffee-950/5 hover:text-coffee-950/20 transition-colors rounded-2xl"
                title="Staff Login"
              >
                <Lock size={18} />
              </button>
              
              <button 
                onClick={() => setShowCustomerOrderStatus(true)}
                className="w-8 h-8 flex items-center justify-center bg-white border border-coffee-100 text-coffee-600 rounded-lg shadow-sm hover:bg-coffee-50 transition-all active:scale-95"
              >
                <ClipboardList size={14} />
              </button>

              <motion.button 
                id="mobile-cart-icon"
                animate={cartPulse ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
                onClick={() => setShowMobileCart(true)}
                className="relative w-8 h-8 flex items-center justify-center bg-coffee-900 text-white rounded-lg shadow-lg active:scale-95 group"
              >
                <ShoppingCart size={14} />
                <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </motion.button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-white">
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
                  className="w-full bg-white border border-coffee-200 rounded-2xl pl-12 pr-4 py-4.5 focus:outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm text-base"
                />
              </div>
              <div className="flex flex-wrap gap-2 pb-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-6 py-4 rounded-2xl font-bold transition-all shadow-sm border",
                      selectedCategory === cat 
                        ? "bg-coffee-700 text-white border-coffee-700" 
                        : "bg-white text-coffee-600 border-coffee-100 hover:border-coffee-300"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-6">
              {filteredMenus.map(menu => (
                <motion.div 
                  key={menu.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-[2rem] overflow-hidden border border-coffee-100/50 shadow-sm hover:shadow-2xl hover:shadow-coffee-200/40 transition-all group flex flex-col"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-coffee-50">
                    {menu.image_url ? (
                      <img 
                        src={menu.image_url} 
                        alt={menu.name} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-coffee-200 bg-gradient-to-br from-coffee-50 to-white">
                        <Coffee size={48} className="opacity-20" />
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] text-coffee-900 shadow-sm border border-white/50">
                        {menu.category}
                      </span>
                    </div>

                    {/* Quick Add Overlay (Desktop) */}
                    <div className="absolute inset-0 bg-coffee-950/20 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex items-center justify-center">
                      <button 
                        onClick={(e) => handleAddToCart(menu, e)}
                        className="bg-white text-coffee-900 p-4 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-coffee-900 hover:text-white"
                      >
                        <Plus size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 flex flex-col flex-1">
                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-sm sm:text-xl font-serif font-bold text-coffee-950 leading-tight group-hover:text-coffee-700 transition-colors line-clamp-1 sm:line-clamp-2 mb-1.5">
                        {menu.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        {menu.size && (
                          <span className="text-[7px] sm:text-[9px] font-black text-coffee-600 bg-coffee-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-widest border border-coffee-100">
                            {menu.size}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[9px] sm:text-xs text-coffee-500 line-clamp-2 leading-relaxed italic opacity-70">
                        {menu.description || 'Dibuat dengan cinta dan biji kopi pilihan terbaik.'}
                      </p>
                    </div>

                    <div className="mt-auto pt-3 sm:pt-5 border-t border-coffee-50 flex items-center justify-between gap-1.5">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.15em] text-coffee-400 font-black mb-0.5">Harga</span>
                        <div className="flex items-baseline gap-0.5 text-coffee-900">
                          <span className="text-[10px] sm:text-sm font-bold">Rp</span>
                          <span className="text-base sm:text-xl font-black tracking-tighter leading-none">
                            {menu.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => handleAddToCart(menu, e)}
                        className="sm:hidden bg-coffee-900 text-white w-9 h-9 rounded-xl hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-100 active:scale-90 flex items-center justify-center shrink-0"
                      >
                        <Plus size={18} />
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
          <div className="fixed inset-0 z-[200] flex justify-end">
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
                            
                            {/* Sugar and Ice Options */}
                            {(item.menu.category?.toLowerCase().includes('kopi') || 
                              item.menu.category?.toLowerCase().includes('teh') || 
                              item.menu.category?.toLowerCase().includes('coffee') || 
                              item.menu.category?.toLowerCase().includes('tea') || 
                              item.menu.category?.toLowerCase().includes('drink') || 
                              item.menu.category?.toLowerCase().includes('minuman')) && (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black uppercase text-coffee-400 tracking-tighter">Gula</label>
                                  <select 
                                    value={item.sugarLevel || 'Normal'}
                                    onChange={(e) => handleUpdateCartOptions(item.menu.id, { sugarLevel: e.target.value })}
                                    className="w-full bg-white border border-coffee-100 rounded-md text-[10px] py-1 px-1 focus:outline-none focus:ring-1 focus:ring-coffee-500"
                                  >
                                    <option value="No Sugar">No Sugar</option>
                                    <option value="Less Sugar">Less Sugar</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Extra Sugar">Extra</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black uppercase text-coffee-400 tracking-tighter">Es</label>
                                  <select 
                                    value={item.iceLevel || 'Normal'}
                                    onChange={(e) => handleUpdateCartOptions(item.menu.id, { iceLevel: e.target.value })}
                                    className="w-full bg-white border border-coffee-100 rounded-md text-[10px] py-1 px-1 focus:outline-none focus:ring-1 focus:ring-coffee-500"
                                  >
                                    <option value="No Ice">No Ice</option>
                                    <option value="Less Ice">Less Ice</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Extra Ice">Extra</option>
                                  </select>
                                </div>
                              </div>
                            )}

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
                            className="w-full bg-white border border-coffee-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            placeholder="Nama Anda"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-coffee-500 mb-1.5 tracking-widest">Nomor Meja</label>
                          <input 
                            type="text"
                            value={customerOrder.table}
                            onChange={e => setCustomerOrder({...customerOrder, table: e.target.value})}
                            className="w-full bg-white border border-coffee-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-coffee-500"
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
                            className="w-full bg-white border border-coffee-200 rounded-xl pl-9 pr-4 py-3 text-base font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:bg-coffee-100 disabled:text-coffee-400"
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

                    {/* Delivery Method Selection */}
                    {appSettings.enable_delivery && (
                      <div className="space-y-3 pt-6 border-t border-coffee-100">
                        <label className="text-[10px] font-black uppercase text-coffee-400 tracking-widest">Metode Pengantaran</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['dine_in', 'takeaway', 'delivery'] as const).map((method) => (
                            <button
                              key={method}
                              onClick={() => setCustomerOrder({ ...customerOrder, deliveryMethod: method })}
                              className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                                customerOrder.deliveryMethod === method 
                                  ? "bg-coffee-900 border-coffee-900 text-white shadow-lg" 
                                  : "bg-white border-coffee-100 text-coffee-600 hover:bg-coffee-50"
                              )}
                            >
                              {method === 'dine_in' && <Coffee size={18} />}
                              {method === 'takeaway' && <ShoppingBag size={18} />}
                              {method === 'delivery' && <Truck size={18} />}
                              <span className="text-[10px] font-bold uppercase">{t(method)}</span>
                            </button>
                          ))}
                        </div>
                        
                        {customerOrder.deliveryMethod === 'delivery' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 pt-2"
                          >
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold uppercase text-coffee-500 tracking-widest">Alamat Pengiriman</label>
                              <textarea 
                                value={customerOrder.deliveryAddress}
                                onChange={e => setCustomerOrder({...customerOrder, deliveryAddress: e.target.value})}
                                className="w-full bg-white border border-coffee-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 min-h-[80px] resize-none"
                                placeholder="Jl. Merdeka No. 123..."
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold uppercase text-coffee-500 tracking-widest">Nomor Telepon</label>
                              <input 
                                type="tel"
                                value={customerOrder.phone}
                                onChange={e => setCustomerOrder({...customerOrder, phone: e.target.value})}
                                className="w-full bg-white border border-coffee-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                placeholder="08123456789..."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold uppercase text-coffee-500 tracking-widest">Latitude</label>
                                <input 
                                  type="number"
                                  step="any"
                                  value={customerOrder.lat || ''}
                                  onChange={e => setCustomerOrder({...customerOrder, lat: e.target.value ? Number(e.target.value) : null})}
                                  className="w-full bg-white border border-coffee-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                  placeholder="-6.1234"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold uppercase text-coffee-500 tracking-widest">Longitude</label>
                                <input 
                                  type="number"
                                  step="any"
                                  value={customerOrder.lng || ''}
                                  onChange={e => setCustomerOrder({...customerOrder, lng: e.target.value ? Number(e.target.value) : null})}
                                  className="w-full bg-white border border-coffee-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                  placeholder="106.1234"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (navigator.geolocation) {
                                  navigator.geolocation.getCurrentPosition((pos) => {
                                    setCustomerOrder({
                                      ...customerOrder,
                                      lat: pos.coords.latitude,
                                      lng: pos.coords.longitude
                                    });
                                    toast.success('Lokasi berhasil diambil');
                                  }, (err) => {
                                    toast.error('Gagal mengambil lokasi: ' + err.message);
                                  });
                                }
                              }}
                              className="w-full py-2.5 bg-coffee-50 text-coffee-700 rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-coffee-100 transition-colors border border-coffee-100"
                            >
                              <MapPin size={14} />
                              Gunakan Lokasi Saat Ini
                            </button>
                          </motion.div>
                        )}
                      </div>
                    )}

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

        {/* Success Animation Overlay */}
        <AnimatePresence>
          {showSuccessAnimation && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-coffee-950 flex flex-col items-center justify-center z-[200] text-white"
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  rotate: [ -45, 0 ],
                }}
                transition={{ duration: 0.8, ease: "backOut" }}
                className="w-48 h-48 bg-white text-coffee-950 rounded-full flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(255,255,255,0.3)]"
              >
                <Check size={96} strokeWidth={4} />
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <h2 className="text-5xl font-serif font-black mb-2 tracking-tight">BERHASIL!</h2>
                <p className="text-coffee-200 font-bold uppercase tracking-[0.3em] text-sm">Pesanan Anda Sedang Diproses</p>
              </motion.div>

              {/* Decorative particles */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                  }}
                  transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, repeatDelay: 0.5 }}
                  className="absolute w-3 h-3 bg-white/40 rounded-full"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        {showCustomerOrderSuccess && (
          <div className="fixed inset-0 bg-coffee-950/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-[2.5rem] p-6 sm:p-10 w-full max-w-md shadow-2xl text-center relative overflow-y-auto max-h-[85vh]"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
              <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
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
          <div className="fixed inset-0 bg-coffee-950/80 backdrop-blur-xl flex items-center justify-center z-[200] p-0 sm:p-4 overflow-y-auto">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 w-full max-w-md shadow-2xl text-center relative min-h-screen sm:min-h-0 flex flex-col justify-center max-h-[85vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowQRISModal(false)}
                className="absolute top-6 right-6 p-2 bg-coffee-50 text-coffee-400 rounded-full hover:bg-coffee-100 transition-all"
              >
                <X size={24} />
              </button>

              <div className="w-16 h-16 bg-coffee-50 text-coffee-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode size={32} />
              </div>
              
              <div className="mb-2">
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Scan & Pay
                </span>
              </div>
              
              <h2 className="text-2xl font-serif font-bold text-coffee-950 mb-1">Pembayaran QRIS</h2>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="bg-coffee-50 px-6 py-3 rounded-2xl flex items-center gap-3 border border-coffee-100">
                  <span className="text-coffee-950 font-black text-2xl tracking-tight">{formatIDR(qrisAmount)}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(qrisAmount.toString());
                      toast.success('Nominal disalin!');
                    }}
                    className="p-2 bg-white text-coffee-400 rounded-lg hover:text-coffee-600 transition-all shadow-sm"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-coffee-400 text-xs mb-6">
                <Clock size={14} />
                <span>Selesaikan dalam <span className="font-bold text-coffee-600">15:00</span></span>
              </div>
              
              <div className="bg-white p-2 sm:p-4 rounded-[2.5rem] border border-coffee-100 shadow-2xl shadow-coffee-100/50 space-y-4 mb-6 relative group">
                {isQRISLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    {appSettings.payment_loading_gif_url ? (
                      <img src={appSettings.payment_loading_gif_url} alt="Loading..." className="w-24 h-24 object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 border-4 border-coffee-100 border-t-coffee-600 rounded-full animate-spin" />
                    )}
                    <p className="text-coffee-400 font-medium animate-pulse text-[10px] tracking-widest uppercase">Menyiapkan Barcode...</p>
                  </div>
                ) : (
                  <>
                    <div className="relative bg-white p-4 rounded-3xl overflow-hidden">
                      <motion.img 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={appSettings.payment_qris_url || 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=QRIS_NOT_SET'} 
                        alt="QRIS" 
                        className="w-full aspect-square mx-auto object-contain rounded-xl"
                        style={{ imageRendering: 'pixelated' }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = appSettings.payment_qris_url || '#';
                        link.download = `QRIS-${qrisAmount}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success('QR disimpan ke galeri!');
                      }}
                      className="flex items-center justify-center gap-2 w-full py-4 bg-coffee-900 text-white rounded-2xl text-sm font-bold hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
                      disabled={!appSettings.payment_qris_url}
                    >
                      <Download size={18} />
                      Simpan QR ke Galeri
                    </button>
                  </>
                )}
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-6">
                <p className="text-[10px] text-amber-800 leading-relaxed font-medium flex items-start gap-2 text-left">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  {appSettings.payment_instructions || 'Silakan scan QRIS di atas menggunakan aplikasi m-banking atau e-wallet Anda. Setelah berhasil, upload bukti bayar di bawah.'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    id="proof-upload"
                    className="hidden"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                  <label 
                    htmlFor="proof-upload"
                    className={cn(
                      "w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer font-bold text-sm",
                      proofFile ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-coffee-50 border-coffee-200 text-coffee-500 hover:border-coffee-400"
                    )}
                  >
                    {proofFile ? (
                      <>
                        <Check size={18} className="text-emerald-600" />
                        Bukti: {proofFile.name.slice(0, 15)}...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Upload Bukti Pembayaran
                      </>
                    )}
                  </label>
                </div>

                <button 
                  disabled={isUploadingProof}
                  onClick={async () => {
                    setIsUploadingProof(true);
                    try {
                      if (proofFile) {
                        const formData = new FormData();
                        formData.append('proof', proofFile);
                        await fetch(`/api/orders/${customerOrderId}/proof`, {
                          method: 'POST',
                          body: formData
                        });
                      }

                      await fetch(`/api/public/orders/${customerOrderId}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'awaiting_confirmation' })
                      });
                      
                      toast.success('Bukti pembayaran berhasil dikirim!');
                      setShowQRISModal(false);
                      setShowCustomerOrderSuccess(true);
                      setProofFile(null);
                    } catch (err) {
                      console.error('Error updating order status:', err);
                      toast.error('Gagal mengirim bukti pembayaran');
                    } finally {
                      setIsUploadingProof(false);
                    }
                  }}
                  className="w-full bg-coffee-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-coffee-200 hover:bg-coffee-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                >
                  {isUploadingProof ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      Konfirmasi Pembayaran
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Flying Items Animation */}
        <AnimatePresence>
          {flyingItems.map(item => {
            // Determine target position
            let targetX = window.innerWidth - 100;
            let targetY = 100;

            const mobileCartIcon = document.getElementById('mobile-cart-icon');
            const mobileFloatingCart = document.getElementById('mobile-floating-cart');
            const desktopCartIcon = document.getElementById('desktop-cart-icon');

            if (window.innerWidth < 1024) {
              if (mobileFloatingCart) {
                const rect = mobileFloatingCart.getBoundingClientRect();
                targetX = rect.left + rect.width / 2;
                targetY = rect.top + rect.height / 2;
              } else if (mobileCartIcon) {
                const rect = mobileCartIcon.getBoundingClientRect();
                targetX = rect.left + rect.width / 2;
                targetY = rect.top + rect.height / 2;
              }
            } else if (desktopCartIcon) {
              const rect = desktopCartIcon.getBoundingClientRect();
              targetX = rect.left + rect.width / 2;
              targetY = rect.top + rect.height / 2;
            }

            return (
              <motion.div
                key={item.id}
                initial={{ 
                  x: item.x - 20, 
                  y: item.y - 20, 
                  scale: 1, 
                  opacity: 1,
                  rotate: 0
                }}
                animate={{ 
                  x: targetX - 20, 
                  y: targetY - 20, 
                  scale: 0.2, 
                  opacity: 0.5,
                  rotate: 360
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="fixed top-0 left-0 z-[9999] pointer-events-none"
              >
                <div className="w-10 h-10 rounded-full bg-coffee-500 border-2 border-white shadow-lg overflow-hidden flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Coffee size={20} className="text-white" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

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
                            const nameToFetch = customerOrder.name || lastCustomerOrder?.name;
                            if (nameToFetch) fetchCustomerHistory(nameToFetch);
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
                                <span className="text-lg font-black text-coffee-900">#{order.display_id || order.id.toString().slice(-4)}</span>
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
                              {order.items && order.items.map((item: any, idx: number) => (
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
                                <span className="text-lg font-black text-coffee-900">#{order.display_id || (order.orderId ? order.orderId.toString().slice(-4) : '????')}</span>
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                  order.status === 'completed' ? "bg-emerald-100 text-emerald-600" : 
                                  order.status === 'awaiting_confirmation' ? "bg-amber-100 text-amber-600" :
                                  "bg-coffee-100 text-coffee-600"
                                )}>
                                  {order.status === 'completed' ? 'Selesai' : 
                                   order.status === 'awaiting_confirmation' ? 'Menunggu Konfirmasi' : 
                                   order.status === 'pending' ? 'Belum Bayar' : 
                                   order.status}
                                </span>
                              </div>
                              <div className="text-[10px] text-coffee-400 font-bold uppercase tracking-wider">
                                {order.date ? formatDate(new Date(order.date), 'dd MMM yyyy, HH:mm') : '-'}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {order.items && order.items.map((item: any, idx: number) => (
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
      </div>
    </div>
    );
  }

  if (isDriverMode && driverUser) {
    return <DriverDashboard driver={driverUser} onLogout={handleDriverLogout} />;
  }

  if (!user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" 
      >
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-110"
          style={{ 
            backgroundImage: `url(${appSettings.login_bg_image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000'})`
          }}
        />
        <div className="absolute inset-0 bg-coffee-950/40 backdrop-blur-[2px]" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-xl p-10 md:p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-white/20 relative z-10"
        >
          <div className="text-center mb-10">
            <div className="mx-auto mb-8 flex items-center justify-center">
              {appSettings.app_logo_url ? (
                <img src={appSettings.app_logo_url} alt="Logo" className="w-24 h-24 object-contain" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-20 h-20 bg-coffee-950 text-white rounded-3xl flex items-center justify-center premium-shadow">
                  <Coffee size={40} />
                </div>
              )}
            </div>
            <h2 className="text-4xl font-serif text-coffee-950 mb-6 tracking-tight">{appSettings.login_title}</h2>
          </div>

          <div className="flex bg-coffee-50/50 p-1.5 rounded-2xl mb-10 border border-coffee-100/50">
            <button 
              onClick={() => setLoginType('staff')}
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-sans font-light uppercase tracking-widest transition-all",
                loginType === 'staff' ? "bg-white text-coffee-950 shadow-sm" : "text-coffee-400 hover:text-coffee-600"
              )}
            >
              Staff / Admin
            </button>
            <button 
              onClick={() => setLoginType('driver')}
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-sans font-light uppercase tracking-widest transition-all",
                loginType === 'driver' ? "bg-white text-coffee-950 shadow-sm" : "text-coffee-400 hover:text-coffee-600"
              )}
            >
              Driver Partner
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-sans font-light uppercase text-coffee-400 tracking-[0.2em] ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-coffee-300 group-focus-within:text-coffee-950 transition-colors" size={18} />
                <input 
                  required
                  type="text"
                  value={loginData.username}
                  onChange={e => setLoginData({...loginData, username: e.target.value})}
                  className="w-full bg-white border border-coffee-100 rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 focus:border-coffee-500 transition-all font-sans font-light text-coffee-950 placeholder:text-coffee-200"
                  placeholder="Enter username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-sans font-light uppercase text-coffee-400 tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-coffee-300 group-focus-within:text-coffee-950 transition-colors" size={18} />
                <input 
                  required
                  type="password"
                  value={loginData.password}
                  onChange={e => setLoginData({...loginData, password: e.target.value})}
                  className="w-full bg-white border border-coffee-100 rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 focus:border-coffee-500 transition-all font-sans font-light text-coffee-950 placeholder:text-coffee-200"
                  placeholder="Enter password"
                />
              </div>
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-sans font-light flex items-center gap-3 border border-rose-100"
              >
                <AlertCircle size={18} />
                {loginError}
              </motion.div>
            )}

            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-[10px] font-sans font-light text-coffee-400 hover:text-coffee-950 uppercase tracking-widest transition-colors"
              >
                Lupa Password?
              </button>
            </div>

            <div className="space-y-4">
              <button 
                type="submit"
                className="w-full bg-accent-500 text-white py-5 rounded-2xl font-sans font-light text-sm uppercase tracking-[0.2em] hover:bg-accent-600 transition-all shadow-xl shadow-accent-500/20 active:scale-[0.98]"
              >
                {t('login')}
              </button>

              <button 
                type="button"
                onClick={() => setIsCustomerMode(true)}
                className="w-full bg-white text-coffee-400 py-5 rounded-2xl font-sans font-light text-[10px] uppercase tracking-[0.2em] border border-coffee-100 hover:bg-coffee-50 transition-all flex items-center justify-center gap-3"
              >
                <ShoppingCart size={16} />
                Kembali ke Menu Order
              </button>
            </div>
          </form>
          
          <div className="mt-12 pt-8 border-t border-coffee-50 text-center">
            <p className="text-[10px] font-sans font-light text-coffee-200 uppercase tracking-[0.2em]">
              Premium Coffee POS System
            </p>
          </div>
        </motion.div>

        {showResetModal && (
          <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[85vh]"
            >
              <h3 className="text-2xl font-serif mb-2">Reset Password</h3>
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

  const filteredUsers = users
    .filter(u => {
      const matchesSearch = u.username.toLowerCase().includes(userSearch.toLowerCase());
      const matchesFilter = userFilter === 'all' || u.role === userFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (userSort === 'username') return a.username.localeCompare(b.username);
      if (userSort === 'role') return a.role.localeCompare(b.role);
      return 0;
    });

  const filteredDrivers = drivers
    .filter(d => {
      const matchesSearch = 
        d.full_name.toLowerCase().includes(driverSearch.toLowerCase()) || 
        d.username.toLowerCase().includes(driverSearch.toLowerCase());
      const matchesFilter = driverFilter === 'all' || d.status === driverFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (driverSort === 'full_name') return a.full_name.localeCompare(b.full_name);
      if (driverSort === 'status') return a.status.localeCompare(b.status);
      if (driverSort === 'active_deliveries') return b.active_deliveries - a.active_deliveries;
      return 0;
    });

  return (
    <div 
      className="min-h-screen flex flex-col lg:flex-row bg-cover bg-center bg-no-repeat bg-fixed"
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
        appSettings={appSettings}
        t={t}
        handleLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        setNotifications={setNotifications}
      />

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-white relative pt-16 lg:pt-0 pb-24 lg:pb-0 scroll-smooth coffee-pattern">
        <div className="p-3 sm:p-6 lg:p-8 xl:p-12 2xl:p-16 max-w-[1800px] mx-auto w-full transition-all duration-300 relative z-10">
          <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && user && (
            <DashboardTab 
              user={user}
              stats={stats}
              dashboardExtra={dashboardExtra}
              transactions={transactions}
              inventory={inventory}
              activeOrders={activeOrders}
              appSettings={appSettings}
              setActiveTab={setActiveTab}
              setNewTx={setNewTx}
              setShowTxModal={setShowTxModal}
              setShowInvModal={setShowInvModal}
              setConfirmUpdate={setConfirmUpdate}
            />
          )}

          {activeTab === 'delivery' && (
            <DeliveryTab 
              fetchData={fetchData}
              drivers={drivers}
              appSettings={appSettings}
              setActiveTab={setActiveTab}
              setUsersSubTab={setUsersSubTab}
              activeOrders={activeOrders}
              t={t}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab 
              reportSubTab={reportSubTab}
              setReportSubTab={setReportSubTab}
              user={user}
              handleExportAllReports={handleExportAllReports}
              reportFilter={reportFilter}
              setReportFilter={setReportFilter}
              reportDate={reportDate}
              setReportDate={setReportDate}
              transactions={transactions}
              appSettings={appSettings}
              exportToCSV={exportToCSV}
              getTransactionInsights={getTransactionInsights}
              fetchDailySummary={fetchDailySummary}
              dailySummary={dailySummary}
              getDailyInsights={getDailyInsights}
              financialRange={financialRange}
              setFinancialRange={setFinancialRange}
              fetchFinancialData={fetchFinancialData}
              financialData={financialData}
              getFinancialInsights={getFinancialInsights}
              consignmentData={consignmentData}
              fetchConsignmentData={fetchConsignmentData}
              handleReprint={handleReprint}
              setConfirmDialog={setConfirmDialog}
              fetchData={fetchData}
              t={t}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab 
              orderView={orderView}
              setOrderView={setOrderView}
              menuSearch={menuSearch}
              setMenuSearch={setMenuSearch}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              menus={menus}
              cart={cart}
              setCart={setCart}
              cartPulse={cartPulse}
              customerName={customerName}
              setCustomerName={setCustomerName}
              tableNumber={tableNumber}
              setTableNumber={setTableNumber}
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
              customers={customers}
              lastOrder={lastOrder}
              loading={loading}
              showMobileCart={showMobileCart}
              setShowMobileCart={setShowMobileCart}
              transactions={transactions}
              appSettings={appSettings}
              handleAddToCart={handleAddToCart}
              handleUpdateCartOptions={handleUpdateCartOptions}
              handleUpdateCartQuantity={handleUpdateCartQuantity}
              handleRemoveFromCart={handleRemoveFromCart}
              handleReprint={handleReprint}
              setShowPaymentModal={setShowPaymentModal}
              isMenuAvailable={isMenuAvailable}
              searchInputRef={searchInputRef}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab 
              inventory={inventory}
              invCategoryFilter={invCategoryFilter}
              setInvCategoryFilter={setInvCategoryFilter}
              invPage={invPage}
              setInvPage={setInvPage}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
              setEditingInvId={setEditingInvId}
              setNewInv={setNewInv}
              setCalcPurchase={setCalcPurchase}
              setShowCalculator={setShowCalculator}
              setShowInvModal={setShowInvModal}
              handleEditInventory={handleEditInventory}
              handleDeleteInventory={handleDeleteInventory}
              setConfirmUpdate={setConfirmUpdate}
              setPurchaseData={setPurchaseData}
              setShowPurchaseModal={setShowPurchaseModal}
              t={t}
            />
          )}

          {activeTab === 'queue' && (
            <QueueTab 
              activeOrders={activeOrders}
              fetchActiveOrders={fetchActiveOrders}
              handleDeleteOrder={handleDeleteOrder}
              handleDeleteItem={handleDeleteItem}
              handleConfirmPayment={handleConfirmPayment}
              handleCompleteOrder={handleCompleteOrder}
              handleUpdateOrderStatus={handleUpdateOrderStatus}
              setCart={setCart}
              setCustomerName={setCustomerName}
              setTableNumber={setTableNumber}
              setCurrentOrderId={setCurrentOrderId}
              setPaymentMethod={setPaymentMethod}
              setShowPaymentModal={setShowPaymentModal}
              setEditingItem={setEditingItem}
              setShowEditItemModal={setShowEditItemModal}
              t={t}
            />
          )}

          {activeTab === 'kitchen' && (
            <KitchenTab 
              activeOrders={activeOrders}
              handleUpdateOrderStatus={handleUpdateOrderStatus}
              handleReprint={handleReprint}
            />
          )}

          {activeTab === 'menu' && (
            <MenuTab 
              menus={menus}
              menuPage={menuPage}
              setMenuPage={setMenuPage}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
              setEditingMenuId={setEditingMenuId}
              setNewMenu={setNewMenu}
              setShowMenuModal={setShowMenuModal}
              handleEditMenu={handleEditMenu}
              handleDeleteMenu={handleDeleteMenu}
              handleAddToCart={handleAddToCart}
              t={t}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTab 
              transactions={transactions}
              txSearch={txSearch}
              setTxSearch={setTxSearch}
              txFilter={txFilter}
              setTxFilter={setTxFilter}
              txPage={txPage}
              setTxPage={setTxPage}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
              appSettings={appSettings}
              setShowTxModal={setShowTxModal}
              handleReprint={handleReprint}
              setConfirmDialog={setConfirmDialog}
              fetchData={fetchData}
              toast={toast}
            />
          )}

          {activeTab === 'users' && user.role === 'admin' && (
            <UsersTab 
              usersSubTab={usersSubTab}
              setUsersSubTab={setUsersSubTab}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              userFilter={userFilter}
              setUserFilter={setUserFilter}
              userSort={userSort}
              setUserSort={setUserSort}
              filteredUsers={filteredUsers}
              setEditingUserId={setEditingUserId}
              setNewUserData={setNewUserData}
              setShowUserModal={setShowUserModal}
              handleDeleteUser={handleDeleteUser}
              driverSearch={driverSearch}
              setDriverSearch={setDriverSearch}
              driverFilter={driverFilter}
              setDriverFilter={setDriverFilter}
              driverSort={driverSort}
              setDriverSort={setDriverSort}
              filteredDrivers={filteredDrivers}
              setNewDriverData={setNewDriverData}
              setShowDriverModal={setShowDriverModal}
              handleUpdateDriverStatus={handleUpdateDriverStatus}
              fetchData={fetchData}
              setSelectedDriverForMap={setSelectedDriverForMap}
              setShowDriverMapModal={setShowDriverMapModal}
              setConfirmDialog={setConfirmDialog}
              t={t}
            />
          )}

          {activeTab === 'loyalty' && (
            <LoyaltyTab 
              customers={customers}
              setEditingCustomerId={setEditingCustomerId}
              setNewCustomer={setNewCustomer}
              setShowCustomerModal={setShowCustomerModal}
              handleDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeTab === 'settings' && user.role === 'admin' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <p className="text-coffee-400 font-sans font-light uppercase tracking-[0.2em] text-[10px] mb-2">Kustomisasi Aplikasi</p>
                  <h2 className="text-4xl font-serif italic text-coffee-950 tracking-tight">
                    Pengaturan <span className="text-coffee-400">Sistem</span>
                  </h2>
                </div>
                <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-coffee-100 shadow-sm overflow-x-auto no-scrollbar max-w-full">
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
                    { id: 'mobile', label: 'Mobile App', icon: Smartphone },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsSubTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-sans font-light uppercase tracking-widest transition-all whitespace-nowrap",
                        settingsSubTab === tab.id 
                          ? "bg-coffee-950 text-white shadow-lg premium-shadow" 
                          : "text-coffee-400 hover:text-coffee-600"
                      )}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </header>

              <div className="space-y-8">
                {settingsSubTab === 'theme' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-coffee-950">Tema Aplikasi</h3>
                      <p className="text-coffee-500 text-sm">Pilih skema warna utama untuk aplikasi Anda. (Aktif: {appSettings.theme_name})</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(THEMES).map(([name, colors]) => (
                        <button
                          key={name}
                          onClick={() => handleUpdateSettings({ theme_name: name })}
                          className={cn(
                            "glass-card p-6 text-left transition-all relative overflow-hidden group",
                            appSettings.theme_name === name ? "ring-2 ring-coffee-600 shadow-lg" : "hover:shadow-md"
                          )}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-coffee-950 capitalize">{name}</h4>
                            {appSettings.theme_name === name && (
                              <div className="bg-coffee-600 text-white p-1 rounded-full">
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                            {[400, 500, 600, 700, 800, 900].map(level => (
                              <div 
                                key={level} 
                                className="flex-1" 
                                style={{ backgroundColor: (colors as any)[level] }} 
                              />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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

                    {/* Database Management */}
                    <div className="glass-card p-8 border-rose-100 bg-rose-50/30 lg:col-span-2">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-rose-100 p-3 rounded-2xl text-rose-600">
                          <Trash2 size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-rose-950">
                          {appSettings.language === 'id' ? 'Manajemen Database' : 'Database Management'}
                        </h3>
                      </div>
                      <p className="text-sm text-rose-600 mb-8 font-medium">
                        {appSettings.language === 'id' 
                          ? 'Gunakan fitur ini untuk mereset database atau memuat data demo untuk uji coba.' 
                          : 'Use these features to reset the database or load demo data for testing.'}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <button 
                          onClick={handleResetTransactions}
                          className="bg-amber-600 text-white py-4 rounded-2xl font-bold hover:bg-amber-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-200"
                        >
                          <History size={20} />
                          {appSettings.language === 'id' ? 'Reset Transaksi Saja' : 'Reset Transactions Only'}
                        </button>
                        <button 
                          onClick={handleResetDatabase}
                          className="bg-rose-600 text-white py-4 rounded-2xl font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-rose-200"
                        >
                          <Trash2 size={20} />
                          {appSettings.language === 'id' ? 'Reset Database (Hapus Semua)' : 'Reset Database (Clear All)'}
                        </button>
                        <button 
                          onClick={handleLoadDemoData}
                          className="bg-coffee-900 text-white py-4 rounded-2xl font-bold hover:bg-coffee-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-coffee-200"
                        >
                          <Database size={20} />
                          {appSettings.language === 'id' ? 'Muat Data Demo' : 'Load Demo Data'}
                        </button>
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

                {settingsSubTab === 'mobile' && (
                  <div className="max-w-4xl mx-auto space-y-8">
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="bg-coffee-900 p-4 rounded-3xl text-white shadow-xl shadow-coffee-200">
                          <Smartphone size={32} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-serif font-bold text-coffee-950">Install Aplikasi Mobile</h3>
                          <p className="text-coffee-500 font-medium">Gunakan MOPI langsung dari handphone Anda seperti aplikasi native.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="bg-coffee-50 p-6 rounded-3xl border border-coffee-100">
                            <h4 className="flex items-center gap-2 font-bold text-coffee-900 mb-4">
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs shadow-sm">1</div>
                              Buka di Browser HP
                            </h4>
                            <p className="text-sm text-coffee-600 leading-relaxed">
                              Buka URL aplikasi ini di browser handphone Anda (Safari di iOS atau Chrome di Android).
                            </p>
                            <div className="mt-4 p-3 bg-white rounded-xl border border-coffee-100 flex items-center justify-between">
                              <code className="text-[10px] font-mono text-coffee-500 truncate mr-2">{window.location.origin}</code>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(window.location.origin);
                                  toast.success('URL disalin!');
                                }}
                                className="p-2 hover:bg-coffee-50 rounded-lg text-coffee-900 transition-colors"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="bg-coffee-50 p-6 rounded-3xl border border-coffee-100">
                            <h4 className="flex items-center gap-2 font-bold text-coffee-900 mb-4">
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs shadow-sm">2</div>
                              Tambahkan ke Home Screen
                            </h4>
                            <div className="space-y-4">
                              <div className="flex gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                                  <Globe size={16} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-coffee-900">iOS (Safari)</p>
                                  <p className="text-[11px] text-coffee-500">Tap ikon <span className="font-bold">Share</span> (kotak dengan panah atas), lalu pilih <span className="font-bold">"Add to Home Screen"</span>.</p>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                                  <Smartphone size={16} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-coffee-900">Android (Chrome)</p>
                                  <p className="text-[11px] text-coffee-500">Tap ikon <span className="font-bold">Tiga Titik</span> di pojok kanan atas, lalu pilih <span className="font-bold">"Install App"</span> atau <span className="font-bold">"Add to Home Screen"</span>.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-coffee-950 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-center items-center text-center">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-coffee-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />
                          
                          <div className="relative z-10 space-y-6">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto border border-white/20 shadow-2xl">
                              <QrCode size={40} className="text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-serif font-bold mb-2">Scan QR Code</h4>
                              <p className="text-sm text-coffee-200/80">Scan kode ini dengan kamera HP Anda untuk membuka aplikasi secara instan.</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl">
                              {/* Placeholder for QR Code - in real app use a QR generator library */}
                              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                <QrCode size={64} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="glass-card p-6 text-center space-y-3">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                          <Zap size={24} />
                        </div>
                        <h5 className="font-bold text-coffee-900">Lebih Cepat</h5>
                        <p className="text-xs text-coffee-500">Akses instan dari home screen tanpa perlu mengetik URL.</p>
                      </div>
                      <div className="glass-card p-6 text-center space-y-3">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                          <Maximize size={24} />
                        </div>
                        <h5 className="font-bold text-coffee-900">Layar Penuh</h5>
                        <p className="text-xs text-coffee-500">Tampilan bersih tanpa bar navigasi browser yang mengganggu.</p>
                      </div>
                      <div className="glass-card p-6 text-center space-y-3">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                          <Bell size={24} />
                        </div>
                        <h5 className="font-bold text-coffee-900">Notifikasi</h5>
                        <p className="text-xs text-coffee-500">Mendukung push notification untuk update pesanan (Segera hadir).</p>
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

                    {/* Customer Menu Theme */}
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="bg-coffee-100 p-3 rounded-2xl text-coffee-900">
                          <Coffee size={24} />
                        </div>
                        <h3 className="text-xl font-serif font-bold">Tema Menu Pelanggan</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Background Menu Pelanggan (Gambar)</label>
                          <div className="flex flex-col gap-4">
                            {appSettings.customer_bg_image && (
                              <div className="relative w-full h-32 bg-coffee-50 rounded-2xl border border-coffee-100 flex items-center justify-center overflow-hidden group">
                                <img src={appSettings.customer_bg_image} alt="Customer BG Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <button 
                                  onClick={() => handleUpdateSettings({ customer_bg_image: '' })}
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
                                  if (url) handleUpdateSettings({ customer_bg_image: url });
                                }
                              }}
                              className="block w-full text-sm text-coffee-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-coffee-100 file:text-coffee-700 hover:file:bg-coffee-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Warna Background Menu (Fallback)</label>
                          <div className="flex gap-3">
                            <input 
                              type="color" 
                              value={appSettings.customer_bg_color}
                              onChange={e => setAppSettings({...appSettings, customer_bg_color: e.target.value})}
                              className="w-12 h-12 rounded-lg cursor-pointer border-none"
                            />
                            <input 
                              type="text" 
                              value={appSettings.customer_bg_color}
                              onChange={e => setAppSettings({...appSettings, customer_bg_color: e.target.value})}
                              className="flex-1 bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={() => handleUpdateSettings({ 
                            customer_bg_color: appSettings.customer_bg_color,
                            customer_bg_image: appSettings.customer_bg_image
                          })}
                          className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                        >
                          Simpan Tema Menu Pelanggan
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
                            <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">{t('loading_animation')}</label>
                            <div className="flex flex-col gap-4">
                              {appSettings.payment_loading_gif_url && (
                                <img src={appSettings.payment_loading_gif_url} alt="Loading GIF Preview" className="h-48 object-contain border border-coffee-100 rounded-lg" referrerPolicy="no-referrer" />
                              )}
                              <input 
                                type="file" 
                                accept="image/gif"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await handleFileUpload(file);
                                    if (url) handleUpdateSettings({ payment_loading_gif_url: url }, true);
                                  }
                                }}
                                className="block w-full text-sm text-coffee-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-coffee-100 file:text-coffee-700 hover:file:bg-coffee-200"
                              />
                              <p className="text-[10px] text-coffee-400 italic">{t('loading_animation_desc')}</p>
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

                    <div className="glass-card p-8 border-l-4 border-l-coffee-900">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-coffee-100 text-coffee-900 rounded-2xl flex items-center justify-center">
                            <Truck size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-serif font-bold">{t('enable_delivery_feature')}</h3>
                            <p className="text-sm text-coffee-500">{t('delivery_feature_desc')}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setAppSettings(prev => ({ ...prev, enable_delivery: !prev.enable_delivery }))}
                          className={cn(
                            "w-14 h-7 rounded-full transition-all relative",
                            appSettings.enable_delivery ? "bg-coffee-900" : "bg-coffee-200"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm",
                            appSettings.enable_delivery ? "left-8" : "left-1"
                          )} />
                        </button>
                      </div>

                      {appSettings.enable_delivery && (
                        <div className="space-y-6 pt-6 border-t border-coffee-50">
                          <div className="bg-coffee-50/50 p-6 rounded-3xl border border-coffee-100 mb-6">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-10 h-10 bg-white text-coffee-600 rounded-xl flex items-center justify-center shadow-sm">
                                <MapPin size={20} />
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-coffee-950">Lokasi Toko (Merchant)</h4>
                                <p className="text-xs text-coffee-500">Titik jemput untuk driver di peta monitoring</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-black text-coffee-400 uppercase tracking-widest mb-1.5">Latitude</label>
                                <input 
                                  type="text" 
                                  value={appSettings.merchant_lat || ''}
                                  onChange={(e) => setAppSettings(prev => ({ ...prev, merchant_lat: e.target.value }))}
                                  className="w-full bg-white border border-coffee-100 rounded-xl px-4 py-3 text-sm font-mono text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                  placeholder="-6.200000"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-coffee-400 uppercase tracking-widest mb-1.5">Longitude</label>
                                <input 
                                  type="text" 
                                  value={appSettings.merchant_lng || ''}
                                  onChange={(e) => setAppSettings(prev => ({ ...prev, merchant_lng: e.target.value }))}
                                  className="w-full bg-white border border-coffee-100 rounded-xl px-4 py-3 text-sm font-mono text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                  placeholder="106.816666"
                                />
                              </div>
                            </div>
                            <p className="text-[10px] text-coffee-400 italic mt-3">Dapatkan koordinat dari Google Maps (klik kanan pada lokasi &gt; salin koordinat).</p>
                          </div>
                        </div>
                      )}
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

      {/* Driver Registration Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[85vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-coffee-950">Pendaftaran Driver</h3>
              <button onClick={() => setShowDriverModal(false)} className="text-coffee-400 hover:text-coffee-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleRegisterDriver} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Nama Lengkap</label>
                  <input 
                    required
                    type="text" 
                    value={newDriverData.full_name}
                    onChange={e => setNewDriverData({...newDriverData, full_name: e.target.value})}
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Nomor WhatsApp</label>
                  <input 
                    required
                    type="tel" 
                    value={newDriverData.phone}
                    onChange={e => setNewDriverData({...newDriverData, phone: e.target.value})}
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="0812xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Informasi Kendaraan</label>
                  <input 
                    required
                    type="text" 
                    value={newDriverData.vehicle_info}
                    onChange={e => setNewDriverData({...newDriverData, vehicle_info: e.target.value})}
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Contoh: Honda Vario (B 1234 ABC)"
                  />
                </div>
                <div className="border-t border-coffee-50 pt-4 mt-2">
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Username Akun</label>
                  <input 
                    required
                    type="text" 
                    value={newDriverData.username}
                    onChange={e => setNewDriverData({...newDriverData, username: e.target.value})}
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="username_driver"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Password</label>
                  <input 
                    required
                    type="password" 
                    value={newDriverData.password}
                    onChange={e => setNewDriverData({...newDriverData, password: e.target.value})}
                    className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="********"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowDriverModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-coffee-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all"
                >
                  Daftar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-coffee-950/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-0 w-full max-w-md shadow-2xl overflow-y-auto max-h-[85vh]"
          >
            <div className="p-8 bg-coffee-50 border-b border-coffee-100 text-center">
              <div className="w-16 h-16 bg-coffee-100 text-coffee-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-coffee-950">Pilih Pembayaran</h3>
              <p className="text-coffee-500 text-sm">Silakan pilih metode pembayaran yang diinginkan</p>
            </div>

            <div className="p-8 bg-white space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-coffee-400 tracking-widest">{t('payment_method')}</label>
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

              {appSettings.enable_delivery && (
                <div className="space-y-3 pt-4 border-t border-coffee-50">
                  <label className="text-[10px] font-bold uppercase text-coffee-400 tracking-widest">{t('delivery_method')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['dine_in', 'takeaway', 'delivery'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setDeliveryMethod(method)}
                        className={cn(
                          "px-3 py-2 rounded-xl border-2 text-[10px] font-bold uppercase tracking-tight transition-all",
                          deliveryMethod === method 
                            ? "bg-coffee-900 border-coffee-900 text-white shadow-md" 
                            : "bg-white border-coffee-100 text-coffee-400 hover:border-coffee-200"
                        )}
                      >
                        {t(method)}
                      </button>
                    ))}
                  </div>
                  
                  {deliveryMethod === 'delivery' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 pt-2"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-coffee-400">{t('delivery_address')}</label>
                        <textarea 
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Jl. Merdeka No. 123..."
                          className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-coffee-500 min-h-[60px] resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-coffee-400">Nomor Telepon Pelanggan</label>
                        <input 
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="08123456789..."
                          className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-coffee-400">Latitude</label>
                          <input 
                            type="number"
                            step="any"
                            value={customerLat || ''}
                            onChange={(e) => setCustomerLat(e.target.value ? Number(e.target.value) : null)}
                            placeholder="-6.1234"
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-coffee-400">Longitude</label>
                          <input 
                            type="number"
                            step="any"
                            value={customerLng || ''}
                            onChange={(e) => setCustomerLng(e.target.value ? Number(e.target.value) : null)}
                            placeholder="106.1234"
                            className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition((pos) => {
                              setCustomerLat(pos.coords.latitude);
                              setCustomerLng(pos.coords.longitude);
                              toast.success('Lokasi berhasil diambil');
                            }, (err) => {
                              toast.error('Gagal mengambil lokasi: ' + err.message);
                            });
                          }
                        }}
                        className="w-full py-2 bg-coffee-100 text-coffee-700 rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-coffee-200 transition-colors"
                      >
                        <MapPin size={14} />
                        Gunakan Lokasi Saat Ini
                      </button>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-coffee-400">{t('delivery_fee')}</label>
                        <input 
                          type="number"
                          value={deliveryFee}
                          onChange={(e) => setDeliveryFee(Number(e.target.value))}
                          className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
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

      {showEditItemModal && editingItem && (
        <div className="fixed inset-0 bg-coffee-950/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-0 w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-8 bg-coffee-50 border-b border-coffee-100 text-center">
              <div className="w-16 h-16 bg-coffee-100 text-coffee-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-coffee-950">Edit Menu</h3>
              <p className="text-coffee-500 text-sm font-bold uppercase tracking-widest">{editingItem.name}</p>
            </div>

            <div className="p-8 bg-white space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Jumlah</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setEditingItem(prev => prev ? ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }) : null)}
                    className="w-12 h-12 rounded-xl bg-coffee-50 text-coffee-600 flex items-center justify-center hover:bg-coffee-100 transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="flex-1 text-center text-2xl font-black text-coffee-950">{editingItem.quantity}</span>
                  <button 
                    onClick={() => setEditingItem(prev => prev ? ({ ...prev, quantity: prev.quantity + 1 }) : null)}
                    className="w-12 h-12 rounded-xl bg-coffee-900 text-white flex items-center justify-center hover:bg-coffee-800 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Sugar Level</label>
                  <select 
                    value={editingItem.sugarLevel}
                    onChange={e => setEditingItem(prev => prev ? ({ ...prev, sugarLevel: e.target.value }) : null)}
                    className="w-full bg-coffee-50 border border-coffee-100 rounded-xl px-4 py-3 text-sm font-bold text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  >
                    {['No Sugar', 'Less Sugar', 'Normal', 'Extra Sugar'].map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Ice Level</label>
                  <select 
                    value={editingItem.iceLevel}
                    onChange={e => setEditingItem(prev => prev ? ({ ...prev, iceLevel: e.target.value }) : null)}
                    className="w-full bg-coffee-50 border border-coffee-100 rounded-xl px-4 py-3 text-sm font-bold text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  >
                    {['No Ice', 'Less Ice', 'Normal', 'Extra Ice'].map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-coffee-500 mb-2">Catatan</label>
                <textarea 
                  value={editingItem.notes}
                  onChange={e => setEditingItem(prev => prev ? ({ ...prev, notes: e.target.value }) : null)}
                  className="w-full bg-coffee-50 border border-coffee-100 rounded-xl px-4 py-3 text-sm font-medium text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 min-h-[80px]"
                  placeholder="Contoh: Tanpa sedotan, dll..."
                />
              </div>
            </div>

            <div className="p-6 bg-coffee-50 flex gap-3">
              <button 
                onClick={() => setShowEditItemModal(false)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-100 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleUpdateItem}
                className="flex-1 bg-coffee-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
              >
                Simpan Perubahan
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[85vh]"
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
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[85vh]"
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
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] p-6 sm:p-8 w-full max-w-md shadow-2xl border border-coffee-100 overflow-y-auto max-h-[85vh]"
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
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[85vh]"
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
                    <option value="Biji Kopi">Biji Kopi</option>
                    <option value="Susu">Susu</option>
                    <option value="Gula">Gula</option>
                    <option value="Kemasan">Kemasan</option>
                    <option value="Pelengkap">Pelengkap</option>
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
                  <div className="mt-4">
                    <label className="block text-xs font-bold uppercase text-coffee-500 mb-1">Tanggal Kedaluwarsa (Opsional)</label>
                    <input 
                      type="date" 
                      value={newInv.expiration_date}
                      onChange={e => setNewInv({...newInv, expiration_date: e.target.value})}
                      className="w-full bg-coffee-50 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    />
                  </div>
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
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[85vh]"
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
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[85vh]"
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
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[85vh]"
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
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] p-6 sm:p-10 w-full max-w-lg shadow-2xl border border-coffee-100 overflow-y-auto max-h-[85vh]"
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
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] p-6 sm:p-10 w-full max-w-lg shadow-2xl border border-coffee-100 overflow-y-auto max-h-[85vh]"
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
        <div className="fixed inset-0 bg-coffee-950/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 no-print">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-0 w-full max-w-sm shadow-2xl overflow-y-auto max-h-[85vh]"
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
                      <img src={appSettings.payment_qris_url} alt="QRIS" className="w-64 h-64 object-contain mx-auto" style={{ imageRendering: 'pixelated' }} referrerPolicy="no-referrer" />
                    )}
                    {paymentMethod === 'DANA' && appSettings.payment_dana_url && (
                      <img src={appSettings.payment_dana_url} alt="DANA" className="w-64 h-64 object-contain mx-auto" style={{ imageRendering: 'pixelated' }} referrerPolicy="no-referrer" />
                    )}
                    {paymentMethod === 'OVO' && appSettings.payment_ovo_url && (
                      <img src={appSettings.payment_ovo_url} alt="OVO" className="w-64 h-64 object-contain mx-auto" style={{ imageRendering: 'pixelated' }} referrerPolicy="no-referrer" />
                    )}
                    {paymentMethod === 'ShopeePay' && appSettings.payment_shopeepay_url && (
                      <img src={appSettings.payment_shopeepay_url} alt="ShopeePay" className="w-64 h-64 object-contain mx-auto" style={{ imageRendering: 'pixelated' }} referrerPolicy="no-referrer" />
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
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] p-6 sm:p-8 w-full max-w-md shadow-2xl border border-coffee-100 overflow-y-auto max-h-[85vh]"
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
        <div className="fixed inset-0 bg-coffee-950/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 no-print">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-0 w-full max-w-sm shadow-2xl overflow-y-auto max-h-[85vh]"
          >
            <div className="p-8 bg-coffee-50 border-b border-coffee-100 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-coffee-950">Pembayaran Berhasil</h3>
              <p className="text-coffee-500 text-sm">Transaksi telah dicatat ke sistem</p>
            </div>

            <div id="receipt-content" className="p-8 bg-white font-mono text-sm print:p-0 print-section thermal-receipt">
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
                        <p className="font-bold">{item.menu?.name || item.name}</p>
                        <p className="text-[10px] text-coffee-500">{item.quantity} x {formatIDR(item.menu?.price || item.price || 0)}</p>
                      </div>
                      <p className="font-bold">{formatIDR((item.menu?.price || item.price || 0) * item.quantity)}</p>
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
                {lastOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Diskon</span>
                    <span>-{formatIDR(lastOrder.discount)}</span>
                  </div>
                )}
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
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[85vh]"
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
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <p className="font-bold">{item.menu?.name || item.name}</p>
                      <p className="text-[10px]">{item.quantity} x {formatIDR(item.menu?.price || item.price || 0)}</p>
                    </div>
                    <p className="font-bold whitespace-nowrap">{formatIDR((item.menu?.price || item.price || 0) * item.quantity)}</p>
                  </div>
                  {(item.sugarLevel || item.iceLevel) && (
                    <div className="flex gap-2 text-[8px] italic">
                      {item.sugarLevel && <span>Sugar: {item.sugarLevel}</span>}
                      {item.iceLevel && <span>Ice: {item.iceLevel}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="border-t border-dashed border-black my-2" />
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatIDR(lastOrder.subtotal || lastOrder.total)}</span>
              </div>
              {lastOrder.discount > 0 && (
                <div className="flex justify-between">
                  <span>Diskon</span>
                  <span>-{formatIDR(lastOrder.discount)}</span>
                </div>
              )}
              {lastOrder.tax > 0 && (
                <div className="flex justify-between">
                  <span>Pajak</span>
                  <span>{formatIDR(lastOrder.tax)}</span>
                </div>
              )}
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

      {/* Driver Map Modal */}
      {showDriverMapModal && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative overflow-y-auto max-h-[85vh]"
          >
            <button 
              onClick={() => setShowDriverMapModal(false)}
              className="absolute top-6 right-6 p-2 text-coffee-400 hover:text-coffee-900 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-coffee-100 text-coffee-900 rounded-2xl flex items-center justify-center">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-coffee-950">Lokasi Real-time Driver</h3>
                <p className="text-sm text-coffee-500">Memantau posisi driver secara langsung</p>
              </div>
            </div>

            <DriverMap 
              drivers={drivers} 
              selectedDriverId={selectedDriverForMap || undefined} 
              merchantLocation={[Number(appSettings.merchant_lat || -6.2), Number(appSettings.merchant_lng || 106.816)]}
            />
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowDriverMapModal(false)}
                className="px-8 py-3 bg-coffee-900 text-white rounded-xl font-bold hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      {confirmDialog && confirmDialog.show && (
        <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[85vh]"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${confirmDialog.isDestructive ? 'bg-rose-100' : 'bg-amber-100'}`}>
              <AlertTriangle className={`w-8 h-8 ${confirmDialog.isDestructive ? 'text-rose-600' : 'text-amber-600'}`} />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-2">{confirmDialog.title}</h3>
            <p className="text-coffee-600 mb-8 leading-relaxed">
              {confirmDialog.message}
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-coffee-600 hover:bg-coffee-50 transition-colors"
              >
                {confirmDialog.cancelText || (appSettings.language === 'id' ? 'Batal' : 'Cancel')}
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className={`flex-1 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${confirmDialog.isDestructive ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-coffee-900 hover:bg-coffee-800 shadow-coffee-200'}`}
              >
                {confirmDialog.confirmText || (appSettings.language === 'id' ? 'Ya, Lanjutkan' : 'Yes, Continue')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
