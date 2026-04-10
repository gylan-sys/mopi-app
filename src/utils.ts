import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { id } from 'date-fns/locale';

export const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date | string | number, formatStr: string, timezone: string = 'Asia/Jakarta') => {
  try {
    let d: Date;
    if (typeof date === 'string') {
      if (date.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        d = new Date(date.replace(' ', 'T') + 'Z');
      } else {
        d = new Date(date);
      }
    } else {
      d = new Date(date);
    }
    
    if (isNaN(d.getTime())) return '-';
    
    const zonedDate = toZonedTime(d, timezone);
    return format(zonedDate, formatStr, { locale: id });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

export const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
