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
  Coffee
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 min-h-screen"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 md:p-0">
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
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-0">
        <button 
          onClick={() => setActiveTab('orders')}
          className="flex flex-col gap-4 p-5 sm:p-6 bg-white border border-coffee-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group active:scale-95"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-accent-500 text-white rounded-xl shadow-sm">
            <Plus size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-coffee-900">Buat Order</p>
            <p className="text-[9px] sm:text-[10px] text-coffee-400 uppercase font-bold tracking-wider">POS System</p>
          </div>
        </button>
        <button 
          onClick={() => {
            setNewTx({ type: 'expense', category: 'Operational', amount: 0, description: '' });
            setShowTxModal(true);
          }}
          className="flex flex-col gap-4 p-5 sm:p-6 bg-white border border-coffee-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group active:scale-95"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-rose-500 text-white rounded-xl shadow-sm">
            <ArrowDownLeft size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-coffee-900">Catat Biaya</p>
            <p className="text-[9px] sm:text-[10px] text-coffee-400 uppercase font-bold tracking-wider">Expense</p>
          </div>
        </button>
        <button 
          onClick={() => setShowInvModal(true)}
          className="flex flex-col gap-4 p-5 sm:p-6 bg-white border border-coffee-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group active:scale-95"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-amber-500 text-white rounded-xl shadow-sm">
            <Package size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-coffee-900">Update Stok</p>
            <p className="text-[9px] sm:text-[10px] text-coffee-400 uppercase font-bold tracking-wider">Inventory</p>
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className="flex flex-col gap-4 p-5 sm:p-6 bg-white border border-coffee-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group active:scale-95"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-coffee-600 text-white rounded-xl shadow-sm">
            <BarChart3 size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-coffee-900">Laporan</p>
            <p className="text-[9px] sm:text-[10px] text-coffee-400 uppercase font-bold tracking-wider">Analytics</p>
          </div>
        </button>
      </div>

      {/* Insights Section */}
      {user.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-0">
          {getDailyInsights(dashboardExtra.dailySummary).map((insight, idx) => (
            <div 
              key={idx}
              className={cn(
                "p-4 rounded-2xl border flex gap-4 items-center shadow-sm",
                insight.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-900" :
                insight.type === 'warning' ? "bg-amber-50 border-amber-100 text-amber-900" :
                "bg-coffee-50 border-coffee-100 text-coffee-900"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                insight.type === 'success' ? "bg-emerald-500 text-white" :
                insight.type === 'warning' ? "bg-amber-500 text-white" :
                "bg-coffee-600 text-white"
              )}>
                {insight.type === 'success' ? <TrendingUp size={20} /> : 
                 insight.type === 'warning' ? <AlertTriangle size={20} /> : 
                 <Lightbulb size={20} />}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider">{insight.title}</p>
                <p className="text-xs opacity-80">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 px-4 md:px-0">
        {[
          { label: 'Revenue', value: formatIDR(stats?.totalIncome || 0), icon: TrendingUp, color: 'emerald' },
          { label: 'Expenses', value: formatIDR(stats?.totalExpense || 0), icon: ArrowDownLeft, color: 'rose' },
          { label: 'Items Sold', value: stats?.dailySalesCount || 0, icon: ShoppingCart, color: 'amber' },
          { label: 'Monthly Sold', value: stats?.monthlySalesCount || 0, icon: Calendar, color: 'indigo' },
          { label: 'Active Queue', value: activeOrders.length, icon: Clock, color: 'violet' },
          { label: 'Low Stock', value: stats?.lowStock.length || 0, icon: AlertCircle, color: 'slate' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-coffee-100 shadow-sm">
            <div className={cn(
              "w-10 h-10 flex items-center justify-center rounded-xl mb-4",
              `bg-${stat.color}-50 text-${stat.color}-600`
            )}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-coffee-400 mb-1">{stat.label}</p>
            <p className="text-lg font-bold text-coffee-900 truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Visual Data Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-4 md:px-0">
        {/* Revenue Trend Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-coffee-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-coffee-900">Performa Keuangan</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-coffee-400 uppercase">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-coffee-400 uppercase">Expense</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardExtra.financialTrend}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9c7c5d', fontSize: 10 }}
                  tickFormatter={(val) => formatDate(val, 'dd MMM')}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9c7c5d', fontSize: 10 }}
                  tickFormatter={(val) => `Rp${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  formatter={(value: number) => [formatIDR(value), '']}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-2xl border border-coffee-100 shadow-sm">
          <h3 className="text-lg font-bold text-coffee-900 mb-6">Produk Terlaris</h3>
          <div className="space-y-6">
            {dashboardExtra.topItems.length === 0 ? (
              <div className="text-center py-12 text-coffee-300">
                <p className="text-sm italic">Belum ada data penjualan.</p>
              </div>
            ) : (
              dashboardExtra.topItems.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-coffee-900">{item.name}</p>
                    <p className="text-xs font-bold text-coffee-500">{item.quantity} terjual</p>
                  </div>
                  <div className="h-1.5 w-full bg-coffee-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.quantity / Math.max(...dashboardExtra.topItems.map(i => i.quantity))) * 100}%` }}
                      className="h-full bg-coffee-600 rounded-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-8 p-6 bg-coffee-700 rounded-2xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">Total Order Hari Ini</p>
              <p className="text-4xl font-bold">{dashboardExtra.dailySummary?.totalOrders || 0}</p>
              <p className="text-[10px] mt-2 opacity-60 uppercase tracking-widest">Transaksi Berhasil</p>
            </div>
            <Coffee className="absolute -right-4 -bottom-4 opacity-10" size={100} />
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
