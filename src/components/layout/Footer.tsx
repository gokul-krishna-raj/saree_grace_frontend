import Link from "next/link";

import { env } from "@/lib/env";

export function Footer() {
  return (
    <footer className="border-maroon-50 border-t bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-heading text-maroon-900 text-lg">Saree Grace</p>
          <p className="text-maroon-600 mt-2 text-sm">
            Authentic Elampillai sarees, crafted by local artisans and delivered to your door.
          </p>
        </div>
        <div className="text-maroon-700 flex flex-col gap-2 text-sm">
          <p className="text-maroon-900 font-medium">Shop</p>
          <Link href="/products">All sarees</Link>
          <Link href="/products?handloomOnly=true">Elampillai saree collection</Link>
          <Link href="/about">Our story</Link>
        </div>
        <div className="text-maroon-700 flex flex-col gap-2 text-sm">
          <p className="text-maroon-900 font-medium">Get in touch</p>
          {env.NEXT_PUBLIC_WHATSAPP_NUMBER ? (
            <a
              href={`https://wa.me/${env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp us
            </a>
          ) : null}
          <a href="mailto:hello@sareegrace.com">hello@sareegrace.com</a>
        </div>
      </div>
      <p className="border-maroon-50 text-maroon-400 border-t py-4 text-center text-xs">
        © {new Date().getFullYear()} Saree Grace. All rights reserved.
      </p>
    </footer>
  );
}
