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
              setNewInv({ name: '', quantity: 0, unit: 'pcs', min_stock: 0, unit_price: 0, category: 'Bahan', type: (invCategoryFilter === 'Bahan' || invCategoryFilter === 'Barang') ? invCategoryFilter : 'Bahan', expiration_date: '' });
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
        {visible.map(item => (
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
            <p className="text-xs font-bold text-coffee-400 mb-1">
              Harga: {formatIDR(item.unit_price)} / {item.unit}
            </p>
            {item.expiration_date && (
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-wider mb-4 flex items-center gap-1",
                new Date(item.expiration_date) < new Date() ? "text-rose-500" : "text-coffee-400"
              )}>
                <Calendar size={10} /> Exp: {formatDate(new Date(item.expiration_date), 'dd MMM yyyy')}
                {new Date(item.expiration_date) < new Date() && " (Expired)"}
              </p>
            )}
            {!item.expiration_date && <div className="mb-4" />}
            
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
        {filtered.length > visible.length && (
          <div className="col-span-full py-8 text-center">
            <button 
              onClick={() => setInvPage(prev => prev + 1)}
              className="bg-coffee-50 text-coffee-600 px-8 py-3 rounded-2xl font-bold hover:bg-coffee-100 transition-all border border-coffee-100"
            >
              Muat Lebih Banyak
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InventoryTab;
