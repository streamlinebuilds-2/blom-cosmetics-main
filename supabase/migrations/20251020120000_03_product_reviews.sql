-- Create table to store approved product reviews
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  product_id text,
  reviewer_name text not null,
  reviewer_email text,
  title text,
  body text not null,
  rating int2 check (rating between 1 and 5),
  photos jsonb default '[]'::jsonb,
  is_verified_buyer boolean default false,
  order_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists product_reviews_product_slug_idx on public.product_reviews (product_slug);
create index if not exists product_reviews_created_at_idx on public.product_reviews (created_at desc);

-- Row Level Security and simple policies (read public, write via service key)
alter table public.product_reviews enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_reviews' and policyname = 'Allow read for all'
  ) then
    create policy "Allow read for all" on public.product_reviews for select using (true);
  end if;
end $$;

-- Upsert trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_product_reviews_updated_at on public.product_reviews;
create trigger set_product_reviews_updated_at
before update on public.product_reviews
for each row execute function public.set_updated_at();

