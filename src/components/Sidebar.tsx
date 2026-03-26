import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Clock, 
  Calendar, 
  ArrowDownLeft, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  UtensilsCrossed,
  Star,
  Sun,
  Moon,
  Keyboard,
  RefreshCw,
  Lock,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  cart: any[];
  activeOrders: any[];
  isReportsOpen: boolean;
  setIsReportsOpen: (open: boolean) => void;
  isInventoryOpen: boolean;
  setIsInventoryOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  reportSubTab: string;
  setReportSubTab: (tab: string) => void;
  invCategoryFilter: string;
  setInvCategoryFilter: (filter: any) => void;
  appSettings: any;
  t: (key: string) => string;
  IconComponent: any;
  handleLogout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  setShowShortcuts: (show: boolean) => void;
  handleRefresh: () => void;
  isRefreshing: boolean;
  setShowPasswordModal: (show: boolean) => void;
  stats: any;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  cart,
  activeOrders,
  isReportsOpen,
  setIsReportsOpen,
  isInventoryOpen,
  setIsInventoryOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  reportSubTab,
  setReportSubTab,
  invCategoryFilter,
  setInvCategoryFilter,
  appSettings,
  t,
  IconComponent,
  handleLogout,
  darkMode,
  setDarkMode,
  setShowShortcuts,
  handleRefresh,
  isRefreshing,
  setShowPasswordModal,
  stats
}) => {
  return (
    <nav className="hidden md:flex w-64 bg-white dark:bg-zinc-900 border-r border-coffee-200 dark:border-zinc-800 p-6 flex-col gap-8 h-screen sticky top-0 no-print overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-4 px-2 mb-4">
        <div className={cn(
          "flex items-center justify-center",
          appSettings.app_logo_url ? "" : "bg-coffee-900 p-2.5 rounded-2xl shadow-md"
        )}>
          {appSettings.app_logo_url ? (
            <img src={appSettings.app_logo_url} alt="Logo" className="w-14 h-14 object-contain" />
          ) : (
            <IconComponent className="text-white w-8 h-8" size={32} />
          )}
        </div>
        <span className="font-serif font-bold text-coffee-950 dark:text-zinc-100 text-xl truncate tracking-tight">{appSettings.app_name}</span>
      </div>

      <div className="flex flex-col gap-2 flex-1 pr-2">
        {user.role === 'admin' && (
          <button 
            onClick={() => {
              setActiveTab('dashboard');
              setIsInventoryOpen(false);
              setIsReportsOpen(false);
              setIsSettingsOpen(false);
            }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
              activeTab === 'dashboard' ? "bg-coffee-600 text-white shadow-lg shadow-coffee-200 dark:shadow-none" : "text-coffee-600 dark:text-zinc-400 hover:bg-coffee-100 dark:hover:bg-zinc-800"
            )}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">{t('dashboard')}</span>
          </button>
        )}
        
        <button 
          onClick={() => {
            setActiveTab('orders');
            setIsInventoryOpen(false);
            setIsReportsOpen(false);
            setIsSettingsOpen(false);
          }}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 relative",
            activeTab === 'orders' ? "bg-coffee-600 text-white shadow-lg shadow-coffee-200 dark:shadow-none" : "text-coffee-600 dark:text-zinc-400 hover:bg-coffee-100 dark:hover:bg-zinc-800"
          )}
        >
          <ShoppingCart size={20} />
          <span className="font-medium">{t('orders')}</span>
          {cart.length > 0 && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>

        <button 
          onClick={() => {
            setActiveTab('queue');
            setIsInventoryOpen(false);
            setIsReportsOpen(false);
            setIsSettingsOpen(false);
          }}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 relative",
            activeTab === 'queue' ? "bg-coffee-600 text-white shadow-lg shadow-coffee-200 dark:shadow-none" : "text-coffee-600 dark:text-zinc-400 hover:bg-coffee-100 dark:hover:bg-zinc-800"
          )}
        >
          <Clock size={20} />
          <span className="font-medium">{t('queue')}</span>
          {activeOrders.length > 0 && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {activeOrders.length}
            </span>
          )}
        </button>

        <div className="space-y-1">
          <button 
            onClick={() => {
              if (activeTab !== 'reports') {
                setActiveTab('reports');
                setIsReportsOpen(true);
                setIsInventoryOpen(false);
                setIsSettingsOpen(false);
              } else {
                setIsReportsOpen(!isReportsOpen);
              }
            }}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200",
              activeTab === 'reports' ? "bg-coffee-600 text-white shadow-lg shadow-coffee-200 dark:shadow-none" : "text-coffee-600 dark:text-zinc-400 hover:bg-coffee-100 dark:hover:bg-zinc-800"
            )}
          >
            <div className="flex items-center gap-3">
              <Calendar size={20} />
              <span className="font-medium">{t('reports')}</span>
            </div>
            <motion.div
              animate={{ rotate: isReportsOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowDownLeft size={14} className="rotate-45" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isReportsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden flex flex-col gap-1 pl-4"
              >
                <button
                  onClick={() => {
                    setActiveTab('reports');
                    setReportSubTab('transactions');
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all",
                    activeTab === 'reports' && reportSubTab === 'transactions' 
                      ? "bg-coffee-100 dark:bg-zinc-800 text-coffee-900 dark:text-zinc-100 font-bold" 
                      : "text-coffee-500 dark:text-zinc-400 hover:bg-coffee-50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    activeTab === 'reports' && reportSubTab === 'transactions' ? "bg-coffee-600" : "bg-coffee-200"
                  )} />
                  {t('transaction_report')}
                </button>
                {user.role === 'admin' && (
                  <>
                    <button
                      onClick={() => {
                        setActiveTab('reports');
                        setReportSubTab('financial');
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all",
                        activeTab === 'reports' && reportSubTab === 'financial' 
                          ? "bg-coffee-100 dark:bg-zinc-800 text-coffee-900 dark:text-zinc-100 font-bold" 
                          : "text-coffee-500 dark:text-zinc-400 hover:bg-coffee-50 dark:hover:bg-zinc-800/50"
                      )}
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        activeTab === 'reports' && reportSubTab === 'financial' ? "bg-coffee-600" : "bg-coffee-200 dark:bg-zinc-700"
                      )} />
                      {t('financial_report')}
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('transactions');
                        setIsReportsOpen(true);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all",
                        activeTab === 'transactions' 
                          ? "bg-coffee-100 dark:bg-zinc-800 text-coffee-900 dark:text-zinc-100 font-bold" 
                          : "text-coffee-500 dark:text-zinc-400 hover:bg-coffee-50 dark:hover:bg-zinc-800/50"
                      )}
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        activeTab === 'transactions' ? "bg-coffee-600" : "bg-coffee-200 dark:bg-zinc-700"
                      )} />
                      Semua Transaksi
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {user.role === 'admin' && (
          <div className="space-y-1">
            <button 
              onClick={() => {
                if (activeTab !== 'inventory') {
                  setActiveTab('inventory');
                  setIsInventoryOpen(true);
                  setIsReportsOpen(false);
                  setIsSettingsOpen(false);
                } else {
                  setIsInventoryOpen(!isInventoryOpen);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200",
                activeTab === 'inventory' ? "bg-coffee-600 text-white shadow-lg shadow-coffee-200 dark:shadow-none" : "text-coffee-600 dark:text-zinc-400 hover:bg-coffee-100 dark:hover:bg-zinc-800"
              )}
            >
              <div className="flex items-center gap-3">
                <Package size={20} />
                <span className="font-medium">{t('inventory')}</span>
              </div>
              <motion.div
                animate={{ rotate: isInventoryOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowDownLeft size={14} className="rotate-45" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isInventoryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex flex-col gap-1 pl-4"
                >
                  <button
                    onClick={() => {
                      setActiveTab('inventory');
                      setInvCategoryFilter('Semua');
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all",
                      activeTab === 'inventory' && invCategoryFilter === 'Semua' 
                        ? "bg-coffee-100 dark:bg-zinc-800 text-coffee-900 dark:text-zinc-100 font-bold" 
                        : "text-coffee-500 dark:text-zinc-400 hover:bg-coffee-50 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      activeTab === 'inventory' && invCategoryFilter === 'Semua' ? "bg-coffee-600" : "bg-coffee-200 dark:bg-zinc-700"
                    )} />
                    {t('all_inventory')}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('inventory');
                      setInvCategoryFilter('Bahan');
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all",
                      activeTab === 'inventory' && invCategoryFilter === 'Bahan' 
                        ? "bg-coffee-100 dark:bg-zinc-800 text-coffee-900 dark:text-zinc-100 font-bold" 
                        : "text-coffee-500 dark:text-zinc-400 hover:bg-coffee-50 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      activeTab === 'inventory' && invCategoryFilter === 'Bahan' ? "bg-coffee-600" : "bg-coffee-200 dark:bg-zinc-700"
                    )} />
                    {t('inventory_materials')}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('inventory');
                      setInvCategoryFilter('Alat');
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all",
                      activeTab === 'inventory' && invCategoryFilter === 'Alat' 
                        ? "bg-coffee-100 dark:bg-zinc-800 text-coffee-900 dark:text-zinc-100 font-bold" 
                        : "text-coffee-500 dark:text-zinc-400 hover:bg-coffee-50 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      activeTab === 'inventory' && invCategoryFilter === 'Alat' ? "bg-coffee-600" : "bg-coffee-200 dark:bg-zinc-700"
                    )} />
                    {t('inventory_tools')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {user.role === 'admin' && (
          <>
            <button 
              onClick={() => {
                setActiveTab('menu');
                setIsInventoryOpen(false);
                setIsReportsOpen(false);
                setIsSettingsOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                activeTab === 'menu' ? "bg-coffee-600 text-white shadow-lg shadow-coffee-200 dark:shadow-none" : "text-coffee-600 dark:text-zinc-400 hover:bg-coffee-100 dark:hover:bg-zinc-800"
              )}
            >
              <UtensilsCrossed size={20} />
              <span className="font-medium">{t('menu')}</span>
            </button>
            <button 
              onClick={() => {
                setActiveTab('users');
                setIsInventoryOpen(false);
                setIsReportsOpen(false);
                setIsSettingsOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                activeTab === 'users' ? "bg-coffee-600 text-white shadow-lg shadow-coffee-200 dark:shadow-none" : "text-coffee-600 dark:text-zinc-400 hover:bg-coffee-100 dark:hover:bg-zinc-800"
              )}
            >
              <User size={20} />
              <span className="font-medium">{t('users')}</span>
            </button>
            <button 
              onClick={() => {
                setActiveTab('loyalty');
                setIsInventoryOpen(false);
                setIsReportsOpen(false);
                setIsSettingsOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                activeTab === 'loyalty' ? "bg-coffee-600 text-white shadow-lg shadow-coffee-200 dark:shadow-none" : "text-coffee-600 dark:text-zinc-400 hover:bg-coffee-100 dark:hover:bg-zinc-800"
              )}
            >
              <Star size={20} />
              <span className="font-medium">Loyalty Program</span>
            </button>
            <button 
              onClick={() => {
                setActiveTab('settings');
                setIsInventoryOpen(false);
                setIsReportsOpen(false);
                setIsSettingsOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                activeTab === 'settings' ? "bg-coffee-600 text-white shadow-lg shadow-coffee-200 dark:shadow-none" : "text-coffee-600 dark:text-zinc-400 hover:bg-coffee-100 dark:hover:bg-zinc-800"
              )}
            >
              <Settings size={20} />
              <span className="font-medium">{t('settings')}</span>
            </button>

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-coffee-600 dark:text-zinc-400 hover:bg-coffee-100 dark:hover:bg-zinc-800"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span className="font-medium">{darkMode ? "Mode Terang" : "Mode Gelap"}</span>
            </button>

            <button 
              onClick={() => setShowShortcuts(true)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-coffee-600 dark:text-zinc-400 hover:bg-coffee-100 dark:hover:bg-zinc-800"
              title="Shortcut Keyboard"
            >
              <Keyboard size={20} />
              <span className="font-medium">{t('shortcuts')}</span>
            </button>

            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-coffee-600 dark:text-zinc-400 hover:bg-coffee-100 dark:hover:bg-zinc-800",
                isRefreshing && "opacity-50 cursor-not-allowed"
              )}
              title="Refresh Data"
            >
              <RefreshCw size={20} className={cn(isRefreshing && "animate-spin")} />
              <span className="font-medium">{isRefreshing ? "Memuat..." : "Refresh"}</span>
            </button>
          </>
        )}
      </div>

      <div className="pt-6 border-t border-coffee-100 dark:border-zinc-800 space-y-4">
        <div className="p-4 bg-coffee-100 dark:bg-zinc-800 rounded-3xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-coffee-900 dark:bg-zinc-700 flex items-center justify-center text-white font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-coffee-950 dark:text-zinc-100 truncate">{user.username}</p>
              <p className="text-[10px] font-bold text-coffee-50 text-coffee-500 uppercase tracking-widest">{user.role}</p>
            </div>
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="p-2 text-coffee-400 hover:text-coffee-900 dark:hover:text-zinc-100 transition-colors"
              title="Ganti Password"
            >
              <Lock size={16} />
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white dark:bg-zinc-900 text-rose-600 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all border border-rose-100 dark:border-rose-900/30"
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>

        <div className="p-4 bg-coffee-100 dark:bg-zinc-800 rounded-3xl">
          <p className="text-xs text-coffee-500 dark:text-zinc-400 uppercase tracking-wider font-bold mb-2">Status Stok</p>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", stats?.lowStock?.length ? "bg-red-500 animate-pulse" : "bg-green-500")} />
            <p className="text-sm font-medium text-coffee-800 dark:text-zinc-300">
              {stats?.lowStock?.length ? `${stats.lowStock.length} Item Menipis` : 'Stok Aman'}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
