export function formatDateShort(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);

  // Check for invalid date
  if (isNaN(date.getTime())) return dateString;

  // Use es-ES locale for dd/mm/yy format
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
}
