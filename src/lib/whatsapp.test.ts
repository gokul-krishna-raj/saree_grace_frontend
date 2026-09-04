import {
  DEFAULT_WHATSAPP_MESSAGE,
  DEFAULT_WHATSAPP_NUMBER,
  getWhatsAppNumber,
  getWhatsAppUrl,
  normalizeWhatsAppNumber,
} from "./whatsapp";

describe("whatsapp utility functions", () => {
  describe("normalizeWhatsAppNumber", () => {
    it("should prepend 91 for 10-digit Indian numbers", () => {
      expect(normalizeWhatsAppNumber("9876543210")).toBe("919876543210");
    });

    it("should preserve numbers that already include country code", () => {
      expect(normalizeWhatsAppNumber("919876543210")).toBe("919876543210");
    });

    it("should strip spaces, dashes, parentheses and plus signs", () => {
      expect(normalizeWhatsAppNumber("+91 98765-43210")).toBe("919876543210");
      expect(normalizeWhatsAppNumber("+91 (987) 654-3210")).toBe("919876543210");
    });
  });

  describe("getWhatsAppNumber", () => {
    it("should return the configured number or default number", () => {
      const number = getWhatsAppNumber();
      expect(number).toBeTruthy();
      expect(number.startsWith("91")).toBe(true);
      expect(DEFAULT_WHATSAPP_NUMBER).toMatch(/^91\d{10}$/);
    });
  });

  describe("getWhatsAppUrl", () => {
    it("should construct the exact wa.me URL with pre-filled message", () => {
      const url = getWhatsAppUrl("919385629808", DEFAULT_WHATSAPP_MESSAGE);
      const expectedText = encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE);
      expect(url).toBe(`https://wa.me/919385629808?text=${expectedText}`);
      expect(url).toContain("https://wa.me/919385629808");
      expect(url).toContain(
        "text=Hi%20Saree%20Grace%2C%20I%20would%20like%20to%20know%20more%20about%20your%20sarees.",
      );
    });

    it("should support custom phone number and custom message", () => {
      const customUrl = getWhatsAppUrl("9876543210", "Need help with silk saree");
      expect(customUrl).toBe("https://wa.me/919876543210?text=Need%20help%20with%20silk%20saree");
    });
  });
});
