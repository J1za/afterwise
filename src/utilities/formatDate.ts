const dateTimeWithTimeFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const rtf = new Intl.RelativeTimeFormat('uk-UA', { numeric: 'auto' });

export function formatDateTime(value: string | Date) {
  return dateTimeWithTimeFormatter.format(new Date(value));
}

export function formatRelative(value: string | Date) {
  const date = new Date(value).getTime();
  const diff = date - Date.now();
  const minutes = Math.round(diff / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(days, 'day');
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(months, 'month');
  return rtf.format(Math.round(months / 12), 'year');
}
