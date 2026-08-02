import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { listTachesAideMenagere, marquerTacheFaite, type Tache } from '../lib/taches';

export function TachesAideMenagere({
  supabase,
  user,
  onSignOut,
}: {
  supabase: SupabaseClient;
  user: User;
  onSignOut: () => void;
}) {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const { data, error } = await listTachesAideMenagere(supabase, user.id);
    if (error) setError(error.message);
    else setTaches(data ?? []);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggle(tache: Tache) {
    if (tache.statut === 'faite') return;
    const { error } = await marquerTacheFaite(supabase, tache.id);
    if (error) setError(error.message);
    else refresh();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes tâches</Text>
      <Text style={styles.status}>Connectée en tant que {user.email}</Text>
      <FlatList
        data={taches}
        keyExtractor={(t) => t.id}
        ListEmptyComponent={<Text style={styles.status}>Aucune tâche pour l&apos;instant.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.tacheRow} onPress={() => handleToggle(item)}>
            <Text>{item.statut === 'faite' ? '☑' : '☐'}</Text>
            <Text style={styles.tacheDescription}>
              {item.description} {item.verrouillee ? '(contrat)' : '(libre)'}
            </Text>
          </Pressable>
        )}
      />
      {error && <Text style={styles.error}>❌ {error}</Text>}
      <Pressable style={styles.button} onPress={onSignOut}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </Pressable>
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
  tacheRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tacheDescription: {
    flexShrink: 1,
  },
  error: {
    color: '#c0392b',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#171717',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
