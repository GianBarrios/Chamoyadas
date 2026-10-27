export function formatMoney(n) {
  const num = Number(n) || 0;
  return '$' + num.toLocaleString('es-MX', { maximumFractionDigits: 2 });
}

export function todayKey(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export function dayLabel(date) {
  return new Date(date).toLocaleDateString('es-MX', { weekday: 'short' }).slice(0, 1).toUpperCase();
}

export function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}
