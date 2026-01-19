import { TravelCategory, BookingStatus, PaymentStatus } from '../types';

export const formatCurrency = (amount: number, currency: string = 'HUF'): string => {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};


export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj);
};


export const formatShortDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
};


export const getCategoryLabel = (category: TravelCategory): string => {
  const labels: Record<TravelCategory, string> = {
    beach: 'Tengerparti',
    adventure: 'Kaland',
    cultural: 'Kulturális',
    city: 'Városnézés',
    nature: 'Természet',
    cruise: 'Hajóút',
    safari: 'Szafari',
    ski: 'Síelés',
    wellness: 'Wellness',
  };
  return labels[category] || category;
};


export const getCategoryIcon = (category: TravelCategory): string => {
  const icons: Record<TravelCategory, string> = {
    beach: 'umbrella-beach',
    adventure: 'mountain',
    cultural: 'landmark',
    city: 'building-2',
    nature: 'trees',
    cruise: 'ship',
    safari: 'binoculars',
    ski: 'snowflake',
    wellness: 'spa',
  };
  return icons[category] || 'globe';
};


export const getBookingStatusInfo = (status: BookingStatus): { label: string; color: string } => {
  const statusMap: Record<BookingStatus, { label: string; color: string }> = {
    pending: { label: 'Függőben', color: 'warning' },
    confirmed: { label: 'Megerősítve', color: 'success' },
    cancelled: { label: 'Lemondva', color: 'danger' },
    completed: { label: 'Teljesítve', color: 'secondary' },
  };
  return statusMap[status] || { label: status, color: 'secondary' };
};


export const getPaymentStatusInfo = (status: PaymentStatus): { label: string; color: string } => {
  const statusMap: Record<PaymentStatus, { label: string; color: string }> = {
    pending: { label: 'Fizetésre vár', color: 'warning' },
    paid: { label: 'Kifizetve', color: 'success' },
    refunded: { label: 'Visszatérítve', color: 'secondary' },
    failed: { label: 'Sikertelen', color: 'danger' },
  };
  return statusMap[status] || { label: status, color: 'secondary' };
};


export const calculateDiscount = (originalPrice: number, currentPrice: number): number => {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};


export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};


export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};


export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};


export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};


export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};


export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};


export const formatDuration = (days: number): string => {
  if (days === 1) return '1 nap';
  return `${days} nap`;
};


export const getContinentColor = (continent: string): string => {
  const colors: Record<string, string> = {
    'Európa': 'bg-blue-100 text-blue-700',
    'Ázsia': 'bg-red-100 text-red-700',
    'Afrika': 'bg-amber-100 text-amber-700',
    'Észak-Amerika': 'bg-green-100 text-green-700',
    'Dél-Amerika': 'bg-purple-100 text-purple-700',
    'Óceánia': 'bg-cyan-100 text-cyan-700',
  };
  return colors[continent] || 'bg-gray-100 text-gray-700';
};
