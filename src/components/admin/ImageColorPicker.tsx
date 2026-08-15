"use client";

import { Pipette, X } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";

interface ImageColorPickerProps {
  images: File[];
  onPick: (hex: string) => void;
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

// Lets an admin sample a swatch straight off an uploaded product photo instead of guessing a
// hex value — draws the image to a canvas so a click can be mapped to the exact pixel under
// the cursor via getImageData, rather than relying on the browser-only (Chromium/Edge) global
// EyeDropper API, which wouldn't work in Safari/Firefox for this admin tool.
export function ImageColorPicker({ images, onPick }: ImageColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverHex, setHoverHex] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasImages = images.length > 0;

  const previewUrls = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);
  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  useEffect(() => {
    if (!isOpen) return;
    const file = images[activeIndex];
    const canvas = canvasRef.current;
    if (!file || !canvas) return;
    let cancelled = false;
    createImageBitmap(file).then((bitmap) => {
      if (cancelled) return;
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
      bitmap.close();
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, activeIndex, images]);

  function readPixel(event: MouseEvent<HTMLCanvasElement>): string | null {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(
      canvas.width - 1,
      Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * canvas.width)),
    );
    const y = Math.min(
      canvas.height - 1,
      Math.max(0, Math.floor(((event.clientY - rect.top) / rect.height) * canvas.height)),
    );
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    return toHex(r, g, b);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (!isOpen) setActiveIndex(0);
          setIsOpen((prev) => !prev);
        }}
        disabled={!hasImages}
        aria-label="Pick color from image"
        title={
          hasImages ? "Pick color from image" : "Upload an image first to pick a color from it"
        }
        className="border-maroon-100 text-maroon-700 hover:border-maroon-400 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Pipette className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen && hasImages ? (
        <div className="border-maroon-100 absolute top-full left-0 z-10 mt-2 w-72 max-w-[85vw] rounded-lg border bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-maroon-900 text-xs font-medium">
              Click the image to pick a color
            </span>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close">
              <X className="text-maroon-500 h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {images.length > 1 ? (
            <div className="mb-2 flex gap-1.5 overflow-x-auto">
              {previewUrls.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-10 w-10 shrink-0 overflow-hidden rounded border-2",
                    index === activeIndex ? "border-maroon-600" : "border-transparent",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          <canvas
            ref={canvasRef}
            onMouseMove={(event) => setHoverHex(readPixel(event))}
            onMouseLeave={() => setHoverHex(null)}
            onClick={(event) => {
              const hex = readPixel(event);
              if (hex) {
                onPick(hex);
                setIsOpen(false);
              }
            }}
            className="border-maroon-100 max-h-64 w-auto max-w-full cursor-crosshair rounded border"
          />

          <div className="mt-2 flex items-center gap-2">
            <span
              className="border-maroon-100 h-6 w-6 shrink-0 rounded border"
              style={{ backgroundColor: hoverHex ?? "transparent" }}
              aria-hidden="true"
            />
            <span className="text-maroon-600 text-xs">{hoverHex ?? "Hover to preview"}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
