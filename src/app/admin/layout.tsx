import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/AdminNav";
import { AdminRoute } from "@/components/layout/AdminRoute";

export const metadata: Metadata = {
  title: { template: "%s | Admin", default: "Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AdminRoute>
      <div className="flex flex-1 flex-col lg:flex-row">
        <AdminNav />
        <div className="flex-1 p-4 lg:p-8">{children}</div>
      </div>
    </AdminRoute>
  );
}
