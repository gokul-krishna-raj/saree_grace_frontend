import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | My Account", default: "My Account" },
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
