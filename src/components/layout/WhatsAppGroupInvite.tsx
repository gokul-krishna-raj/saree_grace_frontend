"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { WhatsAppIcon } from "@/components/layout/SocialIcons";
import { trackJoinWhatsAppGroup } from "@/lib/analytics";
import { env } from "@/lib/env";

const STORAGE_KEY = "sg_whatsapp_group_invite";
const SHOW_AFTER_MS = 8000;
// After "not now", ask again only after a couple of weeks; after joining, never again.
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;
// Never interrupt someone mid-purchase, signing in, or working in the admin.
const HIDDEN_ON = [
  "/checkout",
  "/cart",
  "/account",
  "/admin",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];

type InviteState = { joined: true } | { dismissedAt: number };

function readState(): InviteState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InviteState) : null;
  } catch {
    return null;
  }
}

function writeState(state: InviteState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode / blocked storage — the invite just may show again next visit.
  }
}

function shouldInvite(): boolean {
  const state = readState();
  if (!state) return true;
  if ("joined" in state) return false;
  return Date.now() - state.dismissedAt > SNOOZE_MS;
}

/**
 * A link to the WhatsApp updates group for server-rendered places (footer, home). Joining from
 * here also means the popup invite never shows for this visitor.
 */
export function JoinWhatsAppGroupLink({
  location,
  className,
  children,
}: {
  location: "footer" | "home";
  className?: string;
  children: ReactNode;
}) {
  const groupUrl = env.NEXT_PUBLIC_WHATSAPP_GROUP_URL;
  if (!groupUrl) return null;

  return (
    <a
      href={groupUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        writeState({ joined: true });
        trackJoinWhatsAppGroup(location);
      }}
    >
      {children}
    </a>
  );
}

/**
 * A one-time, dismissible card inviting browsing visitors to the WhatsApp updates group. Sits
 * just above the floating WhatsApp chat button and only appears after a short delay.
 */
export function WhatsAppGroupInvite() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const groupUrl = env.NEXT_PUBLIC_WHATSAPP_GROUP_URL;
  const isHiddenRoute = HIDDEN_ON.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (!groupUrl || isHiddenRoute || !shouldInvite()) return;
    const timer = window.setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [groupUrl, isHiddenRoute]);

  if (!open || !groupUrl || isHiddenRoute) return null;

  function dismiss() {
    writeState({ dismissedAt: Date.now() });
    setOpen(false);
  }

  function join() {
    writeState({ joined: true });
    trackJoinWhatsAppGroup("popup");
    setOpen(false);
  }

  return (
    <aside
      aria-labelledby="whatsapp-invite-title"
      className="whatsapp-invite border-border bg-card animate-fade-in-up fixed right-4 bottom-20 left-4 z-30 rounded-lg border p-4 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.35)] sm:left-auto sm:w-80 lg:right-6 lg:bottom-24 print:hidden"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close WhatsApp group invite"
        className="text-muted-foreground hover:text-foreground absolute top-2 right-2 rounded p-1"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="flex items-start gap-3 pr-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
          <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="whatsapp-invite-title" className="font-heading text-foreground text-base">
            Join our WhatsApp group
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-snug">
            Be the first to see new handloom arrivals, restocks and offers.
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <a
          href={groupUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={join}
          className="flex-1 rounded-md bg-[#0E7266] px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-[#0B5E54] focus-visible:ring-4 focus-visible:ring-[#25D366]/40 focus-visible:outline-none"
        >
          Join the group
        </a>
        <button
          type="button"
          onClick={dismiss}
          className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm"
        >
          Not now
        </button>
      </div>
    </aside>
  );
}
