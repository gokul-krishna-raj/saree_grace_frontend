// Serializes structured data for a <script type="application/ld+json"> tag. `<` is escaped so a
// value containing "</script>" (e.g. an admin-entered product description) can't terminate the
// tag early and inject markup — plain JSON.stringify doesn't protect against that.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
