-- Kidan Shop MVP backend schema
-- Run this once in Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text not null,
  category text not null,
  color text not null default 'Black',
  condition text not null default 'Used',
  price numeric(10,2) not null check (price >= 0),
  description text not null default '',
  seller_name text not null default 'Seller',
  status text not null default 'active',
  tag text not null default 'used',
  created_at timestamptz not null default now()
);

create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, listing_id)
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  listing_id uuid not null references public.listings(id) on delete cascade,
  seller_name text not null default 'Seller',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, listing_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender text not null check (sender in ('buyer', 'seller')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.support_threads (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  status text not null default 'open',
  customer_label text not null default 'Website visitor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.support_threads(id) on delete cascade,
  sender text not null check (sender in ('user', 'agent', 'system')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  listing_id text not null,
  listing_title text not null,
  seller_name text not null default 'Seller',
  buyer_user_id uuid,
  buyer_email text not null default '',
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'USD',
  status text not null default 'pending_payment_setup',
  provider text not null default 'manual_placeholder',
  provider_session_id text,
  delivery_region text not null default 'Europe',
  delivery_method text not null default 'Provider pending',
  delivery_status text not null default 'delivery_placeholder',
  delivery_note text not null default 'Delivery service for Europe will be connected later.',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists buyer_user_id uuid,
  add column if not exists buyer_email text not null default '',
  add column if not exists delivery_region text not null default 'Europe',
  add column if not exists delivery_method text not null default 'Provider pending',
  add column if not exists delivery_status text not null default 'delivery_placeholder',
  add column if not exists delivery_note text not null default 'Delivery service for Europe will be connected later.';

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.listings to anon, authenticated;
grant select, insert, update, delete on public.listing_photos to anon, authenticated;
grant select, insert, update, delete on public.wishlist_items to anon, authenticated;
grant select, insert, update, delete on public.chats to anon, authenticated;
grant select, insert, update, delete on public.messages to anon, authenticated;
grant select, insert, update, delete on public.support_threads to anon, authenticated;
grant select, insert, update, delete on public.support_messages to anon, authenticated;
revoke all on public.orders from anon, authenticated;
grant select, insert on public.orders to authenticated;
grant select, insert, update on public.orders to service_role;

alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Listings are publicly readable" on public.listings;
create policy "Listings are publicly readable"
on public.listings for select
using (status = 'active');

drop policy if exists "Anyone can create listings" on public.listings;
create policy "Anyone can create listings"
on public.listings for insert
with check (true);

drop policy if exists "Listing photos are publicly readable" on public.listing_photos;
create policy "Listing photos are publicly readable"
on public.listing_photos for select
using (true);

drop policy if exists "Anyone can add listing photos" on public.listing_photos;
create policy "Anyone can add listing photos"
on public.listing_photos for insert
with check (true);

drop policy if exists "Wishlist readable by session" on public.wishlist_items;
create policy "Wishlist readable by session"
on public.wishlist_items for select
using (true);

drop policy if exists "Wishlist insert by session" on public.wishlist_items;
create policy "Wishlist insert by session"
on public.wishlist_items for insert
with check (true);

drop policy if exists "Wishlist delete by session" on public.wishlist_items;
create policy "Wishlist delete by session"
on public.wishlist_items for delete
using (true);

drop policy if exists "Chats readable" on public.chats;
create policy "Chats readable"
on public.chats for select
using (true);

drop policy if exists "Chats insertable" on public.chats;
create policy "Chats insertable"
on public.chats for insert
with check (true);

drop policy if exists "Chats updatable" on public.chats;
create policy "Chats updatable"
on public.chats for update
using (true)
with check (true);

drop policy if exists "Messages readable" on public.messages;
create policy "Messages readable"
on public.messages for select
using (true);

drop policy if exists "Messages insertable" on public.messages;
create policy "Messages insertable"
on public.messages for insert
with check (true);

drop policy if exists "Support threads readable" on public.support_threads;
create policy "Support threads readable"
on public.support_threads for select
using (true);

drop policy if exists "Support threads insertable" on public.support_threads;
create policy "Support threads insertable"
on public.support_threads for insert
with check (true);

drop policy if exists "Support threads updatable" on public.support_threads;
create policy "Support threads updatable"
on public.support_threads for update
using (true)
with check (true);

drop policy if exists "Support messages readable" on public.support_messages;
create policy "Support messages readable"
on public.support_messages for select
using (true);

drop policy if exists "Support messages insertable" on public.support_messages;
create policy "Support messages insertable"
on public.support_messages for insert
with check (
  sender = 'user'
  or (sender = 'agent' and auth.role() = 'authenticated')
);

drop policy if exists "Orders readable" on public.orders;
create policy "Orders readable"
on public.orders for select
using (auth.role() = 'service_role' or auth.uid() = buyer_user_id);

drop policy if exists "Orders insertable" on public.orders;
create policy "Orders insertable"
on public.orders for insert
with check (
  status = 'pending_payment_setup'
  and provider = 'manual_placeholder'
  and auth.role() = 'authenticated'
  and auth.uid() = buyer_user_id
);

drop policy if exists "Orders updatable" on public.orders;
create policy "Orders updatable"
on public.orders for update
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create index if not exists listings_brand_idx on public.listings (brand);
create index if not exists listings_tag_idx on public.listings (tag);
create index if not exists listing_photos_listing_id_idx on public.listing_photos (listing_id);
create index if not exists chats_session_id_idx on public.chats (session_id);
create index if not exists messages_chat_id_idx on public.messages (chat_id);
create index if not exists support_threads_session_id_idx on public.support_threads (session_id);
create index if not exists support_messages_thread_id_idx on public.support_messages (thread_id);
create index if not exists orders_session_id_idx on public.orders (session_id);
create index if not exists orders_listing_id_idx on public.orders (listing_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_buyer_user_id_idx on public.orders (buyer_user_id);
create index if not exists orders_delivery_status_idx on public.orders (delivery_status);

drop policy if exists "Listing photos storage public read" on storage.objects;
create policy "Listing photos storage public read"
on storage.objects for select
using (bucket_id = 'listing-photos');

drop policy if exists "Listing photos storage public upload" on storage.objects;
create policy "Listing photos storage public upload"
on storage.objects for insert
with check (bucket_id = 'listing-photos');
