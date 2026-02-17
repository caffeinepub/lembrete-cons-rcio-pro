export function normalizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');
  
  // Add Brazil country code if not present and number looks like a Brazilian mobile
  if (normalized.length === 11 && !normalized.startsWith('55')) {
    normalized = '55' + normalized;
  } else if (normalized.length === 10 && !normalized.startsWith('55')) {
    normalized = '55' + normalized;
  }
  
  return normalized;
}

export function getWhatsAppLink(phone: string): string {
  const normalized = normalizePhone(phone);
  if (!normalized) return '';
  return `https://wa.me/${normalized}`;
}

export function openWhatsApp(phone: string): void {
  try {
    const link = getWhatsAppLink(phone);
    if (!link) return;
    
    // Enhanced deep linking for Android wrapped contexts (TWA/WebView)
    // Try intent:// scheme first for better native app integration on Android
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isAndroid && isStandalone) {
      // Use Android intent for better native WhatsApp integration
      const intentUrl = `intent://send?phone=${normalizePhone(phone)}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
      window.location.href = intentUrl;
      
      // Fallback to wa.me after a short delay if intent fails
      setTimeout(() => {
        window.location.href = link;
      }, 500);
    } else if (isStandalone) {
      // For iOS PWA or other standalone contexts
      window.location.href = link;
    } else {
      // For regular browser contexts
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
  }
}
