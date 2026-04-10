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
  Star,
  Calendar,
  Truck,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
  X
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-coffee-100 dark:border-zinc-800 transition-all duration-300">
      {/* Logo Section */}
      <div className={cn(
        "p-6 flex items-center gap-3 border-b border-coffee-50 dark:border-zinc-900",
        isCollapsed ? "justify-center" : "justify-start"
      )}>
        <div className={cn(
          "flex items-center justify-center shrink-0",
          appSettings.app_logo_url ? "" : "bg-coffee-900 p-2 rounded-2xl shadow-lg shadow-coffee-200 dark:shadow-none"
        )}>
          {appSettings.app_logo_url ? (
            <img src={appSettings.app_logo_url} alt="Logo" className="w-8 h-8 object-contain" />
          ) : (
            <ShoppingCart className="text-white w-5 h-5" size={20} />
          )}
        </div>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-serif font-black text-coffee-950 dark:text-zinc-100 text-xl tracking-tight truncate"
          >
            {appSettings.app_name}
          </motion.span>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
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
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all relative group",
                isActive 
                  ? "bg-coffee-900 text-white shadow-lg shadow-coffee-200 dark:shadow-none" 
                  : "text-coffee-400 dark:text-zinc-500 hover:bg-coffee-50 dark:hover:bg-zinc-900 hover:text-coffee-900 dark:hover:text-zinc-100"
              )}
              title={isCollapsed ? item.label : ""}
            >
              <item.icon size={20} className={cn("shrink-0", isActive ? "text-white" : "text-coffee-400 dark:text-zinc-500 group-hover:text-coffee-900 dark:group-hover:text-zinc-100")} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
              
              {/* Badges */}
              {item.id === 'orders' && cart.length > 0 && (
                <span className={cn(
                  "absolute bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-black transition-all",
                  isCollapsed ? "top-2 right-2 w-4 h-4" : "right-4 w-5 h-5"
                )}>
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
              
              {item.id === 'queue' && activeOrders.length > 0 && (
                <span className={cn(
                  "absolute bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center font-black transition-all",
                  isCollapsed ? "top-2 right-2 w-4 h-4" : "right-4 w-5 h-5"
                )}>
                  {activeOrders.length}
                </span>
              )}

              {isActive && !isCollapsed && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-coffee-50 dark:border-zinc-900 space-y-4">
        {/* Quick Actions */}
        <div className={cn(
          "flex items-center gap-1 bg-coffee-50 dark:bg-zinc-900/50 p-1 rounded-2xl",
          isCollapsed ? "flex-col" : "flex-row justify-around"
        )}>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-coffee-400 hover:text-coffee-900 dark:hover:text-zinc-100 transition-colors rounded-xl hover:bg-white dark:hover:bg-zinc-800"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} />
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-coffee-400 hover:text-coffee-900 dark:hover:text-zinc-100 transition-colors rounded-xl hover:bg-white dark:hover:bg-zinc-800"
            title="Toggle Theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "p-2 rounded-xl transition-all relative hover:bg-white dark:hover:bg-zinc-800",
              showNotifications ? "text-coffee-900 dark:text-zinc-100 bg-white dark:bg-zinc-800" : "text-coffee-400 hover:text-coffee-900 dark:hover:text-zinc-100"
            )}
            title="Notifikasi"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-zinc-950" />
            )}
          </button>
          {!isCollapsed && (
            <button 
              onClick={toggleFullscreen}
              className="p-2 text-coffee-400 hover:text-coffee-900 dark:hover:text-zinc-100 transition-colors rounded-xl hover:bg-white dark:hover:bg-zinc-800"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          )}
        </div>

        {/* Notifications Dropdown (Desktop) */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div 
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              className={cn(
                "absolute bottom-24 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-coffee-100 dark:border-zinc-800 overflow-hidden z-[150] w-80",
                isCollapsed ? "left-20" : "left-4"
              )}
            >
              <div className="p-4 border-b border-coffee-50 dark:border-zinc-800 bg-coffee-50/50 dark:bg-zinc-800/50 flex justify-between items-center">
                <h4 className="font-bold text-coffee-950 dark:text-zinc-100">Notifikasi</h4>
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
                    <div key={notif.id} className="p-4 border-b border-coffee-50 dark:border-zinc-800 hover:bg-coffee-50/50 dark:hover:bg-zinc-800/50 transition-colors flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Check size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-coffee-900 dark:text-zinc-300 leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] text-coffee-400 mt-1 font-medium">{notif.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-2xl bg-coffee-50/50 dark:bg-zinc-900/30 border border-coffee-50 dark:border-zinc-800",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-coffee-900 flex items-center justify-center text-white shrink-0 shadow-md shadow-coffee-200 dark:shadow-none">
              <User size={20} />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-coffee-950 dark:text-zinc-100 truncate">{user.username}</p>
                <p className="text-[10px] text-coffee-400 uppercase font-black tracking-widest truncate">{user.role}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button 
              onClick={handleLogout}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
              title="Keluar"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>

        {/* Collapse Toggle */}
        <button 
          onClick={toggleSidebar}
          className="hidden lg:flex w-full items-center justify-center p-2 text-coffee-300 hover:text-coffee-600 dark:hover:text-zinc-400 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-950 border-b border-coffee-100 dark:border-zinc-800 flex items-center justify-between px-4 z-[100] no-print">
        <div className="flex items-center gap-2">
          <div className="bg-coffee-900 p-1.5 rounded-xl">
            <ShoppingCart className="text-white w-4 h-4" size={16} />
          </div>
          <span className="font-serif font-black text-coffee-950 dark:text-zinc-100 text-lg tracking-tight">
            {appSettings.app_name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-coffee-400 relative"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-zinc-950" />
            )}
          </button>

          {/* Mobile Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="fixed top-16 right-4 w-[calc(100vw-32px)] max-w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-coffee-100 dark:border-zinc-800 overflow-hidden z-[150]"
              >
                <div className="p-4 border-b border-coffee-50 dark:border-zinc-800 bg-coffee-50/50 dark:bg-zinc-800/50 flex justify-between items-center">
                  <h4 className="font-bold text-coffee-950 dark:text-zinc-100">Notifikasi</h4>
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
                      <div key={notif.id} className="p-4 border-b border-coffee-50 dark:border-zinc-800 hover:bg-coffee-50/50 dark:hover:bg-zinc-800/50 transition-colors flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Check size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-coffee-900 dark:text-zinc-300 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-coffee-400 mt-1 font-medium">{notif.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={toggleMobile}
            className="p-2 text-coffee-900 dark:text-zinc-100"
          >
            {isMobileOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

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
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-[120] lg:hidden"
            >
              <SidebarContent />
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
