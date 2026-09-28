import { getImageProps } from "next/image";
import { preload } from "react-dom";

// Hoists a responsive image preload (`<link rel="preload" as="image" imagesrcset=…>`) into the
// document head from a Server Component. Used for LCP images that are rendered inside client
// components — there, next/image's own `preload` prop is a no-op, so the browser only found the
// image after downloading and parsing the JS, and Lighthouse measured multi-second load delays.
// `sizes` must match the <Image> that renders it, so the browser picks the same candidate.
export function preloadImage(src: string | undefined, sizes: string) {
  if (!src) return;
  const {
    props: { srcSet, src: fallbackSrc },
  } = getImageProps({ src, alt: "", fill: true, sizes });
  preload(fallbackSrc, {
    as: "image",
    imageSrcSet: srcSet,
    imageSizes: sizes,
    fetchPriority: "high",
  });
}
