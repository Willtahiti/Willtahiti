import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthForm } from './components/AuthForm';
import { TachesAideMenagere } from './components/TachesAideMenagere';
import { getSupabaseClient } from './lib/supabaseClient';

type Role = 'aide_menagere' | 'client';

export default function App() {
  const supabase = getSupabaseClient();
  const [role, setRole] = useState<Role | null>(null);

  if (!supabase) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Willtahiti — écran de test</Text>
        <Text style={styles.status}>
          ⚠️ Non configuré — copier .env.example vers .env et renseigner
          EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY.
        </Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!role) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Willtahiti</Text>
        <Text style={styles.status}>Tu es...</Text>
        <Pressable style={styles.button} onPress={() => setRole('aide_menagere')}>
          <Text style={styles.buttonText}>Une aide-ménagère</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => setRole('client')}>
          <Text style={styles.buttonText}>Un(e) client(e)</Text>
        </Pressable>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setRole(null)}>
        <Text style={styles.back}>‹ Retour</Text>
      </Pressable>
      <AuthForm
        role={role}
        title={role === 'aide_menagere' ? 'Espace aide-ménagère' : 'Espace client'}
        renderLoggedIn={
          role === 'aide_menagere'
            ? ({ supabase, user, onSignOut }) => (
                <TachesAideMenagere supabase={supabase} user={user} onSignOut={onSignOut} />
              )
            : undefined
        }
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  status: {
    marginTop: 8,
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
  back: {
    color: '#3a8fd6',
    marginBottom: 12,
  },
});
