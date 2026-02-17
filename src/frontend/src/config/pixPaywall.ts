/**
 * Centralized Pix paywall configuration.
 * Single source of truth for payment amount, Pix key, and instructions.
 */

export const pixPaywallConfig = {
  // Payment amount in BRL
  amount: 'R$ 97,00',
  
  // Pix key for payment
  pixKey: 'seu-email@exemplo.com',
  
  // Instructions text (English)
  instructions: 'To activate your account, please make a payment via Pix using the key above. After payment, submit your transaction code or upload your payment receipt below. Your account will be activated once the payment is confirmed by our team.',
  
  // Additional info
  paymentDescription: 'One-time payment for full access',
} as const;
