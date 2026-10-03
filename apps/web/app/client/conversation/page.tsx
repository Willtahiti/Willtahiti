"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import {
  getOrCreateConversation,
  getPhotoSignedUrl,
  listMessages,
  sendMessagePhoto,
  sendMessageTexte,
  subscribeToMessages,
  type Message,
} from "../../../lib/messages";

function MessageBubble({
  supabase,
  message,
  mine,
}: {
  supabase: SupabaseClient;
  message: Message;
  mine: boolean;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!message.photo_url) return;
    getPhotoSignedUrl(supabase, message.photo_url).then(({ url }) => setPhotoUrl(url));
  }, [supabase, message.photo_url]);

  return (
    <li style={{ textAlign: mine ? "right" : "left" }}>
      {message.contenu_texte && <p>{message.contenu_texte}</p>}
      {message.photo_url && photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="Photo envoyée" style={{ maxWidth: 200, borderRadius: 8 }} />
      )}
    </li>
  );
}

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

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!supabase || !user || !conversationId || !file) return;
    const { error } = await sendMessagePhoto(supabase, {
      conversationId,
      expediteurId: user.id,
      file,
    });
    if (error) setError(error.message);
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 480 }}>
      <h1>Messagerie</h1>
      {!conversationId && <p>Aucune conversation disponible pour l&apos;instant.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {messages.map((m) => (
          <MessageBubble key={m.id} supabase={supabase} message={m} mine={m.expediteur_id === user.id} />
        ))}
      </ul>
      {conversationId && (
        <>
          <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="Message"
              value={texte}
              onChange={(event) => setTexte(event.target.value)}
            />
            <button type="submit">Envoyer</button>
          </form>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ marginTop: "0.5rem" }}
          />
        </>
      )}
      {error && <p role="alert">❌ {error}</p>}
    </main>
  );
}
