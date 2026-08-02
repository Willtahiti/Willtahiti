import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import {
  getOrCreateConversation,
  listMessages,
  sendMessageTexte,
  subscribeToMessages,
  type Message,
} from '../lib/messages';

export function ConversationAideMenagere({
  supabase,
  user,
}: {
  supabase: SupabaseClient;
  user: User;
}) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [texte, setTexte] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: tache } = await supabase
        .from('taches')
        .select('client_id')
        .eq('aide_menagere_id', user.id)
        .limit(1)
        .maybeSingle();
      const clientId = tache?.client_id as string | undefined;
      if (!clientId) return;

      const { data: convId, error } = await getOrCreateConversation(supabase, {
        clientId,
        aideMenagereId: user.id,
      });
      if (error) setError(error.message);
      else setConversationId(convId);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    listMessages(supabase, conversationId).then(({ data, error }) => {
      if (error) setError(error.message);
      else setMessages(data ?? []);
    });
    return subscribeToMessages(supabase, conversationId, (message) => {
      setMessages((prev) => [...prev, message]);
    });
  }, [supabase, conversationId]);

  async function handleSend() {
    if (!conversationId || !texte.trim()) return;
    const { error } = await sendMessageTexte(supabase, {
      conversationId,
      expediteurId: user.id,
      contenuTexte: texte.trim(),
    });
    if (error) setError(error.message);
    else setTexte('');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messagerie</Text>
      {!conversationId && <Text style={styles.status}>Aucune conversation disponible pour l&apos;instant.</Text>}
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={item.expediteur_id === user.id ? styles.bubbleMine : styles.bubbleTheirs}>
            <Text>{item.contenu_texte}</Text>
          </View>
        )}
      />
      {conversationId && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            value={texte}
            onChangeText={setTexte}
          />
          <Pressable style={styles.button} onPress={handleSend}>
            <Text style={styles.buttonText}>Envoyer</Text>
          </Pressable>
        </View>
      )}
      {error && <Text style={styles.error}>❌ {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  status: {
    textAlign: 'center',
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: '#e6f4fe',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
  },
  button: {
    backgroundColor: '#171717',
    borderRadius: 6,
    padding: 12,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    color: '#c0392b',
    textAlign: 'center',
  },
});
