import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  unit_price: number;
  min_stock: number;
  type: 'Bahan' | 'Barang';
  expiration_date?: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  payment_method?: string;
  order_id?: string;
  customer_name?: string;
  table_number?: string;
  customer_id?: number;
  date: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  points: number;
  created_at: string;
}

export interface MenuIngredient {
  id: number;
  menu_id: number;
  inventory_id: number;
  quantity: number;
  inventory_name?: string;
  unit?: string;
  unit_price?: number;
  current_stock?: number;
}

export interface Menu {
  id: number;
  name: string;
  price: number;
  size: string;
  category: string;
  description: string;
  image_url?: string;
  type: 'Internal' | 'Consignment';
  supplier_name?: string;
  supplier_price?: number;
  ingredients: MenuIngredient[];
}

export interface UserAccount {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'cashier';
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  dailySalesCount: number;
  dailyIncome: number;
  monthlySalesCount: number;
  recentTransactions: Transaction[];
  lowStock: InventoryItem[];
}
