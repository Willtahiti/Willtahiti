import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { supabase } from './lib/supabase';

export default function App() {
  const [status, setStatus] = useState('Connecting to Supabase...');

  useEffect(() => {
    supabase.auth.getSession().then(({ error }) => {
      setStatus(error ? `Supabase error: ${error.message}` : 'Connected to Supabase ✓');
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>{status}</Text>
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
  },
});
