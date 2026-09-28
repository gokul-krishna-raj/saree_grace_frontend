// `sizes` values shared by the <Image> that renders a picture and the server-side preload for
// it (lib/preloadImage.ts) — they must match, or the browser downloads a second candidate.

// Listing grid: 2 columns on phones, 3 from md, 4 from xl, inside a sidebar layout from lg.
export const LISTING_CARD_SIZES =
  "(min-width: 1280px) 19vw, (min-width: 1024px) 24vw, (min-width: 768px) 31vw, 48vw";

// PDP main photo: full width on phones, half the page from md (two-column layout).
export const PDP_MAIN_IMAGE_SIZES = "(min-width: 768px) 50vw, 100vw";
