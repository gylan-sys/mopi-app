import React from 'react';
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
  CheckCircle2
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
import type { DashboardStats, Transaction, UserAccount } from '../types';

interface DashboardTabProps {
  user: UserAccount;
  stats: DashboardStats | null;
  dashboardExtra: {
    dailySummary: any;
    financialTrend: any[];
    topItems: any[];
  };
  transactions: Transaction[];
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
  activeOrders,
  appSettings,
  setActiveTab,
  setNewTx,
  setShowTxModal,
  setShowInvModal,
  setConfirmUpdate
}) => {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-20"
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
          <span className="text-xs font-bold text-coffee-900 pr-4">{formatDate(new Date(), 'EEEE, d MMMM yyyy', appSettings.timezone)}</span>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <button 
          onClick={() => setActiveTab('orders')}
          className="flex items-center gap-3 p-4 bg-white border border-coffee-100 rounded-3xl shadow-sm hover:shadow-md hover:border-coffee-200 transition-all text-left group"
        >
          <div className="p-2 bg-coffee-100 text-coffee-600 rounded-xl group-hover:bg-coffee-600 group-hover:text-white transition-colors">
            <Plus size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-coffee-950 uppercase tracking-wider">Order Baru</p>
            <p className="text-[10px] text-coffee-400">Buka Kasir POS</p>
          </div>
        </button>
        <button 
          onClick={() => {
            setNewTx({ type: 'expense', category: 'Operational', amount: 0, description: '' });
            setShowTxModal(true);
          }}
          className="flex items-center gap-3 p-4 bg-white border border-coffee-100 rounded-3xl shadow-sm hover:shadow-md hover:border-coffee-200 transition-all text-left group"
        >
          <div className="p-2 bg-rose-100 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <ArrowDownLeft size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-coffee-950 uppercase tracking-wider">Catat Biaya</p>
            <p className="text-[10px] text-coffee-400">Input Pengeluaran</p>
          </div>
        </button>
        <button 
          onClick={() => setShowInvModal(true)}
          className="flex items-center gap-3 p-4 bg-white border border-coffee-100 rounded-3xl shadow-sm hover:shadow-md hover:border-coffee-200 transition-all text-left group"
        >
          <div className="p-2 bg-amber-100 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Package size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-coffee-950 uppercase tracking-wider">Tambah Stok</p>
            <p className="text-[10px] text-coffee-400">Update Inventori</p>
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className="flex items-center gap-3 p-4 bg-white border border-coffee-100 rounded-3xl shadow-sm hover:shadow-md hover:border-coffee-200 transition-all text-left group"
        >
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-coffee-950 uppercase tracking-wider">Laporan</p>
            <p className="text-[10px] text-coffee-400">Analisis Detail</p>
          </div>
        </button>
      </div>

      {/* Insights Section */}
      {user.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getDailyInsights(dashboardExtra.dailySummary).map((insight, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "p-4 rounded-3xl border flex gap-4 items-start",
                insight.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-900" :
                insight.type === 'warning' ? "bg-amber-50 border-amber-100 text-amber-900" :
                "bg-blue-50 border-blue-100 text-blue-900"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl",
                insight.type === 'success' ? "bg-emerald-200 text-emerald-700" :
                insight.type === 'warning' ? "bg-amber-200 text-amber-700" :
                "bg-blue-200 text-blue-700"
              )}>
                {insight.type === 'success' ? <TrendingUp size={18} /> : 
                 insight.type === 'warning' ? <AlertTriangle size={18} /> : 
                 <Lightbulb size={18} />}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-1">{insight.title}</p>
                <p className="text-xs opacity-80 leading-relaxed">{insight.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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

      {/* Main Visual Data Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Revenue Trend Chart */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="xl:col-span-2 glass-card p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-serif font-bold text-coffee-950">Tren Pendapatan</h3>
              <p className="text-xs text-coffee-500 font-medium">Performa harian dalam 30 hari terakhir</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-coffee-400 uppercase">Pemasukan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-coffee-400 uppercase">Pengeluaran</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardExtra.financialTrend}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                  tickFormatter={(val) => formatDate(val, 'dd MMM')}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                  tickFormatter={(val) => `Rp${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    padding: '12px 20px'
                  }}
                  formatter={(value: number) => [formatIDR(value), '']}
                  labelFormatter={(label) => formatDate(label, 'EEEE, d MMMM yyyy')}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Selling Products */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif font-bold flex items-center gap-2">
              <Star className="text-amber-500" fill="currentColor" /> Produk Terlaris
            </h3>
            <span className="text-[10px] font-black text-coffee-400 uppercase tracking-widest">Hari Ini</span>
          </div>
          <div className="space-y-6">
            {dashboardExtra.topItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-coffee-300">
                <Utensils size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium italic">Belum ada data penjualan.</p>
              </div>
            ) : (
              dashboardExtra.topItems.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm font-black text-coffee-950">{item.name}</p>
                      <p className="text-[10px] text-coffee-400 font-bold uppercase">{item.quantity} Terjual</p>
                    </div>
                    <p className="text-xs font-black text-emerald-600">{formatIDR(item.revenue)}</p>
                  </div>
                  <div className="h-2 w-full bg-coffee-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.quantity / Math.max(...dashboardExtra.topItems.map(i => i.quantity))) * 100}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-coffee-600 to-coffee-900 rounded-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-12 p-6 bg-coffee-950 rounded-[32px] text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <Zap size={100} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Total Pesanan</p>
            <p className="text-3xl font-black">{dashboardExtra.dailySummary?.totalOrders || 0}</p>
            <p className="text-[10px] opacity-60 mt-2">Pesanan berhasil diproses hari ini</p>
          </div>
        </motion.div>
      </div>

      {/* Secondary Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales by Category */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-serif font-bold text-coffee-950">Kategori Terpopuler</h3>
              <p className="text-xs text-coffee-500 font-medium">Distribusi penjualan menu</p>
            </div>
          </div>
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

        {/* Low Stock Alerts */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif font-bold flex items-center gap-2">
              <AlertCircle className="text-amber-500" /> Stok Menipis
            </h3>
            <button onClick={() => setActiveTab('inventory')} className="text-coffee-500 text-[10px] font-black uppercase tracking-widest hover:text-coffee-950 transition-colors">Lihat Semua</button>
          </div>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {stats?.lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-coffee-300">
                <CheckCircle2 size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium italic">Stok aman.</p>
              </div>
            ) : (
              stats?.lowStock.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-xs">
                      {item.quantity}
                    </div>
                    <div>
                      <p className="text-xs font-black text-coffee-950">{item.name}</p>
                      <p className="text-[8px] text-amber-600 font-black uppercase tracking-wider">Min: {item.min_stock} {item.unit}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setConfirmUpdate({ id: item.id, name: item.name, currentQty: item.quantity, delta: 10 })}
                    className="bg-white text-amber-600 p-2 rounded-xl shadow-sm border border-amber-100 hover:bg-amber-500 hover:text-white transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif font-bold flex items-center gap-2">
              <History className="text-coffee-600" /> Transaksi Terakhir
            </h3>
            <button onClick={() => setActiveTab('transactions')} className="text-coffee-500 text-[10px] font-black uppercase tracking-widest hover:text-coffee-950 transition-colors">Semua</button>
          </div>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {stats?.recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-coffee-50/30 rounded-2xl border border-coffee-100/30">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    tx.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                  )}>
                    {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-coffee-950 truncate max-w-[120px]">{tx.description}</p>
                    <p className="text-[8px] text-coffee-400 font-bold uppercase">{formatDate(tx.date, 'HH:mm • dd MMM')}</p>
                  </div>
                </div>
                <p className={cn(
                  "text-xs font-black",
                  tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                )}>
                  {tx.type === 'income' ? '+' : '-'} {formatIDR(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Active Orders Summary */}
      {activeOrders.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-violet-100 p-2 rounded-xl text-violet-600">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-coffee-950">Antrian Pesanan Aktif</h3>
                <p className="text-xs text-coffee-500 font-medium">Menampilkan {Math.min(activeOrders.length, 5)} pesanan terbaru dari total {activeOrders.length}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('queue')}
              className="text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full"
            >
              Lihat Semua <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {activeOrders.slice(0, 5).map((order) => (
              <div 
                key={order.orderId}
                className="p-3 bg-white border border-coffee-50 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setActiveTab('queue')}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-coffee-400 uppercase tracking-wider">#{order.displayId || order.orderId.slice(-4)}</span>
                  <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                    order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                    'bg-violet-100 text-violet-600'
                  }`}>
                    {order.status === 'processing' ? 'Proses' : order.status === 'pending' ? 'Menunggu' : 'Konfirmasi'}
                  </span>
                </div>
                <p className="text-sm font-bold text-coffee-950 truncate group-hover:text-violet-600 transition-colors">{order.customerName || 'Pelanggan'}</p>
                <p className="text-[10px] text-coffee-400 mt-1">{formatDate(order.date, 'HH:mm', appSettings.timezone)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardTab;
