import { cn } from "@/lib/cn";
import { DEFAULT_WHATSAPP_MESSAGE, getWhatsAppNumber, getWhatsAppUrl } from "@/lib/whatsapp";

export interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  className?: string;
}

/**
 * Bootstrap Icons bi-whatsapp SVG vector glyph.
 */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={cn("h-7 w-7", className)}
      aria-hidden="true"
    >
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.016-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  );
}

/**
 * Floating WhatsApp button displayed on every page in the bottom-right corner.
 * - Sits above general page elements with z-40 while clearing the mobile bottom nav bar (bottom-20 on mobile, bottom-6 on desktop).
 * - Opens WhatsApp click-to-chat in a new tab with pre-filled enquiry message.
 */
export function WhatsAppButton({
  phoneNumber = getWhatsAppNumber(),
  message = DEFAULT_WHATSAPP_MESSAGE,
  className,
}: WhatsAppButtonProps) {
  const url = getWhatsAppUrl(phoneNumber, message);

  return (
    <div
      className={cn(
        "fixed right-4 bottom-20 z-40 sm:right-6 lg:right-6 lg:bottom-6 print:hidden",
        className,
      )}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition-all duration-300 ease-in-out hover:scale-110 hover:bg-[#20BD5A] hover:shadow-xl hover:shadow-[#25D366]/30 focus-visible:ring-4 focus-visible:ring-[#25D366]/50 focus-visible:outline-none active:scale-95"
      >
        {/* Subtle breathing ripple effect to draw shopper attention */}
        <span
          className="pointer-events-none absolute -inset-1 -z-10 rounded-full bg-[#25D366] opacity-30 transition-opacity duration-300 group-hover:opacity-0 motion-safe:animate-ping"
          aria-hidden="true"
          style={{ animationDuration: "3s" }}
        />

        {/* WhatsApp Icon */}
        <WhatsAppGlyph />

        {/* Desktop hover tooltip */}
        {/* <span
          className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-maroon-950 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 sm:inline-block"
          aria-hidden="true"
        >
          Chat with us
        </span> */}
      </a>
    </div>
  );
}
