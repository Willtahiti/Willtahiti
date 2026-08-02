-- À l'inscription (auth.users), crée automatiquement la ligne public.users correspondante.
-- Le rôle est lu dans les métadonnées passées à supabase.auth.signUp({ options: { data: { role } } }).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, role)
  values (new.id, (new.raw_user_meta_data ->> 'role')::public.user_role);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
