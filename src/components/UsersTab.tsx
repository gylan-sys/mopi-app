import React from 'react';
import { motion } from 'motion/react';
import { 
  User, Truck, Plus, Search, Edit, Trash2, RefreshCw, Globe 
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
  fetchData: () => void;
  setSelectedDriverForMap: (id: string) => void;
  setShowDriverMapModal: (show: boolean) => void;
  setConfirmDialog: (dialog: any) => void;
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
  fetchData,
  setSelectedDriverForMap,
  setShowDriverMapModal,
  setConfirmDialog,
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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-coffee-400 font-sans font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-2">Pengaturan Sistem</p>
          <h2 className="text-3xl sm:text-4xl font-serif text-coffee-950 tracking-tight">
            Manajemen <span className="text-coffee-400">Akun</span>
          </h2>
        </div>
        <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-coffee-100 shadow-sm">
          <button
            onClick={() => setUsersSubTab('staff')}
            className={cn(
              "flex items-center gap-3 px-8 py-2.5 rounded-xl text-[11px] sm:text-xs font-sans font-bold uppercase tracking-widest transition-all",
              usersSubTab === 'staff' 
                ? "bg-accent-500 text-white shadow-lg premium-shadow" 
                : "text-coffee-400 hover:text-coffee-600"
            )}
          >
            <User size={16} />
            Staf
          </button>
          <button
            onClick={() => setUsersSubTab('driver')}
            className={cn(
              "flex items-center gap-3 px-8 py-2.5 rounded-xl text-[11px] sm:text-xs font-sans font-bold uppercase tracking-widest transition-all",
              usersSubTab === 'driver' 
                ? "bg-accent-500 text-white shadow-lg premium-shadow" 
                : "text-coffee-400 hover:text-coffee-600"
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
            <h3 className="text-xl font-serif font-bold text-coffee-950 tracking-tight">Daftar Staf Kasir & Admin</h3>
            <button 
              onClick={() => {
                setEditingUserId(null);
                setNewUserData({ username: '', password: '', role: 'cashier' });
                setShowUserModal(true);
              }}
              className="bg-accent-500 text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 hover:bg-accent-600 transition-all shadow-xl shadow-accent-500/20 premium-shadow group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="font-sans font-bold text-[11px] sm:text-xs uppercase tracking-widest">Tambah User</span>
            </button>
          </div>

          {/* Staff Search & Filter */}
          <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-[2.5rem] border border-coffee-100 shadow-sm">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-coffee-300 group-focus-within:text-coffee-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Cari nama user..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-coffee-50/50 border border-coffee-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coffee-500/20 focus:border-coffee-500 transition-all text-sm font-sans font-semibold text-coffee-950 placeholder:text-coffee-200"
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <select 
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value as any)}
                className="flex-1 md:w-48 px-6 py-4 bg-coffee-50/50 border border-coffee-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coffee-500/20 focus:border-coffee-500 text-[10px] font-sans font-bold uppercase tracking-widest text-coffee-950 cursor-pointer"
              >
                <option value="all">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="cashier">Kasir</option>
              </select>
              <select 
                value={userSort}
                onChange={(e) => setUserSort(e.target.value as any)}
                className="flex-1 md:w-48 px-6 py-4 bg-coffee-50/50 border border-coffee-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coffee-500/20 focus:border-coffee-500 text-[10px] font-sans font-bold uppercase tracking-widest text-coffee-950 cursor-pointer"
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
                                setSelectedDriverForMap(d.id);
                                setShowDriverMapModal(true);
                              }}
                              className="flex items-center gap-1 text-coffee-600 hover:text-coffee-900 transition-colors"
                            >
                              <Globe size={14} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Lihat Map</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-coffee-300 italic">Lokasi tidak tersedia</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {d.status === 'pending' && (
                              <button 
                                onClick={() => handleUpdateDriverStatus(d.id, 'active')}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all"
                              >
                                {t('approve')}
                              </button>
                            )}
                            {d.status === 'active' ? (
                              <button 
                                onClick={() => handleUpdateDriverStatus(d.id, 'suspended')}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100 transition-all"
                              >
                                {t('suspend')}
                              </button>
                            ) : d.status === 'suspended' ? (
                              <button 
                                onClick={() => handleUpdateDriverStatus(d.id, 'active')}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-all"
                              >
                                Aktifkan
                              </button>
                            ) : null}
                            <button 
                              onClick={() => {
                                setConfirmDialog({
                                  show: true,
                                  title: 'Hapus Driver',
                                  message: 'Apakah Anda yakin ingin menghapus driver ini? Tindakan ini tidak dapat dibatalkan.',
                                  isDestructive: true,
                                  onConfirm: async () => {
                                    await fetch(`/api/admin/drivers/${d.id}`, { 
                                      method: 'DELETE',
                                      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                    });
                                    setConfirmDialog(null);
                                    fetchData();
                                  }
                                });
                              }}
                              className="p-1.5 text-rose-300 hover:text-rose-600 transition-colors"
                              title="Hapus Driver"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
