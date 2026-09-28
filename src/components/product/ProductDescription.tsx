import { Fragment } from "react";

import {
  hasProductSpecs,
  ProductSpecs,
  type ProductSpecsProps,
} from "@/components/product/ProductSpecs";
import {
  isBulletBlock,
  looksLikeHtml,
  looksLikeMarkdown,
  markdownToHtml,
  sanitizeDescriptionHtml,
  splitDescriptionParagraphs,
  stripBulletMarker,
} from "@/lib/richText";

// Server-only in practice: never import this file from a client component (it pulls in
// sanitize-html). Nothing here uses client hooks. The PDP renders `DescriptionBody` in the
// Server Component and passes the result into the client purchase panel as a slot, so
// `sanitize-html` (~100 KB gzipped) runs on the server and never ships to the browser.

export function DescriptionBody({ description }: { description?: string | null }) {
  const text = description?.trim();
  if (!text) return null;

  if (looksLikeHtml(text) || looksLikeMarkdown(text)) {
    const safeHtml = sanitizeDescriptionHtml(looksLikeHtml(text) ? text : markdownToHtml(text));
    if (!safeHtml) return null;
    return (
      <div
        className="description-content text-muted-foreground text-[15px] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    );
  }

  const blocks = splitDescriptionParagraphs(text);
  if (blocks.length === 0) return null;

  return (
    <div className="text-muted-foreground flex flex-col gap-3 text-[15px] leading-relaxed">
      {blocks.map((block, blockIndex) =>
        isBulletBlock(block) ? (
          <ul key={blockIndex} className="list-disc space-y-1.5 pl-5">
            {block
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line, lineIndex) => (
                <li key={lineIndex}>{stripBulletMarker(line)}</li>
              ))}
          </ul>
        ) : (
          <p key={blockIndex}>
            {block.split("\n").map((line, lineIndex, lines) => (
              <Fragment key={lineIndex}>
                {line}
                {lineIndex < lines.length - 1 ? <br /> : null}
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  );
}

interface ProductDescriptionProps extends ProductSpecsProps {
  description?: string | null;
  title?: string;
}

// Heading + body + specs in one block (used where no accordion is wanted).
export function ProductDescription({
  description,
  title = "Description",
  ...specs
}: ProductDescriptionProps) {
  const hasBody = Boolean(description?.trim());
  if (!hasBody && !hasProductSpecs(specs)) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-foreground text-xl">{title}</h2>
      <DescriptionBody description={description} />
      <ProductSpecs {...specs} />
    </section>
  );
}
