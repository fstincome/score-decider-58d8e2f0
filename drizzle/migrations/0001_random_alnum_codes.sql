CREATE OR REPLACE FUNCTION public._random_code() RETURNS text
LANGUAGE plpgsql VOLATILE SET search_path=public AS $$
DECLARE alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; b bytea; out text := ''; i int;
BEGIN
  LOOP
    b := decode(replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-',''),'hex');
    out := '';
    FOR i IN 0..9 LOOP out := out || substr(alphabet, (get_byte(b,i*3) % 32)+1, 1); END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM access_codes WHERE code=out);
  END LOOP;
  RETURN out;
END $$;

CREATE OR REPLACE FUNCTION public._assign_code(_jury uuid, _code text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  DELETE FROM access_codes WHERE jury_id=_jury;
  INSERT INTO access_codes(code,role,jury_id) VALUES (_random_code(),'jury',_jury);
END $$;

CREATE OR REPLACE FUNCTION public.login_with_code(_code text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r record; j record;
BEGIN
  SELECT role, jury_id INTO r FROM access_codes WHERE code=upper(trim(_code)) LIMIT 1;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false); END IF;
  IF r.role='admin' THEN RETURN jsonb_build_object('ok',true,'role','admin'); END IF;
  SELECT id,name,is_president,competition_id INTO j FROM juries WHERE id=r.jury_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false); END IF;
  RETURN jsonb_build_object('ok',true,'role','jury','juryId',j.id,'juryName',j.name,'isPresident',j.is_president,'competitionId',j.competition_id);
END $$;

CREATE OR REPLACE FUNCTION public._assert_admin(_code text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM access_codes WHERE code=upper(trim(_code)) AND role='admin') THEN
    RAISE EXCEPTION 'Accès refusé'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public._assert_president(_code text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pid uuid;
BEGIN
  SELECT j.id INTO pid FROM access_codes a JOIN juries j ON j.id=a.jury_id
   WHERE a.code=upper(trim(_code)) AND a.role='jury' AND j.is_president;
  IF pid IS NULL THEN RAISE EXCEPTION 'Accès refusé'; END IF;
  RETURN pid;
END $$;

CREATE OR REPLACE FUNCTION public.president_list_jury_codes(_code text,_competition uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pid uuid;
BEGIN
  pid := _assert_president(_code);
  IF NOT EXISTS (SELECT 1 FROM competitions WHERE id=_competition AND owner_jury_id=pid) THEN
    RAISE EXCEPTION 'Accès refusé'; END IF;
  RETURN COALESCE((SELECT jsonb_agg(jsonb_build_object('jury_id',a.jury_id,'code',a.code))
   FROM access_codes a JOIN juries j ON j.id=a.jury_id
   WHERE j.competition_id=_competition AND NOT j.is_president),'[]'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.president_set_jury_code(_code text,_jury uuid,_jury_code text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pid uuid;
BEGIN
  pid := _assert_president(_code);
  IF NOT EXISTS (SELECT 1 FROM juries j JOIN competitions c ON c.id=j.competition_id
     WHERE j.id=_jury AND NOT j.is_president AND c.owner_jury_id=pid) THEN
    RAISE EXCEPTION 'Accès refusé'; END IF;
  PERFORM _assign_code(_jury,'');
END $$;

REVOKE ALL ON FUNCTION public._random_code() FROM PUBLIC, anon, authenticated;

UPDATE access_codes SET code = _random_code();