"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../../lib/supabaseClient";

type Mode = "inscription" | "connexion";

export default function ConnexionAideMenagerePage() {
  const supabase = getSupabaseClient();
  const [mode, setMode] = useState<Mode>("inscription");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
        ⚠️ Backend non configuré — voir le README.
      </main>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);
    const { error } =
      mode === "inscription"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { role: "aide_menagere" } },
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
      <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
        <h1>Espace aide-ménagère</h1>
        <p>✅ Connecté en tant que {user.email}</p>
        <button onClick={handleSignOut}>Se déconnecter</button>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 360 }}>
      <h1>Espace aide-ménagère</h1>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={() => setMode("inscription")}
          disabled={mode === "inscription"}
        >
          S&apos;inscrire
        </button>
        <button type="button" onClick={() => setMode("connexion")} disabled={mode === "connexion"}>
          Se connecter
        </button>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button type="submit" disabled={loading}>
          {mode === "inscription" ? "S'inscrire" : "Se connecter"}
        </button>
        {error && <p role="alert">❌ {error}</p>}
        {mode === "inscription" && (
          <p style={{ fontSize: "0.85rem" }}>
            Si la confirmation par email est activée sur le projet Supabase, vérifie ta boîte mail
            avant de pouvoir te connecter.
          </p>
        )}
      </form>
    </main>
  );
}
