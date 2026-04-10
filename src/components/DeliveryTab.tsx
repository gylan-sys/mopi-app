import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Truck, Globe, ArrowRight, User } from 'lucide-react';
import DriverMap from './DriverMap';
import { cn } from '../types';

interface DeliveryTabProps {
  fetchData: () => void;
  drivers: any[];
  appSettings: any;
  setActiveTab: (tab: string) => void;
  setUsersSubTab: (tab: string) => void;
  activeOrders: any[];
  t: (key: string) => string;
}

const DeliveryTab: React.FC<DeliveryTabProps> = ({
  fetchData,
  drivers,
  appSettings,
  setActiveTab,
  setUsersSubTab,
  activeOrders,
  t
}) => {
  return (
    <motion.div 
      key="delivery"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="flex justify-between items-center">
        <div>
          <p className="text-coffee-500 font-medium uppercase tracking-widest text-xs mb-1">Layanan Antar</p>
          <h2 className="text-4xl font-serif font-bold text-coffee-950">Delivery & Driver</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-3 bg-coffee-100 text-coffee-600 rounded-2xl hover:bg-coffee-200 transition-all"
          >
            <RefreshCw size={20} />
          </button>
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <Truck size={16} />
            {drivers.filter(d => d.work_status === 'online').length} Driver Online
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Driver Monitoring Map */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-coffee-100 p-2 rounded-xl text-coffee-900">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-coffee-950">Monitoring Driver</h3>
                <p className="text-xs text-coffee-500 font-medium">Posisi real-time driver yang sedang aktif</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setActiveTab('users');
                setUsersSubTab('driver');
              }}
              className="text-[10px] font-bold text-coffee-500 uppercase hover:text-coffee-900 transition-colors flex items-center gap-1"
            >
              Kelola Driver <ArrowRight size={12} />
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-coffee-100 shadow-inner h-[500px]">
            <DriverMap 
              drivers={drivers} 
              merchantLocation={[Number(appSettings.merchant_lat || -6.2), Number(appSettings.merchant_lng || 106.816)]}
            />
          </div>
        </motion.div>

        {/* Delivery Orders Summary */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-serif font-bold mb-6">Pesanan Delivery Aktif</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-coffee-50 text-coffee-500 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Alamat</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-50">
                {activeOrders.filter(o => o.deliveryMethod === 'delivery').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-coffee-400 italic">
                      Tidak ada pesanan delivery aktif saat ini.
                    </td>
                  </tr>
                ) : (
                  activeOrders.filter(o => o.deliveryMethod === 'delivery').map(order => (
                    <tr key={order.orderId} className="hover:bg-coffee-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold">#{order.displayId || order.orderId.slice(-4)}</td>
                      <td className="px-6 py-4 font-bold">{order.customerName}</td>
                      <td className="px-6 py-4 text-xs max-w-xs truncate">{order.deliveryAddress}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          order.deliveryStatus === 'ready_for_pickup' ? "bg-blue-100 text-blue-700" :
                          order.deliveryStatus === 'out_for_delivery' ? "bg-purple-100 text-purple-700" :
                          "bg-amber-100 text-amber-700"
                        )}>
                          {t(order.deliveryStatus || 'pending')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.driverId ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-coffee-100 rounded-full flex items-center justify-center text-coffee-600">
                              <User size={12} />
                            </div>
                            <span className="text-xs font-bold">{drivers.find(d => d.id === order.driverId)?.full_name || 'Driver'}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-coffee-300 italic">Belum ada driver</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DeliveryTab;
