-- Kidan Shop MVP backend schema
-- Run this once in Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
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
  seller_user_id uuid,
  seller_session_id text not null default '',
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
  user_id uuid,
  session_id text not null,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, listing_id)
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  buyer_user_id uuid,
  buyer_session_id text not null default '',
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

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Kidan member',
  username text not null default '',
  bio text not null default '',
  city text not null default '',
  region text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seller_reviews (
  id uuid primary key default gen_random_uuid(),
  seller_user_id uuid not null references auth.users(id) on delete cascade,
  buyer_user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  listing_id text not null,
  listing_title text not null,
  rating int not null check (rating between 1 and 5),
  body text not null default '',
  created_at timestamptz not null default now(),
  unique (buyer_user_id, order_id)
);

alter table public.orders
  add column if not exists buyer_user_id uuid,
  add column if not exists buyer_email text not null default '',
  add column if not exists delivery_region text not null default 'Europe',
  add column if not exists delivery_method text not null default 'Provider pending',
  add column if not exists delivery_status text not null default 'delivery_placeholder',
  add column if not exists delivery_note text not null default 'Delivery service for Europe will be connected later.';

alter table public.listings
  add column if not exists seller_user_id uuid,
  add column if not exists seller_session_id text not null default '';

alter table public.wishlist_items
  add column if not exists user_id uuid;

alter table public.chats
  add column if not exists buyer_user_id uuid,
  add column if not exists buyer_session_id text not null default '';

alter table public.profiles
  add column if not exists display_name text not null default 'Kidan member',
  add column if not exists username text not null default '',
  add column if not exists bio text not null default '',
  add column if not exists city text not null default '',
  add column if not exists region text not null default '',
  add column if not exists updated_at timestamptz not null default now();

alter table public.seller_reviews
  add column if not exists listing_title text not null default '',
  add column if not exists body text not null default '';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'listings_safe_text_lengths') then
    alter table public.listings add constraint listings_safe_text_lengths check (
      char_length(title) between 1 and 120
      and char_length(brand) between 1 and 80
      and char_length(category) between 1 and 60
      and char_length(color) between 1 and 40
      and char_length(condition) between 1 and 30
      and char_length(description) <= 2000
      and char_length(seller_name) between 1 and 80
      and char_length(seller_session_id) <= 140
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'listings_safe_price') then
    alter table public.listings add constraint listings_safe_price check (price between 1 and 10000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'messages_safe_body_length') then
    alter table public.messages add constraint messages_safe_body_length check (char_length(body) between 1 and 2000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'support_messages_safe_body_length') then
    alter table public.support_messages add constraint support_messages_safe_body_length check (char_length(body) between 1 and 2000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'orders_safe_amount') then
    alter table public.orders add constraint orders_safe_amount check (amount between 0 and 10000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_safe_text_lengths') then
    alter table public.profiles add constraint profiles_safe_text_lengths check (
      char_length(display_name) between 1 and 120
      and char_length(username) <= 40
      and char_length(bio) <= 600
      and char_length(city) <= 80
      and char_length(region) <= 80
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'seller_reviews_safe_text_lengths') then
    alter table public.seller_reviews add constraint seller_reviews_safe_text_lengths check (
      char_length(listing_id) between 1 and 120
      and char_length(listing_title) between 1 and 160
      and char_length(body) <= 1000
      and seller_user_id <> buyer_user_id
    );
  end if;
end $$;

grant usage on schema public to anon, authenticated;
revoke all on public.listings from anon, authenticated;
revoke all on public.listing_photos from anon, authenticated;
revoke all on public.wishlist_items from anon, authenticated;
revoke all on public.chats from anon, authenticated;
revoke all on public.messages from anon, authenticated;
revoke all on public.support_threads from anon, authenticated;
revoke all on public.support_messages from anon, authenticated;
revoke all on public.orders from anon, authenticated;
revoke all on public.profiles from anon, authenticated;
revoke all on public.seller_reviews from anon, authenticated;
grant select on public.listings to anon, authenticated;
grant insert, delete on public.listings to authenticated;
grant select on public.listing_photos to anon, authenticated;
grant insert, delete on public.listing_photos to authenticated;
grant select, insert, delete on public.wishlist_items to authenticated;
grant select, insert, update on public.chats to authenticated;
grant select, insert on public.messages to authenticated;
grant select, insert on public.orders to authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select on public.seller_reviews to anon, authenticated;
grant insert on public.seller_reviews to authenticated;
grant select, insert, update, delete on public.listings to service_role;
grant select, insert, update, delete on public.listing_photos to service_role;
grant select, insert, update, delete on public.wishlist_items to service_role;
grant select, insert, update, delete on public.chats to service_role;
grant select, insert, update, delete on public.messages to service_role;
grant select, insert, update, delete on public.support_threads to service_role;
grant select, insert, update, delete on public.support_messages to service_role;
grant select, insert, update on public.orders to service_role;
grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.seller_reviews to service_role;

alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;
alter table public.orders enable row level security;
alter table public.profiles enable row level security;
alter table public.seller_reviews enable row level security;

drop policy if exists "Listings are publicly readable" on public.listings;
create policy "Listings are publicly readable"
on public.listings for select
using (status = 'active');

drop policy if exists "Anyone can create listings" on public.listings;
drop policy if exists "Authenticated users can create own listings" on public.listings;
create policy "Authenticated users can create own listings"
on public.listings for insert
with check (
  (select auth.role()) = 'authenticated'
  and seller_user_id = (select auth.uid())
  and status = 'active'
);

drop policy if exists "Listing owners can delete listings" on public.listings;
create policy "Listing owners can delete listings"
on public.listings for delete
using (seller_user_id = (select auth.uid()));

drop policy if exists "Listing photos are publicly readable" on public.listing_photos;
create policy "Listing photos are publicly readable"
on public.listing_photos for select
using (true);

drop policy if exists "Anyone can add listing photos" on public.listing_photos;
drop policy if exists "Listing owners can add listing photos" on public.listing_photos;
create policy "Listing owners can add listing photos"
on public.listing_photos for insert
with check (
  (select auth.role()) = 'authenticated'
  and exists (
    select 1
    from public.listings
    where listings.id = listing_photos.listing_id
      and listings.seller_user_id = (select auth.uid())
  )
);

drop policy if exists "Listing owners can delete listing photos" on public.listing_photos;
create policy "Listing owners can delete listing photos"
on public.listing_photos for delete
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_photos.listing_id
      and listings.seller_user_id = (select auth.uid())
  )
);

