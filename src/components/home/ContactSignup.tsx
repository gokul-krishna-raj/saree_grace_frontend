import { MessageCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { env } from "@/lib/env";

// "Newsletter/WhatsApp signup" from the checklist — implemented as a WhatsApp link (no backend
// endpoint needed) rather than an email newsletter, since the backend has no subscription
// endpoint (flagged in NOTES.md, same pattern as the Section 11 address-book gap). Falls back
// to a mailto link until a real WhatsApp Business number is provisioned in
// NEXT_PUBLIC_WHATSAPP_NUMBER — never a fabricated phone number.
export function ContactSignup() {
  const whatsappNumber = env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const href = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "mailto:hello@sareegrace.com";
  const label = whatsappNumber ? "Message us on WhatsApp" : "Email us for updates";

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 text-center">
      <h2 className="font-heading text-maroon-900 text-2xl">Stay in the loop</h2>
      <p className="text-maroon-600 mt-2 text-sm">
        Hear about new arrivals and saree stories first.
      </p>
      <a
        href={href}
        target={whatsappNumber ? "_blank" : undefined}
        rel={whatsappNumber ? "noopener noreferrer" : undefined}
        className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-6 inline-flex")}
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        {label}
      </a>
    </section>
  );
}
