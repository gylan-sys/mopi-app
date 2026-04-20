import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChefHat, 
  Timer,
  Check,
  Play,
  Pause,
  Printer
} from 'lucide-react';
import { cn } from '../types';
import { formatDate } from '../utils';

interface KitchenTabProps {
  activeOrders: any[];
  handleUpdateOrderStatus: (orderId: string, status: 'pending' | 'preparing' | 'ready' | 'completed') => void;
  handleReprint: (orderId: string) => void;
}

const OrderCard = ({ 
  order, 
  handleUpdateOrderStatus, 
  handleReprint 
}: { 
  order: any; 
  handleUpdateOrderStatus: (orderId: string, status: 'pending' | 'preparing' | 'ready' | 'completed') => void;
  handleReprint: (orderId: string) => void;
}) => {
  const timeInQueue = Math.floor((new Date().getTime() - new Date(order.date).getTime()) / 60000);
  const isUrgent = timeInQueue > 15;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "glass-card p-0 overflow-hidden border-2 flex flex-col h-full",
        order.status === 'preparing' ? "border-amber-500 shadow-amber-100" : 
        order.status === 'ready' ? "border-emerald-500 shadow-emerald-100" :
        "border-coffee-100"
      )}
    >
      <div className={cn(
        "p-4 flex justify-between items-center",
        order.status === 'preparing' ? "bg-amber-50" : 
        order.status === 'ready' ? "bg-emerald-50" :
        "bg-coffee-50"
      )}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-coffee-950">#{order.id.slice(-4)}</span>
            {order.table_number && (
              <span className="px-2 py-0.5 bg-coffee-900 text-white text-[10px] font-black rounded-lg">
                MEJA {order.table_number}
              </span>
            )}
          </div>
          <p className="text-[10px] font-bold text-coffee-500 mt-1">{order.customer_name || 'Umum'}</p>
        </div>
        <div className="text-right">
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black",
            isUrgent ? "text-rose-500" : "text-coffee-400"
          )}>
            <Timer size={12} />
            {timeInQueue}m
          </div>
          <p className="text-[10px] text-coffee-400">{formatDate(new Date(order.date), 'HH:mm')}</p>
        </div>
      </div>

      <div className="p-4 flex-1 space-y-3 overflow-y-auto custom-scrollbar">
        {order.items.map((item: any, idx: number) => (
          <div key={idx} className="flex gap-3">
            <div className="w-6 h-6 rounded-lg bg-coffee-100 flex items-center justify-center text-coffee-900 text-xs font-black shrink-0">
              {item.quantity}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-coffee-950 leading-tight">{item.menu.name}</p>
              {(item.sugarLevel || item.iceLevel) && (
                <div className="flex gap-2 mt-1">
                  {item.sugarLevel && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-bold">
                      {item.sugarLevel}
                    </span>
                  )}
                  {item.iceLevel && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-bold">
                      {item.iceLevel}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-coffee-50 grid grid-cols-2 gap-2">
        {order.status === 'pending' && (
          <button
            onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
            className="col-span-2 flex items-center justify-center gap-2 bg-amber-500 text-white py-2.5 rounded-xl font-black text-xs hover:bg-amber-600 transition-all active:scale-95"
          >
            <Play size={14} />
            MULAI MASAK
          </button>
        )}
        {order.status === 'preparing' && (
          <>
            <button
              onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
              className="col-span-2 flex items-center justify-center gap-2 bg-emerald-500 text-white py-2.5 rounded-xl font-black text-xs hover:bg-emerald-600 transition-all active:scale-95"
            >
              <CheckCircle2 size={14} />
              SIAP SAJI
            </button>
          </>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
            className="col-span-2 flex items-center justify-center gap-2 bg-coffee-900 text-white py-2.5 rounded-xl font-black text-xs hover:bg-coffee-950 transition-all active:scale-95"
          >
            <Check size={14} />
            SELESAI / DIAMBIL
          </button>
        )}
        <button
          onClick={() => handleReprint(order.id)}
          className="flex items-center justify-center gap-2 bg-coffee-50 text-coffee-600 py-2 rounded-xl font-bold text-[10px] hover:bg-coffee-100 transition-all"
        >
          <Printer size={12} />
          STRUK
        </button>
        {order.status === 'preparing' && (
          <button
            onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
            className="flex items-center justify-center gap-2 bg-rose-50 text-rose-500 py-2 rounded-xl font-bold text-[10px] hover:bg-rose-100 transition-all"
          >
            <Pause size={12} />
            TUNDA
          </button>
        )}
      </div>
    </motion.div>
  );
};

const KitchenTab: React.FC<KitchenTabProps> = ({
  activeOrders,
  handleUpdateOrderStatus,
  handleReprint
}) => {
  const preparingOrders = activeOrders.filter(o => o.status === 'preparing');
  const pendingOrders = activeOrders.filter(o => o.status === 'pending');
  const readyOrders = activeOrders.filter(o => o.status === 'ready');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-coffee-400 font-sans font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-2">Kitchen Display System</p>
          <h2 className="text-3xl sm:text-4xl font-serif text-coffee-950 tracking-tight flex items-center gap-4">
            <ChefHat size={32} className="text-coffee-400" />
            Dapur <span className="text-coffee-400">MOPI</span>
          </h2>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4 bg-amber-50/50 border-amber-100 shadow-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-sans font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20">
              {preparingOrders.length}
            </div>
            <span className="text-[9px] sm:text-[10px] font-sans font-bold text-amber-900 uppercase tracking-widest">Sedang Dibuat</span>
          </div>
          <div className="glass-card px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4 bg-emerald-50/50 border-emerald-100 shadow-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-sans font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20">
              {readyOrders.length}
            </div>
            <span className="text-[9px] sm:text-[10px] font-sans font-bold text-emerald-900 uppercase tracking-widest">Siap Saji</span>
          </div>
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {activeOrders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 flex flex-col items-center justify-center text-center"
            >
              <div className="bg-coffee-50 p-8 rounded-full mb-4">
                <ChefHat size={64} className="text-coffee-200" />
              </div>
              <h3 className="text-xl font-serif font-bold text-coffee-950">Belum Ada Pesanan</h3>
              <p className="text-coffee-500 mt-2">Dapur sedang santai. Semua pesanan sudah selesai!</p>
            </motion.div>
          ) : (
            activeOrders
              .sort((a, b) => {
                // Sort by status priority then by date
                const statusPriority = { 'preparing': 0, 'pending': 1, 'ready': 2, 'completed': 3 };
                if (statusPriority[a.status as keyof typeof statusPriority] !== statusPriority[b.status as keyof typeof statusPriority]) {
                  return statusPriority[a.status as keyof typeof statusPriority] - statusPriority[b.status as keyof typeof statusPriority];
                }
                return new Date(a.date).getTime() - new Date(b.date).getTime();
              })
              .map(order => (
                <motion.div 
                  key={order.id} 
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
                  }}
                  className="h-full"
                >
                  <OrderCard 
                    order={order} 
                    handleUpdateOrderStatus={handleUpdateOrderStatus}
                    handleReprint={handleReprint}
                  />
                </motion.div>
              ))
          )}
        </AnimatePresence>
      </motion.div>

      <div className="glass-card p-8 bg-coffee-950 text-white border-none shadow-2xl shadow-coffee-950/20 premium-shadow">
        <div className="flex items-center gap-4 mb-6">
          <AlertCircle className="text-amber-400" size={24} />
          <h4 className="font-serif text-xl">Panduan Dapur</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[11px] sm:text-xs font-sans font-bold uppercase tracking-widest text-coffee-300">
          <div className="flex gap-4 items-center">
            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <p>Klik <strong className="text-white">Mulai Masak</strong> untuk pesanan baru.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <p>Klik <strong className="text-white">Siap Saji</strong> jika pesanan sudah matang.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-2 h-2 rounded-full bg-coffee-600 shrink-0" />
            <p>Klik <strong className="text-white">Selesai</strong> setelah pesanan diserahkan.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default KitchenTab;
