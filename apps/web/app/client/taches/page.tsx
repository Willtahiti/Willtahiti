"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import { addTacheLibre, listTachesClient, type Tache } from "../../../lib/taches";

export default function TachesClientPage() {
  const supabase = getSupabaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [taches, setTaches] = useState<Tache[]>([]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh(userId: string) {
    if (!supabase) return;
    const { data, error } = await listTachesClient(supabase, userId);
    if (error) setError(error.message);
    else setTaches(data ?? []);
  }

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) refresh(sessionUser.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  if (!supabase) {
    return (
      <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
        ⚠️ Backend non configuré — voir le README.
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
        <p>
          Connecte-toi d&apos;abord :{" "}
          <a href="/client/connexion">espace client</a>
        </p>
      </main>
    );
  }

  const verrouillees = taches.filter((t) => t.verrouillee);
  const libres = taches.filter((t) => !t.verrouillee);
  const aideMenagereId = taches[0]?.aide_menagere_id;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !user || !aideMenagereId) return;
    setError(null);
    setLoading(true);
    const { error } = await addTacheLibre(supabase, {
      clientId: user.id,
      aideMenagereId,
      description,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDescription("");
    refresh(user.id);
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 480 }}>
      <h1>Mes tâches</h1>

      <h2>Tâches du contrat</h2>
      {verrouillees.length === 0 && <p>Aucune tâche de contrat pour l&apos;instant.</p>}
      <ul>
        {verrouillees.map((t) => (
          <li key={t.id}>
            <input type="checkbox" checked={t.statut === "faite"} disabled readOnly /> {t.description}
          </li>
        ))}
      </ul>

      <h2>Tâches ajoutées</h2>
      {libres.length === 0 && <p>Aucune tâche ajoutée pour l&apos;instant.</p>}
      <ul>
        {libres.map((t) => (
          <li key={t.id}>
            <input type="checkbox" checked={t.statut === "faite"} disabled readOnly /> {t.description}
          </li>
        ))}
      </ul>

      {aideMenagereId ? (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <input
            type="text"
            placeholder="Nouvelle tâche"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <button type="submit" disabled={loading}>
            Ajouter
          </button>
        </form>
      ) : (
        <p style={{ fontSize: "0.85rem" }}>
          Aucune aide-ménagère associée pour l&apos;instant — impossible d&apos;ajouter une tâche
          libre.
        </p>
      )}
      {error && <p role="alert">❌ {error}</p>}
    </main>
  );
}
