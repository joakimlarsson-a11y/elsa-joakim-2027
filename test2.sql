grant select, insert, update, delete on public.invitations, public.guests to anon, authenticated;
insert into invitations (group_name,email,token) values ('Kusinerna',null,'22222222-2222-2222-2222-222222222222');
insert into invitations (group_name,email,token) values ('Med mejl','old@x.se','33333333-3333-3333-3333-333333333333');
insert into guests (invitation_id,name) select id,'Lisa' from invitations;
set role anon;
select get_invitation_by_token('22222222-2222-2222-2222-222222222222')->'has_email' as has_email;
do $$ begin
 perform submit_rsvp('22222222-2222-2222-2222-222222222222', jsonb_build_array(jsonb_build_object('id', get_invitation_by_token('22222222-2222-2222-2222-222222222222')->'guests'->0->'id','attending',true)), ' Lisa@Mail.se ');
 perform submit_rsvp('33333333-3333-3333-3333-333333333333', jsonb_build_array(jsonb_build_object('id', get_invitation_by_token('33333333-3333-3333-3333-333333333333')->'guests'->0->'id','attending',true)), 'hijack@x.se');
 perform submit_rsvp('22222222-2222-2222-2222-222222222222', jsonb_build_array(jsonb_build_object('id', get_invitation_by_token('22222222-2222-2222-2222-222222222222')->'guests'->0->'id','attending',false)));
end $$;
select submit_rsvp('22222222-2222-2222-2222-222222222222','[{"id":"00000000-0000-0000-0000-000000000000","attending":true}]','bad');
reset role;
select group_name,email,status from invitations order by group_name;
