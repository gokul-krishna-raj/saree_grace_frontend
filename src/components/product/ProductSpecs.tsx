import type { ReactNode } from "react";

// Product attribute list (fabric, colour, loom, occasion, SKU). Kept separate from
// ProductDescription so the client purchase panel can render it without importing the
// server-side description sanitizer.
export interface ProductSpecsProps {
  fabric?: string;
  color?: string;
  isHandloom?: boolean;
  sku?: string;
  occasions?: Array<{ _id: string; name: string }>;
}

export function hasProductSpecs({ fabric, color, isHandloom, sku, occasions }: ProductSpecsProps) {
  return Boolean(fabric || color || isHandloom || (occasions && occasions.length > 0) || sku);
}

export function ProductSpecs({ fabric, color, isHandloom, sku, occasions }: ProductSpecsProps) {
  const rows: Array<{ label: string; value: ReactNode }> = [];
  if (fabric) rows.push({ label: "Fabric", value: fabric });
  if (color) rows.push({ label: "Colour", value: <span className="capitalize">{color}</span> });
  if (isHandloom) rows.push({ label: "Loom & craft", value: "Traditional Elampillai handloom" });
  if (occasions && occasions.length > 0) {
    rows.push({ label: "Occasion", value: occasions.map((occ) => occ.name).join(", ") });
  }
  if (sku) rows.push({ label: "SKU", value: <span className="font-mono text-xs">{sku}</span> });
  if (rows.length === 0) return null;

  return (
    <div>
      <dl className="divide-border divide-y text-sm">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[8rem_1fr] gap-4 py-2.5">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
      {isHandloom ? (
        <p className="text-muted-foreground mt-3 text-xs leading-relaxed italic">
          Handcrafted by weaver families in Elampillai, Tamil Nadu. Small variations in weave and
          motifs are genuine hallmarks of authentic handloom.
        </p>
      ) : null}
    </div>
  );
}
