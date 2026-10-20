import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { siteContentQuery } from "@/lib/content";

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

function Index() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const s = data.settings;
  if (!s) return null;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-semibold">{s.name}</span>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <a href="#impact" className="hover:text-foreground">Impact</a>
          <a href="#care" className="hover:text-foreground">Care</a>
          <a href="#connect" className="hover:text-foreground">Connect</a>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">{s.tagline}</p>
        <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
          “{s.mission}”
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">{s.intro}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          {s.foundation_url && (
            <a href={s.foundation_url} target="_blank" rel="noreferrer" className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Melody Gaius Foundation
            </a>
          )}
          {s.counseling_url && (
            <a href={s.counseling_url} target="_blank" rel="noreferrer" className="rounded-full border border-foreground/30 px-6 py-3 text-sm font-medium hover:bg-secondary">
              Aviv Counseling
            </a>
          )}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl">About</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{s.about}</p>
          </div>
          <div className="space-y-8">
            <div className="border-l-2 border-primary pl-5">
              <h3 className="font-display text-xl">Recognition</h3>
              <p className="mt-2 text-muted-foreground">{s.recognition}</p>
            </div>
            <div className="border-l-2 border-accent pl-5">
              <h3 className="font-display text-xl">Counseling</h3>
              <p className="mt-2 text-muted-foreground">{s.counseling}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="impact" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="font-display text-4xl">Regional impact</h2>
        <div className="mt-12 divide-y divide-border">
          {data.outreaches.map((o) => (
            <article key={o.id} className="grid gap-4 py-8 md:grid-cols-[200px_1fr_220px]">
              <div>
                <p className="text-sm font-semibold text-primary">{o.location}</p>
                {o.date_label && <p className="text-sm text-muted-foreground">{o.date_label}</p>}
              </div>
              <div>
                <h3 className="font-display text-2xl">{o.title}</h3>
                <p className="mt-2 text-muted-foreground">{o.description}</p>
              </div>
              <p className="font-display text-2xl text-accent md:text-right">{o.stat}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="care" className="bg-accent text-accent-foreground">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="font-display text-4xl">Holistic care</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {data.programs.map((p, i) => (
              <div key={p.id}>
                <span className="font-display text-5xl opacity-50">0{i + 1}</span>
                <h3 className="mt-3 font-display text-2xl">{p.title}</h3>
                <p className="mt-3 opacity-85">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="connect" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="font-display text-3xl">Partners</h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {data.partners.map((p) => (
            <li key={p.id} className="rounded-full border border-border bg-card px-5 py-2 text-sm">
              {p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="hover:text-primary">{p.name}</a> : p.name}
            </li>
          ))}
        </ul>
        {s.contact_email && (
          <p className="mt-12 text-lg">
            Get in touch: <a href={`mailto:${s.contact_email}`} className="text-primary underline">{s.contact_email}</a>
          </p>
        )}
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {s.name} · <Link to="/admin" className="hover:text-foreground">Admin</Link>
      </footer>
    </div>
  );
}