drop policy if exists "Wishlist readable by session" on public.wishlist_items;
drop policy if exists "Wishlist readable by owner" on public.wishlist_items;
create policy "Wishlist readable by owner"
on public.wishlist_items for select
using (user_id = (select auth.uid()));

drop policy if exists "Wishlist insert by session" on public.wishlist_items;
drop policy if exists "Wishlist insert by owner" on public.wishlist_items;
create policy "Wishlist insert by owner"
on public.wishlist_items for insert
with check (user_id = (select auth.uid()));

drop policy if exists "Wishlist delete by session" on public.wishlist_items;
drop policy if exists "Wishlist delete by owner" on public.wishlist_items;
create policy "Wishlist delete by owner"
on public.wishlist_items for delete
using (user_id = (select auth.uid()));

drop policy if exists "Chats readable" on public.chats;
drop policy if exists "Chats readable by buyer" on public.chats;
create policy "Chats readable by buyer"
on public.chats for select
using (buyer_user_id = (select auth.uid()));

drop policy if exists "Chats insertable" on public.chats;
drop policy if exists "Chats insertable by buyer" on public.chats;
create policy "Chats insertable by buyer"
on public.chats for insert
with check (buyer_user_id = (select auth.uid()));

drop policy if exists "Chats updatable" on public.chats;
drop policy if exists "Chats updatable by buyer" on public.chats;
create policy "Chats updatable by buyer"
on public.chats for update
using (buyer_user_id = (select auth.uid()))
with check (buyer_user_id = (select auth.uid()));

drop policy if exists "Messages readable" on public.messages;
drop policy if exists "Messages readable by chat buyer" on public.messages;
create policy "Messages readable by chat buyer"
on public.messages for select
using (
  exists (
    select 1
    from public.chats
    where chats.id = messages.chat_id
      and chats.buyer_user_id = (select auth.uid())
  )
);

drop policy if exists "Messages insertable" on public.messages;
drop policy if exists "Messages insertable by chat buyer" on public.messages;
create policy "Messages insertable by chat buyer"
on public.messages for insert
with check (
  sender in ('buyer', 'seller')
  and exists (
    select 1
    from public.chats
    where chats.id = messages.chat_id
      and chats.buyer_user_id = (select auth.uid())
  )
);

drop policy if exists "Support threads readable" on public.support_threads;

drop policy if exists "Support threads insertable" on public.support_threads;

drop policy if exists "Support threads updatable" on public.support_threads;

