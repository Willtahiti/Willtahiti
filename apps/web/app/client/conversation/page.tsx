"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import {
  getOrCreateConversation,
  listMessages,
  sendMessageTexte,
  subscribeToMessages,
  type Message,
} from "../../../lib/messages";

export default function ConversationClientPage() {
  const supabase = getSupabaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [texte, setTexte] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (!sessionUser) return;

      const { data: tache } = await supabase
        .from("taches")
        .select("aide_menagere_id")
        .eq("client_id", sessionUser.id)
        .limit(1)
        .maybeSingle();
      const aideMenagereId = tache?.aide_menagere_id as string | undefined;
      if (!aideMenagereId) return;

      const { data: convId, error } = await getOrCreateConversation(supabase, {
        clientId: sessionUser.id,
        aideMenagereId,
      });
      if (error) setError(error.message);
      else setConversationId(convId);
    });
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !conversationId) return;
    listMessages(supabase, conversationId).then(({ data, error }) => {
      if (error) setError(error.message);
      else setMessages(data ?? []);
    });
    return subscribeToMessages(supabase, conversationId, (message) => {
      setMessages((prev) => [...prev, message]);
    });
  }, [supabase, conversationId]);

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
          Connecte-toi d&apos;abord : <a href="/client/connexion">espace client</a>
        </p>
      </main>
    );
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !user || !conversationId || !texte.trim()) return;
    const { error } = await sendMessageTexte(supabase, {
      conversationId,
      expediteurId: user.id,
      contenuTexte: texte.trim(),
    });
    if (error) setError(error.message);
    else setTexte("");
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 480 }}>
      <h1>Messagerie</h1>
      {!conversationId && <p>Aucune conversation disponible pour l&apos;instant.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {messages.map((m) => (
          <li key={m.id} style={{ textAlign: m.expediteur_id === user.id ? "right" : "left" }}>
            <p>{m.contenu_texte}</p>
          </li>
        ))}
      </ul>
      {conversationId && (
        <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Message"
            value={texte}
            onChange={(event) => setTexte(event.target.value)}
          />
          <button type="submit">Envoyer</button>
        </form>
      )}
      {error && <p role="alert">❌ {error}</p>}
    </main>
  );
}
