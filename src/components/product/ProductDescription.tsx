import { Fragment } from "react";

import {
  isBulletBlock,
  looksLikeHtml,
  sanitizeDescriptionHtml,
  splitDescriptionParagraphs,
  stripBulletMarker,
} from "@/lib/richText";

interface ProductDescriptionProps {
  description?: string | null;
  title?: string;
  fabric?: string;
  color?: string;
  isHandloom?: boolean;
  sku?: string;
  occasions?: Array<{ _id: string; name: string }>;
}

export function ProductDescription({
  description,
  title = "Description",
  fabric,
  color,
  isHandloom,
  sku,
  occasions,
}: ProductDescriptionProps) {
  const text = description?.trim();
  const hasSpecs = Boolean(
    fabric || color || isHandloom || (occasions && occasions.length > 0) || sku,
  );

  if (!text && !hasSpecs) return null;

  function renderBody() {
    if (!text) return null;

    if (looksLikeHtml(text)) {
      const safeHtml = sanitizeDescriptionHtml(text);
      if (!safeHtml) return null;
      return (
        <div
          className="description-content text-muted-foreground text-sm leading-relaxed sm:text-base"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      );
    }

    const blocks = splitDescriptionParagraphs(text);
    if (blocks.length === 0) return null;

    return (
      <div className="text-muted-foreground flex flex-col gap-3 text-sm leading-relaxed sm:text-base">
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

  return (
    <div className="bg-muted/30 border-border/40 space-y-4 rounded-2xl border p-6 sm:p-8">
      <h3 className="font-display text-foreground flex items-center gap-2.5 text-lg font-bold sm:text-xl">
        <div className="bg-primary h-6 w-1 rounded-full" aria-hidden="true" />
        {title}
      </h3>

      {renderBody()}

      {hasSpecs ? (
        <div className="border-border/50 divide-border/40 divide-y border-t pt-3 text-sm">
          {fabric ? (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Fabric
              </span>
              <span className="text-foreground font-semibold">{fabric}</span>
            </div>
          ) : null}
          {color ? (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Color
              </span>
              <span className="text-foreground font-semibold capitalize">{color}</span>
            </div>
          ) : null}
          {isHandloom ? (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Loom & Craft
              </span>
              <span className="text-foreground font-semibold">Traditional Elampillai Handloom</span>
            </div>
          ) : null}
          {occasions && occasions.length > 0 ? (
            <div className="flex flex-col gap-1.5 py-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Occasion
              </span>
              <div className="flex flex-wrap gap-1.5">
                {occasions.map((occ) => (
                  <span
                    key={occ._id}
                    className="border-border bg-card text-foreground rounded-md border px-2.5 py-0.5 text-xs font-medium"
                  >
                    {occ.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {sku ? (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                SKU
              </span>
              <span className="text-muted-foreground font-mono text-xs">{sku}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {isHandloom ? (
        <p className="text-muted-foreground/85 border-border/40 border-t pt-3 text-xs leading-relaxed italic">
          Handcrafted by weaver families in Elampillai, Tamil Nadu. Small variations in weave and
          motifs are genuine hallmarks of authentic handloom.
        </p>
      ) : null}
    </div>
  );
}
