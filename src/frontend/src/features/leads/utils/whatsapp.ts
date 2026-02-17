// WhatsApp deep link utility for opening chats with lead phone numbers
export function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
}

export function getWhatsAppLink(phone: string): string {
  const normalized = normalizePhone(phone);
  // WhatsApp deep link format
  return `https://wa.me/${normalized}`;
}

export function openWhatsApp(phone: string): void {
  const link = getWhatsAppLink(phone);
  window.open(link, '_blank', 'noopener,noreferrer');
}
