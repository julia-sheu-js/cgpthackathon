-- FoodBridge starter schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create type public.org_role as enum ('school', 'charity', 'admin');
create type public.listing_status as enum ('available', 'fully_claimed', 'expired', 'cancelled');
create type public.request_status as enum ('pending', 'approved', 'declined', 'cancelled', 'completed');
create type public.collection_status as enum ('proposed', 'confirmed', 'completed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_name text not null,
  organization_type public.org_role not null,
  email text,
  phone text,
  address text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.food_listings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.profiles(id) on delete cascade,
  food_name text not null,
  category text not null default 'Other',
  total_quantity numeric(10,2) not null check (total_quantity > 0),
  unit text not null default 'portions',
  description text,
  allergens text,
  preparation_time timestamptz,
  collection_deadline timestamptz not null,
  storage_instructions text,
  image_url text,
  status public.listing_status not null default 'available',
  created_at timestamptz not null default now()
);

create table public.food_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.food_listings(id) on delete cascade,
  charity_id uuid not null references public.profiles(id) on delete cascade,
  requested_quantity numeric(10,2) not null check (requested_quantity > 0),
  approved_quantity numeric(10,2) not null default 0 check (approved_quantity >= 0),
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (listing_id, charity_id, id)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.food_requests(id) on delete cascade,
  collection_address text not null,
  collection_time timestamptz,
  contact_person text,
  contact_phone text,
  notes text,
  status public.collection_status not null default 'proposed',
  school_confirmed boolean not null default false,
  charity_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.current_role()
returns public.org_role language sql stable security definer
set search_path = public
as $$ select organization_type from public.profiles where id = auth.uid() $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, organization_name, organization_type, email, phone, address)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'organization_name', 'New organization'),
    coalesce((new.raw_user_meta_data->>'organization_type')::public.org_role, 'charity'),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.food_listings enable row level security;
alter table public.food_requests enable row level security;
alter table public.collections enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

create policy "Profiles visible to authenticated users" on public.profiles
for select to authenticated using (true);
create policy "Users update own profile" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "Listings readable by authenticated users" on public.food_listings
for select to authenticated using (true);
create policy "Schools create listings" on public.food_listings
for insert to authenticated with check (school_id = auth.uid() and public.current_role() = 'school');
create policy "Schools update own listings" on public.food_listings
for update to authenticated using (school_id = auth.uid() or public.current_role() = 'admin')
with check (school_id = auth.uid() or public.current_role() = 'admin');
create policy "Schools delete own listings" on public.food_listings
for delete to authenticated using (school_id = auth.uid() or public.current_role() = 'admin');

create policy "Requests visible to requester and listing school" on public.food_requests
for select to authenticated using (
  charity_id = auth.uid()
  or exists (select 1 from public.food_listings l where l.id = listing_id and l.school_id = auth.uid())
  or public.current_role() = 'admin'
);
create policy "Charities create requests" on public.food_requests
for insert to authenticated with check (charity_id = auth.uid() and public.current_role() = 'charity');
create policy "School or charity updates requests" on public.food_requests
for update to authenticated using (
  charity_id = auth.uid()
  or exists (select 1 from public.food_listings l where l.id = listing_id and l.school_id = auth.uid())
  or public.current_role() = 'admin'
);

create policy "Collections visible to participants" on public.collections
for select to authenticated using (
  exists (
    select 1 from public.food_requests r
    join public.food_listings l on l.id = r.listing_id
    where r.id = request_id and (r.charity_id = auth.uid() or l.school_id = auth.uid())
  ) or public.current_role() = 'admin'
);
create policy "Participants create collections" on public.collections
for insert to authenticated with check (
  exists (
    select 1 from public.food_requests r
    join public.food_listings l on l.id = r.listing_id
    where r.id = request_id and (r.charity_id = auth.uid() or l.school_id = auth.uid())
  )
);
create policy "Participants update collections" on public.collections
for update to authenticated using (
  exists (
    select 1 from public.food_requests r
    join public.food_listings l on l.id = r.listing_id
    where r.id = request_id and (r.charity_id = auth.uid() or l.school_id = auth.uid())
  ) or public.current_role() = 'admin'
);

create policy "Messages visible to collection participants" on public.messages
for select to authenticated using (
  exists (
    select 1 from public.collections c
    join public.food_requests r on r.id = c.request_id
    join public.food_listings l on l.id = r.listing_id
    where c.id = collection_id and (r.charity_id = auth.uid() or l.school_id = auth.uid())
  )
);
create policy "Participants send messages" on public.messages
for insert to authenticated with check (
  sender_id = auth.uid() and exists (
    select 1 from public.collections c
    join public.food_requests r on r.id = c.request_id
    join public.food_listings l on l.id = r.listing_id
    where c.id = collection_id and (r.charity_id = auth.uid() or l.school_id = auth.uid())
  )
);
create policy "Users see own notifications" on public.notifications
for select to authenticated using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Enable realtime for listing/request changes.
alter publication supabase_realtime add table public.food_listings;
alter publication supabase_realtime add table public.food_requests;
