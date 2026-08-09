"use client";

import { useRouter } from "next/navigation";

import { AccountNav } from "@/components/account/AccountNav";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetMeQuery, useLogoutMutation } from "@/store/api/authApi";

function ProfileContent() {
  const { data: user, isLoading } = useGetMeQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (isLoading || !user) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="border-maroon-50 rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-maroon-900 text-lg">{user.name}</h2>
          {user.role === "admin" ? <Badge variant="gold">Admin</Badge> : null}
        </div>
        <p className="text-maroon-600 mt-1 text-sm">{user.email}</p>
        {/* Editing is intentionally not offered here — the backend has no update-profile
            endpoint (no PUT/PATCH /auth/me) and no `phone` field on the User model at all
            (only per-shipping-address phone numbers). See NOTES.md. */}
        <p className="text-maroon-400 mt-3 text-xs">
          Profile editing isn&apos;t available yet — reach out to us if any of this needs to change.
        </p>
      </section>

      <Button variant="ghost" onClick={handleLogout} isLoading={isLoggingOut} className="w-fit">
        Sign out
      </Button>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="font-heading text-maroon-900 mb-4 text-2xl">Your account</h1>
        <AccountNav />
        <ProfileContent />
      </main>
    </ProtectedRoute>
  );
}
