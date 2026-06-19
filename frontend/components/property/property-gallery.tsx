"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = React.useState(0);
  const go = (dir: number) =>
    setActive((a) => (a + dir + images.length) % images.length);

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60">
        <Image
          src={images[active]}
          alt={`${title} — image ${active + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
        <button
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full bg-background/60 transition-all",
                i === active ? "w-6 bg-background" : "w-1.5"
              )}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-colors",
              i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <Image src={img} alt={`thumbnail ${i + 1}`} fill sizes="20vw" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
