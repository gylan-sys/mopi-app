import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, User, Calendar, ArrowUpRight, ArrowDownLeft, 
  MessageSquare, Printer, Trash2, Filter, CheckCircle2,
  AlertCircle, DollarSign, Search
} from 'lucide-react';
import { formatIDR, formatDate } from '../utils';
import { cn } from '../types';

interface TransactionsTabProps {
  transactions: any[];
  txSearch: string;
  setTxSearch: (search: string) => void;
  txFilter: { type: string; category: string };
  setTxFilter: (filter: { type: string; category: string }) => void;
  txPage: number;
  setTxPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
  appSettings: any;
  setShowTxModal: (show: boolean) => void;
  handleReprint: (orderId: string) => void;
  setConfirmDialog: (dialog: any) => void;
  fetchData: () => void;
  toast: any;
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  txSearch,
  setTxSearch,
  txFilter,
  setTxFilter,
  txPage,
  setTxPage,
  ITEMS_PER_PAGE,
  appSettings,
  setShowTxModal,
  handleReprint,
  setConfirmDialog,
  fetchData,
  toast
}) => {
  const [consignmentOnly, setConsignmentOnly] = useState(false);

  const handleSettleConsignment = async (txId: number) => {
    try {
      const res = await fetch(`/api/transactions/${txId}/settle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        toast.success('Pembayaran konsinyasi berhasil dicatat');
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal mencatat pembayaran');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi');
    }
  };

  return (
    <motion.div 
      key="transactions"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-20"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-coffee-400 font-sans font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-2">Catatan Keuangan</p>
          <h2 className="text-3xl sm:text-4xl font-serif text-coffee-950 tracking-tight">
            Pemasukan & <span className="text-coffee-400">Pengeluaran</span>
          </h2>
        </div>
        <button 
          onClick={() => setShowTxModal(true)}
          className="w-full md:w-auto bg-coffee-950 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-coffee-900 transition-all shadow-xl shadow-coffee-950/20 premium-shadow group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          <span className="font-sans font-bold text-xs uppercase tracking-widest">Catat Transaksi</span>
        </button>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col gap-6 bg-white p-8 rounded-[2.5rem] border border-coffee-100 shadow-sm">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex-1 min-w-[280px] relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-coffee-300 group-focus-within:text-coffee-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Cari ID Order, Nama Customer, atau Deskripsi..."
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              className="w-full bg-coffee-50/50 border border-coffee-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-sans font-semibold text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 focus:border-coffee-500 transition-all placeholder:text-coffee-200"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-coffee-50/50 p-1.5 rounded-2xl border border-coffee-100">
            <button 
              onClick={() => setConsignmentOnly(false)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-sans font-bold uppercase tracking-widest transition-all",
                !consignmentOnly ? "bg-coffee-950 text-white shadow-lg premium-shadow" : "text-coffee-400 hover:text-coffee-600"
              )}
            >
              Semua
            </button>
            <button 
              onClick={() => setConsignmentOnly(true)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-sans font-bold uppercase tracking-widest transition-all",
                consignmentOnly ? "bg-coffee-950 text-white shadow-lg premium-shadow" : "text-coffee-400 hover:text-coffee-600"
              )}
            >
              Konsinyasi
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-8 items-center pt-6 border-t border-coffee-50">
          <div className="flex items-center gap-3">
            <Filter size={14} className="text-coffee-300" />
            <span className="text-[10px] sm:text-xs font-sans font-bold uppercase text-coffee-300 tracking-widest">Tipe:</span>
            <select 
              value={txFilter.type}
              onChange={e => setTxFilter({...txFilter, type: e.target.value})}
              className="bg-transparent border-none text-[10px] sm:text-xs font-sans font-bold text-coffee-950 focus:outline-none focus:ring-0 cursor-pointer uppercase tracking-widest"
            >
              <option value="">Semua Tipe</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] sm:text-xs font-sans font-bold uppercase text-coffee-300 tracking-widest">Kategori:</span>
            <select 
              value={txFilter.category}
              onChange={e => setTxFilter({...txFilter, category: e.target.value})}
              className="bg-transparent border-none text-[10px] sm:text-xs font-sans font-bold text-coffee-950 focus:outline-none focus:ring-0 cursor-pointer uppercase tracking-widest"
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
            onClick={() => {
              setTxFilter({ type: '', category: '' });
              setConsignmentOnly(false);
              setTxSearch('');
            }}
            className="text-[10px] font-sans font-bold text-coffee-300 hover:text-rose-500 transition-colors ml-auto uppercase tracking-widest"
          >
            Reset Filter
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-coffee-100 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-coffee-50/50 border-b border-coffee-100">
                <th className="px-8 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-coffee-400">Waktu & ID</th>
                <th className="px-8 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-coffee-400">Tipe</th>
                <th className="px-8 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-coffee-400">Kategori</th>
                <th className="px-8 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-coffee-400">Deskripsi</th>
                <th className="px-8 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-coffee-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-coffee-400 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-50">
              {(() => {
                const filtered = transactions.filter(tx => {
                  if (txFilter.type && tx.type !== txFilter.type) return false;
                  if (txFilter.category && tx.category !== txFilter.category) return false;
                  if (consignmentOnly && !tx.description.toLowerCase().includes('consignment')) return false;
                  
                  if (!txSearch) return true;
                  const search = txSearch.toLowerCase();
                  return (
                    (tx.order_id && tx.order_id.toLowerCase().includes(search)) ||
                    (tx.customer_name && tx.customer_name.toLowerCase().includes(search)) ||
                    (tx.description && tx.description.toLowerCase().includes(search))
                  );
                });
                const visible = filtered.slice(0, txPage * ITEMS_PER_PAGE);
                
                if (visible.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-coffee-300">
                          <DollarSign size={48} className="mb-4 opacity-20" />
                          <p className="text-sm font-medium italic">Tidak ada transaksi yang ditemukan.</p>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <>
                    {visible.map(tx => {
                      const isConsignment = tx.description.toLowerCase().includes('consignment');
                      return (
                        <tr key={tx.id} className="hover:bg-coffee-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 text-xs font-bold text-coffee-950">
                                <Calendar size={12} className="text-coffee-400" />
                                {formatDate(tx.date, 'dd/MM/yy HH:mm', appSettings.timezone)}
                              </div>
                              <span className="text-[10px] font-mono font-bold text-coffee-400 mt-1">{tx.order_id || 'TX-'+tx.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center shadow-sm",
                              tx.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                            )}>
                              {tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-black text-coffee-900 uppercase tracking-wider">{tx.category}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-[200px]">
                              <p className="text-xs text-coffee-600 font-medium line-clamp-1">{tx.description || '-'}</p>
                              {tx.notes && (
                                <p className="text-[10px] text-coffee-400 mt-1 flex items-center gap-1 italic">
                                  <MessageSquare size={10} />
                                  {tx.notes}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isConsignment ? (
                              <div className="flex items-center gap-2">
                                {tx.is_consignment_paid ? (
                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-lg flex items-center gap-1">
                                    <CheckCircle2 size={10} /> LUNAS
                                  </span>
                                ) : (
                                  <button 
                                    onClick={() => handleSettleConsignment(tx.id)}
                                    className="px-2 py-1 bg-amber-100 text-amber-600 text-[10px] font-black rounded-lg flex items-center gap-1 hover:bg-amber-200 transition-all"
                                  >
                                    <AlertCircle size={10} /> BAYAR
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-coffee-300">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <span className={cn(
                                "text-sm font-black",
                                tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                              )}>
                                {tx.type === 'income' ? '+' : '-'} {formatIDR(tx.amount)}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {tx.order_id && (
                                  <button 
                                    onClick={() => handleReprint(tx.order_id)}
                                    className="p-1.5 text-coffee-400 hover:text-coffee-600 hover:bg-coffee-100 rounded-lg transition-all"
                                  >
                                    <Printer size={14} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => {
                                    setConfirmDialog({
                                      show: true,
                                      title: 'Hapus Transaksi',
                                      message: 'Apakah Anda yakin ingin menghapus catatan transaksi ini?',
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
                                  className="p-1.5 text-coffee-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length > visible.length && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <button 
                            onClick={() => setTxPage(prev => prev + 1)}
                            className="bg-coffee-50 text-coffee-600 px-8 py-3 rounded-2xl font-bold hover:bg-coffee-100 transition-all border border-coffee-100"
                          >
                            Muat Lebih Banyak
                          </button>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionsTab;

