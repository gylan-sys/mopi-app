import React from 'react';
import { motion } from 'motion/react';
import { Plus, Star, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../utils';

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
  return (
    <motion.div 
      key="loyalty"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-coffee-500 font-medium uppercase tracking-widest text-xs mb-1">Customer Relationship</p>
          <h2 className="text-4xl font-serif font-bold text-coffee-950">Loyalty Program</h2>
        </div>
        <button 
          onClick={() => {
            setEditingCustomerId(null);
            setNewCustomer({ name: '', phone: '', email: '' });
            setShowCustomerModal(true);
          }}
          className="flex items-center gap-2 bg-coffee-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-coffee-800 transition-all shadow-lg shadow-coffee-200"
        >
          <Plus size={20} />
          Tambah Customer
        </button>
      </header>

      <div className="glass-card overflow-hidden border-coffee-100 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-coffee-50 border-b border-coffee-100">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500">Nama</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500">Kontak</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500">Poin</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500">Terdaftar</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-coffee-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-50">
              {customers.map(cust => (
                <tr key={cust.id} className="hover:bg-coffee-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-coffee-950">{cust.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-coffee-600">{cust.phone || '-'}</p>
                    <p className="text-xs text-coffee-400">{cust.email || '-'}</p>
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
                    <div className="flex justify-end gap-2">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default LoyaltyTab;
