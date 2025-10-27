-- categories table (if missing)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamptz default now()
);

-- products: add only the columns the app uses, *if missing* (no type changes on existing cols)
alter table public.products
  add column if not exists sku text,
  add column if not exists slug text unique,
  add column if not exists status text not null default 'draft',
  add column if not exists price_cents int not null default 0,
  add column if not exists compare_at_price_cents int,
  add column if not exists stock_qty int not null default 0,
  add column if not exists short_desc text,
  add column if not exists overview text,
  add column if not exists features text[],
  add column if not exists how_to_use text[],
  add column if not exists inci_ingredients text[],
  add column if not exists key_ingredients text[],
  add column if not exists size text,
  add column if not exists shelf_life text,
  add column if not exists claims text[],
  add column if not exists thumbnail_url text,
  add column if not exists gallery_urls text[],
  add column if not exists category_id uuid,
  add column if not exists updated_at timestamptz default now();

-- FK (only if not present)
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='products' and column_name='category_id')
  and not exists (select 1 from information_schema.table_constraints
                  where table_schema='public' and table_name='products' and constraint_name='products_category_id_fkey') then
    execute 'alter table public.products add constraint products_category_id_fkey
             foreign key (category_id) references public.categories(id) on delete set null';
  end if;
end $$;

-- normalize status values & constraint
do $$
begin
  execute 'alter table public.products alter column status set default ''draft''';
  execute 'update public.products set status = ''draft'' where status is null';
  execute 'update public.products set status = ''active'' where lower(status) in (''active'',''published'',''live'',''enabled'')';
  execute 'update public.products set status = ''archived'' where lower(status) in (''archived'',''inactive'',''disabled'')';
  execute 'update public.products set status = ''draft'' where lower(status) not in (''draft'',''active'',''archived'')';
  if exists (select 1 from pg_constraint where conrelid='public.products'::regclass and conname='products_status_check')
  then execute 'alter table public.products drop constraint products_status_check'; end if;
  execute 'alter table public.products add constraint products_status_check check (status in (''draft'',''active'',''archived''))';
  execute 'alter table public.products alter column status set not null';
end $$;

-- keep price <-> price_cents in sync WITHOUT altering existing column types
create or replace function public.products_sync_price_bidirectional()
returns trigger language plpgsql as $fn$
begin
  if NEW.price_cents is not null then
    NEW.price := (NEW.price_cents::numeric / 100.0);
  elsif NEW.price is not null then
    NEW.price_cents := round(NEW.price::numeric * 100)::int;
  end if;
  return NEW;
end
$fn$;
drop trigger if exists trg_products_sync_price_bidirectional on public.products;
create trigger trg_products_sync_price_bidirectional
before insert or update on public.products
for each row execute function public.products_sync_price_bidirectional();

