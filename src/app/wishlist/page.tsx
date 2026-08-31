import type { Metadata } from "next";

import { WishlistClient } from "./WishlistClient";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "View and manage your saved sarees at Saree Grace.",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return <WishlistClient />;
}
