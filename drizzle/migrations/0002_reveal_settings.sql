ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS reveal_order text NOT NULL DEFAULT 'best_first',
  ADD COLUMN IF NOT EXISTS reveal_count integer,
  ADD COLUMN IF NOT EXISTS reveal_mode text NOT NULL DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS reveal_step integer NOT NULL DEFAULT 0;