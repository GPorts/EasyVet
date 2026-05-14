import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format a date to Brazilian format
 */
export function formatDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Format date with time
 */
export function formatDateTime(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/**
 * Format time only
 */
export function formatTime(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm', { locale: ptBR });
}

/**
 * Get human-readable relative date
 */
export function formatRelativeDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isToday(d)) return 'Hoje';
  if (isTomorrow(d)) return 'Amanhã';
  if (isYesterday(d)) return 'Ontem';
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
}

/**
 * Format month/year for calendar headers
 */
export function formatMonthYear(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMMM yyyy', { locale: ptBR });
}

/**
 * Format currency in BRL
 */
export function formatCurrency(value) {
  if (value == null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format phone number
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Format CPF
 */
export function formatCPF(cpf) {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

/**
 * Check if a product is expiring soon (within N days)
 */
export function isExpiringSoon(expirationDate, days = 30) {
  if (!expirationDate) return false;
  const d = typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate;
  return differenceInDays(d, new Date()) <= days && differenceInDays(d, new Date()) >= 0;
}

/**
 * Check if product is expired
 */
export function isExpired(expirationDate) {
  if (!expirationDate) return false;
  const d = typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate;
  return differenceInDays(d, new Date()) < 0;
}

/**
 * Get species label in Portuguese
 */
export function getSpeciesLabel(species) {
  const labels = {
    dog: 'Cachorro',
    cat: 'Gato',
    bird: 'Ave',
    rabbit: 'Coelho',
    hamster: 'Hamster',
    fish: 'Peixe',
    reptile: 'Réptil',
    other: 'Outro',
  };
  return labels[species] || species;
}

/**
 * Get appointment status config (label + color classes)
 */
export function getStatusConfig(status) {
  const configs = {
    pending: { 
      label: 'Pendente', 
      bg: 'bg-warning-100', 
      text: 'text-warning-600',
      dot: 'bg-warning-500',
    },
    confirmed: { 
      label: 'Confirmado', 
      bg: 'bg-primary-100', 
      text: 'text-primary-700',
      dot: 'bg-primary-500',
    },
    completed: { 
      label: 'Concluído', 
      bg: 'bg-accent-100', 
      text: 'text-accent-700',
      dot: 'bg-accent-500',
    },
    cancelled: { 
      label: 'Cancelado', 
      bg: 'bg-danger-100', 
      text: 'text-danger-600',
      dot: 'bg-danger-500',
    },
  };
  return configs[status] || configs.pending;
}
