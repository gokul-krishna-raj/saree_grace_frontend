"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { Skeleton } from "@/components/ui/Skeleton";
import { useAppSelector } from "@/store/hooks";

// Client-side-only route guard. There is no server-side option here: tokens live in memory +
// localStorage, never in a cookie (see CLAUDE_FRONTEND.md / BACKEND_CONTRACT.md), so
// `src/proxy.ts` (Next 16's middleware equivalent) has literally nothing to read on the server
// — it cannot know whether a request is authenticated. Every protected page/layout must wrap
// its content in this component instead.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const status = useAppSelector((state) => state.auth.status);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status === "authenticated") return children;

  if (status === "unauthenticated") return null;

  return (
    <div className="flex w-full flex-col gap-4 p-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
