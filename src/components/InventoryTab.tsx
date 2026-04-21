import React from 'react';
import { motion } from 'motion/react';
import { Plus, Package, Edit, Trash2, Calendar } from 'lucide-react';
import { formatIDR, formatDate } from '../utils';
import { cn } from '../types';
import type { InventoryItem } from '../types';

interface InventoryTabProps {
  inventory: InventoryItem[];
  invCategoryFilter: 'Semua' | 'Bahan' | 'Barang';
  setInvCategoryFilter: (filter: 'Semua' | 'Bahan' | 'Barang') => void;
  invPage: number;
  setInvPage: (page: number | ((prev: number) => number)) => void;
  ITEMS_PER_PAGE: number;
  setEditingInvId: (id: number | null) => void;
  setNewInv: (inv: any) => void;
  setCalcPurchase: (calc: any) => void;
  setShowCalculator: (show: boolean) => void;
  setShowInvModal: (show: boolean) => void;
  handleEditInventory: (item: InventoryItem) => void;
  handleDeleteInventory: (id: number) => void;
  setConfirmUpdate: (update: any) => void;
  setPurchaseData: (data: any) => void;
  setShowPurchaseModal: (show: boolean) => void;
  t: (key: string) => string;
}

const InventoryTab: React.FC<InventoryTabProps> = ({
  inventory,
  invCategoryFilter,
  setInvCategoryFilter,
  invPage,
  setInvPage,
  ITEMS_PER_PAGE,
  setEditingInvId,
  setNewInv,
  setCalcPurchase,
  setShowCalculator,
  setShowInvModal,
  handleEditInventory,
  handleDeleteInventory,
  setConfirmUpdate,
  setPurchaseData,
  setShowPurchaseModal,
  t
}) => {
  const filtered = inventory.filter(item => invCategoryFilter === 'Semua' || item.type === invCategoryFilter || item.category === invCategoryFilter);
  const visible = filtered.slice(0, invPage * ITEMS_PER_PAGE);

  return (
    <motion.div 
      key="inventory"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-32 md:pb-8"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 safe-top">
        <div>
          <p className="text-coffee-400 font-sans font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-2">Manajemen Barang</p>
          <h2 className="text-3xl sm:text-4xl font-serif text-coffee-950 tracking-tight">
            Inventory <span className="text-coffee-400 font-serif">{invCategoryFilter === 'Semua' ? 'Stok' : (invCategoryFilter === 'Bahan' ? t('raw_material') : (invCategoryFilter === 'Barang' ? t('goods') : invCategoryFilter))}</span>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex flex-wrap bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-coffee-100 shadow-sm no-print w-full sm:w-auto">
            {(['Semua', 'Bahan', 'Barang'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setInvCategoryFilter(type)}
                className={cn(
                  "flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-sans font-bold uppercase tracking-widest transition-all",
                  invCategoryFilter === type ? "bg-accent-500 text-white shadow-lg premium-shadow" : "text-coffee-400 hover:text-coffee-600"
                )}
              >
                {type === 'Semua' ? 'Semua' : (type === 'Bahan' ? t('raw_material') : t('goods'))}
              </button>
            ))}
          </div>
          <button 
            onClick={() => {
              setEditingInvId(null);
              setNewInv({ name: '', quantity: 0, unit: 'pcs', min_stock: 0, unit_price: 0, category: 'Bahan', type: (invCategoryFilter === 'Bahan' || invCategoryFilter === 'Barang') ? invCategoryFilter : 'Bahan', expiration_date: '' });
              setCalcPurchase({ qty: 1, content: 0, totalPrice: 0 });
              setShowCalculator(false);
              setShowInvModal(true);
            }}
            className="bg-accent-500 text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 hover:bg-accent-600 transition-all shadow-xl shadow-accent-500/20 active:scale-[0.98]"
          >
            <Plus size={18} />
            <span className="font-sans font-bold text-[10px] uppercase tracking-widest">Tambah Item</span>
          </button>
        </div>
      </header>

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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8"
      >
        {visible.map(item => (
          <motion.div 
            key={item.id} 
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
            }}
            className="glass-card p-8 group relative flex flex-col overflow-hidden"
          >
            {/* Hover Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none" />
            
            <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-10">
              <span className={cn(
                "text-[8px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border",
                item.type === 'Barang' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-amber-50 text-amber-600 border-amber-100"
              )}>
                {item.type === 'Bahan' ? t('raw_material') : t('goods')}
              </span>
              <span className={cn(
                "text-[8px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-coffee-50 text-coffee-500 border border-coffee-100"
              )}>
                {item.category || 'Bahan'}
              </span>
            </div>
            
            <div className="flex justify-between items-start mb-8">
              <div className="bg-coffee-50 p-4 rounded-2xl group-hover:bg-coffee-100 transition-colors border border-coffee-100/50">
                <Package className="text-coffee-600" size={24} />
              </div>
              <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 lg:translate-x-4 lg:group-hover:translate-x-0 z-10">
                <button 
                  onClick={() => handleEditInventory(item)}
                  className="p-3 bg-white lg:bg-transparent text-coffee-600 lg:text-coffee-300 hover:text-coffee-600 hover:bg-coffee-50 rounded-xl transition-all shadow-sm lg:shadow-none border border-coffee-100 lg:border-transparent"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteInventory(item.id)}
                  className="p-3 bg-white lg:bg-transparent text-rose-500 lg:text-coffee-300 hover:text-white hover:bg-rose-500 rounded-xl transition-all shadow-sm lg:shadow-none border border-coffee-100 lg:border-transparent"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1">
              <h4 className="text-xl font-serif font-bold text-coffee-950 mb-2 tracking-tight">{item.name}</h4>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-serif text-coffee-950">{item.quantity}</span>
                <span className="text-coffee-400 font-sans font-bold uppercase tracking-widest text-[10px]">{item.unit}</span>
              </div>
              <p className="text-[10px] font-sans font-bold text-coffee-400 uppercase tracking-widest mb-4">
                {formatIDR(item.unit_price)} / {item.unit}
              </p>
              
              {item.expiration_date && (
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-sans font-bold uppercase tracking-widest mb-6",
                  new Date(item.expiration_date) < new Date() ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-coffee-50 text-coffee-400 border border-coffee-100"
                )}>
                  <Calendar size={12} />
                  <span>Exp: {formatDate(new Date(item.expiration_date), 'dd MMM yyyy')}</span>
                  {new Date(item.expiration_date) < new Date() && <span className="ml-1 text-rose-700 underline">Expired</span>}
                </div>
              )}
            </div>
            
            <div className="space-y-4 mt-auto pt-6 border-t border-coffee-50">
              <div className="w-full bg-coffee-50 h-1.5 rounded-full overflow-hidden border border-coffee-100/50">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000 ease-out",
                    item.quantity <= item.min_stock ? "bg-rose-400" : "bg-coffee-950"
                  )}
                  style={{ width: `${Math.min(100, (item.quantity / Math.max(1, item.min_stock * 3)) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-sans font-bold text-coffee-300 uppercase tracking-widest">Min: {item.min_stock} {item.unit}</span>
                <div className="flex items-center gap-1 bg-coffee-50 p-1 rounded-xl border border-coffee-100">
                  <button 
                    onClick={() => setConfirmUpdate({ id: item.id, name: item.name, currentQty: item.quantity, delta: -1 })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-coffee-600 hover:bg-white hover:shadow-sm transition-all font-bold"
                  >
                    -
                  </button>
                  <div className="w-px h-4 bg-coffee-200 mx-1" />
                  <button 
                    onClick={() => setConfirmUpdate({ id: item.id, name: item.name, currentQty: item.quantity, delta: 1 })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-coffee-600 hover:bg-white hover:shadow-sm transition-all font-bold"
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
              className="w-full mt-6 bg-coffee-950 text-white py-4 rounded-xl font-sans font-bold text-[11px] sm:text-xs uppercase tracking-widest hover:bg-coffee-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-coffee-950/10 button-press"
            >
              <Plus size={14} />
              Beli Stok
            </button>
          </motion.div>
        ))}
        {filtered.length > visible.length && (
          <div className="col-span-full py-12 text-center">
            <button 
              onClick={() => setInvPage(prev => prev + 1)}
              className="bg-white text-coffee-600 px-12 py-4 rounded-2xl font-sans font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-coffee-50 transition-all border border-coffee-100 shadow-sm premium-shadow"
            >
              Muat Lebih Banyak
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default InventoryTab;
