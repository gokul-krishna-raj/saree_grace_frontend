import { z } from "zod";

// Mirrors product.validation.ts exactly (createSimpleProductSchema / createVariantShellProductSchema
// / addVariantSchema) — using plain z.number() (not z.coerce.number()) paired with
// `valueAsNumber: true` on the corresponding <input> registrations, since z.coerce splits a
// form's input/output types in a way @hookform/resolvers can't reconcile (see NOTES.md; hit
// this same issue with the review form in Section 7).
// Shared by both product types' "base info" fields — kept separate from the simple-product
// schema below (rather than reusing it with price/stock defaulted to 0) because 0 fails that
// schema's `.positive()` check, which would make a variant product's base-info edit form
// permanently invalid. Extending, not duplicating.
export const productBaseFieldsSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(200),
  description: z.string().trim().min(1, "Required").max(5000),
  category: z.string().min(1, "Select a category"),
  fabric: z.string().trim().max(100).optional(),
  color: z.string().trim().max(100).optional(),
  isHandloom: z.boolean(),
});
export type ProductBaseFormValues = z.infer<typeof productBaseFieldsSchema>;

export const simpleProductSchema = productBaseFieldsSchema.extend({
  price: z.number({ error: "Enter a price" }).positive("Must be greater than 0"),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number({ error: "Enter stock quantity" }).int().min(0),
  sku: z.string().trim().optional(),
});
export type SimpleProductFormValues = z.infer<typeof simpleProductSchema>;

export const variantShellSchema = productBaseFieldsSchema.extend({
  variantAttributeNames: z
    .string()
    .min(1, "Enter at least one attribute name, comma-separated (e.g. color, size)"),
});
export type VariantShellFormValues = z.infer<typeof variantShellSchema>;

export const variantSchema = z.object({
  sku: z.string().trim().min(1, "Enter a SKU"),
  price: z.number({ error: "Enter a price" }).positive("Must be greater than 0"),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number({ error: "Enter stock quantity" }).int().min(0),
});
export type VariantFormValues = z.infer<typeof variantSchema>;
