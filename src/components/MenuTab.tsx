import React from 'react';
import { motion } from 'motion/react';
import { Plus, Coffee, Edit, Trash2, Info } from 'lucide-react';
import { formatIDR } from '../utils';
import { cn } from '../types';

interface MenuTabProps {
  menus: any[];
  menuPage: number;
  setMenuPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
  setEditingMenuId: (id: string | null) => void;
  setNewMenu: (menu: any) => void;
  setShowMenuModal: (show: boolean) => void;
  handleEditMenu: (menu: any) => void;
  handleDeleteMenu: (id: string) => void;
  handleAddToCart: (menu: any, e: React.MouseEvent) => void;
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
  return (
    <motion.div 
      key="menu"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-coffee-400 font-sans font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-2">Daftar Jualan</p>
          <h2 className="text-3xl sm:text-4xl font-serif text-coffee-950 tracking-tight">
            Menu <span className="text-coffee-400">Katalog</span>
          </h2>
        </div>
        <button 
          onClick={() => {
            setEditingMenuId(null);
            setNewMenu({ name: '', price: 0, size: '', description: '', category: 'Kopi', image_url: '', ingredients: [], type: 'Internal', supplier_name: '', supplier_price: 0 });
            setShowMenuModal(true);
          }}
          className="bg-accent-500 text-white px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-accent-600 transition-all shadow-xl shadow-accent-500/20 premium-shadow group w-full md:w-auto justify-center"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          <span className="font-sans font-bold text-xs uppercase tracking-widest">Tambah Menu</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(() => {
          const visible = menus.slice(0, menuPage * ITEMS_PER_PAGE);
          return (
            <>
              {visible.map(menu => (
                <div key={menu.id} className="glass-card overflow-hidden group hover:border-coffee-300 transition-all duration-500 flex flex-col border-2 border-transparent hover:shadow-2xl hover:shadow-coffee-900/10">
                  <div className="relative h-56 bg-coffee-50 overflow-hidden">
                    {menu.image_url ? (
                      <img 
                        src={menu.image_url} 
                        alt={menu.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-coffee-200 bg-coffee-50/50">
                        <Coffee size={56} strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="bg-white/90 backdrop-blur-md text-coffee-950 px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em] shadow-xl border border-white/20 w-fit">
                        {menu.category || 'Menu'}
                      </span>
                      {menu.type === 'Consignment' && (
                        <span className="bg-amber-500/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em] shadow-xl border border-amber-400/20 w-fit">
                          {t('consignment')}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleEditMenu(menu)}
                        className="bg-white/90 backdrop-blur-md text-coffee-600 p-3 rounded-2xl shadow-xl hover:bg-coffee-950 hover:text-white transition-all border border-white/20"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMenu(menu.id)}
                        className="bg-white/90 backdrop-blur-md text-rose-600 p-3 rounded-2xl shadow-xl hover:bg-rose-600 hover:text-white transition-all border border-white/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-serif font-bold text-coffee-950 tracking-tight group-hover:text-coffee-700 transition-colors">{menu.name}</h4>
                      {menu.size && (
                        <span className="bg-coffee-50 text-coffee-400 px-3 py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-widest border border-coffee-100">
                          {menu.size}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-coffee-500 mb-6 line-clamp-2 flex-1 font-sans leading-relaxed">{menu.description}</p>
                    <div className="flex justify-between items-end mb-8">
                      <p className="text-3xl font-serif font-bold text-coffee-950">{formatIDR(menu.price)}</p>
                      <div className="text-right">
                        {menu.type === 'Consignment' ? (
                          <>
                            <p className="text-[9px] font-sans font-bold text-coffee-300 uppercase tracking-widest mb-1">
                              {t('supplier_price')}: {formatIDR(menu.supplier_price || 0)}
                            </p>
                            <p className={cn(
                              "text-[10px] font-sans font-bold uppercase tracking-widest",
                              (menu.price - (menu.supplier_price || 0)) > 0 ? "text-emerald-600" : "text-rose-600"
                            )}>
                              {t('profit_share')}: {formatIDR(menu.price - (menu.supplier_price || 0))}
                              {menu.price > 0 && (
                                <span className="text-[9px] ml-1 opacity-60">
                                  ({Math.round(((menu.price - (menu.supplier_price || 0)) / menu.price) * 100)}%)
                                </span>
                              )}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[9px] font-sans font-bold text-coffee-300 uppercase tracking-widest mb-1">
                              Modal: {formatIDR(menu.ingredients.reduce((sum: number, ing: any) => sum + (ing.unit_price || 0) * ing.quantity, 0))}
                            </p>
                            <p className={cn(
                              "text-[10px] font-sans font-bold uppercase tracking-widest",
                              (menu.price - menu.ingredients.reduce((sum: number, ing: any) => sum + (ing.unit_price || 0) * ing.quantity, 0)) > 0 ? "text-emerald-600" : "text-rose-600"
                            )}>
                              Margin: {formatIDR(menu.price - menu.ingredients.reduce((sum: number, ing: any) => sum + (ing.unit_price || 0) * ing.quantity, 0))}
                              {menu.price > 0 && (
                                <span className="text-[9px] ml-1 opacity-60">
                                  ({Math.round(((menu.price - menu.ingredients.reduce((sum: number, ing: any) => sum + (ing.unit_price || 0) * ing.quantity, 0)) / menu.price) * 100)}%)
                                </span>
                              )}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {menu.type === 'Internal' ? (
                      <div className="space-y-4 mb-2">
                        <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-coffee-300 flex items-center gap-2">
                          <Info size={14} /> Resep & Takaran
                        </p>
                        <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                          {menu.ingredients.map((ing: any) => (
                            <div key={ing.id} className="flex justify-between items-center text-sm">
                              <div className="flex flex-col">
                                <span className="text-coffee-600 font-sans font-semibold">{ing.inventory_name}</span>
                                <span className="text-[10px] text-coffee-300 font-sans">
                                  {ing.quantity} {ing.unit} x {formatIDR(ing.unit_price || 0)}
                                </span>
                              </div>
                              <span className="font-serif font-bold text-coffee-950">{formatIDR((ing.quantity || 0) * (ing.unit_price || 0))}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 mb-2 p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                        <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-amber-600 flex items-center gap-2">
                          <Info size={14} /> Info Penitip
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-serif font-bold text-amber-900">{menu.supplier_name}</span>
                          <span className="text-[9px] font-sans font-bold text-amber-600 bg-white px-3 py-1 rounded-full border border-amber-200 uppercase tracking-widest">
                            {t('consignment')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleAddToCart(menu, e)}
                    className="w-full bg-coffee-50 text-coffee-950 py-5 font-sans font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-coffee-950 hover:text-white transition-all border-t border-coffee-100 group-hover:border-coffee-950"
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
            </>
          );
        })()}
      </div>
    </motion.div>
  );
};

export default MenuTab;
