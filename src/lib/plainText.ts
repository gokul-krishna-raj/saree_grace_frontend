// Plain text for meta descriptions / JSON-LD: no tags, no Markdown punctuation. Dependency-free
// on purpose (safe to import anywhere, unlike lib/richText which pulls in sanitize-html).
export function toPlainText(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/(^|\n)\s{0,3}#{1,6}\s+/g, "$1")
    .replace(/\*\*|__/g, "")
    .replace(/(^|\n)\s*[*•-]\s+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
