import { type LucideIcon, PackageCheck, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

// Every claim here mirrors the published policies (shipping-policy, refund-policy pages) — keep
// them in sync if a policy changes.
const ITEMS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Sparkles,
    title: "Direct from weavers",
    body: "Sourced from weaver families in Elampillai, Salem.",
  },
  {
    icon: PackageCheck,
    title: "Dispatched in 1–2 days",
    body: "Delivered across India in 3–7 business days.",
  },
  {
    icon: RotateCcw,
    title: "7-day returns",
    body: "On unused items in their original packaging.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    body: "UPI, cards and net banking via Razorpay.",
  },
];

export function TrustStrip() {
  return (
    <section aria-label="Why shop with Saree Grace" className="border-border border-y">
      <ul className="container-page grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4 lg:py-12">
        {ITEMS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Icon className="text-accent h-6 w-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="text-foreground text-sm font-medium">{title}</p>
              <p className="text-muted-foreground mt-1 text-[13px] leading-relaxed">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
