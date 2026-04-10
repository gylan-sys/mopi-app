import React from 'react';
import { motion } from 'motion/react';
import { 
  User, Truck, Plus, Search, Edit, Trash2, RefreshCw, MapPin 
} from 'lucide-react';
import { formatDate } from '../utils';
import { cn } from '../types';

interface UsersTabProps {
  usersSubTab: 'staff' | 'driver';
  setUsersSubTab: (tab: 'staff' | 'driver') => void;
  userSearch: string;
  setUserSearch: (search: string) => void;
  userFilter: 'all' | 'admin' | 'cashier';
  setUserFilter: (filter: 'all' | 'admin' | 'cashier') => void;
  userSort: 'username' | 'role';
  setUserSort: (sort: 'username' | 'role') => void;
  filteredUsers: any[];
  setEditingUserId: (id: string | null) => void;
  setNewUserData: (data: any) => void;
  setShowUserModal: (show: boolean) => void;
  handleDeleteUser: (id: string) => void;
  driverSearch: string;
  setDriverSearch: (search: string) => void;
  driverFilter: 'all' | 'active' | 'pending' | 'inactive';
  setDriverFilter: (filter: 'all' | 'active' | 'pending' | 'inactive') => void;
  driverSort: 'full_name' | 'status' | 'active_deliveries';
  setDriverSort: (sort: 'full_name' | 'status' | 'active_deliveries') => void;
  filteredDrivers: any[];
  setNewDriverData: (data: any) => void;
  setShowDriverModal: (show: boolean) => void;
  handleUpdateDriverStatus: (id: string, status: string) => void;
  handleDeleteDriver: (id: string) => void;
  fetchData: () => void;
  setSelectedDriver: (driver: any) => void;
  setShowDriverMap: (show: boolean) => void;
  t: (key: string) => string;
}

