import sanitizeHtml from "sanitize-html";

// Only trust a description as HTML when it actually contains a tag — a plain-text description
// that happens to include a literal "<" (e.g. "size < 10") must never be parsed as markup.
const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*?>/i;

export function looksLikeHtml(text: string): boolean {
  return HTML_TAG_PATTERN.test(text);
}

// Pure allowlist, no jsdom — small enough set of basic formatting tags that a rich-text
// description realistically needs, everything else (scripts, event handlers, iframes, ...) is
// stripped entirely rather than escaped.
export function sanitizeDescriptionHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "span",
      "ul",
      "ol",
      "li",
      "h3",
      "h4",
      "blockquote",
      "a",
    ],
    allowedAttributes: { a: ["href"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
    },
  }).trim();
}

// Blank-line-separated blocks become paragraphs (or bullet lists); a single newline inside a
// block is a soft line break within that paragraph.
export function splitDescriptionParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

const BULLET_LINE = /^\s*(?:[•*-]|\d+[.)])\s+/;

export function isBulletBlock(block: string): boolean {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 && lines.every((line) => BULLET_LINE.test(line));
}

export function stripBulletMarker(line: string): string {
  return line.trim().replace(BULLET_LINE, "");
}
