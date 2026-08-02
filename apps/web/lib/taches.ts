import type { SupabaseClient } from "@supabase/supabase-js";

export type Tache = {
  id: string;
  client_id: string;
  aide_menagere_id: string;
  contrat_id: string | null;
  description: string;
  statut: "a_faire" | "faite";
  verrouillee: boolean;
  created_at: string;
};

export async function listTachesClient(supabase: SupabaseClient, clientId: string) {
  return supabase
    .from("taches")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .returns<Tache[]>();
}

export async function addTacheLibre(
  supabase: SupabaseClient,
  params: { clientId: string; aideMenagereId: string; description: string },
) {
  return supabase.from("taches").insert({
    client_id: params.clientId,
    aide_menagere_id: params.aideMenagereId,
    description: params.description,
  });
}
