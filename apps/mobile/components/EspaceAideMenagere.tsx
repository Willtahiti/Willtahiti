import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { TachesAideMenagere } from './TachesAideMenagere';
import { ConversationAideMenagere } from './ConversationAideMenagere';

type Onglet = 'taches' | 'messages';

export function EspaceAideMenagere({
  supabase,
  user,
  onSignOut,
}: {
  supabase: SupabaseClient;
  user: User;
  onSignOut: () => void;
}) {
  const [onglet, setOnglet] = useState<Onglet>('taches');

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, onglet === 'taches' && styles.tabActive]}
          onPress={() => setOnglet('taches')}
        >
          <Text>Tâches</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, onglet === 'messages' && styles.tabActive]}
          onPress={() => setOnglet('messages')}
        >
          <Text>Messages</Text>
        </Pressable>
      </View>
      {onglet === 'taches' ? (
        <TachesAideMenagere supabase={supabase} user={user} onSignOut={onSignOut} />
      ) : (
        <ConversationAideMenagere supabase={supabase} user={user} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tabActive: {
    backgroundColor: '#e6f4fe',
    borderColor: '#3a8fd6',
  },
});
