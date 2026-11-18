ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS slug text;
CREATE OR REPLACE FUNCTION public._competition_slug() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE base text; s text; n int := 1;
BEGIN
  IF TG_OP='UPDATE' AND NEW.name IS NOT DISTINCT FROM OLD.name AND NEW.slug IS NOT NULL THEN RETURN NEW; END IF;
  base := lower(translate(coalesce(NEW.name,''),'ÀÁÂÃÄÅàáâãäåÈÉÊËèéêëÌÍÎÏìíîïÒÓÔÕÖòóôõöÙÚÛÜùúûüÇçÑñ','AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn'));
  base := trim(both '-' from regexp_replace(base,'[^a-z0-9]+','-','g'));
  IF base='' THEN base:='competition'; END IF;
  s := base;
  WHILE EXISTS(SELECT 1 FROM competitions WHERE slug=s AND id<>NEW.id) LOOP n:=n+1; s:=base||'-'||n; END LOOP;
  NEW.slug := s; RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_competition_slug ON public.competitions;
CREATE TRIGGER trg_competition_slug BEFORE INSERT OR UPDATE ON public.competitions FOR EACH ROW EXECUTE FUNCTION public._competition_slug();
UPDATE public.competitions SET slug=NULL WHERE slug IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS competitions_slug_key ON public.competitions(slug);