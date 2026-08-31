import type { Metadata } from "next";

import { CartClient } from "./CartClient";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your selected sarees and proceed to secure checkout at Saree Grace.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartClient />;
}
