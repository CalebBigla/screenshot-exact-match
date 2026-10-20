import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const siteContentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: async () => {
    const [settings, outreaches, programs, partners] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("outreaches").select("*").order("sort_order"),
      supabase.from("programs").select("*").order("sort_order"),
      supabase.from("partners").select("*").order("sort_order"),
    ]);
    for (const r of [settings, outreaches, programs, partners]) if (r.error) throw r.error;
    return {
      settings: settings.data,
      outreaches: outreaches.data ?? [],
      programs: programs.data ?? [],
      partners: partners.data ?? [],
    };
  },
});
