import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { siteContentQuery } from "@/lib/content";
import hero from "@/assets/hero.jpg";
import feeding from "@/assets/feeding.jpg";
import widows from "@/assets/widows.jpg";
import counsel from "@/assets/counsel.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Melody Gaius Danjuma — Humanitarian, Counselor, Social Worker" },
      {
        name: "description",
        content:
          "Melody Gaius Danjuma feeds the hungry, counsels families and supports widows and children across Taraba, Gombe and Adamawa, Nigeria.",
      },
      { property: "og:title", content: "Melody Gaius Danjuma — Humanitarian" },
      {
        property: "og:description",
        content: "Revealing Jesus by feeding the people — outreaches across northern Nigeria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  component: Index,
});

const outreachImages = [feeding, feeding, widows];
const careImages = [widows, counsel, feeding];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const on = () => setY(window.scrollY);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return y;
}

function Index() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const s = data.settings;
  const y = useScrollY();
  useReveal();
  if (!s) return null;
  const [first, ...rest] = s.name.split(" ");

  return (
    <div className="min-h-screen overflow-x-clip bg-background font-sans text-foreground antialiased">
      {/* Nav */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          y > 40 ? "border-b border-border bg-background/70 py-3 backdrop-blur-xl" : "py-6"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <a href="#top" className="font-display text-2xl tracking-tight">
            {first} <span className="italic text-primary">{rest.join(" ")}</span>
          </a>
          <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <a href="#story" className="transition-colors hover:text-foreground">Story</a>
            <a href="#impact" className="transition-colors hover:text-foreground">Impact</a>
            <a href="#care" className="transition-colors hover:text-foreground">Care</a>
            <a href="#connect" className="transition-colors hover:text-foreground">Connect</a>
          </nav>
          <a href="#connect" className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-105">
            Support the work
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative flex min-h-screen items-end overflow-hidden">
        <img
          src={hero}
          alt={s.name}
          width={1280}
          height={1600}
          className="absolute inset-0 h-full w-full object-cover object-[30%_20%]"
          style={{ transform: `scale(${1.08 + y * 0.0002}) translateY(${y * 0.25}px)` }}
        />
        <div className="absolute inset-0 bg-fade" />
        <div className="absolute inset-0 bg-background/30" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-40" style={{ opacity: Math.max(0, 1 - y / 600) }}>
          <p className="rise text-xs uppercase tracking-[0.35em] text-primary">{s.tagline}</p>
          <h1 className="rise mt-6 max-w-5xl font-display text-6xl leading-[0.95] tracking-tight md:text-8xl lg:text-[8.5rem]" style={{ animationDelay: "0.15s" }}>
            {s.mission.split(/(feeding)/i).map((part, i) =>
              /^feeding$/i.test(part) ? <em key={i} className="text-gold">{part}</em> : part,
            )}
          </h1>
          <div className="rise mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between" style={{ animationDelay: "0.35s" }}>
            <p className="max-w-md text-lg text-muted-foreground">{s.intro}</p>
            <div className="flex flex-wrap gap-3">
              {s.foundation_url && (
                <a href={s.foundation_url} target="_blank" rel="noreferrer" className="rounded-full bg-gold px-7 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105">
                  The Foundation →
                </a>
              )}
              {s.counseling_url && (
                <a href={s.counseling_url} target="_blank" rel="noreferrer" className="rounded-full border border-foreground/25 px-7 py-3.5 text-sm backdrop-blur transition-colors hover:bg-foreground/10">
                  Aviv Counseling
                </a>
              )}
              {!s.foundation_url && !s.counseling_url && (
                <a href="#impact" className="rounded-full bg-gold px-7 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105">
                  See the impact ↓
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border md:grid-cols-4">
          {[
            ...data.outreaches.map((o) => [o.stat, o.location] as const),
            [String(data.partners.length), "Partner organisations"] as const,
          ].slice(0, 4).map(([n, l], i) => (
            <div key={i} className="reveal px-6 py-10" style={{ transitionDelay: `${i * 0.1}s` }}>
              <p className="font-display text-3xl text-gold md:text-4xl">{n}</p>
              <p className="mt-2 text-sm text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story — sticky split */}
      <section id="story" className="mx-auto grid max-w-7xl gap-16 px-6 py-32 md:grid-cols-2">
        <div className="md:sticky md:top-28 md:h-fit">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Her story</p>
          <h2 className="mt-6 font-display text-5xl leading-tight md:text-7xl">
            Faith, food <em className="text-gold">&amp;</em> healing.
          </h2>
          <div className="mt-10 overflow-hidden rounded-2xl">
            <img src={counsel} alt="Counseling session" loading="lazy" width={1600} height={1008} className="aspect-[4/3] w-full object-cover transition-transform duration-[1.5s] hover:scale-105" />
          </div>
        </div>
        <div className="space-y-20 md:pt-40">
          {[
            ["About", s.about],
            ["Recognition", s.recognition],
            ["Counseling", s.counseling],
          ].map(([t, body], i) => (
            <div key={t} className="reveal">
              <span className="font-display text-xl italic text-primary">0{i + 1}</span>
              <h3 className="mt-2 font-display text-4xl">{t}</h3>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact — sticky stacking cards */}
      <section id="impact" className="relative px-6 pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="reveal mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="font-display text-5xl md:text-7xl">
              Regional <em className="text-gold">impact</em>
            </h2>
            <p className="max-w-sm text-muted-foreground">From her home in Takum to communities across northern Nigeria.</p>
          </div>
          <div className="space-y-8">
            {data.outreaches.map((o, i) => (
              <article
                key={o.id}
                className="sticky overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
                style={{ top: `${96 + i * 28}px` }}
              >
                <div className="grid md:grid-cols-2">
                  <div className="relative h-72 md:h-[480px]">
                    <img src={outreachImages[i % outreachImages.length]} alt={o.title} loading="lazy" width={1600} height={1008} className="h-full w-full object-cover" />
                    <span className="absolute left-5 top-5 rounded-full bg-background/70 px-4 py-1.5 text-xs uppercase tracking-widest backdrop-blur">
                      {o.location}
                    </span>
                  </div>
                  <div className="flex flex-col justify-between p-8 md:p-12">
                    <div>
                      {o.date_label && <p className="text-sm text-primary">{o.date_label}</p>}
                      <h3 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{o.title}</h3>
                      <p className="mt-5 text-lg text-muted-foreground">{o.description}</p>
                    </div>
                    <p className="mt-10 font-display text-4xl text-gold md:text-5xl">{o.stat}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Care — pinned image with scrolling list */}
      <Care programs={data.programs} />

      {/* Partners marquee */}
      <section id="connect" className="border-y border-border py-16">
        <p className="mb-8 text-center text-xs uppercase tracking-[0.35em] text-muted-foreground">In partnership with</p>
        <div className="flex overflow-hidden">
          <div className="marquee flex shrink-0 gap-16 pr-16">
            {[...data.partners, ...data.partners, ...data.partners, ...data.partners].map((p, i) => (
              <span key={i} className="whitespace-nowrap font-display text-4xl text-foreground/70 md:text-5xl">
                {p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="hover:text-primary">{p.name}</a> : p.name}
                <span className="ml-16 text-primary">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-6 py-40 text-center">
        <img src={feeding} alt="" loading="lazy" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
        <div className="reveal relative mx-auto max-w-3xl">
          <h2 className="font-display text-5xl leading-tight md:text-7xl">
            Every meal is a <em className="text-gold">message of hope.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">Partner with the Melody Gaius Foundation to reach the next thousand children.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {s.contact_email && (
              <a href={`mailto:${s.contact_email}`} className="rounded-full bg-gold px-8 py-4 text-sm font-medium text-primary-foreground transition-transform hover:scale-105">
                Get in touch
              </a>
            )}
            {s.foundation_url && (
              <a href={s.foundation_url} target="_blank" rel="noreferrer" className="rounded-full border border-foreground/25 px-8 py-4 text-sm transition-colors hover:bg-foreground/10">
                Visit the Foundation
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <span className="font-display text-xl text-foreground">{s.name}</span>
          <span>© {new Date().getFullYear()} · Taraba State, Nigeria</span>
          <Link to="/admin" className="hover:text-foreground">Admin</Link>
        </div>
      </footer>
    </div>
  );
}

function Care({ programs }: { programs: { id: string; title: string; description: string }[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset["i"]));
        }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [programs.length]);

  return (
    <section id="care" className="bg-card">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-32 md:grid-cols-2">
        <div className="md:sticky md:top-0 md:flex md:h-screen md:items-center">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
            {careImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                loading="lazy"
                width={1600}
                height={1008}
                className="absolute inset-0 h-full w-full object-cover transition-all duration-1000"
                style={{ opacity: active % careImages.length === i ? 1 : 0, transform: active % careImages.length === i ? "scale(1)" : "scale(1.1)" }}
              />
            ))}
            <div className="absolute inset-x-0 bottom-0 bg-fade p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-primary">Holistic care</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="font-display text-5xl md:text-7xl">
            Beyond <em className="text-gold">the plate.</em>
          </h2>
          {programs.map((p, i) => (
            <div
              key={p.id}
              data-i={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={`flex min-h-[60vh] flex-col justify-center border-l-2 pl-8 transition-all duration-700 ${
                active === i ? "border-primary opacity-100" : "border-border opacity-30"
              }`}
            >
              <span className="font-display text-6xl italic text-primary">0{i + 1}</span>
              <h3 className="mt-4 font-display text-4xl md:text-5xl">{p.title}</h3>
              <p className="mt-5 max-w-md text-lg text-muted-foreground">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
