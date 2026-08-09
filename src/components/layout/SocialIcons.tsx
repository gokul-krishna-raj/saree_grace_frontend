// lucide-react (v1) dropped brand/logo glyphs, so these are small hand-rolled outline icons
// rather than a new icon-library dependency for four static glyphs.
import type { SVGProps } from "react";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M15 8.5h-2a1.5 1.5 0 0 0-1.5 1.5v2h3.3l-.5 3H11.5V21" />
      <path d="M13.5 21H6.5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2" />
    </svg>
  );
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="4" />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M6.4 17.6 4 21l3.5-2.3a8 8 0 1 0-2.7-2.6Z" />
      <path d="M8.8 9.8c0 3 2.4 5.4 5.4 5.4.6 0 1-.5.9-1.1l-.2-1a.8.8 0 0 0-.8-.6l-1.3.2a4 4 0 0 1-2.5-2.5l.2-1.3a.8.8 0 0 0-.6-.8l-1-.2c-.6-.1-1.1.3-1.1.9Z" />
    </svg>
  );
}
