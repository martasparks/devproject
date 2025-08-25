'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Slider {
  id: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  desktopImageUrl: string;
  mobileImageUrl?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  showContent: boolean;
  isActive: boolean;
  order: number;
}

interface HeroSliderProps {
  initialSliders: Slider[];
}

export default function HeroSlider({ initialSliders }: HeroSliderProps) {
  const [sliders] = useState<Slider[]>(initialSliders);
  const [currentSlide, setCurrentSlide] = useState(0);

  const TRANSITION_MS = 600; // crossfade duration
  const AUTOPLAY_MS = 7000;  // time each slide stays
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoplayRef.current) clearTimeout(autoplayRef.current);
    if (sliders.length > 1) {
      autoplayRef.current = setTimeout(() => {
        nextSlide();
      }, AUTOPLAY_MS);
    }
    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
    };
  }, [sliders.length, currentSlide]);

  const goToSlide = (index: number) => {
    if (sliders.length === 0) return;
    const nextIndex = ((index % sliders.length) + sliders.length) % sliders.length;
    if (nextIndex === currentSlide) return;
    setCurrentSlide(nextIndex);
  };

  const nextSlide = () => {
    if (sliders.length === 0) return;
    goToSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (sliders.length === 0) return;
    goToSlide(currentSlide - 1);
  };


  if (sliders.length === 0) {
    return (
      <section className="h-96 md:h-[700px] overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Laipni lūdzam mūsu e-veikalā!</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Atklāj plašu produktu klāstu ar labākajām cenām. Ātra piegāde, drošs maksājums, izcils serviss.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
            Sākt iepirkšanos
          </button>
        </div>
      </section>
    );
  }

  const slider = sliders[currentSlide];

  return (
    <section className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[16/9] overflow-hidden">

      <div className="absolute inset-0">
        {sliders.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 pointer-events-none transition-opacity duration-[${TRANSITION_MS}ms] ease-out ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={i !== currentSlide}
          >

            <div className="hidden md:block absolute inset-0">
              <Image
                src={s.desktopImageUrl}
                alt={s.title}
                fill
                priority={i === currentSlide}
                className="object-cover object-[70%_60%]"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 100vw"
              />
            </div>

            <div className="md:hidden absolute inset-0">
              <Image
                src={s.mobileImageUrl || s.desktopImageUrl}
                alt={s.title}
                fill
                priority={i === currentSlide}
                className="object-cover object-[50%_75%]"
                sizes="100vw"
              />
            </div>
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/30 pointer-events-none" />
      </div>

      {slider.showContent && (
        <div className="relative z-20 flex items-center h-full py-6">
          <div className="max-w-7xl mx-auto px-4 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
            <div className="max-w-3xl">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3">{slider.title}</h2>
              {slider.subtitle && (
                <h3 className="text-lg md:text-2xl mb-3">{slider.subtitle}</h3>
              )}
              {slider.description && (
                <p className="text-base md:text-xl mb-6 opacity-90 max-w-2xl">{slider.description}</p>
              )}
              {slider.buttonText && slider.buttonUrl && (
                <Link
                  href={slider.buttonUrl}
                  className="inline-block bg-white/90 backdrop-blur px-6 py-3 rounded-lg text-base md:text-lg font-semibold text-gray-900 hover:bg-white transition-colors"
                >
                  {slider.buttonText}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {sliders.length > 1 && (
        <div className="absolute z-30 bottom-6 md:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {sliders.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (autoplayRef.current) clearTimeout(autoplayRef.current);
                goToSlide(index);
              }}
              className={`transition-all ${index === currentSlide ? 'w-3.5 h-3.5 bg-white' : 'w-3 h-3 bg-white/50'} rounded-full`}
            />
          ))}
        </div>
      )}

      {sliders.length > 1 && (
        <>
          <button
            onClick={() => {
              if (autoplayRef.current) clearTimeout(autoplayRef.current);
              prevSlide();
            }}
            className="absolute z-30 left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (autoplayRef.current) clearTimeout(autoplayRef.current);
              nextSlide();
            }}
            className="absolute z-30 right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}