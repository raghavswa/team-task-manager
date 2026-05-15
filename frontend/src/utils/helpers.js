import { format, isAfter, parseISO, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  try {
    return format(parseISO(date), 'MMM d, yyyy');
  } catch {
    return '—';
  }
};

export const formatRelative = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true });
  } catch {
    return '';
  }
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  return isAfter(new Date(), parseISO(dueDate));
};

export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getApiError = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong.'
  );
};

export const getProgressPercent = (stats) => {
  if (!stats || stats.total === 0) return 0;
  return Math.round((stats.done / stats.total) * 100);
};
