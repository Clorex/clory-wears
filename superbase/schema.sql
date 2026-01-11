/* =========================================================
   CLORY WEARS — Supabase Database Schema
   - Orders + order items
   - Admin list
   - RLS policies for customer/admin reads
   - Receipts storage bucket (public) + public read policy
   ========================================================= */

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum (
      'pending',
      'receipt_uploaded',
      'payment_claimed',
      'paid',
      'rejected'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'created',
      'awaiting_payment_review',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    );
  end if;
end $$;

-- Updated-at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Admins table (email-based admin access)
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

-- Add your admin email (safe to re-run)
insert into public.admins (email)
values ('itabitamiracle090@gmail.com')
on conflict (email) do nothing;

-- Orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,

  customer_email text not null,
  customer_full_name text not null,
  customer_phone text not null,

  shipping_state text not null,
  shipping_city text not null,
  shipping_address1 text not null,
  shipping_address2 text,
  shipping_note text,

  subtotal_ngn integer not null default 0,
  shipping_ngn integer not null default 0,
  grand_total_ngn integer not null default 0,

  receipt_url text,

  payment_status public.payment_status not null default 'pending',
  order_status public.order_status not null default 'created',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

create index if not exists idx_orders_customer_email on public.orders (customer_email);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

-- Order items table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,

  product_id text not null,
  name text not null,
  category text not null, -- 'trousers' | 'shirts'

  price_ngn integer not null,
  quantity integer not null,

  size text not null,
  color text not null,
  image text not null,

  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items (order_id);

-- =========================================================
-- RLS (Row Level Security)
-- =========================================================
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admins enable row level security;

-- Admins table: only admins can read admins list (optional; keeps it private)
drop policy if exists "admins_select_only_admins" on public.admins;
create policy "admins_select_only_admins"
on public.admins
for select
to authenticated
using (
  exists (
    select 1
    from public.admins a
    where a.email = (auth.jwt() ->> 'email')
  )
);

-- Orders: customer can SELECT their orders by matching auth email
drop policy if exists "orders_select_customer" on public.orders;
create policy "orders_select_customer"
on public.orders
for select
to authenticated
using (
  customer_email = (auth.jwt() ->> 'email')
);

-- Orders: admin can SELECT all orders
drop policy if exists "orders_select_admin" on public.orders;
create policy "orders_select_admin"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.admins a
    where a.email = (auth.jwt() ->> 'email')
  )
);

-- Order items: customer can SELECT items belonging to their orders
drop policy if exists "order_items_select_customer" on public.order_items;
create policy "order_items_select_customer"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.customer_email = (auth.jwt() ->> 'email')
  )
);

-- Order items: admin can SELECT all items
drop policy if exists "order_items_select_admin" on public.order_items;
create policy "order_items_select_admin"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.admins a
    where a.email = (auth.jwt() ->> 'email')
  )
);

-- NOTE:
-- We are NOT allowing client-side INSERT/UPDATE/DELETE on orders or items,
-- because your Next.js API routes use the Service Role key to write securely.

-- =========================================================
-- Storage: receipts bucket (PUBLIC) + public read policy
-- =========================================================
-- You can also create the bucket in Supabase Dashboard:
-- Storage → Buckets → New bucket → name: receipts → Public: ON

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- Ensure public can read receipt files (needed in some setups even for public buckets)
-- This makes every receipt URL publicly accessible, which is functional but less private.
-- If you want private receipts later, tell me and we’ll switch to signed URLs.
drop policy if exists "public_read_receipts" on storage.objects;
create policy "public_read_receipts"
on storage.objects
for select
to public
using (bucket_id = 'receipts');