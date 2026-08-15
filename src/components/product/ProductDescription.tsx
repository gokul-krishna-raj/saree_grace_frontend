import { Fragment } from "react";

import {
  isBulletBlock,
  looksLikeHtml,
  sanitizeDescriptionHtml,
  splitDescriptionParagraphs,
  stripBulletMarker,
} from "@/lib/richText";

export function ProductDescription({ description }: { description?: string | null }) {
  const text = description?.trim();
  if (!text) return null;

  if (looksLikeHtml(text)) {
    const safeHtml = sanitizeDescriptionHtml(text);
    if (!safeHtml) return null;
    return (
      <section>
        <h2 className="text-maroon-900 text-sm font-medium">Description</h2>
        <div
          className="description-content text-maroon-700 mt-2 text-sm leading-relaxed sm:text-base"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </section>
    );
  }

  const blocks = splitDescriptionParagraphs(text);
  if (blocks.length === 0) return null;

  return (
    <section>
      <h2 className="text-maroon-900 text-sm font-medium">Description</h2>
      <div className="text-maroon-700 mt-2 flex flex-col gap-3 text-sm leading-relaxed sm:text-base">
        {blocks.map((block, blockIndex) =>
          isBulletBlock(block) ? (
            <ul key={blockIndex} className="list-disc space-y-1 pl-5">
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
    </section>
  );
}
