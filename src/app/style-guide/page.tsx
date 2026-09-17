import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { COLOR_MAP } from "@/lib/colors";

export const metadata: Metadata = {
  title: "Visual Design System Style Guide",
  robots: { index: false, follow: false },
};

export default function StyleGuidePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-12">
      <div className="border-border border-b pb-6">
        <span className="text-accent text-xs font-semibold tracking-wider uppercase">
          Design System Manifest
        </span>
        <h1 className="font-display text-primary mt-1 text-3xl font-bold sm:text-4xl">
          Saree Grace — Visual Design System
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          Luxury Indian ethnic couture design language, transplanted from source React + Vite to
          Next.js App Router.
        </p>
      </div>

      {/* 1. Brand Palette */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-foreground text-2xl font-bold">1. Brand Palette</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="border-border bg-card rounded-xl border p-4 text-center shadow-xs">
            <div className="bg-primary h-14 w-full rounded-lg shadow-sm" />
            <p className="text-foreground mt-2 text-xs font-bold">Primary Maroon</p>
            <p className="text-muted-foreground text-[10px]">#7E1B34</p>
          </div>
          <div className="border-border bg-card rounded-xl border p-4 text-center shadow-xs">
            <div className="bg-accent h-14 w-full rounded-lg shadow-sm" />
            <p className="text-foreground mt-2 text-xs font-bold">Zari Gold</p>
            <p className="text-muted-foreground text-[10px]">#D99B26</p>
          </div>
          <div className="border-border bg-card rounded-xl border p-4 text-center shadow-xs">
            <div className="bg-secondary border-border h-14 w-full rounded-lg border shadow-sm" />
            <p className="text-foreground mt-2 text-xs font-bold">Warm Cream</p>
            <p className="text-muted-foreground text-[10px]">#F4EFE6</p>
          </div>
          <div className="border-border bg-card rounded-xl border p-4 text-center shadow-xs">
            <div className="bg-royal h-14 w-full rounded-lg shadow-sm" />
            <p className="text-foreground mt-2 text-xs font-bold">Royal Blue</p>
            <p className="text-muted-foreground text-[10px]">#1B4DB3</p>
          </div>
          <div className="border-border bg-card rounded-xl border p-4 text-center shadow-xs">
            <div className="bg-silk h-14 w-full rounded-lg shadow-sm" />
            <p className="text-foreground mt-2 text-xs font-bold">Silk Pink</p>
            <p className="text-muted-foreground text-[10px]">#ECC2CB</p>
          </div>
          <div className="border-border bg-card rounded-xl border p-4 text-center shadow-xs">
            <div className="bg-forest h-14 w-full rounded-lg shadow-sm" />
            <p className="text-foreground mt-2 text-xs font-bold">Forest Green</p>
            <p className="text-muted-foreground text-[10px]">#2E6B44</p>
          </div>
        </div>
      </section>

      {/* 2. Typography System */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-foreground text-2xl font-bold">2. Typography System</h2>
        <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-6 shadow-xs">
          <div>
            <span className="text-muted-foreground text-xs uppercase">
              Display Serif (Playfair Display)
            </span>
            <p className="font-display text-foreground text-3xl font-bold">
              The Art of Authentic Elampillai Weaves
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs uppercase">Interface Sans (Inter)</span>
            <p className="text-foreground font-body text-base leading-relaxed">
              Every saree in our collection is handloom woven by master weavers in Salem, Tamil
              Nadu. We preserve traditional zari borders, delicate pallus, and rich bridal motifs.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Button Variants */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-foreground text-2xl font-bold">
          3. Button Variants (11 Styles)
        </h2>
        <div className="border-border bg-card flex flex-wrap items-center gap-3 rounded-xl border p-6 shadow-xs">
          <Button variant="default">Default</Button>
          <Button variant="primary">Primary (Maroon)</Button>
          <Button variant="gold">Gold Gradient</Button>
          <Button variant="maroon">Maroon Gradient</Button>
          <Button variant="premium">Premium</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="hero">Hero CTA</Button>
          <Button variant="primary" isLoading>
            Loading
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </section>

      {/* 4. Badges & Micro-Interactions */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-foreground text-2xl font-bold">4. Badges &amp; Tags</h2>
        <div className="border-border bg-card flex flex-wrap items-center gap-3 rounded-xl border p-6 shadow-xs">
          <Badge variant="default">Default</Badge>
          <Badge variant="maroon">Maroon</Badge>
          <Badge variant="gold">Gold Bestseller</Badge>
          <Badge variant="royal">Royal Blue</Badge>
          <Badge variant="secondary">Secondary Cream</Badge>
          <Badge variant="outline">Outline Tag</Badge>
          <Badge variant="destructive">50% Off</Badge>
          <Badge variant="danger">Out of Stock</Badge>
        </div>
      </section>

      {/* 5. Gradients & Visual Signatures */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-foreground text-2xl font-bold">
          5. Gradients &amp; Effects
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-gradient-gold text-foreground shadow-gold flex h-24 items-center justify-center rounded-xl font-semibold">
            .bg-gradient-gold
          </div>
          <div className="bg-gradient-maroon text-primary-foreground shadow-elegant flex h-24 items-center justify-center rounded-xl font-semibold">
            .bg-gradient-maroon
          </div>
          <div className="bg-gradient-premium text-primary-foreground shadow-elegant flex h-24 items-center justify-center rounded-xl font-semibold">
            .bg-gradient-premium
          </div>
        </div>
        <div className="mt-2 flex items-center gap-6">
          <span className="text-gradient-gold text-2xl font-bold">.text-gradient-gold</span>
          <span className="link-underline cursor-pointer text-base font-semibold">
            Hover for .link-underline animation
          </span>
        </div>
      </section>

      {/* 6. Color Swatch Map */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-foreground text-2xl font-bold">
          6. Swatch Color Map (COLOR_MAP)
        </h2>
        <div className="border-border bg-card flex flex-wrap items-center gap-3 rounded-xl border p-6 shadow-xs">
          {Object.entries(COLOR_MAP).map(([name, hex]) => (
            <div
              key={name}
              className="border-border flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs"
            >
              <span
                className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
                style={{ backgroundColor: hex }}
                aria-hidden="true"
              />
              <span className="text-foreground font-medium capitalize">{name}</span>
              <span className="text-muted-foreground text-[10px] uppercase">{hex}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Form Inputs */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-foreground text-2xl font-bold">7. Form Inputs</h2>
        <div className="border-border bg-card grid gap-5 rounded-xl border p-6 shadow-xs sm:grid-cols-2">
          <Input label="Customer Name" placeholder="Priya Raman" />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="98765 43210"
            hint="10-digit mobile number"
          />
          <Input
            label="Email Address"
            type="email"
            error="Please enter a valid email address"
            defaultValue="invalid-email"
          />
          <Select label="Filter by Fabric" defaultValue="soft_silk">
            <option value="soft_silk">Elampillai Soft Silk</option>
            <option value="cotton">Handloom Cotton</option>
            <option value="bridal">Bridal Kanchipuram Style</option>
            <option value="linen">Festive Linen</option>
          </Select>
        </div>
      </section>

      {/* 8. Cards & Skeletons */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-foreground text-2xl font-bold">
          8. Cards &amp; Skeletons
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Soft Silk Saree</CardTitle>
              <CardDescription>Salem Master Weavers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-primary text-xl font-bold">₹2,499</p>
              <p className="text-muted-foreground mt-1 text-xs">Traditional gold zari border</p>
            </CardContent>
          </Card>
          <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-6 shadow-xs">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="border-border bg-card hover:shadow-elegant flex flex-col justify-between rounded-xl border p-6 transition-shadow">
            <div>
              <span className="text-accent text-xs font-semibold tracking-wider uppercase">
                Elevated Surface
              </span>
              <h3 className="font-display text-foreground mt-1 text-xl font-bold">
                Shadow Elegant
              </h3>
              <p className="text-muted-foreground mt-2 text-xs">
                Features luxurious maroon tinted box-shadow elevation from the source design system.
              </p>
            </div>
            <Button variant="gold" size="sm" className="mt-4 w-fit">
              Explore
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
