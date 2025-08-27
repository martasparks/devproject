"use client";
import React, { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";

type Hotspot = {
  id: string;
  x: number; // % koordinātes X
  y: number; // % koordinātes Y
  title: string;
  price: string;
  href: string;
  thumb?: string;
};

const slides = [
  {
    id: "slide1",
    image: "/test/room.png", // dummy bilde no /public/test/
    hotspots: [
      { id: "1", x: 30, y: 60, title: "Dīvāns Oslo", price: "€499", href: "/produkts/divans-oslo", thumb: "/test/1.webp" },
      { id: "2", x: 70, y: 40, title: "Lampa Nord", price: "€79", href: "/produkts/lampa-nord", thumb: "/test/2.webp" },
    ],
  },
];

export default function TestHotspotSlider() {
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="overflow-hidden w-full" ref={emblaRef}>
      <div className="flex">
        {slides.map((slide) => (
          <div className="relative flex-[0_0_100%]" key={slide.id}>
            {/* Attēls */}
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={slide.image}
                alt="Slider image"
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
            </div>

            {/* Hotspoti */}
            {slide.hotspots.map((h) => (
              <div
                key={h.id}
                className="absolute"
                style={{ left: `${h.x}%`, top: `${h.y}%`, transform: "translate(-50%, -50%)" }}
              >
                <div className="group relative">
                  <button
                    aria-label={`${h.title} ${h.price}`}
                    onClick={() => setActive((a) => (a === h.id ? null : h.id))}
                    className="w-6 h-6 rounded-full bg-white border border-gray-400 shadow flex items-center justify-center"
                  >
                    <span className="w-2 h-2 bg-black rounded-full" />
                  </button>
                  {/* Tooltip: visible on hover (desktop) or when active (mobile) */}
                  <div
                    className={
                      `absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full z-10 ` +
                      `min-w-[180px] max-w-[240px] rounded-lg bg-white shadow-lg border border-black/10 p-3 text-sm ` +
                      `opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto ` +
                      `${active === h.id ? 'opacity-100 pointer-events-auto' : ''}`
                    }
                  >
                    {h.thumb && (
                      <Image
                        src={h.thumb}
                        alt={h.title}
                        width={120}
                        height={80}
                        className="mb-2 rounded object-cover"
                      />
                    )}
                    <div className="font-semibold">{h.title}</div>
                    <div className="text-gray-600 mt-1">{h.price}</div>
                    <a href={h.href} className="inline-block mt-2 text-xs font-medium underline hover:no-underline">
                      Apskatīt preci
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}