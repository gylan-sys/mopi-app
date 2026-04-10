import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, User, Calendar, ArrowUpRight, ArrowDownLeft, 
  MessageSquare, Printer, Trash2 
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
  return (
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
              {(() => {
                const filtered = transactions.filter(tx => {
                  // Filter by txFilter (type and category)
                  if (txFilter.type && tx.type !== txFilter.type) return false;
                  if (txFilter.category && tx.category !== txFilter.category) return false;
                  
                  if (!txSearch) return true;
                  const search = txSearch.toLowerCase();
                  return (
                    (tx.order_id && tx.order_id.toLowerCase().includes(search)) ||
                    (tx.customer_name && tx.customer_name.toLowerCase().includes(search)) ||
                    (tx.description && tx.description.toLowerCase().includes(search))
                  );
                });
                const visible = filtered.slice(0, txPage * ITEMS_PER_PAGE);
                return (
                  <>
                    {visible.map(tx => (
                      <tr key={tx.id} className="hover:bg-coffee-50/50 transition-colors">
                        <td className="py-4 text-sm text-coffee-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {formatDate(tx.date, 'dd/MM/yy HH:mm', appSettings.timezone)}
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
                        <td className="py-4 text-sm text-coffee-600">
                          <div className="italic">{tx.description || '-'}</div>
                          {tx.notes && (
                            <div className="text-[10px] text-coffee-400 mt-1 flex items-center gap-1">
                              <MessageSquare size={10} />
                              {tx.notes}
                            </div>
                          )}
                        </td>
                        <td className={cn(
                          "py-4 text-sm font-bold text-right",
                          tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                        )}>
                          <div className="flex items-center justify-end gap-3 group">
                            <span>{tx.type === 'income' ? '+' : '-'} {formatIDR(tx.amount)}</span>
                            {tx.order_id && (
                              <button 
                                onClick={() => handleReprint(tx.order_id)}
                                className="p-1.5 text-coffee-400 hover:text-coffee-600 hover:bg-coffee-100 rounded-lg transition-all shadow-sm bg-white border border-coffee-100"
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
                              className="p-1.5 text-coffee-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Hapus Transaksi"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length > visible.length && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center">
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
