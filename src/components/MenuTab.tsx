import React from 'react';
import { motion } from 'motion/react';
import { Plus, Coffee, Edit, Trash2, Info } from 'lucide-react';
import { formatIDR } from '../utils';
import { cn } from '../types';
import type { Menu } from '../types';

interface MenuTabProps {
  menus: Menu[];
  menuPage: number;
  setMenuPage: (page: number | ((prev: number) => number)) => void;
  ITEMS_PER_PAGE: number;
  setEditingMenuId: (id: number | null) => void;
  setNewMenu: (menu: any) => void;
  setShowMenuModal: (show: boolean) => void;
  handleEditMenu: (menu: Menu) => void;
  handleDeleteMenu: (id: number) => void;
  handleAddToCart: (menu: Menu, e: React.MouseEvent) => void;
  t: (key: string) => string;
}

const MenuTab: React.FC<MenuTabProps> = ({
  menus,
  menuPage,
  setMenuPage,
  ITEMS_PER_PAGE,
  setEditingMenuId,
  setNewMenu,
  setShowMenuModal,
  handleEditMenu,
  handleDeleteMenu,
  handleAddToCart,
  t
}) => {
  const visible = menus.slice(0, menuPage * ITEMS_PER_PAGE);

  return (
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
        {visible.map(menu => (
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
              onClick={(e) => handleAddToCart(menu, e)}
              className="w-full bg-coffee-100 text-coffee-900 py-4 font-bold flex items-center justify-center gap-2 hover:bg-coffee-900 hover:text-white transition-all border-t border-coffee-200"
            >
              <Plus size={18} />
              Tambah ke Order
            </button>
          </div>
        ))}
        {menus.length > visible.length && (
          <div className="col-span-full py-8 text-center">
            <button 
              onClick={() => setMenuPage(prev => prev + 1)}
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

export default MenuTab;