drop policy if exists "Support threads service role only" on public.support_threads;
create policy "Support threads service role only"
on public.support_threads for all
using ((select auth.role()) = 'service_role')
with check ((select auth.role()) = 'service_role');

drop policy if exists "Support messages readable" on public.support_messages;

drop policy if exists "Support messages insertable" on public.support_messages;

drop policy if exists "Support messages service role only" on public.support_messages;
create policy "Support messages service role only"
on public.support_messages for all
using ((select auth.role()) = 'service_role')
with check ((select auth.role()) = 'service_role');

drop policy if exists "Orders readable" on public.orders;
create policy "Orders readable"
on public.orders for select
using ((select auth.role()) = 'service_role' or buyer_user_id = (select auth.uid()));

drop policy if exists "Orders insertable" on public.orders;
create policy "Orders insertable"
on public.orders for insert
with check (
  status = 'pending_payment_setup'
  and provider = 'manual_placeholder'
  and (select auth.role()) = 'authenticated'
  and buyer_user_id = (select auth.uid())
);

drop policy if exists "Orders updatable" on public.orders;
create policy "Orders updatable"
on public.orders for update
using ((select auth.role()) = 'service_role')
with check ((select auth.role()) = 'service_role');

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
on public.profiles for select
to anon, authenticated
using (true);

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
on public.profiles for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Seller reviews are publicly readable" on public.seller_reviews;
create policy "Seller reviews are publicly readable"
on public.seller_reviews for select
to anon, authenticated
using (true);

drop policy if exists "Buyers can review purchased listings" on public.seller_reviews;
create policy "Buyers can review purchased listings"
on public.seller_reviews for insert
to authenticated
with check (
  buyer_user_id = (select auth.uid())
  and seller_user_id <> (select auth.uid())
  and exists (
    select 1
    from public.orders
    join public.listings on listings.id::text = orders.listing_id
    where orders.id = seller_reviews.order_id
      and orders.buyer_user_id = (select auth.uid())
      and orders.listing_id = seller_reviews.listing_id
      and listings.seller_user_id = seller_reviews.seller_user_id
      and orders.status in ('paid', 'pending_payment_setup')
  )
);

create index if not exists listings_brand_idx on public.listings (brand);
create index if not exists listings_tag_idx on public.listings (tag);
create index if not exists listing_photos_listing_id_idx on public.listing_photos (listing_id);
create index if not exists chats_session_id_idx on public.chats (session_id);
create index if not exists chats_buyer_user_id_idx on public.chats (buyer_user_id);
create unique index if not exists chats_buyer_listing_idx on public.chats (buyer_user_id, listing_id);
create index if not exists messages_chat_id_idx on public.messages (chat_id);
create index if not exists support_threads_session_id_idx on public.support_threads (session_id);
create index if not exists support_messages_thread_id_idx on public.support_messages (thread_id);
create index if not exists wishlist_items_user_id_idx on public.wishlist_items (user_id);
create index if not exists wishlist_items_listing_id_idx on public.wishlist_items (listing_id);
create unique index if not exists wishlist_items_user_listing_idx on public.wishlist_items (user_id, listing_id);
create index if not exists listings_seller_user_id_idx on public.listings (seller_user_id);
create index if not exists orders_session_id_idx on public.orders (session_id);
create index if not exists orders_listing_id_idx on public.orders (listing_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_buyer_user_id_idx on public.orders (buyer_user_id);
create index if not exists orders_delivery_status_idx on public.orders (delivery_status);
create unique index if not exists profiles_username_unique_idx on public.profiles (lower(username)) where username <> '';
create index if not exists seller_reviews_seller_user_id_idx on public.seller_reviews (seller_user_id);
create index if not exists seller_reviews_buyer_user_id_idx on public.seller_reviews (buyer_user_id);
create index if not exists seller_reviews_order_id_idx on public.seller_reviews (order_id);
create index if not exists seller_reviews_listing_id_idx on public.seller_reviews (listing_id);

drop policy if exists "Listing photos storage public read" on storage.objects;

drop policy if exists "Listing photos storage public upload" on storage.objects;
drop policy if exists "Listing photos storage owner upload" on storage.objects;
create policy "Listing photos storage owner upload"
on storage.objects for insert
with check (
  bucket_id = 'listing-photos'
  and (select auth.role()) = 'authenticated'
  and exists (
    select 1
    from public.listings
    where listings.id::text = (storage.foldername(name))[1]
      and listings.seller_user_id = (select auth.uid())
  )
);
