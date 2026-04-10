import React from 'react';
import { motion } from 'motion/react';
import { 
  Download, Calendar, FileDown, TrendingUp, TrendingDown, 
  Printer, Trash2, Lightbulb, Info, AlertCircle, RefreshCw, 
  CreditCard, AlertTriangle, ArrowUpRight, BarChart3, 
  PieChart as PieChartIcon 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { formatIDR, formatDate, CHART_COLORS } from '../utils';
import { cn } from '../types';
import { toast } from 'react-hot-toast';

interface ReportsTabProps {
  reportSubTab: 'transactions' | 'daily-summary' | 'financial' | 'consignment';
  setReportSubTab: (tab: 'transactions' | 'daily-summary' | 'financial' | 'consignment') => void;
  user: any;
  handleExportAllReports: () => void;
  reportFilter: 'daily' | 'monthly';
  setReportFilter: (filter: 'daily' | 'monthly') => void;
  reportDate: string;
  setReportDate: (date: string) => void;
  transactions: any[];
  appSettings: any;
  exportToCSV: (data: any[], filename: string) => void;
  getTransactionInsights: (transactions: any[], filter: string, date: string) => any[];
  fetchDailySummary: () => void;
  dailySummary: any;
  getDailyInsights: (summary: any) => any[];
  financialRange: { startDate: string; endDate: string };
  setFinancialRange: (range: any) => void;
  fetchFinancialData: () => void;
  financialData: any;
  getFinancialInsights: (data: any) => any[];
  consignmentData: any[];
  fetchConsignmentData: () => void;
  handleReprint: (orderId: string) => void;
  setConfirmDialog: (dialog: any) => void;
  fetchData: () => void;
  t: (key: string) => string;
}

const ReportsTab: React.FC<ReportsTabProps> = ({
  reportSubTab,
  setReportSubTab,
  user,
  handleExportAllReports,
  reportFilter,
  setReportFilter,
  reportDate,
  setReportDate,
  transactions,
  appSettings,
  exportToCSV,
  getTransactionInsights,
  fetchDailySummary,
  dailySummary,
  getDailyInsights,
  financialRange,
  setFinancialRange,
  fetchFinancialData,
  financialData,
  getFinancialInsights,
  consignmentData,
  fetchConsignmentData,
  handleReprint,
  setConfirmDialog,
  fetchData,
  t
}) => {
  return (
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
        <button 
          onClick={() => setReportSubTab('daily-summary')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            reportSubTab === 'daily-summary' ? "bg-coffee-900 text-white shadow-lg" : "text-coffee-500 hover:bg-coffee-50"
          )}
        >
          Ringkasan Harian
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
                      ? formatDate(tx.date, 'yyyy-MM-dd', appSettings.timezone) === reportDate
                      : formatDate(tx.date, 'yyyy-MM', appSettings.timezone) === formatDate(reportDate, 'yyyy-MM', appSettings.timezone)
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
                      ? formatDate(tx.date, 'yyyy-MM-dd', appSettings.timezone) === reportDate
                      : formatDate(tx.date, 'yyyy-MM', appSettings.timezone) === formatDate(reportDate, 'yyyy-MM', appSettings.timezone)
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
                      ? formatDate(tx.date, 'yyyy-MM-dd', appSettings.timezone) === reportDate
                      : formatDate(tx.date, 'yyyy-MM', appSettings.timezone) === formatDate(reportDate, 'yyyy-MM', appSettings.timezone)
                  ));
                  const counts: any = {};
                  sales.forEach((s: any) => counts[s.payment_method || 'Cash'] = (counts[s.payment_method || 'Cash'] || 0) + 1);
                  const top = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0];
                  return top ? `${top[0]} (${top[1]})` : '-';
                })()}
              </p>
            </div>
          </div>

          {/* Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="glass-card p-8">
              <h3 className="text-lg font-serif font-bold mb-6 text-coffee-900">Tren Pendapatan vs Pengeluaran</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(() => {
                      const filtered = transactions.filter(tx => (
                        reportFilter === 'daily' 
                          ? formatDate(tx.date, 'yyyy-MM-dd', appSettings.timezone) === reportDate
                          : formatDate(tx.date, 'yyyy-MM', appSettings.timezone) === formatDate(reportDate, 'yyyy-MM', appSettings.timezone)
                      ));
                      
                      if (reportFilter === 'daily') {
                        // Hourly trend for daily
                        const hours = Array.from({ length: 24 }, (_, i) => ({
                          name: `${String(i).padStart(2, '0')}:00`,
                          income: 0,
                          expense: 0
                        }));
                        filtered.forEach(tx => {
                          const hour = new Date(tx.date).getHours();
                          if (tx.type === 'income') hours[hour].income += tx.amount;
                          else hours[hour].expense += tx.amount;
                        });
                        return hours.filter(h => h.income > 0 || h.expense > 0);
                      } else {
                        // Daily trend for monthly
                        const daysInMonth = new Date(new Date(reportDate).getFullYear(), new Date(reportDate).getMonth() + 1, 0).getDate();
                        const days = Array.from({ length: daysInMonth }, (_, i) => ({
                          name: String(i + 1),
                          income: 0,
                          expense: 0
                        }));
                        filtered.forEach(tx => {
                          const day = new Date(tx.date).getDate();
                          if (tx.type === 'income') days[day - 1].income += tx.amount;
                          else days[day - 1].expense += tx.amount;
                        });
                        return days;
                      }
                    })()}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickFormatter={(value) => `Rp ${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [formatIDR(value), '']}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Bar dataKey="income" name="Pendapatan" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="expense" name="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-8">
              <h3 className="text-lg font-serif font-bold mb-6 text-coffee-900">Komposisi Penjualan</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(() => {
                        const sales = transactions.filter(tx => tx.type === 'income' && tx.category === 'Sales' && (
                          reportFilter === 'daily' 
                            ? formatDate(tx.date, 'yyyy-MM-dd', appSettings.timezone) === reportDate
                            : formatDate(tx.date, 'yyyy-MM', appSettings.timezone) === formatDate(reportDate, 'yyyy-MM', appSettings.timezone)
                        ));
                        const categories: any = {};
                        sales.forEach(s => {
                          // Extract menu name from description if possible
                          const name = s.description?.replace('Order: ', '').split(' (x')[0] || 'Lainnya';
                          categories[name] = (categories[name] || 0) + s.amount;
                        });
                        return Object.entries(categories)
                          .map(([name, value]) => ({ name, value }))
                          .sort((a: any, b: any) => b.value - a.value)
                          .slice(0, 5);
                      })()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        '#8B4513', // SaddleBrown
                        '#A0522D', // Sienna
                        '#D2691E', // Chocolate
                        '#CD853F', // Peru
                        '#F4A460'  // SandyBrown
                      ].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [formatIDR(value), '']}
                    />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-serif font-bold mb-6">Detail Penjualan ({reportFilter === 'daily' ? formatDate(reportDate, 'dd MMM yyyy', appSettings.timezone) : formatDate(reportDate, 'MMMM yyyy', appSettings.timezone)})</h3>
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
                          ? formatDate(tx.date, 'yyyy-MM-dd', appSettings.timezone) === reportDate
                          : formatDate(tx.date, 'yyyy-MM', appSettings.timezone) === formatDate(reportDate, 'yyyy-MM', appSettings.timezone)
                      ))
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-coffee-50/50 transition-colors">
                          <td className="py-4 text-sm text-coffee-600">
                            {formatDate(tx.date, 'HH:mm', appSettings.timezone)}
                            <span className="text-[10px] block text-coffee-400">{formatDate(tx.date, 'dd MMM yyyy', appSettings.timezone)}</span>
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
                          <div className="flex items-center justify-end gap-2 group">
                            {formatIDR(tx.amount)}
                            {tx.order_id && (
                              <button 
                                onClick={() => handleReprint(tx.order_id)}
                                className="p-2 text-coffee-400 hover:text-coffee-600 hover:bg-coffee-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Cetak Ulang Struk"
                              >
                                <Printer size={14} />
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setConfirmDialog({
                                  show: true,
                                  title: 'Hapus Transaksi',
                                  message: 'Apakah Anda yakin ingin menghapus catatan transaksi ini? Stok bahan akan dikembalikan jika ini adalah pesanan.',
                                  confirmText: 'Hapus',
                                  cancelText: 'Batal',
                                  isDestructive: true,
                                  onConfirm: async () => {
                                    try {
                                      const res = await fetch(`/api/transactions/${tx.id}`, {
                                        method: 'DELETE',
                                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                      });
                                      if (res.ok) {
                                        toast.success('Transaksi berhasil dihapus');
                                        fetchData();
                                      } else {
                                        const data = await res.json();
                                        toast.error(data.error || 'Gagal menghapus transaksi');
                                      }
                                    } catch (error) {
                                      toast.error('Terjadi kesalahan saat menghapus transaksi');
                                    }
                                    setConfirmDialog(null);
                                  }
                                });
                              }}
                              className="p-2 text-coffee-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Hapus Transaksi"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction Insights */}
          <div className="glass-card p-8 bg-gradient-to-br from-coffee-50/50 to-white border-coffee-100">
            <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
              <Lightbulb size={20} className="text-amber-500" />
              Saran & Insight Transaksi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getTransactionInsights(transactions, reportFilter, reportDate).map((insight: any, idx: number) => (
                <div key={idx} className={cn(
                  "p-4 rounded-2xl border flex gap-4",
                  insight.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-900" :
                  insight.type === 'info' ? "bg-blue-50 border-blue-100 text-blue-900" :
                  "bg-amber-50 border-amber-100 text-amber-900"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    insight.type === 'success' ? "bg-emerald-100 text-emerald-600" :
                    insight.type === 'info' ? "bg-blue-100 text-blue-600" :
                    "bg-amber-100 text-amber-600"
                  )}>
                    {insight.type === 'success' ? <TrendingUp size={20} /> :
                     insight.type === 'info' ? <Info size={20} /> :
                     <AlertCircle size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-1">{insight.title}</p>
                    <p className="text-xs opacity-80 leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              ))}
              {getTransactionInsights(transactions, reportFilter, reportDate).length === 0 && (
                <p className="col-span-full text-center text-coffee-400 italic py-4">Belum ada insight tambahan untuk periode ini.</p>
              )}
            </div>
          </div>
        </div>
      ) : reportSubTab === 'daily-summary' ? (
        <div className="space-y-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-coffee-500 font-medium uppercase tracking-widest text-xs mb-1">Ringkasan Penjualan</p>
              <h2 className="text-4xl font-serif font-bold text-coffee-950">Ringkasan Hari Ini</h2>
            </div>
            <button 
              onClick={fetchDailySummary}
              className="p-3 bg-coffee-900 text-white rounded-2xl hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200 active:scale-95"
            >
              <RefreshCw size={18} />
            </button>
          </header>

          {dailySummary && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 bg-emerald-50 border-emerald-100">
                  <p className="text-emerald-700 text-xs font-bold uppercase tracking-widest mb-2">Total Pendapatan</p>
                  <p className="text-3xl font-bold text-emerald-600">{formatIDR(dailySummary.totalRevenue)}</p>
                </div>
                <div className="glass-card p-6 bg-blue-50 border-blue-100">
                  <p className="text-blue-700 text-xs font-bold uppercase tracking-widest mb-2">Total Pesanan</p>
                  <p className="text-3xl font-bold text-blue-600">{dailySummary.totalOrders} <span className="text-sm font-medium">Order</span></p>
                </div>
                <div className="glass-card p-6 bg-amber-50 border-amber-100">
                  <p className="text-amber-700 text-xs font-bold uppercase tracking-widest mb-2">Item Terjual</p>
                  <p className="text-3xl font-bold text-amber-600">{dailySummary.totalItems} <span className="text-sm font-medium">Pcs</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8">
                  <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-coffee-600" />
                    Menu Terlaris
                  </h3>
                  <div className="space-y-4">
                    {dailySummary.topItems.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-coffee-50/50 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-coffee-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-coffee-950">{item.name}</p>
                            <p className="text-xs text-coffee-500">{item.quantity} terjual</p>
                          </div>
                        </div>
                        <p className="font-bold text-coffee-900">{formatIDR(item.revenue)}</p>
                      </div>
                    ))}
                    {dailySummary.topItems.length === 0 && (
                      <p className="text-center text-coffee-400 italic py-8">Belum ada data penjualan hari ini</p>
                    )}
                  </div>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                    <CreditCard size={20} className="text-coffee-600" />
                    Metode Pembayaran
                  </h3>
                  <div className="space-y-4">
                    {dailySummary.salesByPayment.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-coffee-50/50 rounded-2xl">
                        <p className="font-bold text-coffee-950">{item.payment_method}</p>
                        <p className="font-bold text-coffee-900">{formatIDR(item.total)}</p>
                      </div>
                    ))}
                    {dailySummary.salesByPayment.length === 0 && (
                      <p className="text-center text-coffee-400 italic py-8">Belum ada data pembayaran hari ini</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Insights Section */}
              <div className="glass-card p-8 bg-gradient-to-br from-coffee-50 to-white border-coffee-100">
                <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                  <Lightbulb size={20} className="text-amber-500" />
                  Saran & Insight Bisnis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getDailyInsights(dailySummary).map((insight: any, idx: number) => (
                    <div key={idx} className={cn(
                      "p-4 rounded-2xl border flex gap-4",
                      insight.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-900" :
                      insight.type === 'warning' ? "bg-amber-50 border-amber-100 text-amber-900" :
                      insight.type === 'info' ? "bg-blue-50 border-blue-100 text-blue-900" :
                      "bg-rose-50 border-rose-100 text-rose-900"
                    )}>
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        insight.type === 'success' ? "bg-emerald-100 text-emerald-600" :
                        insight.type === 'warning' ? "bg-amber-100 text-amber-600" :
                        insight.type === 'info' ? "bg-blue-100 text-blue-600" :
                        "bg-rose-100 text-rose-600"
                      )}>
                        {insight.type === 'success' ? <TrendingUp size={20} /> :
                         insight.type === 'warning' ? <AlertCircle size={20} /> :
                         insight.type === 'info' ? <Info size={20} /> :
                         <AlertTriangle size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-1">{insight.title}</p>
                        <p className="text-xs opacity-80 leading-relaxed">{insight.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
                  onChange={(e) => setFinancialRange((prev: any) => ({ ...prev, startDate: e.target.value }))}
                  className="bg-transparent border-none text-xs font-bold text-coffee-900 focus:outline-none w-24"
                />
                <span className="text-coffee-300 text-[10px] font-bold">s/d</span>
                <input 
                  type="date" 
                  value={financialRange.endDate}
                  onChange={(e) => setFinancialRange((prev: any) => ({ ...prev, endDate: e.target.value }))}
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

              {/* Financial Insights */}
              <div className="glass-card p-8 bg-gradient-to-br from-blue-50/30 to-white border-blue-100 mt-8">
                <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                  <Lightbulb size={20} className="text-amber-500" />
                  Analisis & Rekomendasi Keuangan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getFinancialInsights(financialData).map((insight: any, idx: number) => (
                    <div key={idx} className={cn(
                      "p-5 rounded-2xl border flex gap-5 transition-all hover:shadow-md",
                      insight.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-900" :
                      insight.type === 'warning' ? "bg-amber-50 border-amber-100 text-amber-900" :
                      insight.type === 'info' ? "bg-blue-50 border-blue-100 text-blue-900" :
                      "bg-rose-50 border-rose-100 text-rose-900"
                    )}>
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                        insight.type === 'success' ? "bg-white text-emerald-600" :
                        insight.type === 'warning' ? "bg-white text-amber-600" :
                        insight.type === 'info' ? "bg-white text-blue-600" :
                        "bg-white text-rose-600"
                      )}>
                        {insight.type === 'success' ? <TrendingUp size={24} /> :
                         insight.type === 'warning' ? <AlertCircle size={24} /> :
                         insight.type === 'info' ? <Info size={24} /> :
                         <AlertTriangle size={24} />}
                      </div>
                      <div>
                        <p className="font-bold text-base mb-1.5">{insight.title}</p>
                        <p className="text-sm opacity-80 leading-relaxed">{insight.message}</p>
                      </div>
                    </div>
                  ))}
                  {getFinancialInsights(financialData).length === 0 && (
                    <div className="col-span-full p-8 text-center bg-coffee-50/30 rounded-3xl border border-dashed border-coffee-200">
                      <p className="text-coffee-500 italic">Belum ada insight tambahan untuk periode ini. Terus pantau performa keuangan Anda.</p>
                    </div>
                  )}
                </div>
              </div>
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
                    sedangkan <strong>{t('profit_share')}</strong> adalah keuntungan yang diperoleh kedai dari penjualan tersebut.
                  </p>
                </div>
              </div>
            </div>
          )}
    </motion.div>
  );
};

export default ReportsTab;
