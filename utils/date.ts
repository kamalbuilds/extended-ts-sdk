export function formatDateToISO(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}

export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
}