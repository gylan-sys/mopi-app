import React from 'react';
import { motion } from 'motion/react';
import { 
  RefreshCw, Clock, Check, ShoppingBag, Store, Trash2, 
  MapPin, Edit, X, Info, ImageIcon, CheckCircle2, Truck 
} from 'lucide-react';
import { formatDate } from '../utils';
import { cn } from '../types';

interface QueueTabProps {
  activeOrders: any[];
  fetchActiveOrders: () => void;
  handleDeleteOrder: (orderId: string) => void;
  handleDeleteItem: (itemId: number) => void;
  handleConfirmPayment: (orderId: string) => void;
  handleCompleteOrder: (orderId: string) => void;
  handleUpdateOrderStatus: (orderId: string, status: string) => void;
  setCart: (cart: any[]) => void;
  setCustomerName: (name: string) => void;
  setTableNumber: (num: string) => void;
  setCurrentOrderId: (id: string | null) => void;
  setPaymentMethod: (method: string) => void;
  setShowPaymentModal: (show: boolean) => void;
  setEditingItem: (item: any) => void;
  setShowEditItemModal: (show: boolean) => void;
  t: (key: string) => string;
}

const QueueTab: React.FC<QueueTabProps> = ({
  activeOrders,
  fetchActiveOrders,
  handleDeleteOrder,
  handleDeleteItem,
  handleConfirmPayment,
  handleCompleteOrder,
  handleUpdateOrderStatus,
  setCart,
  setCustomerName,
  setTableNumber,
  setCurrentOrderId,
  setPaymentMethod,
  setShowPaymentModal,
  setEditingItem,
  setShowEditItemModal,
  t
}) => {
  return (
    <motion.div 
      key="queue"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-32 md:pb-8"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 safe-top">
        <div>
          <p className="text-coffee-400 font-sans font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Antrian Pesanan</p>
          <h2 className="text-4xl font-serif text-coffee-950 tracking-tight">
            Pesanan <span className="text-coffee-400">Diproses</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchActiveOrders}
            className="p-3.5 bg-white border border-coffee-100 text-coffee-600 rounded-2xl hover:bg-coffee-50 transition-all shadow-sm active:scale-95"
            title="Refresh Antrian"
          >
            <RefreshCw size={20} />
          </button>
          <div className="bg-coffee-700 text-white px-6 py-3.5 rounded-2xl text-[10px] font-sans font-bold uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-coffee-700/20 premium-shadow">
            <Clock size={18} className="text-coffee-400" />
            {activeOrders.length} Pesanan Menunggu
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeOrders.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center">
            <div className="w-20 h-20 bg-coffee-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-coffee-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-coffee-950 mb-2">Semua Pesanan Selesai!</h3>
            <p className="text-coffee-500">Belum ada pesanan baru yang masuk ke antrian.</p>
          </div>
        ) : (
          activeOrders.map(order => (
            <div key={order.orderId} className="glass-card overflow-hidden border-l-4 border-l-amber-500">
              <div className="p-6 bg-coffee-50 border-b border-coffee-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white",
                    order.source === 'GrabFood' ? "bg-emerald-500" :
                    order.source === 'GoFood' ? "bg-rose-500" :
                    order.source === 'ShopeeFood' ? "bg-orange-500" :
                    "bg-coffee-900"
                  )}>
                    {order.source === 'GrabFood' ? <ShoppingBag size={20} /> :
                     order.source === 'GoFood' ? <ShoppingBag size={20} /> :
                     order.source === 'ShopeeFood' ? <ShoppingBag size={20} /> :
                     <Store size={20} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-coffee-400">Order ID</p>
                    <div className="flex items-center gap-2">
                      <h4 className="font-mono font-bold text-coffee-950">{order.displayId || order.orderId}</h4>
                      <button 
                        onClick={() => handleDeleteOrder(order.orderId)}
                        className="text-rose-400 hover:text-rose-600 transition-colors"
                        title="Batalkan Pesanan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-coffee-400">Customer</p>
                    <h4 className="font-bold text-coffee-950">{order.customerName} {order.tableNumber && `(Meja ${order.tableNumber})`}</h4>
                    <div className="flex flex-col items-end gap-1 mt-1">
                      {order.status === 'pending' && (
                        <span className="inline-block bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Belum Bayar
                        </span>
                      )}
                      {order.status === 'processing' && (
                        <span className="inline-block bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Sudah Bayar
                        </span>
                      )}
                      {order.status === 'awaiting_confirmation' && (
                        <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          Menunggu Konfirmasi
                        </span>
                      )}
                      <span className="inline-block bg-coffee-50 text-coffee-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {order.paymentMethod || 'Tunai'}
                      </span>
                      {order.deliveryMethod === 'delivery' && (
                        <span className={cn(
                          "inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          order.deliveryStatus === 'ready_for_pickup' ? "bg-blue-100 text-blue-700" :
                          order.deliveryStatus === 'out_for_delivery' ? "bg-purple-100 text-purple-700" :
                          order.deliveryStatus === 'delivered' ? "bg-emerald-100 text-emerald-700" :
                          "bg-amber-100 text-amber-700"
                        )}>
                          Delivery: {t(order.deliveryStatus || 'pending')}
                        </span>
                      )}
                    </div>
                  </div>
              </div>
              <div className="p-6 space-y-4">
                {order.deliveryMethod === 'delivery' && order.deliveryAddress && (
                  <div className="bg-coffee-50 p-3 rounded-xl border border-coffee-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-coffee-400 mb-1 flex items-center gap-1">
                      <MapPin size={10} /> Alamat Pengiriman
                    </p>
                    <p className="text-xs text-coffee-900 font-medium">{order.deliveryAddress}</p>
                  </div>
                )}
                <div className="space-y-2">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-coffee-50 last:border-0 group/item">
                      <div className="flex flex-col">
                        <span className="text-coffee-900 font-medium">{item.name}</span>
                        {(item.sugarLevel || item.iceLevel) && (
                          <span className="text-[10px] text-coffee-400 font-bold uppercase">
                            {item.sugarLevel && `${item.sugarLevel} Sugar`}
                            {item.sugarLevel && item.iceLevel && ' • '}
                            {item.iceLevel && `${item.iceLevel} Ice`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditingItem({
                                id: item.id,
                                name: item.name,
                                quantity: item.quantity,
                                sugarLevel: item.sugarLevel || 'Normal',
                                iceLevel: item.iceLevel || 'Normal',
                                notes: item.notes || ''
                              });
                              setShowEditItemModal(true);
                            }}
                            className="p-1 text-coffee-400 hover:text-coffee-600 transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-rose-300 hover:text-rose-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <span className="bg-coffee-100 text-coffee-700 px-2 py-1 rounded-lg text-xs font-bold">x{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {order.notes && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1 flex items-center gap-1">
                      <Info size={10} /> Catatan
                    </p>
                    <p className="text-xs text-amber-900 italic">"{order.notes}"</p>
                  </div>
                )}
                {order.proofOfPaymentUrl && (
                  <a 
                    href={order.proofOfPaymentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-xs font-black hover:bg-emerald-100 transition-all"
                  >
                    <ImageIcon size={16} />
                    LIHAT BUKTI BAYAR
                  </a>
                )}
                <div className="flex items-center gap-2 text-[10px] text-coffee-400 font-bold uppercase tracking-wider mb-4">
                  <Clock size={12} />
                  Dipesan pada {formatDate(new Date(order.date), 'HH:mm')}
                </div>
                {(order.status === 'pending' || order.status === 'awaiting_confirmation') && (
                  <div className="flex flex-col gap-2">
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => {
                          // Load order into cart and open payment
                          fetch(`/api/orders/${order.orderId}`)
                            .then(res => res.json())
                            .then(data => {
                              setCart(data.items);
                              setCustomerName(data.customerName || '');
                              setTableNumber(data.tableNumber || '');
                              setCurrentOrderId(order.orderId);
                              setPaymentMethod(data.paymentMethod || 'Tunai');
                              setShowPaymentModal(true);
                            });
                        }}
                        className="w-full bg-coffee-100 text-coffee-700 py-3 rounded-xl font-bold hover:bg-coffee-200 transition-all flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Edit & Bayar
                      </button>
                    )}
                    <button 
                      onClick={() => handleConfirmPayment(order.orderId)}
                      className={cn(
                        "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
                        order.status === 'awaiting_confirmation' 
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100" 
                          : "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-100"
                      )}
                    >
                      <CheckCircle2 size={18} />
                      {order.status === 'awaiting_confirmation' ? 'Konfirmasi Pembayaran' : 'Konfirmasi & Selesaikan'}
                    </button>
                  </div>
                )}
                {order.status === 'processing' && (
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        if (order.deliveryMethod === 'delivery' && order.deliveryStatus !== 'ready_for_pickup') {
                          handleUpdateOrderStatus(order.orderId, 'ready_for_pickup');
                        } else {
                          handleCompleteOrder(order.orderId);
                        }
                      }}
                      className={cn(
                        "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
                        order.deliveryMethod === 'delivery' && order.deliveryStatus !== 'ready_for_pickup'
                          ? "bg-amber-600 text-white hover:bg-amber-700 shadow-amber-100"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100"
                      )}
                    >
                      <CheckCircle2 size={18} />
                      {order.deliveryMethod === 'delivery' && order.deliveryStatus !== 'ready_for_pickup' ? 'Siap Dijemput' : 'Selesaikan'}
                    </button>
                    
                    {order.deliveryMethod === 'delivery' && order.deliveryStatus === 'ready_for_pickup' && (
                      <div className="w-full bg-blue-50 text-blue-700 py-3 rounded-xl font-bold text-center text-xs flex items-center justify-center gap-2 border border-blue-100">
                        <Clock size={16} className="animate-pulse" /> Menunggu Driver
                      </div>
                    )}
                    
                    {order.deliveryMethod === 'delivery' && order.deliveryStatus === 'out_for_delivery' && (
                      <div className="w-full bg-purple-50 text-purple-700 py-3 rounded-xl font-bold text-center text-xs flex items-center justify-center gap-2 border border-purple-100">
                        <Truck size={16} className="animate-bounce" /> Sedang Diantar
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default QueueTab;
