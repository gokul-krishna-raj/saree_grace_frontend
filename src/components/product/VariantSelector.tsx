"use client";

import { cn } from "@/lib/cn";
import { type AttributeSelection, getAvailableValues } from "@/lib/variantSelection";
import type { ProductVariant } from "@/types";

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
        return (
          <div key={attributeName} className="flex flex-col gap-2">
            <span className="text-maroon-900 text-sm font-medium capitalize">{attributeName}</span>
            <div className="flex flex-wrap gap-2">
              {availableValues.map((value) => {
                const isSelected = selection[attributeName] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onSelect(attributeName, value)}
                    aria-pressed={isSelected}
                    className={cn(
                      "h-11 rounded-lg border px-4 text-sm font-medium",
                      isSelected
                        ? "border-maroon-700 bg-maroon-700 text-white"
                        : "border-maroon-200 text-maroon-800 hover:border-maroon-700",
                    )}
                  >
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
