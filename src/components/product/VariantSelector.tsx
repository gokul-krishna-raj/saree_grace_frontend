"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { getColorCodeValue, isColorAttribute } from "@/lib/colorCode";
import { getColorHex } from "@/lib/colors";
import {
  type AttributeSelection,
  getAllAttributeValues,
  getAttrValue,
} from "@/lib/variantSelection";
import type { ProductVariant } from "@/types";

function isLightColor(hex?: string): boolean {
  if (!hex) return false;
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return false;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 165;
}

// A "color" row gets a swatch dot sourced from the matching variant's
// (excluded-from-selection) `colorCode` attribute, when one was set — or falls back
// to our standard brand color palette via getColorHex(value).
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
  return match ? (getColorCodeValue(match.attributes) ?? getColorHex(value)) : getColorHex(value);
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
        const availableValues = getAllAttributeValues(variants, attributeName);
        const selectedValue = getAttrValue(selection, attributeName);
        const isColor = isColorAttribute(attributeName);

        return (
          <div key={attributeName} className="flex flex-col gap-2">
            <span className="text-foreground text-sm font-semibold capitalize">
              {attributeName}:{" "}
              <span className="text-muted-foreground font-normal">{selectedValue || "Select"}</span>
            </span>
            <div className="flex flex-wrap gap-2.5">
              {availableValues.map((value) => {
                const isSelected =
                  selectedValue !== undefined &&
                  (selectedValue === value ||
                    selectedValue.trim().toLowerCase() === value.trim().toLowerCase());
                const swatchColor = swatchFor(variants, attributeName, value);

                if (isColor) {
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onSelect(attributeName, value)}
                      aria-pressed={isSelected}
                      aria-label={value}
                      title={value}
                      className={cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                        isSelected
                          ? "border-primary ring-primary/30 scale-110 shadow-sm ring-2"
                          : "border-border hover:border-primary/60 hover:scale-105",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-full w-full items-center justify-center rounded-full"
                        style={{ backgroundColor: swatchColor }}
                      >
                        {isSelected ? (
                          <Check
                            className="h-4 w-4"
                            style={{
                              color: isLightColor(swatchColor) ? "#000000" : "#ffffff",
                            }}
                          />
                        ) : null}
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onSelect(attributeName, value)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-all",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border bg-card text-foreground hover:border-primary/60 hover:bg-muted/50",
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
