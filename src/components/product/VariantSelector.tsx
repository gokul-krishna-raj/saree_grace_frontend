"use client";

import { cn } from "@/lib/cn";
import { getColorCodeValue, isColorAttribute } from "@/lib/colorCode";
import { type AttributeSelection, getAttrValue, getAvailableValues } from "@/lib/variantSelection";
import type { ProductVariant } from "@/types";

// A "color" row gets a swatch dot sourced from the matching variant's
// (excluded-from-selection) `colorCode` attribute, when one was set — every
// other attribute (size, material, ...) stays a plain text pill.
function swatchFor(
  variants: ProductVariant[],
  attributeName: string,
  value: string,
): string | undefined {
  if (!isColorAttribute(attributeName)) return undefined;
  const targetVal = value.trim().toLowerCase();
  const match = variants.find((variant) => {
    const attrVal = getAttrValue(variant.attributes, attributeName);
    return attrVal !== undefined && attrVal.trim().toLowerCase() === targetVal;
  });
  return match ? getColorCodeValue(match.attributes) : undefined;
}

export function VariantSelector({
  attributeNames,
  variants,
  selection,
  onSelect,
}: {
  attributeNames: string[];
  variants: ProductVariant[];
  selection: AttributeSelection;
  onSelect: (attributeName: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {attributeNames.map((attributeName) => {
        const availableValues = getAvailableValues(variants, attributeName, selection);
        const selectedValue = getAttrValue(selection, attributeName);
        return (
          <div key={attributeName} className="flex flex-col gap-2">
            <span className="text-maroon-900 text-sm font-medium capitalize">{attributeName}</span>
            <div className="flex flex-wrap gap-2">
              {availableValues.map((value) => {
                const isSelected =
                  selectedValue !== undefined &&
                  (selectedValue === value ||
                    selectedValue.trim().toLowerCase() === value.trim().toLowerCase());
                const swatchColor = swatchFor(variants, attributeName, value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onSelect(attributeName, value)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium",
                      isSelected
                        ? "border-maroon-700 bg-maroon-700 text-white"
                        : "border-maroon-200 text-maroon-800 hover:border-maroon-700",
                    )}
                  >
                    {swatchColor ? (
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 rounded-full border border-white/60 shadow-sm"
                        style={{ backgroundColor: swatchColor }}
                      />
                    ) : null}
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
