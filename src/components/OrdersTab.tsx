import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, LayoutDashboard, Coffee, Milk, Utensils, Cookie, 
  Check, Plus, ShoppingCart, Trash2, Minus, User, Hash, 
  Users, CreditCard, Printer, AlertCircle, X 
} from 'lucide-react';
import { formatIDR, formatDate } from '../utils';
import { cn } from '../types';
import type { Menu, CartItem, Transaction, Customer } from '../types';

interface OrdersTabProps {
  orderView: 'pos' | 'history';
  setOrderView: (view: 'pos' | 'history') => void;
  menuSearch: string;
  setMenuSearch: (search: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  menus: Menu[];
  cart: CartItem[];
  setCart: (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  cartPulse: boolean;
  customerName: string;
  setCustomerName: (name: string) => void;
  tableNumber: string;
  setTableNumber: (num: string) => void;
  selectedCustomerId: number | null;
  setSelectedCustomerId: (id: number | null) => void;
  customers: Customer[];
  lastOrder: any;
  loading: boolean;
  showMobileCart: boolean;
  setShowMobileCart: (show: boolean) => void;
  transactions: Transaction[];
  appSettings: any;
  handleAddToCart: (menu: Menu, e: React.MouseEvent) => void;
  handleUpdateCartOptions: (menuId: number, options: Partial<CartItem>) => void;
  handleUpdateCartQuantity: (menuId: number, delta: number) => void;
  handleRemoveFromCart: (menuId: number) => void;
  handleReprint: (orderId?: string) => void;
  setShowPaymentModal: (show: boolean) => void;
  isMenuAvailable: (menu: Menu) => boolean;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const OrdersTab: React.FC<OrdersTabProps> = ({
  orderView,
  setOrderView,
  menuSearch,
  setMenuSearch,
  selectedCategory,
  setSelectedCategory,
  menus,
  cart,
  setCart,
  cartPulse,
  customerName,
  setCustomerName,
  tableNumber,
  setTableNumber,
  selectedCustomerId,
  setSelectedCustomerId,
  customers,
  lastOrder,
  loading,
  showMobileCart,
  setShowMobileCart,
  transactions,
  appSettings,
  handleAddToCart,
  handleUpdateCartOptions,
  handleUpdateCartQuantity,
  handleRemoveFromCart,
  handleReprint,
  setShowPaymentModal,
  isMenuAvailable,
  searchInputRef
}) => {
  const inCart = (menuId: number) => cart.find(c => c.menu.id === menuId);

  return (
    <motion.div 
      key="orders"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-coffee-400 font-sans font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-2">Kasir</p>
          <h2 className="text-3xl sm:text-4xl font-serif text-coffee-950 tracking-tight">
            {orderView === 'pos' ? 'Orderan ' : 'Histori '}
            <span className="text-coffee-400 font-serif">{orderView === 'pos' ? 'Masuk' : 'Orderan'}</span>
          </h2>
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto">
          <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-coffee-100 shadow-sm no-print w-full md:w-auto">
            <button 
              onClick={() => setOrderView('pos')}
              className={cn(
                "flex-1 md:px-8 py-2.5 rounded-xl text-[10px] font-sans font-bold uppercase tracking-widest transition-all",
                orderView === 'pos' ? "bg-accent-500 text-white shadow-lg premium-shadow" : "text-coffee-400 hover:text-coffee-600"
              )}
            >
              POS
            </button>
            <button 
              onClick={() => setOrderView('history')}
              className={cn(
                "flex-1 md:px-8 py-2.5 rounded-xl text-[10px] font-sans font-bold uppercase tracking-widest transition-all",
                orderView === 'history' ? "bg-accent-500 text-white shadow-lg premium-shadow" : "text-coffee-400 hover:text-coffee-600"
              )}
            >
              Histori
            </button>
          </div>
        </div>
      </header>

      {orderView === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24 md:pb-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Menu Selection Section */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h3 className="text-xl sm:text-2xl font-serif text-coffee-950 tracking-tight">Pilih <span className="text-coffee-400">Menu</span></h3>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-coffee-300" size={18} />
                  <input 
                    ref={searchInputRef}
                    type="text"
                    placeholder="Cari menu... (/)"
                    value={menuSearch}
                    className="w-full bg-white border border-coffee-100 rounded-2xl pl-14 pr-6 py-3.5 text-sm font-sans font-semibold text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 focus:border-coffee-500 shadow-sm transition-all placeholder:text-coffee-200"
                    onChange={(e) => setMenuSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Tabs */}
              <div className="sticky top-0 z-20 bg-coffee-50/80 backdrop-blur-md py-4 -mx-4 px-4 lg:relative lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:m-0">
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {[
                    { id: 'Semua', icon: <LayoutDashboard size={16} /> },
                    { id: 'Kopi', icon: <Coffee size={16} /> },
                    { id: 'Non-Kopi', icon: <Milk size={16} /> },
                    { id: 'Makanan', icon: <Utensils size={16} /> },
                    { id: 'Snack', icon: <Cookie size={16} /> }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[11px] sm:text-xs font-sans font-bold uppercase tracking-widest transition-all duration-500 border whitespace-nowrap",
                        selectedCategory === cat.id 
                          ? "bg-coffee-950 border-coffee-950 text-white shadow-xl shadow-coffee-950/20 premium-shadow" 
                          : "bg-white border-coffee-100 text-coffee-400 hover:border-coffee-300 hover:text-coffee-600"
                      )}
                    >
                      <span className={cn(
                        "transition-transform duration-500",
                        selectedCategory === cat.id ? "scale-110" : "scale-100"
                      )}>
                        {cat.icon}
                      </span>
                      {cat.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar pb-32 lg:pb-8">
                {menus
                  .filter(m => {
                    const matchSearch = m.name.toLowerCase().includes(menuSearch.toLowerCase());
                    const matchCategory = selectedCategory === 'Semua' || m.category === selectedCategory;
                    return matchSearch && matchCategory;
                  })
                  .map(menu => {
                    const available = isMenuAvailable(menu);
                    const cartItem = inCart(menu.id);
                    return (
                      <button
                        key={menu.id}
                        disabled={!available}
                        onClick={(e) => handleAddToCart(menu, e)}
                        className={cn(
                          "glass-card p-0 text-left transition-all duration-500 group relative overflow-hidden flex flex-col h-full border-2",
                          available 
                            ? "hover:border-coffee-300 active:scale-[0.98] bg-white" 
                            : "opacity-60 grayscale cursor-not-allowed bg-slate-50",
                          cartItem ? "border-coffee-950 ring-4 ring-coffee-950/5" : "border-transparent"
                        )}
                      >
                        {/* Image Section */}
                        <div className="relative w-full aspect-square overflow-hidden bg-coffee-50 shrink-0">
                          {menu.image_url ? (
                            <img 
                              src={menu.image_url} 
                              alt={menu.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-coffee-200 bg-coffee-50/50">
                              <Coffee size={40} strokeWidth={1.5} />
                            </div>
                          )}
                          
                          {/* Overlay for actions */}
                          <div className="absolute inset-0 bg-coffee-950/0 group-hover:bg-coffee-950/10 transition-colors duration-500" />
                          
                          {!available && (
                            <div className="absolute top-4 right-4 bg-rose-500 text-white px-3 py-1.5 rounded-full text-[8px] font-sans font-bold uppercase tracking-[0.2em] shadow-xl">
                              Habis
                            </div>
                          )}
                          
                          {available && !cartItem && (
                            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-coffee-950 p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 shadow-xl hidden sm:block border border-white/20">
                              <Plus size={20} />
                            </div>
                          )}
  
                          {cartItem && (
                            <motion.div 
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="absolute top-4 left-4 bg-coffee-950 text-white text-[10px] font-sans font-bold w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/20 z-10"
                            >
                              {cartItem.quantity}
                            </motion.div>
                          )}
                        </div>
  
                        <div className="p-5 flex-1 flex flex-col min-w-0">
                          <p className="text-[9px] sm:text-[10px] font-sans font-bold text-coffee-300 uppercase tracking-[0.2em] mb-2">{menu.category || 'Menu'}</p>
                          <h4 className="font-serif font-bold text-coffee-950 text-sm sm:text-base mb-3 line-clamp-2 leading-tight group-hover:text-coffee-700 transition-colors tracking-tight">{menu.name}</h4>
                          <div className="mt-auto flex justify-between items-center">
                            <p className="text-sm sm:text-base text-coffee-950 font-serif font-bold">{formatIDR(menu.price)}</p>
                            <div className={cn(
                              "w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border",
                              cartItem 
                                ? "bg-coffee-950 text-white border-coffee-950 shadow-lg shadow-coffee-950/20" 
                                : "bg-coffee-50 text-coffee-300 border-coffee-100 group-hover:bg-coffee-100 group-hover:text-coffee-600 group-hover:border-coffee-200"
                            )}>
                              {cartItem ? <Check size={18} /> : <Plus size={18} />}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar Summary - Hidden on Mobile */}
          <div className="hidden lg:block space-y-6">
            {/* Desktop Cart Section - Moved to Right Column */}
            <motion.div 
              id="desktop-cart-icon" 
              animate={cartPulse ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold text-coffee-950">Daftar Orderan</h3>
                {cart.length > 0 && (
                  <button 
                    onClick={() => setCart([])}
                    className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 transition-colors tracking-widest flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Hapus Semua
                  </button>
                )}
              </div>
              {cart.length === 0 ? (
                <div className="glass-card p-8 flex flex-col items-center justify-center text-center bg-white/50 border-dashed border-2">
                  <div className="bg-coffee-50 p-4 rounded-full mb-3">
                    <ShoppingCart size={32} className="text-coffee-200" />
                  </div>
                  <p className="text-sm text-coffee-500 font-medium">Keranjang Kosong</p>
                </div>
              ) : (
                <div className="glass-card overflow-hidden bg-white shadow-sm border-coffee-100">
                  <div className="max-h-[calc(100vh-450px)] overflow-y-auto custom-scrollbar">
                    <table className="w-full">
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b border-coffee-100 bg-coffee-50/90 backdrop-blur-sm">
                          <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-coffee-400">Item</th>
                          <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-coffee-400">Qty</th>
                          <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-coffee-400">Subtotal</th>
                          <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-coffee-400"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-coffee-50">
                        {(Object.entries(
                          cart.reduce((acc, item) => {
                            const category = item.menu.category || 'Lainnya';
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(item);
                            return acc;
                          }, {} as Record<string, CartItem[]>)
                        ) as [string, CartItem[]][]).map(([category, items]) => (
                          <React.Fragment key={category}>
                            <tr className="bg-coffee-50/50">
                              <td colSpan={4} className="px-4 py-1.5 text-[9px] font-black text-coffee-400 uppercase tracking-widest border-y border-coffee-100/50">
                                {category}
                              </td>
                            </tr>
                            {items.map((item) => (
                              <tr key={item.menu.id} className="hover:bg-coffee-50/30 transition-colors">
                                <td className="px-4 py-3">
                                  <div>
                                    <p className="font-bold text-coffee-950 text-xs">{item.menu.name}</p>
                                    <p className="text-[10px] text-coffee-500">{formatIDR(item.menu.price)}</p>
                                    
                                    {/* Sugar and Ice Options */}
                                    {(item.menu.category?.toLowerCase().includes('kopi') || 
                                      item.menu.category?.toLowerCase().includes('teh') || 
                                      item.menu.category?.toLowerCase().includes('coffee') || 
                                      item.menu.category?.toLowerCase().includes('tea') || 
                                      item.menu.category?.toLowerCase().includes('drink') || 
                                      item.menu.category?.toLowerCase().includes('minuman')) && (
                                      <div className="mt-2 flex gap-2">
                                        <select 
                                          value={item.sugarLevel || 'Normal'}
                                          onChange={(e) => handleUpdateCartOptions(item.menu.id, { sugarLevel: e.target.value })}
                                          className="bg-coffee-50 border border-coffee-100 rounded text-[9px] py-0.5 px-1 focus:outline-none"
                                          title="Sugar Level"
                                        >
                                          <option value="No Sugar">No Sugar</option>
                                          <option value="Less Sugar">Less Sugar</option>
                                          <option value="Normal">Normal</option>
                                          <option value="Extra Sugar">Extra</option>
                                        </select>
                                        <select 
                                          value={item.iceLevel || 'Normal'}
                                          onChange={(e) => handleUpdateCartOptions(item.menu.id, { iceLevel: e.target.value })}
                                          className="bg-coffee-50 border border-coffee-100 rounded text-[9px] py-0.5 px-1 focus:outline-none"
                                          title="Ice Level"
                                        >
                                          <option value="No Ice">No Ice</option>
                                          <option value="Less Ice">Less Ice</option>
                                          <option value="Normal">Normal</option>
                                          <option value="Extra Ice">Extra</option>
                                        </select>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <button 
                                      onClick={() => handleUpdateCartQuantity(item.menu.id, -1)}
                                      className="w-8 h-8 flex items-center justify-center rounded-xl border border-coffee-200 text-coffee-600 hover:bg-coffee-50 text-sm active:scale-90 transition-all"
                                    >
                                      <Minus size={14} />
                                    </button>
                                    <span className="font-bold text-coffee-900 text-xs w-5 text-center">{item.quantity}</span>
                                    <button 
                                      onClick={() => handleUpdateCartQuantity(item.menu.id, 1)}
                                      className="w-8 h-8 flex items-center justify-center rounded-xl border border-coffee-200 text-coffee-600 hover:bg-coffee-50 text-sm active:scale-90 transition-all"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-coffee-950 text-xs">
                                  {formatIDR(item.menu.price * item.quantity)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button 
                                    onClick={() => handleRemoveFromCart(item.menu.id)}
                                    className="text-coffee-300 hover:text-rose-500 transition-colors p-2"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>

            <div className="glass-card p-8 bg-coffee-950 text-white border-none sticky top-24 shadow-2xl shadow-coffee-950/40 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar flex flex-col">
              <h3 className="text-2xl font-serif font-bold mb-8 tracking-tight">Ringkasan <span className="text-coffee-400">Order</span></h3>
              
              <div className="space-y-6 mb-10">
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase text-coffee-400 mb-3 tracking-[0.2em] ml-1">Nama Pembeli</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-600 group-focus-within:text-coffee-300 transition-colors" size={16} />
                    <input 
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nama pembeli..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-sans font-semibold text-coffee-100 focus:outline-none focus:ring-2 focus:ring-coffee-500/40 transition-all placeholder:text-coffee-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase text-coffee-400 mb-3 tracking-[0.2em] ml-1">No. Meja</label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-600 group-focus-within:text-coffee-300 transition-colors" size={16} />
                      <input 
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="Meja..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-sans font-semibold text-coffee-100 focus:outline-none focus:ring-2 focus:ring-coffee-500/40 transition-all placeholder:text-coffee-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase text-coffee-400 mb-3 tracking-[0.2em] ml-1">Loyalty</label>
                    <div className="relative group">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-600 group-focus-within:text-coffee-300 transition-colors" size={16} />
                      <select 
                        value={selectedCustomerId || ''}
                        onChange={(e) => {
                          const id = e.target.value ? Number(e.target.value) : null;
                          setSelectedCustomerId(id);
                          if (id) {
                            const cust = customers.find(c => c.id === id);
                            if (cust) setCustomerName(cust.name);
                          }
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-sans font-semibold text-coffee-100 focus:outline-none focus:ring-2 focus:ring-coffee-500/40 transition-all appearance-none"
                      >
                        <option value="" className="bg-coffee-950">Umum</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id} className="bg-coffee-950">{c.name} ({c.points} pts)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 mb-10 mt-auto">
                <div className="flex justify-between items-center text-coffee-400">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]">Total Item</span>
                  <span className="text-sm font-sans font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)} Items</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-coffee-400 mb-1.5">Total Bayar</span>
                  <span className="text-4xl font-serif font-bold text-white">
                    {formatIDR(cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0))}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-accent-500 text-white py-5 rounded-2xl font-display font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-accent-600 transition-all disabled:opacity-30 shadow-xl shadow-accent-950/20 active:scale-[0.98]"
                  disabled={loading || cart.length === 0}
                >
                  <CreditCard size={18} />
                  Pilih Pembayaran
                </button>
  
                {lastOrder && (
                  <button 
                    onClick={() => handleReprint()}
                    className="w-full bg-white/5 text-coffee-300 py-4 rounded-2xl font-display font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all border border-white/5"
                  >
                    <Printer size={16} />
                    Cetak Ulang Struk
                  </button>
                )}
              </div>
            </div>

            <div className="glass-card p-6 border-dashed border-2 border-coffee-200 bg-transparent">
              <p className="text-xs font-bold uppercase tracking-widest text-coffee-400 mb-4 flex items-center gap-2">
                <AlertCircle size={14} /> Catatan Kasir
              </p>
              <p className="text-sm text-coffee-600 italic">
                "Pastikan stok bahan baku mencukupi sebelum memproses pembayaran. Sistem akan memvalidasi stok secara otomatis."
              </p>
            </div>
          </div>

          {/* Mobile Floating Cart Button */}
          {cart.length > 0 && (
            <motion.button
              id="mobile-floating-cart"
              initial={{ scale: 0, y: 20 }}
              animate={cartPulse ? { scale: [1, 1.1, 1], y: 0 } : { scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowMobileCart(true)}
              className="lg:hidden fixed bottom-24 right-6 z-40 bg-coffee-950 text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border-2 border-white/20 backdrop-blur-xl active:scale-95 transition-all premium-shadow"
            >
              <div className="relative">
                <div className="bg-white/20 p-2 rounded-xl">
                  <ShoppingCart size={22} className="text-white" />
                </div>
                <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-coffee-950 shadow-lg">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[8px] font-sans font-bold uppercase tracking-widest text-coffee-300">Total Bayar</p>
                <p className="font-sans font-bold text-sm">
                  {formatIDR(cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0))}
                </p>
              </div>
            </motion.button>
          )}

          {/* Mobile Cart Slide-over */}
          <AnimatePresence>
            {showMobileCart && (
              <div className="fixed inset-0 z-[60] lg:hidden">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileCart(false)}
                  className="absolute inset-0 bg-coffee-950/60 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                  <div className="p-6 border-b border-coffee-100 flex justify-between items-center bg-coffee-50/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-coffee-900 text-white p-2 rounded-xl">
                        <ShoppingCart size={20} />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-coffee-950">Keranjang Saya</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {cart.length > 0 && (
                        <button 
                          onClick={() => setCart([])}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                          title="Hapus Semua"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                      <button 
                        onClick={() => setShowMobileCart(false)}
                        className="w-10 h-10 rounded-full bg-white border border-coffee-100 flex items-center justify-center text-coffee-400 hover:text-coffee-900"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <div className="space-y-6">
                      {(Object.entries(
                        cart.reduce((acc, item) => {
                          const category = item.menu.category || 'Lainnya';
                          if (!acc[category]) acc[category] = [];
                          acc[category].push(item);
                          return acc;
                        }, {} as Record<string, CartItem[]>)
                      ) as [string, CartItem[]][]).map(([category, items]) => (
                        <div key={category} className="space-y-3">
                          <h4 className="text-[10px] font-black uppercase text-coffee-400 tracking-widest px-1">{category}</h4>
                          <div className="space-y-3">
                            {items.map((item) => (
                              <div key={item.menu.id} className="flex items-center gap-3 min-[400px]:gap-4 bg-slate-50 p-3 min-[400px]:p-4 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 min-[400px]:w-16 min-[400px]:h-16 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm border border-slate-100">
                                  {item.menu.image_url ? (
                                    <img src={item.menu.image_url} alt={item.menu.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-coffee-200">
                                      <Coffee size={20} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-coffee-950 text-xs min-[400px]:text-sm truncate">{item.menu.name}</h4>
                                  <p className="text-[10px] min-[400px]:text-xs text-coffee-500">{formatIDR(item.menu.price)}</p>
                                  
                                  {/* Sugar and Ice Options */}
                                  {(item.menu.category?.toLowerCase().includes('kopi') || 
                                    item.menu.category?.toLowerCase().includes('teh') || 
                                    item.menu.category?.toLowerCase().includes('coffee') || 
                                    item.menu.category?.toLowerCase().includes('tea') || 
                                    item.menu.category?.toLowerCase().includes('drink') || 
                                    item.menu.category?.toLowerCase().includes('minuman')) && (
                                    <div className="mt-1.5 flex gap-1.5">
                                      <select 
                                        value={item.sugarLevel || 'Normal'}
                                        onChange={(e) => handleUpdateCartOptions(item.menu.id, { sugarLevel: e.target.value })}
                                        className="bg-white border border-slate-200 rounded-lg text-[9px] min-[400px]:text-[10px] py-0.5 min-[400px]:py-1 px-1.5 min-[400px]:px-2 focus:outline-none focus:ring-1 focus:ring-coffee-500"
                                      >
                                        <option value="No Sugar">No Sugar</option>
                                        <option value="Less Sugar">Less Sugar</option>
                                        <option value="Normal">Normal</option>
                                        <option value="Extra Sugar">Extra</option>
                                      </select>
                                      <select 
                                        value={item.iceLevel || 'Normal'}
                                        onChange={(e) => handleUpdateCartOptions(item.menu.id, { iceLevel: e.target.value })}
                                        className="bg-white border border-slate-200 rounded-lg text-[9px] min-[400px]:text-[10px] py-0.5 min-[400px]:py-1 px-1.5 min-[400px]:px-2 focus:outline-none focus:ring-1 focus:ring-coffee-500"
                                      >
                                        <option value="No Ice">No Ice</option>
                                        <option value="Less Ice">Less Ice</option>
                                        <option value="Normal">Normal</option>
                                        <option value="Extra Ice">Extra</option>
                                      </select>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 min-[400px]:gap-3 bg-white p-1 rounded-xl border border-slate-200">
                                  <button 
                                    onClick={() => handleUpdateCartQuantity(item.menu.id, -1)}
                                    className="w-8 h-8 min-[400px]:w-10 min-[400px]:h-10 flex items-center justify-center rounded-xl text-coffee-600 hover:bg-coffee-50 active:bg-coffee-100 active:scale-90 transition-all"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="font-bold text-coffee-900 text-xs min-[400px]:text-sm w-4 text-center">{item.quantity}</span>
                                  <button 
                                    onClick={() => handleUpdateCartQuantity(item.menu.id, 1)}
                                    className="w-8 h-8 min-[400px]:w-10 min-[400px]:h-10 flex items-center justify-center rounded-xl text-coffee-600 hover:bg-coffee-50 active:bg-coffee-100 active:scale-90 transition-all"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-coffee-50 p-6 rounded-3xl space-y-4 border border-coffee-100">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase text-coffee-400 tracking-widest">Nama Pembeli</label>
                          <input 
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Ketik nama pembeli..."
                            className="w-full bg-white border border-coffee-200 rounded-2xl px-4 py-3 text-sm text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white border-t border-coffee-100 space-y-4">
                    <div className="flex justify-between items-baseline px-2">
                      <span className="text-coffee-950 font-serif font-bold text-lg">Total Bayar</span>
                      <span className="text-2xl font-black text-coffee-900">
                        {formatIDR(cart.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0))}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setShowMobileCart(false);
                        setShowPaymentModal(true);
                      }}
                      className="w-full bg-accent-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-accent-600 active:scale-95 transition-all shadow-xl shadow-accent-500/20"
                      disabled={loading || cart.length === 0}
                    >
                      <CreditCard size={20} />
                      LANJUT PEMBAYARAN
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass-card p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif font-bold text-coffee-950">Riwayat Penjualan</h3>
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-coffee-500 text-xs uppercase tracking-widest border-b border-coffee-100">
                  <th className="pb-4 font-bold">Waktu</th>
                  <th className="pb-4 font-bold">Metode</th>
                  <th className="pb-4 font-bold">Deskripsi</th>
                  <th className="pb-4 font-bold text-right">Total</th>
                  <th className="pb-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-50">
                {transactions
                  .filter(tx => tx.type === 'income' && tx.category === 'Sales')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(tx => (
                    <tr key={tx.id} className="hover:bg-coffee-50/50 transition-colors">
                      <td className="py-4 text-sm text-coffee-600">
                        {formatDate(new Date(tx.date), 'HH:mm')}
                        <span className="text-[10px] block text-coffee-400">{formatDate(new Date(tx.date), 'dd MMM yyyy')}</span>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-coffee-100 rounded text-[10px] font-bold text-coffee-600 uppercase">
                          {tx.payment_method || 'Cash'}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-coffee-900 font-medium">{tx.description}</td>
                      <td className="py-4 text-sm font-bold text-right text-emerald-600">
                        {formatIDR(tx.amount)}
                      </td>
                      <td className="py-4 text-right">
                        {tx.order_id && (
                          <button
                            onClick={() => handleReprint(tx.order_id)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-coffee-600 hover:text-coffee-900 hover:bg-coffee-100 rounded-lg transition-all border border-coffee-100"
                            title="Cetak Ulang Struk"
                          >
                            <Printer size={14} />
                            <span className="text-[10px] font-bold uppercase">Struk</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="md:hidden space-y-4">
            {transactions
              .filter(tx => tx.type === 'income' && tx.category === 'Sales')
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(tx => (
                <div key={tx.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-coffee-950">{formatDate(new Date(tx.date), 'HH:mm')}</span>
                      <span className="px-1.5 py-0.5 bg-coffee-100 rounded text-[8px] font-black text-coffee-600 uppercase">
                        {tx.payment_method || 'Cash'}
                      </span>
                    </div>
                    <p className="text-xs text-coffee-600 font-medium line-clamp-1">{tx.description}</p>
                    <p className="text-[10px] text-coffee-400">{formatDate(new Date(tx.date), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-sm font-black text-emerald-600">{formatIDR(tx.amount)}</p>
                    {tx.order_id && (
                      <button 
                        onClick={() => handleReprint(tx.order_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-coffee-100 text-coffee-600 rounded-xl shadow-sm active:scale-90 transition-transform"
                      >
                        <Printer size={12} />
                        <span className="text-[10px] font-black uppercase">Struk</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OrdersTab;
