import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Clock, 
  Package, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  RefreshCw,
  Maximize,
  Minimize,
  User,
  Bell,
  Check,
  UtensilsCrossed,
  ChefHat,
  Star,
  Calendar,
  Truck,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
  X,
  Coffee,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { cn } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  cart: any[];
  activeOrders: any[];
  appSettings: any;
  t: (key: string) => string;
  handleLogout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  handleRefresh: () => void;
  isRefreshing: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  notifications: any[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  setNotifications: (notifs: any[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  cart,
  activeOrders,
  appSettings,
  t,
  handleLogout,
  darkMode,
  setDarkMode,
  handleRefresh,
  isRefreshing,
  isFullscreen,
  toggleFullscreen,
  notifications,
  showNotifications,
  setShowNotifications,
  setNotifications
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, adminOnly: true },
    { id: 'orders', label: t('orders'), icon: ShoppingCart, adminOnly: false },
    { id: 'kitchen', label: 'Dapur', icon: ChefHat, adminOnly: false },
    { id: 'queue', label: t('queue'), icon: Clock, adminOnly: false },
    { id: 'delivery', label: 'Delivery', icon: Truck, adminOnly: false },
    { id: 'reports', label: t('reports'), icon: Calendar, adminOnly: false },
    { id: 'inventory', label: t('inventory'), icon: Package, adminOnly: true },
    { id: 'menu', label: t('menu'), icon: UtensilsCrossed, adminOnly: true },
    { id: 'users', label: t('users'), icon: User, adminOnly: true },
    { id: 'loyalty', label: t('loyalty'), icon: Star, adminOnly: true },
    { id: 'settings', label: t('settings'), icon: Settings, adminOnly: true },
  ];

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const mobileGridItems = [
    { id: 'reports', label: 'Laporan Transaksi', icon: Calendar, color: 'bg-orange-50 text-orange-700' },
    { id: 'reports', label: 'Laporan Keuangan', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'reports', label: 'Catatan Keuangan', icon: Wallet, color: 'bg-blue-50 text-blue-600' },
    { id: 'inventory', label: 'Stok', icon: Package, color: 'bg-amber-50 text-amber-600' },
    { id: 'menu', label: 'Menu', icon: Coffee, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'settings', label: 'Setting', icon: Settings, color: 'bg-slate-50 text-slate-600' },
    { id: 'logout', label: 'Keluar', icon: LogOut, color: 'bg-rose-50 text-rose-600' },
  ];

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    if (isMobile) {
      return (
        <div className="flex flex-col h-full bg-white p-8">
          <div className="grid grid-cols-3 gap-y-10 gap-x-4">
            {mobileGridItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.id === 'logout') {
                    handleLogout();
                  } else {
                    setActiveTab(item.id);
                  }
                  setIsMobileOpen(false);
                }}
                className="flex flex-col items-center gap-3 group active:scale-95 transition-all"
              >
                <div className={cn(
                  "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-sm transition-all group-hover:shadow-md",
                  item.color
                )}>
                  <item.icon size={28} strokeWidth={2} />
                </div>
                <span className="text-[11px] font-bold text-coffee-900 text-center leading-tight px-1">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className={cn(
        "flex flex-col h-full bg-white transition-all duration-500",
        !isMobile && "border-r border-coffee-100"
      )}>
        {/* Logo Section */}
        <div className={cn(
          "p-6 flex items-center gap-3 border-b border-coffee-50",
          (isCollapsed && !isMobile) ? "justify-center" : "justify-start"
        )}>
          <div className={cn(
            "flex items-center justify-center shrink-0 transition-all",
            appSettings.app_logo_url ? "" : "bg-coffee-700 p-2 rounded-xl shadow-sm"
          )}>
            {appSettings.app_logo_url ? (
              <img src={appSettings.app_logo_url} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              <Coffee className="text-white w-6 h-6" />
            )}
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="font-bold text-coffee-900 text-lg tracking-tight">
                {appSettings.app_name}
              </span>
              <span className="text-[10px] text-coffee-400 uppercase tracking-wider">Point of Sale</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar no-scrollbar">
          {navItems.map((item) => {
            if (item.adminOnly && user.role !== 'admin') return null;
            
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobileOpen) setIsMobileOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all relative group",
                  isActive 
                    ? "bg-coffee-700 text-white shadow-sm" 
                    : "text-coffee-500 hover:bg-coffee-50 hover:text-coffee-900"
                )}
                title={(isCollapsed && !isMobile) ? item.label : ""}
              >
                <item.icon size={18} className={cn("shrink-0", isActive ? "text-white" : "text-coffee-300 group-hover:text-coffee-900")} />
                {(!isCollapsed || isMobile) && (
                  <span className="truncate">
                    {item.label}
                  </span>
                )}
                
                {/* Badges */}
                {item.id === 'orders' && cart.length > 0 && (
                  <span className={cn(
                    "absolute bg-accent-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold",
                    (isCollapsed && !isMobile) ? "top-1 right-1 w-4 h-4" : "right-4 w-5 h-5"
                  )}>
                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
                
                {item.id === 'queue' && activeOrders.length > 0 && (
                  <span className={cn(
                    "absolute bg-coffee-400 text-white text-[10px] rounded-full flex items-center justify-center font-bold",
                    (isCollapsed && !isMobile) ? "top-1 right-1 w-4 h-4" : "right-4 w-5 h-5"
                  )}>
                    {activeOrders.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="p-6 border-t border-coffee-50 space-y-8">
          {/* Quick Actions */}
          <div className={cn(
            "flex items-center gap-2 bg-coffee-50 p-1.5 rounded-xl",
            (isCollapsed && !isMobile) ? "flex-col" : "flex-row justify-around"
          )}>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-coffee-400 hover:text-coffee-900 transition-all rounded-lg hover:bg-white"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} />
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-coffee-400 hover:text-coffee-900 transition-all rounded-lg hover:bg-white"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "p-2 rounded-lg transition-all relative",
                showNotifications ? "text-coffee-900 bg-white shadow-sm" : "text-coffee-400 hover:text-coffee-900 hover:bg-white"
              )}
              title="Notifikasi"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-accent-500 rounded-full border border-white" />
              )}
            </button>
          </div>

          {/* User Profile */}
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl bg-white border border-coffee-100 shadow-sm",
            (isCollapsed && !isMobile) ? "justify-center" : "justify-between"
          )}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-coffee-700 flex items-center justify-center text-white shrink-0 shadow-sm relative">
                <User size={20} />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              {(!isCollapsed || isMobile) && (
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-coffee-900 truncate">{user.username}</p>
                  <p className="text-[9px] text-coffee-400 uppercase font-bold tracking-wider truncate">{user.role}</p>
                </div>
              )}
            </div>
            {(!isCollapsed || isMobile) && (
              <button 
                onClick={handleLogout}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                title="Keluar"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>

          {/* Collapse Toggle */}
          <button 
            onClick={toggleSidebar}
            className="hidden lg:flex w-full items-center justify-center p-2 text-coffee-300 hover:text-coffee-600 dark:hover:text-coffee-400 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white/90 dark:bg-coffee-900/90 backdrop-blur-2xl border-b border-coffee-100 dark:border-coffee-800 flex items-center justify-between px-6 z-[100] no-print safe-top shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-coffee-700 p-2.5 rounded-2xl shadow-xl shadow-coffee-900/30">
            {appSettings.app_logo_url ? (
              <img src={appSettings.app_logo_url} alt="Logo" className="w-6 h-6 object-contain" />
            ) : (
              <Coffee className="text-white w-6 h-6" size={24} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-display text-coffee-950 dark:text-coffee-100 text-xl tracking-tighter leading-none">
              {appSettings.app_name}
            </span>
            <span className="text-[9px] font-sans font-black text-coffee-400 uppercase tracking-[0.2em] mt-1">Premium POS</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-4 text-coffee-400 hover:text-coffee-950 dark:hover:text-coffee-100 transition-colors relative bg-coffee-50 dark:bg-coffee-800 rounded-2xl active:scale-90"
          >
            <Bell size={24} />
            {notifications.length > 0 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-accent-500 rounded-full border-2 border-white dark:border-coffee-950" />
            )}
          </button>
        </div>

        {/* Mobile Notifications Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed top-16 right-4 w-[calc(100vw-32px)] max-w-80 bg-white dark:bg-coffee-900 rounded-2xl shadow-2xl border border-coffee-100 dark:border-coffee-800 overflow-hidden z-[150]"
            >
              <div className="p-4 border-b border-coffee-50 dark:border-coffee-800 bg-coffee-50/50 dark:bg-coffee-800/50 flex justify-between items-center">
                <h4 className="font-bold text-coffee-950 dark:text-coffee-100">Notifikasi</h4>
                <button 
                  onClick={() => setNotifications([])}
                  className="text-[10px] font-bold text-coffee-500 uppercase hover:text-rose-500 transition-colors"
                >
                  Hapus Semua
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-coffee-400">
                    <Bell size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs">Belum ada notifikasi</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="p-4 border-b border-coffee-50 dark:border-coffee-800 hover:bg-coffee-50/50 dark:hover:bg-coffee-800/50 transition-colors flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Check size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-coffee-900 dark:text-coffee-300 leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] text-coffee-400 mt-1 font-medium">{notif.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 mobile-bottom-nav-height bg-white/90 dark:bg-coffee-900/90 backdrop-blur-2xl border-t border-coffee-100 dark:border-coffee-800 flex items-center justify-around px-2 z-[100] no-print safe-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        {[
          { id: 'orders', label: t('orders'), icon: ShoppingCart },
          { id: 'queue', label: t('queue'), icon: Clock },
          { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, adminOnly: true },
          { id: 'reports', label: t('reports'), icon: Calendar },
          { id: 'more', label: 'Menu', icon: MenuIcon, isMore: true }
        ].map((item) => {
          if (item.adminOnly && user.role !== 'admin') return null;
          
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isMore) {
                  toggleMobile();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all relative active:scale-90",
                isActive ? "text-coffee-950 dark:text-coffee-100" : "text-coffee-300 dark:text-coffee-600"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-2xl transition-all duration-300",
                isActive ? "bg-coffee-700 text-white shadow-lg shadow-coffee-900/20 scale-110 -translate-y-1" : "hover:bg-coffee-50 dark:hover:bg-coffee-800"
              )}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[11px] font-sans font-bold uppercase tracking-tighter transition-all duration-300",
                isActive ? "opacity-100 translate-y-0" : "opacity-60 translate-y-0.5"
              )}>
                {item.label}
              </span>
              
              {/* Badges */}
              {item.id === 'orders' && cart.length > 0 && (
                <span className="absolute top-2 right-1/4 bg-accent-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white dark:border-coffee-950 shadow-lg">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
              {item.id === 'queue' && activeOrders.length > 0 && (
                <span className="absolute top-2 right-1/4 bg-coffee-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white dark:border-coffee-950 shadow-lg">
                  {activeOrders.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:block sticky left-0 top-0 bottom-0 h-screen z-[100] transition-all duration-300 no-print shrink-0",
        isCollapsed ? "w-20" : "w-72"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobile}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] lg:hidden"
            />
            <motion.aside 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 right-0 bottom-0 h-[85vh] bg-white rounded-t-[40px] z-[120] lg:hidden overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
            >
              <div className="w-12 h-1.5 bg-coffee-100 rounded-full mx-auto mt-4 mb-2" />
              <SidebarContent isMobile={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Spacing for Main Content */}
      <div className={cn(
        "transition-all duration-300",
        isMobileOpen ? "overflow-hidden" : ""
      )} />
    </>
  );
};

export default Sidebar;
