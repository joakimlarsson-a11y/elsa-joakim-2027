-- ============================================================
-- Elsa & Joakim – ta bort låtönskemål från OSA
-- Kör i Supabase SQL Editor efter 20261011000000_invitations.sql.
-- Skriptet kan köras flera gånger. Kolumnen guests.song_request
-- lämnas kvar så att inga befintliga data försvinner.
-- ============================================================

create or replace function public.get_invitation_by_token(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'group_name', i.group_name,
    'status',     i.status,
    'has_email',  i.email is not null,
    'guests', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id',           g.id,
               'name',         g.name,
               'attending',    g.attending,
               'dietary_info', g.dietary_info,
               'needs_bus',    g.needs_bus,
               'message',      g.message
             ) order by g.name)
      from public.guests g
      where g.invitation_id = i.id
    ), '[]'::jsonb)
  )
  from public.invitations i
  where i.token = p_token;
$$;

-- p_responses: [{ "id": uuid, "attending": bool, "dietary_info": text,
--                 "needs_bus": bool, "message": text }, ...]
create or replace function public.submit_rsvp(p_token uuid, p_responses jsonb, p_email text default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invitation_id uuid;
  v_response      jsonb;
  v_attending     boolean;
  v_updated       integer;
  v_email         text := nullif(lower(btrim(p_email)), '');
begin
  if p_responses is null or jsonb_typeof(p_responses) <> 'array' or jsonb_array_length(p_responses) = 0 then
    raise exception 'Ogiltigt svar.' using errcode = '22023';
  end if;

  if v_email is not null and (char_length(v_email) > 200 or position('@' in v_email) <= 1) then
    raise exception 'Ogiltig e-postadress.' using errcode = '22023';
  end if;

  select id into v_invitation_id
  from public.invitations
  where token = p_token
  for update;

  if v_invitation_id is null then
    return false;
  end if;

  for v_response in select value from jsonb_array_elements(p_responses) loop
    v_attending := (v_response ->> 'attending')::boolean;
    if v_attending is null then
      raise exception 'Svar saknas för en gäst.' using errcode = '22023';
    end if;

    update public.guests set
      attending    = v_attending,
      dietary_info = case when v_attending then nullif(left(btrim(v_response ->> 'dietary_info'), 1000), '') end,
      needs_bus    = v_attending and coalesce((v_response ->> 'needs_bus')::boolean, false),
      song_request = null,
      message      = case when not v_attending then nullif(left(btrim(v_response ->> 'message'), 2000), '') end
    where id = (v_response ->> 'id')::uuid
      and invitation_id = v_invitation_id;

    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'Okänd gäst.' using errcode = '22023';
    end if;
  end loop;

  if exists (select 1 from public.guests where invitation_id = v_invitation_id and attending is null) then
    raise exception 'Alla gäster i sällskapet måste svara.' using errcode = '22023';
  end if;

  update public.invitations
  set status = 'responded',
      email  = coalesce(email, v_email)
  where id = v_invitation_id;

  return true;
end;
$$;

revoke all on function public.get_invitation_by_token(uuid)    from public;
revoke all on function public.submit_rsvp(uuid, jsonb, text)   from public;
grant execute on function public.get_invitation_by_token(uuid)  to anon, authenticated;
grant execute on function public.submit_rsvp(uuid, jsonb, text) to anon, authenticated;
