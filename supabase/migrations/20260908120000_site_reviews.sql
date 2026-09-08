-- Homepage "customer reviews" submissions (separate from per-product reviews).
create table if not exists public.site_reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  review_text text not null,
  photo_url text,
  products_mentioned text,
  status text not null default 'approved' check (status in ('approved', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists site_reviews_status_created_idx
  on public.site_reviews (status, created_at desc);

alter table public.site_reviews enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'site_reviews' and policyname = 'Allow public read of approved site reviews'
  ) then
    create policy "Allow public read of approved site reviews"
      on public.site_reviews for select
      using (status = 'approved');
  end if;
end $$;
