import type { SupabaseClient } from '@supabase/supabase-js';

export type Tache = {
  id: string;
  client_id: string;
  aide_menagere_id: string;
  contrat_id: string | null;
  description: string;
  statut: 'a_faire' | 'faite';
  verrouillee: boolean;
  created_at: string;
};

export async function listTachesAideMenagere(supabase: SupabaseClient, aideMenagereId: string) {
  return supabase
    .from('taches')
    .select('*')
    .eq('aide_menagere_id', aideMenagereId)
    .order('created_at', { ascending: true })
    .returns<Tache[]>();
}

export async function marquerTacheFaite(supabase: SupabaseClient, tacheId: string) {
  return supabase.from('taches').update({ statut: 'faite' }).eq('id', tacheId);
}
