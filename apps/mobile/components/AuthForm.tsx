import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabaseClient';

type Mode = 'inscription' | 'connexion';

type Role = 'aide_menagere' | 'client';

export function AuthForm({ role, title }: { role: Role; title: string }) {
  const supabase = getSupabaseClient();
  const [mode, setMode] = useState<Mode>('inscription');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.subscription.unsubscribe();
  }, [supabase]);

  if (!supabase) {
    return (
      <View style={styles.container}>
        <Text style={styles.status}>
          ⚠️ Non configuré — copier .env.example vers .env et renseigner
          EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY.
        </Text>
      </View>
    );
  }

  async function handleSubmit() {
    if (!supabase) return;
    setError(null);
    setLoading(true);
    const { error } =
      mode === 'inscription'
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { role } },
          })
        : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.status}>✅ Connecté en tant que {user.email}</Text>
        <Pressable style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Se déconnecter</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.modeSwitch}>
        <Pressable
          style={[styles.modeButton, mode === 'inscription' && styles.modeButtonActive]}
          onPress={() => setMode('inscription')}
        >
          <Text>S&apos;inscrire</Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === 'connexion' && styles.modeButtonActive]}
          onPress={() => setMode('connexion')}
        >
          <Text>Se connecter</Text>
        </Pressable>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>
          {mode === 'inscription' ? "S'inscrire" : 'Se connecter'}
        </Text>
      </Pressable>
      {error && <Text style={styles.error}>❌ {error}</Text>}
      {mode === 'inscription' && (
        <Text style={styles.hint}>
          Si la confirmation par email est activée sur le projet Supabase, vérifie ta boîte mail
          avant de pouvoir te connecter.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
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
  modeSwitch: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 8,
  },
  modeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modeButtonActive: {
    backgroundColor: '#e6f4fe',
    borderColor: '#3a8fd6',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
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
  error: {
    color: '#c0392b',
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555',
  },
});
