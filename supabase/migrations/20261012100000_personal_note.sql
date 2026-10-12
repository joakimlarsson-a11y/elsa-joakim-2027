-- Personlig hälsning från brudparet som visas i heron på gästens länk.
alter table public.invitations
  add column if not exists personal_note text
  check (personal_note is null or char_length(personal_note) <= 500);

create or replace function public.get_invitation_by_token(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'group_name',    i.group_name,
    'status',        i.status,
    'has_email',     i.email is not null,
    'personal_note', i.personal_note,
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

revoke all on function public.get_invitation_by_token(uuid) from public;
grant execute on function public.get_invitation_by_token(uuid) to anon, authenticated;
