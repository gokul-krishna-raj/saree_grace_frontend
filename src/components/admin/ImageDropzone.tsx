"use client";

import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";

export interface ImageDropzoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  label?: string;
}

// Shared by admin product/variant creation and reviews — drag-and-drop or click-to-browse,
// preview thumbnails, remove, and reorder (move-left/move-right rather than full drag-reorder,
// which would need a DnD library not in saree-grace-frontend-packages.md for a fairly small
// per-form win). No byte-level upload progress bar: these are single multipart requests through
// RTK Query's `fetchBaseQuery`, which doesn't expose upload progress (only XMLHttpRequest does)
// — the mutation's `isLoading` state drives an indeterminate "Uploading..." state instead. See
// NOTES.md if true progress ever becomes a real requirement — it would need a dedicated
// XHR-based upload path, not a small tweak to the existing one.
export function ImageDropzone({
  files,
  onChange,
  maxFiles = 8,
  disabled,
  label = "Drag images here, or click to browse",
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  function addFiles(newFiles: FileList | File[]) {
    // Keep the newest files when over capacity (rather than the earliest) — so a maxFiles={1}
    // dropzone acts as "replace" when the admin picks a different file, instead of silently
    // discarding it in favor of the one already selected.
    onChange([...files, ...Array.from(newFiles)].slice(-maxFiles));
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  function moveTo(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= files.length) return;
    const next = [...files];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        className={cn(
          "text-maroon-600 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center text-sm",
          isDragging ? "border-maroon-700 bg-maroon-50" : "border-maroon-200",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <ImagePlus className="h-6 w-6" aria-hidden="true" />
        <span>
          {label} ({files.length}/{maxFiles})
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            if (event.target.files?.length) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {files.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="border-maroon-100 relative h-20 w-20 overflow-hidden rounded-lg border"
            >
              {/* Ephemeral local blob preview, not a remote/optimizable asset — next/image
                  doesn't handle blob: URLs, a plain img is the correct tool here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrls[index]} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Remove image"
                className="text-maroon-700 absolute top-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <div className="absolute bottom-0.5 left-0.5 flex gap-0.5">
                <button
                  type="button"
                  onClick={() => moveTo(index, -1)}
                  disabled={index === 0}
                  aria-label="Move earlier"
                  className="text-maroon-700 flex h-5 w-5 items-center justify-center rounded bg-white/90 disabled:opacity-30"
                >
                  <ChevronLeft className="h-3 w-3" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => moveTo(index, 1)}
                  disabled={index === files.length - 1}
                  aria-label="Move later"
                  className="text-maroon-700 flex h-5 w-5 items-center justify-center rounded bg-white/90 disabled:opacity-30"
                >
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
