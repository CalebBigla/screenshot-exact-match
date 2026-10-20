import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { siteContentQuery } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Content editor — Melody Gaius Danjuma" },
      { name: "description", content: "Edit the content of Melody Gaius Danjuma's website." },
      { property: "og:title", content: "Content editor" },
      { property: "og:description", content: "Site content management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return setIsAdmin(null);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (!ready) return null;
  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link to="/" className="font-display text-lg">← View site</Link>
        {session && (
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
            Sign out
          </Button>
        )}
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        {!session ? (
          <AuthForm />
        ) : isAdmin === null ? null : !isAdmin ? (
          <p className="text-muted-foreground">This account doesn't have editing access.</p>
        ) : (
          <Editor />
        )}
      </main>
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (mode === "up" && !data.session) toast.success("Check your email to confirm your account.");
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4">
      <h1 className="font-display text-3xl">{mode === "in" ? "Sign in" : "Create account"}</h1>
      <p className="text-sm text-muted-foreground">The first account created becomes the site editor.</p>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pw">Password</Label>
        <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {mode === "in" ? "Sign in" : "Create account"}
      </Button>
      <button type="button" className="text-sm text-primary underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "Need an account? Create one" : "Have an account? Sign in"}
      </button>
    </form>
  );
}

const settingFields = [
  ["name", "Name", false],
  ["tagline", "Tagline", false],
  ["mission", "Mission quote", false],
  ["intro", "Intro", true],
  ["about", "About", true],
  ["recognition", "Recognition", true],
  ["counseling", "Counseling", true],
  ["foundation_url", "Foundation website link", false],
  ["counseling_url", "Aviv Counseling link", false],
  ["contact_email", "Contact email", false],
] as const;

function Editor() {
  const qc = useQueryClient();
  const { data } = useQuery(siteContentQuery);
  const refresh = () => qc.invalidateQueries({ queryKey: siteContentQuery.queryKey });
  if (!data?.settings) return null;

  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="outreaches">Outreaches</TabsTrigger>
        <TabsTrigger value="programs">Care programs</TabsTrigger>
        <TabsTrigger value="partners">Partners</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <SettingsForm initial={data.settings} onSaved={refresh} />
      </TabsContent>
      <TabsContent value="outreaches">
        <ListEditor table="outreaches" rows={data.outreaches} onChange={refresh}
          fields={[["location", "Location"], ["title", "Title"], ["date_label", "Date"], ["stat", "Highlight number"], ["description", "Description", true]]} />
      </TabsContent>
      <TabsContent value="programs">
        <ListEditor table="programs" rows={data.programs} onChange={refresh}
          fields={[["title", "Title"], ["description", "Description", true]]} />
      </TabsContent>
      <TabsContent value="partners">
        <ListEditor table="partners" rows={data.partners} onChange={refresh}
          fields={[["name", "Name"], ["url", "Website link"]]} />
      </TabsContent>
    </Tabs>
  );
}

function SettingsForm({ initial, onSaved }: { initial: Record<string, unknown>; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  async function save() {
    const patch = Object.fromEntries(settingFields.map(([k]) => [k, form[k] ?? ""]));
    const { error } = await supabase.from("site_settings").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    onSaved();
  }
  return (
    <div className="space-y-4 pt-4">
      {settingFields.map(([k, label, long]) => (
        <div key={k} className="space-y-2">
          <Label>{label}</Label>
          {long ? (
            <Textarea rows={4} value={String(form[k] ?? "")} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          ) : (
            <Input value={String(form[k] ?? "")} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          )}
        </div>
      ))}
      <Button onClick={save}>Save changes</Button>
    </div>
  );
}

type Table = "outreaches" | "programs" | "partners";
type Field = readonly [string, string, boolean?];

function ListEditor({ table, rows, fields, onChange }: {
  table: Table;
  rows: Array<Record<string, unknown> & { id: string; sort_order: number }>;
  fields: Field[];
  onChange: () => void;
}) {
  async function add() {
    const next = (rows.at(-1)?.sort_order ?? 0) + 1;
    const { error } = await supabase.from(table).insert({ sort_order: next });
    if (error) { toast.error(error.message); return; }
    onChange();
  }
  return (
    <div className="space-y-6 pt-4">
      {rows.map((r) => (
        <RowEditor key={r.id} table={table} row={r} fields={fields} onChange={onChange} />
      ))}
      <Button variant="outline" onClick={add}>+ Add item</Button>
    </div>
  );
}

function RowEditor({ table, row, fields, onChange }: {
  table: Table;
  row: Record<string, unknown> & { id: string; sort_order: number };
  fields: Field[];
  onChange: () => void;
}) {
  const [form, setForm] = useState(row);
  async function save() {
    const patch = Object.fromEntries([...fields.map(([k]) => [k, form[k] ?? ""]), ["sort_order", Number(form.sort_order) || 0]]);
    const { error } = await supabase.from(table).update(patch).eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    onChange();
  }
  async function remove() {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    onChange();
  }
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-5">
      {fields.map(([k, label, long]) => (
        <div key={k} className="space-y-1">
          <Label>{label}</Label>
          {long ? (
            <Textarea rows={3} value={String(form[k] ?? "")} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          ) : (
            <Input value={String(form[k] ?? "")} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          )}
        </div>
      ))}
      <div className="flex items-end gap-3">
        <div className="w-24 space-y-1">
          <Label>Order</Label>
          <Input type="number" value={String(form.sort_order)} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
        </div>
        <Button onClick={save}>Save</Button>
        <Button variant="ghost" className="text-destructive" onClick={remove}>Delete</Button>
      </div>
    </div>
  );
}
