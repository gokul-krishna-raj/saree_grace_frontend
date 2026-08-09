"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { Skeleton } from "@/components/ui/Skeleton";
import { useGetMeQuery } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";

// A real role check against the server (`getMe`), not just hiding nav links — per the
// checklist's explicit "role check, not just hiding nav links" requirement. A customer who
// guesses an /admin URL gets redirected, not a page that merely doesn't link here.
export function AdminRoute({ children }: { children: ReactNode }) {
  const authStatus = useAppSelector((state) => state.auth.status);
  const { data: user, isLoading } = useGetMeQuery(undefined, {
    skip: authStatus !== "authenticated",
  });
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = user?.role === "admin";
  const isDenied =
    authStatus === "unauthenticated" || (authStatus === "authenticated" && !isLoading && !isAdmin);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (authStatus === "authenticated" && !isLoading && !isAdmin) {
      router.replace("/");
    }
  }, [authStatus, isLoading, isAdmin, router, pathname]);

  if (isDenied) return null;

  if (authStatus !== "authenticated" || isLoading) {
    return (
      <div className="flex w-full flex-col gap-4 p-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return children;
}
