export type Competition = {
  id: string;
  name: string;
  locked: boolean;
  created_at: string;
} & Partial<RevealSettings>;

export type Criterion = {
  id: string;
  competition_id: string;
  label: string;
  max_points: number;
  position: number;
};

export type Team = {
  id: string;
  competition_id: string;
  project_number: number;
  name: string;
};

export type Jury = {
  id: string;
  competition_id: string;
  name: string;
  is_president: boolean;
};

export type Score = {
  id: string;
  competition_id: string;
  jury_id: string;
  team_id: string;
  criterion_id: string;
  value: number;
};

export const DEFAULT_CRITERIA = [
  { label: "Innovation", max_points: 25 },
  { label: "Impact", max_points: 20 },
  { label: "Faisabilité technique", max_points: 20 },
  { label: "Qualité du prototype", max_points: 15 },
  { label: "Présentation du pitch", max_points: 10 },
  { label: "Réponses aux questions", max_points: 10 },
];

export const totalMax = (criteria: Criterion[]) =>
  criteria.reduce((s, c) => s + Number(c.max_points || 0), 0);

/** Classement agrégé : moyenne des totaux des jurés ayant noté. */
export function buildRanking(
  teams: Team[],
  criteria: Criterion[],
  scores: Score[],
) {
  const byTeam = new Map<string, Map<string, number>>();
  for (const s of scores) {
    if (!byTeam.has(s.team_id)) byTeam.set(s.team_id, new Map());
    const m = byTeam.get(s.team_id)!;
    m.set(s.jury_id, (m.get(s.jury_id) ?? 0) + Number(s.value || 0));
  }
  const rows = teams.map((t) => {
    const m = byTeam.get(t.id) ?? new Map<string, number>();
    const totals = [...m.values()];
    const submitted = totals.length;
    const avg = submitted ? totals.reduce((a, b) => a + b, 0) / submitted : 0;
    return {
      team: t,
      submitted,
      avg,
      max: totalMax(criteria),
    };
  });
  return rows;
}

export type RevealSettings = {
  reveal_order: string; // "best_first" | "last_first"
  reveal_count: number | null; // null = toutes
  reveal_mode: string; // "all" | "one"
  reveal_step: number;
};

/**
 * Sélectionne les équipes proclamées selon les réglages du président.
 * `ranked` doit être trié du meilleur au moins bon. Retourne les lignes
 * dans l'ordre d'affichage, avec leur rang réel (1 = premier).
 */
export function computeReveal<T>(ranked: T[], s: RevealSettings) {
  const n = s.reveal_count && s.reveal_count > 0 ? Math.min(s.reveal_count, ranked.length) : ranked.length;
  const top = ranked.slice(0, n).map((row, i) => ({ row, rank: i + 1 }));
  const ordered = s.reveal_order === "last_first" ? [...top].reverse() : top;
  const shown = s.reveal_mode === "one" ? ordered.slice(0, Math.max(0, Math.min(s.reveal_step, n))) : ordered;
  return { shown, total: n };
}
