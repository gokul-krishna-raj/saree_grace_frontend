import { Lock, type LucideIcon, PackageCheck, RefreshCw, ShieldCheck, Truck } from "lucide-react";

const REASONS: { icon: LucideIcon; label: string }[] = [
  { icon: Truck, label: "Fast Delivery" },
  { icon: RefreshCw, label: "Easy Returns" },
  { icon: Lock, label: "Secure Payments" },
  { icon: ShieldCheck, label: "Quality Assured" },
  { icon: PackageCheck, label: "Carefully Packed" },
];

export function WhyShopWithUs() {
  return (
    <section className="bg-maroon-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-heading text-maroon-900 text-center text-2xl">Why Shop With Us</h2>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {REASONS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-3 text-center">
              <span className="bg-maroon-100 text-maroon-700 flex h-14 w-14 items-center justify-center rounded-full">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-maroon-800 text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
