// Thin brand strip above the header. Scrolls away with the page (only the header row is sticky)
// so it never costs vertical space while browsing. Every line here must stay factually true.
export function AnnouncementBar() {
  return (
    <div className="bg-maroon-950 text-white/85">
      <p className="container-page flex h-8 items-center justify-center gap-6 text-center text-[11px] tracking-[0.14em] whitespace-nowrap uppercase sm:text-xs">
        <span>Woven in Elampillai, Salem</span>
        <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" aria-hidden="true" />
        <span className="hidden sm:inline">Shipped across India</span>
        <span className="hidden h-1 w-1 rounded-full bg-white/40 lg:block" aria-hidden="true" />
        <span className="hidden lg:inline">Secure payments with Razorpay</span>
      </p>
    </div>
  );
}
