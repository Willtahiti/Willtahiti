import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { getSupabaseClient } from './lib/supabaseClient';

type ConnectionStatus =
  | { state: 'not-configured' }
  | { state: 'ok' }
  | { state: 'error'; message: string };

export default function App() {
  const [status, setStatus] = useState<ConnectionStatus>({ state: 'not-configured' });

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus({ state: 'not-configured' });
      return;
    }
    supabase.auth.getSession().then(({ error }) => {
      setStatus(error ? { state: 'error', message: error.message } : { state: 'ok' });
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Willtahiti — écran de test</Text>
      <Text>Statut de connexion au backend Supabase :</Text>
      {status.state === 'not-configured' && (
        <Text style={styles.status}>
          ⚠️ Non configuré — copier .env.example vers .env et renseigner
          EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY.
        </Text>
      )}
      {status.state === 'ok' && <Text style={styles.status}>✅ Connecté au backend Supabase.</Text>}
      {status.state === 'error' && (
        <Text style={styles.status}>❌ Échec de connexion : {status.message}</Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  status: {
    marginTop: 8,
    textAlign: 'center',
  },
});
