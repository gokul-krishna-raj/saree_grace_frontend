import { MessageCircle } from "lucide-react";

import { WhatsAppIcon } from "@/components/layout/SocialIcons";
import { JoinWhatsAppGroupLink } from "@/components/layout/WhatsAppGroupInvite";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { env } from "@/lib/env";

export function ContactSignup() {
  const whatsappNumber = env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const href = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : `mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`;
  const label = whatsappNumber ? "Message us on WhatsApp" : "Email us";

  return (
    <section
      aria-labelledby="contact-cta"
      className="bg-primary text-primary-foreground relative overflow-hidden"
    >
      <div className="bg-pattern-indian absolute inset-0" aria-hidden="true" />
      <div className="container-page relative flex flex-col items-center py-16 text-center lg:py-24">
        <p className="eyebrow !text-gold-200 mb-4">Personal shopping</p>
        <h2 id="contact-cta" className="text-heading-xl max-w-2xl">
          Not sure which saree is right for the occasion?
        </h2>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/80 sm:text-base">
          Tell us what you&apos;re looking for — colour, fabric, budget — and we&apos;ll help you
          choose. We&apos;re also the first to share new handloom arrivals.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href={href}
            target={whatsappNumber ? "_blank" : undefined}
            rel={whatsappNumber ? "noopener noreferrer" : undefined}
            className={cn(buttonVariants({ variant: "light", size: "lg" }))}
          >
            <MessageCircle aria-hidden="true" />
            {label}
          </a>
          <JoinWhatsAppGroupLink
            location="home"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white",
            )}
          >
            <WhatsAppIcon aria-hidden="true" />
            Join our WhatsApp group
          </JoinWhatsAppGroupLink>
        </div>
      </div>
    </section>
  );
}
