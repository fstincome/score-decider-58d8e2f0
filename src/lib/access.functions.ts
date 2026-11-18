// Vérifications de codes faites par la base (fonctions SQL sécurisées) :
// aucune clé secrète serveur requise, donc fonctionne sur Lovable comme sur Vercel.
import { supabase } from "@/integrations/supabase/client";

type LoginResult =
  | { ok: false }
  | { ok: true; role: "admin" }
  | {
      ok: true;
      role: "jury";
      juryId: string;
      juryName: string;
      isPresident: boolean;
      competitionId: string | null;
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export async function loginWithCode({ data }: { data: { code: string } }) {
  const code = String(data?.code ?? "").trim();
  if (!code) return { ok: false } as LoginResult;
  return rpc<LoginResult>("login_with_code", { _code: code });
}

export async function listPresidents({ data }: { data: { adminCode: string } }) {
  return rpc<
    {
      id: string;
      name: string;
      code: string;
      competitionId: string | null;
      competitionName: string | null;
      locked: boolean;
    }[]
  >("admin_list_presidents", { _admin_code: data.adminCode });
}

export async function createPresident({
  data,
}: {
  data: { adminCode: string; name: string; code: string };
}) {
  const id = await rpc<string>("admin_create_president", {
    _admin_code: data.adminCode,
    _name: data.name.trim(),
    _code: data.code.trim(),
  });
  return { id };
}

export async function setPresidentCode({
  data,
}: {
  data: { adminCode: string; presidentId: string; code: string };
}) {
  await rpc("admin_set_president_code", {
    _admin_code: data.adminCode,
    _president: data.presidentId,
    _code: data.code.trim(),
  });
  return { ok: true };
}

export async function deletePresident({
  data,
}: {
  data: { adminCode: string; presidentId: string };
}) {
  await rpc("admin_delete_president", {
    _admin_code: data.adminCode,
    _president: data.presidentId,
  });
  return { ok: true };
}

export async function listJuryCodes({
  data,
}: {
  data: { code: string; competitionId: string };
}) {
  return rpc<{ jury_id: string; code: string }[]>("president_list_jury_codes", {
    _code: data.code,
    _competition: data.competitionId,
  });
}

export async function setJuryCode({
  data,
}: {
  data: { code: string; juryId: string; juryCode: string };
}) {
  await rpc("president_set_jury_code", {
    _code: data.code,
    _jury: data.juryId,
    _jury_code: data.juryCode.trim(),
  });
  return { ok: true };
}
