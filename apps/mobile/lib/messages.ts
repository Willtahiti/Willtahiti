import type { SupabaseClient } from '@supabase/supabase-js';

export type Message = {
  id: string;
  conversation_id: string;
  expediteur_id: string;
  contenu_texte: string | null;
  photo_url: string | null;
  horodatage: string;
};

export async function getOrCreateConversation(
  supabase: SupabaseClient,
  params: { clientId: string; aideMenagereId: string },
): Promise<{ data: string | null; error: { message: string } | null }> {
  const existing = await supabase
    .from('conversations')
    .select('id')
    .eq('client_id', params.clientId)
    .eq('aide_menagere_id', params.aideMenagereId)
    .maybeSingle();
  if (existing.error) return { data: null, error: existing.error };
  if (existing.data) return { data: existing.data.id as string, error: null };

  const created = await supabase
    .from('conversations')
    .insert({ client_id: params.clientId, aide_menagere_id: params.aideMenagereId })
    .select('id')
    .single();
  if (created.error) return { data: null, error: created.error };
  return { data: created.data.id as string, error: null };
}

export async function listMessages(supabase: SupabaseClient, conversationId: string) {
  return supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('horodatage', { ascending: true })
    .returns<Message[]>();
}

export async function sendMessageTexte(
  supabase: SupabaseClient,
  params: { conversationId: string; expediteurId: string; contenuTexte: string },
) {
  return supabase.from('messages').insert({
    conversation_id: params.conversationId,
    expediteur_id: params.expediteurId,
    contenu_texte: params.contenuTexte,
  });
}

// photo_url stocke le chemin dans le bucket privé "message-photos" (pas une URL publique) —
// il faut une URL signée pour l'afficher. L'envoi de photo depuis le mobile n'est pas encore
// implémenté (nécessiterait expo-image-picker, voir TODO.md) ; seule la réception/affichage
// d'une photo envoyée depuis le web est couverte ici.
export async function getPhotoSignedUrl(supabase: SupabaseClient, path: string) {
  const { data, error } = await supabase.storage
    .from('message-photos')
    .createSignedUrl(path, 60 * 60);
  return { url: data?.signedUrl ?? null, error };
}

export function subscribeToMessages(
  supabase: SupabaseClient,
  conversationId: string,
  onInsert: (message: Message) => void,
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onInsert(payload.new as Message),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
