-- ============================================================
-- Elsa & Joakim – personliga inbjudningslänkar och gäster
-- Kör i Supabase SQL Editor. Skriptet kan köras flera gånger.
-- Byt ut admin-adresserna i is_wedding_admin() och använd samma
-- adresser i miljövariabeln ADMIN_EMAILS.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Tabeller ----------
create table if not exists public.invitations (
  id          uuid primary key default gen_random_uuid(),
  token       uuid not null unique default gen_random_uuid(),
  group_name  text not null check (char_length(group_name) between 1 and 200),
  email       text check (email is null or (char_length(email) <= 200 and position('@' in email) > 1)),
  status      text not null default 'pending' check (status in ('pending', 'sent', 'responded')),
  created_at  timestamptz not null default now()
);

-- E-post är valfri (för databaser där tabellen skapades med not null)
alter table public.invitations alter column email drop not null;

create table if not exists public.guests (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 120),
  attending     boolean,
  dietary_info  text check (char_length(dietary_info) <= 1000),
  needs_bus     boolean not null default false,
  song_request  text check (char_length(song_request) <= 300),
  message       text check (char_length(message) <= 2000)
);

alter table public.guests add column if not exists message text check (char_length(message) <= 2000);

create index if not exists guests_invitation_id_idx on public.guests (invitation_id);

alter table public.invitations enable row level security;
alter table public.guests      enable row level security;

-- ---------- Admin-kontroll ----------
create or replace function public.is_wedding_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(lower(auth.jwt() ->> 'email'), '') in (
    'din-email@example.com',
    'partner-email@example.com'
  );
$$;

-- ---------- RLS: full åtkomst för administratörer ----------
drop policy if exists "Admins har full åtkomst till invitations" on public.invitations;
create policy "Admins har full åtkomst till invitations"
  on public.invitations for all to authenticated
  using ((select public.is_wedding_admin()))
  with check ((select public.is_wedding_admin()));

drop policy if exists "Admins har full åtkomst till guests" on public.guests;
create policy "Admins har full åtkomst till guests"
  on public.guests for all to authenticated
  using ((select public.is_wedding_admin()))
  with check ((select public.is_wedding_admin()));

-- Anonyma besökare har inga policies på tabellerna. De når endast
-- funktionerna nedan, som kräver inbjudans token.

-- ---------- Läsning via token ----------
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
               'song_request', g.song_request,
               'message',      g.message
             ) order by g.name)
      from public.guests g
      where g.invitation_id = i.id
    ), '[]'::jsonb)
  )
  from public.invitations i
  where i.token = p_token;
$$;

-- ---------- Svar via token ----------
-- p_responses: [{ "id": uuid, "attending": bool, "dietary_info": text,
--                 "needs_bus": bool, "song_request": text, "message": text }, ...]
-- p_email fyller endast i en saknad e-postadress, den skriver aldrig över.
drop function if exists public.submit_rsvp(uuid, jsonb);

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
      song_request = case when v_attending then nullif(left(btrim(v_response ->> 'song_request'), 300), '') end,
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
