import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  MapPin, 
  Package, 
  CheckCircle2, 
  LogOut, 
  Navigation, 
  Phone, 
  Clock,
  RefreshCw,
  AlertCircle,
  Power,
  User,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface DriverDashboardProps {
  onLogout: () => void;
  driver: { id: number; username: string; full_name: string };
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ onLogout, driver }) => {
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workStatus, setWorkStatus] = useState<'online' | 'offline'>('offline');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const watchId = useRef<number | null>(null);

  const fetchOrders = async () => {
    try {
      const [availableRes, myRes] = await Promise.all([
        fetch('/api/driver/available-orders'),
        fetch('/api/driver/my-orders')
      ]);
      
      if (availableRes.ok) setAvailableOrders(await availableRes.json());
      if (myRes.ok) setActiveOrders(await myRes.json());
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateLocation = async (lat: number, lng: number) => {
    try {
      await fetch('/api/driver/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng })
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const toggleWorkStatus = async () => {
    const newStatus = workStatus === 'online' ? 'offline' : 'online';
    
    if (newStatus === 'online') {
      if (!navigator.geolocation) {
        toast.error("Browser Anda tidak mendukung GPS");
        return;
      }

      toast.info("Mengaktifkan GPS...");
      
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lng: longitude });
          updateLocation(latitude, longitude);
        },
        (err) => {
          console.error(err);
          toast.error("Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.");
          setWorkStatus('offline');
        },
        { enableHighAccuracy: true }
      );
    } else {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    }

    try {
      const res = await fetch('/api/driver/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setWorkStatus(newStatus);
        toast.success(`Status Anda sekarang ${newStatus === 'online' ? 'Online' : 'Offline'}`);
      }
    } catch (error) {
      toast.error("Gagal memperbarui status");
    }
  };

  const takeOrder = async (orderId: string) => {
    if (workStatus === 'offline') {
      toast.error("Anda harus Online untuk mengambil pesanan");
      return;
    }

    try {
      const res = await fetch('/api/driver/take-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });
      
      if (res.ok) {
        toast.success("Pesanan berhasil diambil!");
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal mengambil pesanan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const completeDelivery = async (orderId: string) => {
    try {
      const res = await fetch('/api/driver/complete-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });
      
      if (res.ok) {
        toast.success("Pengiriman selesai!");
        fetchOrders();
      }
    } catch (error) {
      toast.error("Gagal menyelesaikan pengiriman");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-coffee-900 rounded-xl flex items-center justify-center text-white">
              <Truck size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{driver.full_name}</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Driver Partner</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Status Kerja</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${workStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                <span className="text-xl font-bold capitalize">{workStatus}</span>
              </div>
            </div>
            <button 
              onClick={toggleWorkStatus}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                workStatus === 'online' 
                ? 'bg-rose-50 text-rose-600 shadow-rose-100' 
                : 'bg-green-50 text-green-600 shadow-green-100'
              }`}
            >
              <Power size={28} />
            </button>
          </div>
          
          {workStatus === 'online' && location && (
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-500">
              <MapPin size={14} className="text-coffee-600" />
              <span>GPS Aktif: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
            </div>
          )}
        </motion.div>

        {/* Active Deliveries */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Pengiriman Aktif</h2>
            <span className="bg-coffee-100 text-coffee-900 text-xs font-bold px-2.5 py-1 rounded-full">
              {activeOrders.length}
            </span>
          </div>
          
          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-gray-200">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                  <Package size={24} />
                </div>
                <p className="text-sm text-gray-400">Belum ada pengiriman aktif</p>
              </div>
            ) : (
              activeOrders.map((order) => (
                <motion.div 
                  key={order.order_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-coffee-400 uppercase tracking-widest">#{order.display_id || order.order_id.slice(-4)}</span>
                      <h3 className="text-base font-bold text-gray-900 mt-0.5">{order.customer_name}</h3>
                    </div>
                    <div className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
                      Sedang Dikirim
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{order.delivery_address}</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.delivery_address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gray-900 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-gray-200"
                    >
                      <Navigation size={16} /> Navigasi
                    </a>
                    <button 
                      onClick={() => completeDelivery(order.order_id)}
                      className="flex-1 bg-green-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-green-100"
                    >
                      <CheckCircle2 size={16} /> Selesai
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Available Orders */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Orderan Tersedia</h2>
            <button 
              onClick={fetchOrders}
              className="p-2 text-coffee-600 hover:bg-coffee-50 rounded-xl transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {availableOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-gray-200">
                <p className="text-sm text-gray-400">Belum ada orderan baru di sekitar Anda</p>
              </div>
            ) : (
              availableOrders.map((order) => (
                <motion.div 
                  key={order.order_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 border-l-4 border-l-coffee-900"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] font-black text-coffee-400 uppercase tracking-widest">#{order.display_id || order.order_id.slice(-4)}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{format(new Date(order.date), 'HH:mm', { locale: id })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Ongkir</p>
                      <p className="text-sm font-black text-coffee-900">Rp {order.delivery_fee.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm text-gray-600 mb-4">
                    <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="line-clamp-2">{order.delivery_address}</p>
                  </div>

                  <button 
                    onClick={() => takeOrder(order.order_id)}
                    className="w-full bg-coffee-900 text-white rounded-xl py-3 font-bold text-sm shadow-lg shadow-coffee-100 hover:bg-coffee-800 transition-all"
                  >
                    Ambil Pesanan
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Bottom Nav (Optional) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center z-50">
        <button className="flex flex-col items-center gap-1 text-coffee-900">
          <Truck size={20} />
          <span className="text-[10px] font-bold uppercase">Tugas</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <Clock size={20} />
          <span className="text-[10px] font-bold uppercase">Riwayat</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <User size={20} />
          <span className="text-[10px] font-bold uppercase">Profil</span>
        </button>
      </div>
    </div>
  );
};

export default DriverDashboard;