const UsersTab: React.FC<UsersTabProps> = ({
  usersSubTab,
  setUsersSubTab,
  userSearch,
  setUserSearch,
  userFilter,
  setUserFilter,
  userSort,
  setUserSort,
  filteredUsers,
  setEditingUserId,
  setNewUserData,
  setShowUserModal,
  handleDeleteUser,
  driverSearch,
  setDriverSearch,
  driverFilter,
  setDriverFilter,
  driverSort,
  setDriverSort,
  filteredDrivers,
  setNewDriverData,
  setShowDriverModal,
  handleUpdateDriverStatus,
  handleDeleteDriver,
  fetchData,
  setSelectedDriver,
  setShowDriverMap,
  t
}) => {
  return (
    <motion.div 
      key="users"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-coffee-500 font-medium uppercase tracking-widest text-xs mb-1">Pengaturan Sistem</p>
          <h2 className="text-4xl font-serif font-bold text-coffee-950">Manajemen Akun</h2>
        </div>
        <div className="flex bg-coffee-100 p-1 rounded-2xl">
          <button
            onClick={() => setUsersSubTab('staff')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
              usersSubTab === 'staff' 
                ? "bg-white text-coffee-900 shadow-sm" 
                : "text-coffee-500 hover:text-coffee-700"
            )}
          >
            <User size={16} />
            Staf
          </button>
          <button
            onClick={() => setUsersSubTab('driver')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
              usersSubTab === 'driver' 
                ? "bg-white text-coffee-900 shadow-sm" 
                : "text-coffee-500 hover:text-coffee-700"
            )}
          >
            <Truck size={16} />
            Driver
          </button>
        </div>
      </header>

      {usersSubTab === 'staff' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-coffee-950">Daftar Staf Kasir & Admin</h3>
            <button 
              onClick={() => {
                setEditingUserId(null);
                setNewUserData({ username: '', password: '', role: 'cashier' });
                setShowUserModal(true);
              }}
              className="bg-coffee-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
            >
              <Plus size={20} />
              <span className="font-bold">Tambah User</span>
            </button>
          </div>

          {/* Staff Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-coffee-100 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" size={18} />
              <input 
                type="text"
                placeholder="Cari nama user..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-coffee-50/50 border-none rounded-2xl focus:ring-2 focus:ring-coffee-200 transition-all text-sm"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <select 
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value as any)}
                className="flex-1 md:w-40 px-4 py-3 bg-coffee-50/50 border-none rounded-2xl focus:ring-2 focus:ring-coffee-200 text-sm font-bold text-coffee-700"
              >
                <option value="all">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="cashier">Kasir</option>
              </select>
              <select 
                value={userSort}
                onChange={(e) => setUserSort(e.target.value as any)}
                className="flex-1 md:w-40 px-4 py-3 bg-coffee-50/50 border-none rounded-2xl focus:ring-2 focus:ring-coffee-200 text-sm font-bold text-coffee-700"
              >
                <option value="username">Nama (A-Z)</option>
                <option value="role">Role</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-coffee-200">
                <User size={48} className="mx-auto mb-4 text-coffee-200" />
                <p className="text-coffee-400 italic">Tidak ada user yang ditemukan.</p>
              </div>
            ) : (
              filteredUsers.map(u => (
              <div key={u.id} className="glass-card p-6 group hover:border-coffee-400 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-coffee-100 p-3 rounded-2xl group-hover:bg-coffee-200 transition-colors">
                    <User className="text-coffee-600" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingUserId(u.id);
                        setNewUserData({ username: u.username, password: '', role: u.role });
                        setShowUserModal(true);
                      }}
                      className="text-coffee-300 hover:text-coffee-600 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-coffee-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-coffee-950 mb-1">{u.username}</h4>
                <p className="text-xs font-bold text-coffee-500 uppercase tracking-widest bg-coffee-50 inline-block px-2 py-1 rounded-lg">
                  {u.role}
                </p>
              </div>
            )))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-coffee-950">{t('driver_management')}</h3>
              <p className="text-sm text-coffee-500">Kelola pendaftaran dan status driver internal.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setNewDriverData({ username: '', password: '', full_name: '', phone: '', vehicle_info: '' });
                  setShowDriverModal(true);
                }}
                className="bg-coffee-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
              >
                <Plus size={20} />
                <span className="font-bold">Tambah Driver</span>
              </button>
              <button 
                onClick={fetchData}
                className="p-3 bg-coffee-100 text-coffee-600 rounded-2xl hover:bg-coffee-200 transition-all"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          {/* Driver Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-coffee-100 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" size={18} />
              <input 
                type="text"
                placeholder="Cari nama atau username driver..."
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-coffee-50/50 border-none rounded-2xl focus:ring-2 focus:ring-coffee-200 transition-all text-sm"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <select 
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value as any)}
                className="flex-1 md:w-40 px-4 py-3 bg-coffee-50/50 border-none rounded-2xl focus:ring-2 focus:ring-coffee-200 text-sm font-bold text-coffee-700"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="pending">Menunggu</option>
                <option value="inactive">Nonaktif</option>
              </select>
              <select 
                value={driverSort}
                onChange={(e) => setDriverSort(e.target.value as any)}
                className="flex-1 md:w-40 px-4 py-3 bg-coffee-50/50 border-none rounded-2xl focus:ring-2 focus:ring-coffee-200 text-sm font-bold text-coffee-700"
              >
                <option value="full_name">Nama (A-Z)</option>
                <option value="status">Status</option>
                <option value="active_deliveries">Pengiriman Aktif</option>
              </select>
            </div>
          </div>

          <div className="glass-card overflow-hidden border-coffee-100 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-coffee-50 text-coffee-500 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Driver</th>
                    <th className="px-6 py-4">Kontak</th>
                    <th className="px-6 py-4">Status Akun</th>
                    <th className="px-6 py-4">Status Kerja</th>
                    <th className="px-6 py-4">Lokasi</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-coffee-50">
                  {filteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-coffee-400 italic">
                        Tidak ada driver yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredDrivers.map(d => (
                      <tr key={d.id} className="hover:bg-coffee-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-coffee-900">{d.full_name}</div>
                          <div className="text-xs text-coffee-400">@{d.username}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-coffee-600">{d.phone}</div>
                          <div className="text-[10px] text-coffee-400">{d.vehicle_info}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            d.status === 'active' ? "bg-emerald-100 text-emerald-700" : 
                            d.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                          )}>
                            {t(d.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit",
                              d.active_deliveries > 0 ? "bg-blue-100 text-blue-700" :
                              (d.last_online && (new Date().getTime() - new Date(d.last_online + 'Z').getTime()) < 300000) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                            )}>
                              {d.active_deliveries > 0 ? t('delivering') :
                              (d.last_online && (new Date().getTime() - new Date(d.last_online + 'Z').getTime()) < 300000) ? t('available') : t('offline')}
                            </span>
                            {d.last_online && (
                              <span className="text-[9px] text-coffee-400 font-bold uppercase">
                                Aktif: {formatDate(new Date(d.last_online + 'Z'), 'HH:mm')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {d.latitude && d.longitude ? (
                            <button 
                              onClick={() => {
                                setSelectedDriver(d);
                                setShowDriverMap(true);
                              }}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold"
                            >
                              <MapPin size={14} />
                              Lihat Peta
                            </button>
                          ) : (
                            <span className="text-coffee-300 italic text-xs">Lokasi tidak tersedia</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {d.status === 'pending' && (
                              <button 
                                onClick={() => handleUpdateDriverStatus(d.id, 'active')}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                                title="Setujui Driver"
                              >
                                <Plus size={16} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteDriver(d.id)}
                              className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                              title="Hapus Driver"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UsersTab;
