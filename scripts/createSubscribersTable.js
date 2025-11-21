import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnectivity() {
  console.log('Checking connectivity to Supabase URL:', supabaseUrl);
  try {
    const response = await fetch(supabaseUrl);
    if (!response.ok) {
      throw new Error('Supabase URL is not reachable');
    }
    console.log('Supabase URL is reachable');
  } catch (error) {
    console.error('Connectivity check failed:', error);
    throw error; // Rethrow to stop execution
  }
}

async function createSubscribersTable() {
  try {
    await checkConnectivity(); // Check connectivity before proceeding

    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        create table if not exists public.subscribers (
          id uuid primary key default gen_random_uuid(),
          email text not null,
          phone text,
          source text default 'popup',
          consent boolean not null default true,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        );
        create unique index if not exists subscribers_email_key on public.subscribers (lower(email));
        alter table public.subscribers enable row level security;
        do $$
        begin
          if not exists (
            select 1 from pg_policies where schemaname='public' and tablename='subscribers' and policyname='subscribers_anon_insert'
          ) then
            create policy subscribers_anon_insert on public.subscribers
              for insert to anon with check (true);
          end if;
          if not exists (
            select 1 from pg_policies where schemaname='public' and tablename='subscribers' and policyname='subscribers_service_read'
          ) then
            create policy subscribers_service_read on public.subscribers
              for select to service_role using (true);
          end if;
        end$$;
        create or replace view public.v_subscribers as
        select id,email,phone,source,consent,created_at
        from public.subscribers
        order by created_at desc;
      `
    });

    if (error) {
      console.error('Error creating subscribers table:', error.message);
      console.error('Error details:', error);
    } else {
      console.log('Subscribers table created successfully:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createSubscribersTable();