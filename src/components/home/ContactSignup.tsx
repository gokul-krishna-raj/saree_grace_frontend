import { MessageCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { env } from "@/lib/env";

export function ContactSignup() {
  const whatsappNumber = env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const href = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : `mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`;
  const label = whatsappNumber ? "Message us on WhatsApp" : "Email us for updates";

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="bg-gradient-maroon text-primary-foreground border-gold/30 shadow-elegant relative overflow-hidden rounded-2xl border px-6 py-12 text-center sm:px-12 sm:py-16">
        <div className="bg-pattern-indian absolute inset-0 opacity-10" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center">
          <span className="border-gold/30 bg-accent/20 text-gold-light mb-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            Exclusive Updates
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stay in the loop
          </h2>
          <p className="text-primary-foreground/85 mt-3 max-w-md text-sm leading-relaxed sm:text-base">
            Be the first to know about new handloom arrivals, festive bridal collections, and master
            weaver stories.
          </p>
          <a
            href={href}
            target={whatsappNumber ? "_blank" : undefined}
            rel={whatsappNumber ? "noopener noreferrer" : undefined}
            className={cn(
              buttonVariants({ variant: "gold", size: "lg" }),
              "mt-8 inline-flex items-center gap-2",
            )}
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            {label}
          </a>
        </div>
      </div>
    </section>
  );
}
