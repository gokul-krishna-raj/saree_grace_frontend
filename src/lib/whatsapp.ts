import { env } from "@/lib/env";

/**
 * Central configuration for WhatsApp customer support.
 *
 * To enter your WhatsApp number, you can:
 * 1. Set `NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX` in `.env.local`
 *    OR
 * 2. Update `DEFAULT_WHATSAPP_NUMBER` below.
 *
 * Format: Country code (91 for India) followed by 10 digits without '+' or spaces
 * (e.g. "919500750704" or "919876543210").
 */
export const DEFAULT_WHATSAPP_NUMBER = "919385629808"; // Placeholder number for testing; replace with your actual business number

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi Saree Grace, I would like to know more about your sarees.";

/**
 * Normalizes any phone string (strips non-digits, auto-prefixes 91 if 10 digits provided).
 */
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Returns the configured WhatsApp phone number.
 * Priority: NEXT_PUBLIC_WHATSAPP_NUMBER in env > DEFAULT_WHATSAPP_NUMBER constant.
 */
export function getWhatsAppNumber(): string {
  const envNumber = env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  const raw = envNumber || DEFAULT_WHATSAPP_NUMBER;
  return normalizeWhatsAppNumber(raw);
}

/**
 * Generates the official WhatsApp Click-to-Chat URL.
 * Format: https://wa.me/91YOURNUMBER?text=YOUR_MESSAGE
 */
export function getWhatsAppUrl(
  phoneNumber: string = getWhatsAppNumber(),
  message: string = DEFAULT_WHATSAPP_MESSAGE,
): string {
  const normalizedNumber = normalizeWhatsAppNumber(phoneNumber);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${normalizedNumber}?text=${encodedText}`;
}
