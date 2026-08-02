export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type ConnectionStatus =
  | { state: "not-configured" }
  | { state: "ok" }
  | { state: "error"; message: string };

async function checkSupabaseConnection(): Promise<ConnectionStatus> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { state: "not-configured" };
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: { apikey: supabaseAnonKey },
      cache: "no-store",
    });
    if (!response.ok) {
      return { state: "error", message: `HTTP ${response.status}` };
    }
    return { state: "ok" };
  } catch (error) {
    return {
      state: "error",
      message: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

export default async function Page() {
  const status = await checkSupabaseConnection();

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Willtahiti — page de test</h1>
      <p>Statut de connexion au backend Supabase :</p>
      {status.state === "not-configured" && (
        <p>
          ⚠️ Non configuré — copier <code>.env.example</code> vers{" "}
          <code>.env.local</code> et renseigner{" "}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </p>
      )}
      {status.state === "ok" && <p>✅ Connecté au backend Supabase.</p>}
      {status.state === "error" && (
        <p>❌ Échec de connexion : {status.message}</p>
      )}
      <p>
        <a href="/aide-menagere/connexion">Espace aide-ménagère (inscription/connexion)</a>
      </p>
    </main>
  );
}
