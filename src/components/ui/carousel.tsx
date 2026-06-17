"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";

import { withBasePath } from "@/lib/base-path";
import { cn } from "@/lib/utils";
import type { PortfolioMediaRecord } from "@/lib/db";

type CarouselProps = {
  media: PortfolioMediaRecord[];
  title: string;
};

export function Carousel({ media, title }: CarouselProps) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + media.length) % media.length),
    [media.length]
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % media.length),
    [media.length]
  );

  if (media.length === 0) return null;

  const item = media[current];
  const mediaUrl = withBasePath(item.url);

  return (
    <div className="relative overflow-hidden rounded-lg bg-muted">
      {/* Main media area */}
      <div className="relative flex aspect-video w-full items-center justify-center bg-black/5">
        {item.type === "video" ? (
          <video
            key={item.url}
            src={mediaUrl}
            controls
            className="h-full w-full object-contain"
            aria-label={item.alt}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.url}
            src={mediaUrl}
            alt={item.alt || `${title} — slide ${current + 1}`}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback placeholder when image is missing in dev
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        {/* Arrow controls (only shown when >1 item) */}
        {media.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow transition hover:bg-background sm:h-8 sm:w-8"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow transition hover:bg-background sm:h-8 sm:w-8"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Caption + dots */}
      {media.length > 1 && (
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {item.alt || `${current + 1} / ${media.length}`}
          </span>
          <div className="flex gap-1.5">
            {media.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === current ? "w-4 bg-primary" : "w-1.5 bg-border"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
