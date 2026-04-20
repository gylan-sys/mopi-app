import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Plus, 
  ArrowDownLeft, 
  Package, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  ArrowUpRight, 
  ShoppingCart, 
  Clock, 
  AlertCircle, 
  Star, 
  Utensils, 
  Zap, 
  History, 
  ArrowRight,
  CheckCircle2,
  Coffee,
  Search,
  Bell,
  Wallet,
  ArrowDownRight,
  Flame
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { formatIDR, formatDate, CHART_COLORS } from '../utils';
import { cn } from '../types';
import type { DashboardStats, Transaction, UserAccount, InventoryItem } from '../types';

interface DashboardTabProps {
  user: UserAccount;
  stats: DashboardStats | null;
  dashboardExtra: {
    dailySummary: any;
    financialTrend: any[];
    topItems: any[];
  };
  transactions: Transaction[];
  inventory: InventoryItem[];
  activeOrders: any[];
  appSettings: any;
  setActiveTab: (tab: any) => void;
  setNewTx: (tx: any) => void;
  setShowTxModal: (show: boolean) => void;
  setShowInvModal: (show: boolean) => void;
  setConfirmUpdate: (update: any) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  user,
  stats,
  dashboardExtra,
  transactions,
  inventory,
  activeOrders,
  appSettings,
  setActiveTab,
  setNewTx,
  setShowTxModal,
  setShowInvModal,
  setConfirmUpdate
}) => {
  const [chartRange, setChartRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

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

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className="space-y-6 pb-32 min-h-screen"
    >
      {/* Desktop Header */}
      <motion.header 
        variants={{
          hidden: { opacity: 0, x: -20 },
          show: { opacity: 1, x: 0 }
        }}
        className="hidden lg:flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-coffee-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-coffee-500">Ringkasan bisnis hari ini</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-coffee-100 shadow-sm">
          <Calendar size={18} className="text-coffee-400" />
          <span className="text-sm font-semibold text-coffee-900">{formatDate(new Date(), 'EEEE, d MMMM yyyy', appSettings.timezone)}</span>
        </div>
      </motion.header>

      {/* KPI Stats (Horizontal Scroll on Mobile) */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.05 } }
        }}
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6"
      >
        {[
          { label: 'Revenue', value: formatIDR(stats?.totalIncome || 0), icon: TrendingUp, color: 'emerald', trend: '+12%' },
          { label: 'Expenses', value: formatIDR(stats?.totalExpense || 0), icon: ArrowDownRight, color: 'rose', trend: '-5%' },
          { label: 'Items Sold', value: stats?.dailySalesCount || 0, icon: ShoppingCart, color: 'amber', trend: '+8%' },
          { label: 'Monthly Sold', value: stats?.monthlySalesCount || 0, icon: Calendar, color: 'indigo', trend: '+15%' },
          { label: 'Active Queue', value: activeOrders.length, icon: Clock, color: 'violet', trend: '0' },
          { label: 'Low Stock', value: stats?.lowStock.length || 0, icon: AlertCircle, color: 'slate', trend: '!' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx} 
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              show: { opacity: 1, scale: 1 }
            }}
            className="min-w-[130px] sm:min-w-[160px] lg:min-w-0 flex-1 bg-white p-3.5 sm:p-5 rounded-[24px] border border-coffee-100 shadow-[0_4px_20px_-4px_rgba(36,27,20,0.04)] hover:shadow-[0_15px_35px_-8px_rgba(36,27,20,0.08)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-[14px] sm:rounded-2xl",
                `bg-${stat.color}-50 text-${stat.color}-600`
              )}>
                <stat.icon size={16} sm:size={20} />
              </div>
              <span className={cn(
                "text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg",
                stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : 
                stat.trend.startsWith('-') ? "bg-rose-50 text-rose-600" : "bg-coffee-50 text-coffee-400"
              )}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-coffee-400 mb-0.5 sm:mb-1">{stat.label}</p>
              <p className="text-sm sm:text-lg font-black text-coffee-950 truncate">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions (2-Column Grid on Mobile) */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
        }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        <motion.button 
          variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
          onClick={() => setActiveTab('orders')}
          className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-white border border-coffee-100 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(36,27,20,0.04)] hover:shadow-xl transition-all text-center group button-press"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-accent-500 text-white rounded-[20px] shadow-lg shadow-accent-500/20 group-hover:scale-110 transition-transform">
            <Plus size={20} sm:size={28} />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-black text-coffee-950">Buat Order</p>
            <p className="text-[8px] sm:text-[9px] text-coffee-400 uppercase font-black tracking-widest">POS System</p>
          </div>
        </motion.button>
        <motion.button 
          variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
          onClick={() => {
            setNewTx({ type: 'expense', category: 'Operational', amount: 0, description: '' });
            setShowTxModal(true);
          }}
          className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-white border border-coffee-100 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(36,27,20,0.04)] hover:shadow-xl transition-all text-center group button-press"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-rose-500 text-white rounded-[20px] shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
            <ArrowDownLeft size={20} sm:size={28} />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-black text-coffee-950">Catat Biaya</p>
            <p className="text-[8px] sm:text-[9px] text-coffee-400 uppercase font-black tracking-widest">Expense</p>
          </div>
        </motion.button>
        <motion.button 
          variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
          onClick={() => setShowInvModal(true)}
          className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-white border border-coffee-100 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(36,27,20,0.04)] hover:shadow-xl transition-all text-center group button-press"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-amber-500 text-white rounded-[20px] shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
            <Package size={20} sm:size={28} />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-black text-coffee-950">Update Stok</p>
            <p className="text-[8px] sm:text-[9px] text-coffee-400 uppercase font-black tracking-widest">Inventory</p>
          </div>
        </motion.button>
        <motion.button 
          variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
          onClick={() => setActiveTab('reports')}
          className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-white border border-coffee-100 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(36,27,20,0.04)] hover:shadow-xl transition-all text-center group button-press"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-coffee-600 text-white rounded-[20px] shadow-lg shadow-coffee-600/20 group-hover:scale-110 transition-transform">
            <BarChart3 size={20} sm:size={28} />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-black text-coffee-950">Laporan</p>
            <p className="text-[8px] sm:text-[9px] text-coffee-400 uppercase font-black tracking-widest">Analytics</p>
          </div>
        </motion.button>
      </motion.div>

      {/* Alert Box (Floating Card) */}
      <div className="bg-coffee-50/50 border border-coffee-100 p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-accent-500 shadow-sm">
            <Zap size={20} sm:size={24} />
          </div>
          <div>
            <h4 className="font-black text-sm sm:text-base text-coffee-950">Tingkatkan Penjualan!</h4>
            <p className="text-[10px] sm:text-xs text-coffee-500">Buat promo khusus untuk pelanggan setia hari ini.</p>
          </div>
        </div>
        <button className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-coffee-950 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm active:scale-95 transition-all shadow-lg shadow-coffee-900/20">
          Buat Promo
        </button>
      </div>

      {/* Main Visual Data Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-[24px] border border-coffee-100 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-lg font-black text-coffee-950">Performa Keuangan</h3>
              <p className="text-[10px] font-black text-coffee-400 uppercase tracking-widest">Revenue vs Expense</p>
            </div>
            <div className="flex bg-coffee-50 p-1 rounded-xl">
              {['daily', 'weekly', 'monthly'].map((range) => (
                <button
                  key={range}
                  onClick={() => setChartRange(range as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                    chartRange === range ? "bg-white text-coffee-950 shadow-sm" : "text-coffee-400 hover:text-coffee-600"
                  )}
                >
                  {range === 'daily' ? 'Harian' : range === 'weekly' ? 'Mingguan' : 'Bulanan'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardExtra.financialTrend}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9c7c5d', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(val) => formatDate(val, 'dd MMM')}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9c7c5d', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(val) => `Rp${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                  formatter={(value: number) => [formatIDR(value), '']}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products (Horizontal Scroll on Mobile) */}
        <div className="bg-white p-6 rounded-[24px] border border-coffee-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-coffee-950">Produk Terlaris</h3>
            <div className="flex items-center gap-1 text-accent-500">
              <Flame size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Trending</span>
            </div>
          </div>
          
          <div className="flex lg:flex-col gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0">
            {dashboardExtra.topItems.length === 0 ? (
              <div className="text-center py-12 text-coffee-300 w-full">
                <p className="text-sm italic">Belum ada data penjualan.</p>
              </div>
            ) : (
              dashboardExtra.topItems.map((item, idx) => (
                <div key={idx} className="min-w-[200px] lg:min-w-0 bg-coffee-50/50 p-4 rounded-[20px] border border-coffee-100/50 flex flex-col lg:flex-row items-center gap-4 relative overflow-hidden group">
                  <div className="absolute top-2 right-2 bg-accent-500 text-white text-[8px] font-black px-2 py-1 rounded-full z-10 shadow-lg">
                    BEST SELLER
                  </div>
                  <div className="w-full lg:w-16 h-24 lg:h-16 rounded-2xl bg-white overflow-hidden shadow-sm">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-coffee-200">
                        <Coffee size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <p className="text-sm font-black text-coffee-950 truncate">{item.name}</p>
                    <p className="text-[10px] font-bold text-coffee-400 uppercase tracking-widest">{item.quantity} Terjual</p>
                    <div className="h-1 w-full bg-coffee-100 rounded-full mt-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.quantity / Math.max(...dashboardExtra.topItems.map(i => i.quantity))) * 100}%` }}
                        className="h-full bg-accent-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Secondary Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-0">
        {/* Sales by Category */}
        <div className="bg-white p-6 rounded-2xl border border-coffee-100 shadow-sm">
          <h3 className="text-lg font-bold text-coffee-900 mb-6">Kategori</h3>
          <div className="h-[250px] w-full">
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
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 600, color: '#9c7c5d' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-coffee-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-coffee-900">Stok Menipis</h3>
            <button onClick={() => setActiveTab('inventory')} className="text-[10px] font-bold text-coffee-400 uppercase hover:text-coffee-900">Lihat Semua</button>
          </div>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
            {stats?.lowStock.length === 0 ? (
              <div className="text-center py-12 text-coffee-300">
                <p className="text-sm italic">Stok aman.</p>
              </div>
            ) : (
              stats?.lowStock.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 bg-coffee-50 rounded-xl border border-coffee-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white text-coffee-900 flex items-center justify-center font-bold text-xs shadow-sm">
                      {item.quantity}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-coffee-900">{item.name}</p>
                      <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">Min: {item.min_stock} {item.unit}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setConfirmUpdate({ id: item.id, name: item.name, currentQty: item.quantity, delta: 10 })}
                    className="bg-coffee-700 text-white p-2 rounded-lg hover:bg-coffee-800 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-coffee-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-coffee-900">Transaksi Terakhir</h3>
            <button onClick={() => setActiveTab('transactions')} className="text-[10px] font-bold text-coffee-400 uppercase hover:text-coffee-900">History</button>
          </div>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
            {stats?.recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-coffee-50 rounded-xl border border-coffee-100">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm",
                    tx.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-coffee-900 truncate max-w-[100px]">{tx.description}</p>
                    <p className="text-[9px] text-coffee-400 font-bold uppercase">{formatDate(tx.date, 'HH:mm • dd MMM')}</p>
                  </div>
                </div>
                <p className={cn(
                  "text-xs font-bold",
                  tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                )}>
                  {tx.type === 'income' ? '+' : '-'} {formatIDR(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Orders Summary */}
      {activeOrders.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-coffee-100 shadow-sm px-4 md:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-violet-50 p-2 rounded-xl text-violet-600">
                <Clock size={20} />
              </div>
              <h3 className="text-lg font-bold text-coffee-900">Antrian Aktif</h3>
            </div>
            <button 
              onClick={() => setActiveTab('queue')}
              className="text-[10px] font-bold text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-2 bg-violet-50 px-4 py-2 rounded-full uppercase tracking-wider"
            >
              Kelola Antrian <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {activeOrders.slice(0, 5).map((order) => (
              <div 
                key={order.orderId}
                className="p-4 bg-coffee-50 border border-coffee-100 rounded-xl hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setActiveTab('queue')}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-bold text-coffee-400 uppercase tracking-wider">#{order.displayId || order.orderId.slice(-4)}</span>
                  <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                    order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                    'bg-violet-100 text-violet-600'
                  }`}>
                    {order.status === 'processing' ? 'Proses' : order.status === 'pending' ? 'Menunggu' : 'Konfirmasi'}
                  </span>
                </div>
                <p className="text-xs font-bold text-coffee-900 truncate group-hover:text-violet-600 transition-colors">{order.customerName || 'Pelanggan'}</p>
                <p className="text-[9px] text-coffee-400 mt-1 uppercase font-bold">{formatDate(order.date, 'HH:mm', appSettings.timezone)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardTab;
