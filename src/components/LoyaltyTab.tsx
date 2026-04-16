import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Star, 
  Edit, 
  Trash2, 
  Trophy, 
  Ticket, 
  Users, 
  Search,
  ChevronRight,
  Gift,
  Copy,
  Check
} from 'lucide-react';
import { formatDate, formatIDR } from '../utils';
import { cn } from '../types';

interface LoyaltyTabProps {
  customers: any[];
  setEditingCustomerId: (id: number | null) => void;
  setNewCustomer: (data: any) => void;
  setShowCustomerModal: (show: boolean) => void;
  handleDeleteCustomer: (id: number) => void;
}

const LoyaltyTab: React.FC<LoyaltyTabProps> = ({
  customers,
  setEditingCustomerId,
  setNewCustomer,
  setShowCustomerModal,
  handleDeleteCustomer
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'vouchers' | 'tiers'>('customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const tiers = [
    { id: 'bronze', name: 'Bronze', minPoints: 0, color: 'text-orange-600', bg: 'bg-orange-100', icon: Trophy, benefits: ['Poin 1x per transaksi', 'Voucher ulang tahun'] },
    { id: 'silver', name: 'Silver', minPoints: 500, color: 'text-slate-400', bg: 'bg-slate-100', icon: Trophy, benefits: ['Poin 1.2x per transaksi', 'Diskon 5% setiap Jumat', 'Voucher ulang tahun'] },
    { id: 'gold', name: 'Gold', minPoints: 1500, color: 'text-amber-500', bg: 'bg-amber-100', icon: Trophy, benefits: ['Poin 1.5x per transaksi', 'Diskon 10% setiap hari', 'Akses menu rahasia', 'Voucher ulang tahun'] },
    { id: 'platinum', name: 'Platinum', minPoints: 5000, color: 'text-indigo-600', bg: 'bg-indigo-100', icon: Trophy, benefits: ['Poin 2x per transaksi', 'Diskon 15% setiap hari', 'Gratis ongkir delivery', 'Akses menu rahasia', 'Voucher ulang tahun'] },
  ];

  const vouchers = [
    { code: 'MOPIBARU', discount: '10%', type: 'Percentage', minOrder: 50000, status: 'Active' },
    { code: 'KOPIPUAS', discount: 'Rp 5.000', type: 'Fixed', minOrder: 30000, status: 'Active' },
    { code: 'SENINSEMANGAT', discount: '20%', type: 'Percentage', minOrder: 100000, status: 'Expired' },
  ];

  const getCustomerTier = (points: number) => {
    return [...tiers].reverse().find(t => points >= t.minPoints) || tiers[0];
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone?.includes(searchQuery)
  );

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <motion.div 
      key="loyalty"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-20"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-coffee-400 font-sans font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Customer Relationship</p>
          <h2 className="text-4xl font-serif text-coffee-950 tracking-tight">
            Loyalty <span className="text-coffee-400">Program</span>
          </h2>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => {
              setEditingCustomerId(null);
              setNewCustomer({ name: '', phone: '', email: '' });
              setShowCustomerModal(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-accent-500 text-white px-8 py-4 rounded-2xl font-sans font-bold text-[10px] uppercase tracking-widest hover:bg-accent-600 transition-all shadow-xl shadow-accent-500/20 premium-shadow group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            Tambah Customer
          </button>
        </div>
      </header>

      {/* Sub Tabs */}
      <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-coffee-100 shadow-sm w-fit">
        {[
          { id: 'customers', label: 'Pelanggan', icon: Users },
          { id: 'vouchers', label: 'Voucher', icon: Ticket },
          { id: 'tiers', label: 'Level Member', icon: Trophy }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={cn(
              "flex items-center gap-3 px-8 py-2.5 rounded-xl text-[10px] font-sans font-bold uppercase tracking-widest transition-all",
              activeSubTab === tab.id ? "bg-accent-500 text-white shadow-lg premium-shadow" : "text-coffee-400 hover:text-coffee-600"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'customers' && (
          <motion.div
            key="customers-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-300" size={20} />
              <input 
                type="text"
                placeholder="Cari nama atau nomor telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-coffee-100 rounded-2xl focus:ring-2 focus:ring-coffee-900 focus:border-transparent outline-none transition-all text-sm font-medium"
              />
            </div>

            <div className="glass-card overflow-hidden border-coffee-100 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-coffee-50 border-b border-coffee-100">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500">Pelanggan</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500">Level</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500">Poin</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500">Terdaftar</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-coffee-50">
                    {filteredCustomers.map(cust => {
                      const tier = getCustomerTier(cust.points);
                      return (
                        <tr key={cust.id} className="hover:bg-coffee-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-coffee-100 flex items-center justify-center text-coffee-600 font-black text-xs">
                                {cust.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-coffee-950">{cust.name}</p>
                                <p className="text-[10px] text-coffee-400 font-medium">{cust.phone || cust.email || 'Tanpa Kontak'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit",
                              tier.bg, tier.color
                            )}>
                              <tier.icon size={10} />
                              {tier.name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Star size={14} className="text-amber-500 fill-amber-500" />
                              <span className="font-bold text-coffee-950">{cust.points} pts</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-coffee-500">{formatDate(new Date(cust.created_at), 'dd MMM yyyy')}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setEditingCustomerId(cust.id);
                                  setNewCustomer({ name: cust.name, phone: cust.phone || '', email: cust.email || '' });
                                  setShowCustomerModal(true);
                                }}
                                className="p-2 text-coffee-400 hover:text-coffee-600 hover:bg-coffee-100 rounded-xl transition-all"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteCustomer(cust.id)}
                                className="p-2 text-coffee-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'vouchers' && (
          <motion.div
            key="vouchers-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Add Voucher Card */}
            <button className="glass-card p-8 border-dashed border-2 border-coffee-200 flex flex-col items-center justify-center text-center hover:border-coffee-400 hover:bg-coffee-50 transition-all group">
              <div className="w-12 h-12 rounded-full bg-coffee-100 text-coffee-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <h4 className="font-bold text-coffee-950">Buat Voucher Baru</h4>
              <p className="text-xs text-coffee-400 mt-1">Diskon persentase atau nominal</p>
            </button>

            {vouchers.map((v, idx) => (
              <div key={idx} className="glass-card p-0 overflow-hidden border-2 border-coffee-100 relative group">
                <div className={cn(
                  "p-6 flex flex-col items-center text-center",
                  v.status === 'Active' ? "bg-emerald-50" : "bg-slate-50 grayscale"
                )}>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-coffee-900 mb-4 shadow-sm">
                    <Gift size={24} />
                  </div>
                  <h4 className="text-2xl font-black text-coffee-950">{v.discount} OFF</h4>
                  <p className="text-[10px] font-bold text-coffee-500 uppercase tracking-widest mt-1">Min. Order {formatIDR(v.minOrder)}</p>
                </div>
                
                <div className="p-6 bg-white border-t-2 border-dashed border-coffee-100 relative">
                  {/* Ticket notches */}
                  <div className="absolute -left-3 -top-3 w-6 h-6 bg-coffee-50 rounded-full border-2 border-coffee-100" />
                  <div className="absolute -right-3 -top-3 w-6 h-6 bg-coffee-50 rounded-full border-2 border-coffee-100" />
                  
                  <div className="flex items-center justify-between bg-coffee-50 p-3 rounded-xl border border-coffee-100">
                    <code className="font-mono font-black text-coffee-950">{v.code}</code>
                    <button 
                      onClick={() => handleCopy(v.code)}
                      className="text-coffee-400 hover:text-coffee-900 transition-colors"
                    >
                      {copiedCode === v.code ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                      v.status === 'Active' ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                    )}>
                      {v.status}
                    </span>
                    <button className="text-[10px] font-bold text-coffee-400 hover:text-rose-500 transition-colors">Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeSubTab === 'tiers' && (
          <motion.div
            key="tiers-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {tiers.map((tier) => (
              <div key={tier.id} className="glass-card p-8 flex flex-col h-full border-2 border-coffee-100 hover:border-coffee-400 transition-all">
                <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-6", tier.bg, tier.color)}>
                  <tier.icon size={32} />
                </div>
                <h4 className="text-2xl font-serif font-bold text-coffee-950 mb-1">{tier.name}</h4>
                <p className="text-xs font-bold text-coffee-400 uppercase tracking-widest mb-6">{tier.minPoints}+ Points</p>
                
                <div className="space-y-3 flex-1">
                  <p className="text-[10px] font-black text-coffee-950 uppercase tracking-wider border-b border-coffee-50 pb-2">Benefits:</p>
                  {tier.benefits.map((benefit, bIdx) => (
                    <div key={bIdx} className="flex gap-2 items-start">
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", tier.color.replace('text', 'bg'))} />
                      <p className="text-xs text-coffee-600 leading-relaxed">{benefit}</p>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-8 py-3 rounded-2xl border-2 border-coffee-100 text-coffee-400 text-xs font-bold hover:bg-coffee-50 transition-all">
                  Edit Level
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LoyaltyTab;

