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

// Admin-entered descriptions are frequently Markdown ("## Heading", "**bold**", "* item").
// A deliberately tiny converter — headings, bold/italic, bullet and numbered lists, paragraphs —
// run on the server only. Input is HTML-escaped first and the output still goes through
// `sanitizeDescriptionHtml`, so nothing here can introduce markup the allowlist rejects.
const MARKDOWN_HINT = /(^|\n)\s{0,3}#{1,6}\s|\*\*[^*\n]+\*\*|(^|\n)\s*[*-]\s+\S/;

export function looksLikeMarkdown(text: string): boolean {
  return MARKDOWN_HINT.test(text);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*(?!\s)([^*\n]+?)\*(?!\w)/g, "$1<em>$2</em>");
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  // Map the shallowest heading the author used to h3 (the page already has its h1 and section
  // h2s), the next level to h4 — so a description that starts at "###" doesn't skip a level.
  const depths = lines
    .map((line) => /^(#{1,6})\s+/.exec(line.trim())?.[1]?.length)
    .filter((depth): depth is number => depth !== undefined);
  const topDepth = depths.length ? Math.min(...depths) : 1;
  const out: string[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) out.push(`<p>${paragraph.map(inlineMarkdown).join("<br>")}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list)
      out.push(
        `<${list.type}>${list.items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${list.type}>`,
      );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    const bullet = /^(?:[*•-])\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);

    if (!line) {
      flushParagraph();
      flushList();
    } else if (heading) {
      flushParagraph();
      flushList();
      const tag = heading[1].length <= topDepth ? "h3" : "h4";
      out.push(`<${tag}>${inlineMarkdown(heading[2])}</${tag}>`);
    } else if (bullet || numbered) {
      flushParagraph();
      const type = bullet ? "ul" : "ol";
      if (list && list.type !== type) flushList();
      if (!list) list = { type, items: [] };
      list.items.push((bullet ?? numbered)![1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return out.join("");
}
