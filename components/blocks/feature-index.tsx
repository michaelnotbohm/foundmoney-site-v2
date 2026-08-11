"use client";

/**
 * FeatureIndex — "Ledger Index" variant for feature_grid
 * ------------------------------------------------------
 * An editorial, full-width numbered index that replaces the card grid.
 * Each row: oversized numeral + display-serif title. Hover/tap expands
 * the row to reveal the body copy, draws a gold rule across the width,
 * and warms the background to the surface tone.
 *
 * Registered as block type: feature_index -> FeatureIndexBlock
 * (This registry maps type -> component; variants resolve inside components.)
 *
 * Content shape (identical to feature_grid, so sections switch by
 * changing their type — no content migration):
 * {
 *   heading?: string,
 *   intro?: string,
 *   items: [{ title: string, body: string, href?: string }]
 * }
 *
 * Generic + theme-token-driven: no business-specific values. All colors
 * read CSS variables written from the tenant theme, with hex fallbacks
 * matching the current token values in case a variable name differs.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type FeatureIndexItem = {
  title: string;
  body: string;
  href?: string;
};

type FeatureIndexContent = {
  heading?: string;
  intro?: string;
  linkLabel?: string;
  items?: FeatureIndexItem[];
};

const tokens = {
  foreground: "var(--foreground, #1B241F)",
  muted: "var(--muted, #6F6E60)",
  accent: "var(--accent, #B08A3F)",
  surface: "var(--surface, #F1EDE1)",
  border: "var(--border, #DAD3C1)",
  fontHeading: "var(--font-heading, 'Fraunces', serif)",
};

export function FeatureIndexBlock({
  content,
}: {
  content: FeatureIndexContent;
}) {
  const items = content?.items ?? [];
  const [active, setActive] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // One-time staggered reveal on scroll into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="mx-auto w-full max-w-[1200px] px-6 py-20 md:py-28"
      aria-label={content?.heading ?? "Services index"}
    >
      {/* Section header: small-caps eyebrow rule + heading */}
      {(content?.heading || content?.intro) && (
        <header className="mb-12 md:mb-16">
          {content?.heading && (
            <div className="flex items-baseline gap-5">
              <span
                aria-hidden
                className="hidden h-px w-12 shrink-0 translate-y-[-0.35em] md:block"
                style={{ backgroundColor: tokens.accent }}
              />
              <h2
                className="text-4xl leading-[1.05] md:text-5xl"
                style={{
                  fontFamily: tokens.fontHeading,
                  color: tokens.foreground,
                }}
              >
                {content.heading}
              </h2>
            </div>
          )}
          {content?.intro && (
            <p
              className="mt-4 max-w-xl text-base md:ml-[4.25rem]"
              style={{ color: tokens.muted }}
            >
              {content.intro}
            </p>
          )}
        </header>
      )}

      {/* Top hairline */}
      <div className="h-px w-full" style={{ backgroundColor: tokens.border }} />

      <ul className="list-none p-0" role="list">
        {items.map((item, i) => {
          const isActive = active === i;
          const number = String(i + 1).padStart(2, "0");

          return (
            <li
              key={item.title}
              className="relative"
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? "translateY(0)" : "translateY(24px)",
                transition:
                  "opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)",
                transitionDelay: `${i * 110}ms`,
              }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {/* Row background tint on active */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -mx-6 transition-opacity duration-500 md:-mx-10"
                style={{
                  backgroundColor: tokens.surface,
                  opacity: isActive ? 1 : 0,
                }}
              />

              <button
                type="button"
                className="relative z-[1] flex w-full cursor-pointer items-baseline gap-5 py-8 text-left md:gap-10 md:py-10"
                aria-expanded={isActive}
                onClick={() => setActive(isActive ? null : i)}
              >
                {/* Numeral */}
                <span
                  className="w-12 shrink-0 text-sm font-medium tracking-[0.2em] transition-colors duration-400 md:w-16 md:text-base"
                  style={{
                    color: isActive ? tokens.accent : tokens.muted,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {number}
                </span>

                {/* Title */}
                <span
                  className="flex-1 text-2xl leading-[1.12] transition-transform duration-500 md:text-[2.6rem]"
                  style={{
                    fontFamily: tokens.fontHeading,
                    color: tokens.foreground,
                    transform: isActive ? "translateX(6px)" : "translateX(0)",
                  }}
                >
                  {item.title}
                </span>

                {/* Arrow indicator */}
                <span
                  aria-hidden
                  className="hidden shrink-0 transition-all duration-500 md:block"
                  style={{
                    color: isActive ? tokens.accent : tokens.muted,
                    transform: isActive
                      ? "translateX(0) rotate(0deg)"
                      : "translateX(-8px) rotate(-45deg)",
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M13 5l7 7-7 7" />
                  </svg>
                </span>
              </button>

              {/* Expanding body — 0fr -> 1fr grid trick for smooth height */}
              <div
                className="relative z-[1] grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ gridTemplateRows: isActive ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-5 pb-10 pl-[4.25rem] pr-2 md:flex-row md:items-end md:justify-between md:gap-16 md:pl-[6.5rem]">
                    <p
                      className="max-w-2xl text-base leading-relaxed md:text-lg"
                      style={{
                        color: tokens.muted,
                        opacity: isActive ? 1 : 0,
                        transform: isActive
                          ? "translateY(0)"
                          : "translateY(8px)",
                        transition:
                          "opacity 500ms ease 120ms, transform 500ms ease 120ms",
                      }}
                    >
                      {item.body}
                    </p>
                    {item.href && (
                      <Link
                        href={item.href}
                        className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium tracking-wide"
                        style={{
                          color: tokens.foreground,
                          opacity: isActive ? 1 : 0,
                          transition: "opacity 500ms ease 200ms",
                        }}
                      >
                        <span
                          className="border-b pb-0.5 transition-colors duration-300"
                          style={{ borderColor: tokens.accent }}
                        >
                          {content?.linkLabel ?? "Learn more"}
                        </span>
                        <span
                          aria-hidden
                          className="transition-transform duration-300 group-hover:translate-x-1"
                          style={{ color: tokens.accent }}
                        >
                          →
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom rule: hairline that turns gold and "draws" on active */}
              <div className="relative h-px w-full">
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: tokens.border }}
                />
                <div
                  className="absolute inset-0 origin-left transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    backgroundColor: tokens.accent,
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
