import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

export default function StyleGuidePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10">
      <h1 className="font-heading text-maroon-900 text-3xl">Saree Grace — Style guide</h1>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-maroon-700 text-xl">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" isLoading>
            Loading
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-maroon-700 text-xl">Badges</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="maroon">Handloom</Badge>
          <Badge variant="gold">Bestseller</Badge>
          <Badge variant="outline">New</Badge>
          <Badge variant="danger">Out of stock</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-maroon-700 text-xl">Form inputs</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" placeholder="Priya Raman" />
          <Input label="Phone" type="tel" inputMode="tel" placeholder="98765 43210" />
          <Input
            label="Email"
            type="email"
            error="Enter a valid email address"
            defaultValue="not-an-email"
          />
          <Select label="Sort by" defaultValue="newest">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="top_rated">Top rated</option>
          </Select>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-maroon-700 text-xl">Cards &amp; skeletons</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="font-heading text-maroon-900 text-lg">Elampillai Cotton Saree</p>
            <p className="text-maroon-600 text-sm">Elampillai · Maroon &amp; Gold border</p>
          </Card>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </section>
    </main>
  );
}
