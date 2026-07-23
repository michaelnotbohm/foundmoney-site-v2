-- ============================================================================
-- ClientSites template — initial schema
--
-- Single-site model: this database serves ONE business. There is no tenant_id
-- anywhere. Run this once against a fresh Supabase project, before anything
-- else.
--
-- Ordering note: admin_users is created BEFORE the RLS helper functions that
-- query it. A SECURITY DEFINER function validates its body at creation time,
-- so defining is_admin() first fails with "relation does not exist".
-- ============================================================================


-- ============================================================================
-- 1. EXTENSIONS & SHARED TRIGGER
-- ============================================================================

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================================
-- 2. ADMIN USERS
--
-- Created first so the RLS helpers below can reference it.
-- ============================================================================

create table public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid not null unique references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  role          text not null default 'editor',
  created_at    timestamptz not null default now(),
  constraint admin_users_role_check check (role in ('owner','admin','editor'))
);

create table public.admin_invites (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  role        text not null default 'editor',
  token       text not null unique,
  expires_at  timestamptz not null,
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);


-- ============================================================================
-- 3. RLS HELPER FUNCTIONS
--
-- SECURITY DEFINER so a policy can read admin_users without recursing through
-- admin_users' own RLS.
-- ============================================================================

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (select 1 from public.admin_users where auth_user_id = auth.uid());
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (
    select 1 from public.admin_users
    where auth_user_id = auth.uid() and role = 'owner'
  );
$$;


-- ============================================================================
-- 4. SITE SETTINGS
--
-- Exactly one row, enforced by a fixed primary key value, so the renderer can
-- never get two rows back and never has to guess which is current.
-- ============================================================================

create table public.site_settings (
  id              boolean primary key default true,

  -- Identity
  name            text not null,
  legal_name      text,
  tagline         text,
  description     text,

  -- Domains
  domain          text not null,              -- primary, canonical host
  alt_domains     text[] default '{}',        -- redirect sources
  preview_domain  text,

  -- Brand
  logo_url        text,
  logo_dark_url   text,
  favicon_url     text,

  -- Contact
  email           text,
  phone           text,
  phone_tollfree  text,
  fax             text,

  -- Address
  address_line1   text,
  address_line2   text,
  city            text,
  state           text,
  postal_code     text,
  country         text default 'US',
  latitude        numeric,
  longitude       numeric,

  -- Credentials. license_label keeps this generic: a lender sets "NMLS", a
  -- contractor sets "State License #", an advisory firm leaves both null.
  license_number  text,
  license_label   text,

  -- Structured config
  social_links    jsonb not null default '{}'::jsonb,
  theme           jsonb not null default '{}'::jsonb,
  nav             jsonb not null default '{"links":[]}'::jsonb,
  footer          jsonb not null default '{}'::jsonb,

  -- Schema.org
  business_type   text default 'Organization',  -- or LocalBusiness, etc.
  founding_date   date,

  noindex         boolean not null default true,  -- ON during build

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint site_settings_singleton check (id = true)
);

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

comment on table public.site_settings is
  'Single-row business identity, theme, and navigation config.';
comment on column public.site_settings.noindex is
  'Emits noindex,nofollow and excludes from sitemap. Flip to false at launch.';


-- ============================================================================
-- 5. PAGES & SECTIONS
-- ============================================================================

create table public.pages (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,

  -- SEO
  meta_title        text,
  meta_description  text,
  canonical_url     text,          -- override only; normally computed
  og_image          text,
  schema_json       jsonb,
  noindex           boolean not null default false,

  -- Publishing
  status            text not null default 'draft',
  sort_order        integer not null default 0,
  published_at      timestamptz,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint pages_status_check check (status in ('draft','published','archived'))
);

create index pages_status_idx on public.pages (status);
create index pages_sort_idx   on public.pages (sort_order);

create trigger pages_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

comment on column public.pages.slug is
  'Path without leading slash. Home page uses ''/''.';
comment on column public.pages.canonical_url is
  'Override only. Leave null so the renderer computes from site domain + slug.';


create table public.sections (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references public.pages(id) on delete cascade,
  type        text not null,
  variant     text not null default 'default',
  content     jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index sections_page_idx on public.sections (page_id, sort_order);

create trigger sections_updated_at
  before update on public.sections
  for each row execute function public.set_updated_at();

comment on table public.sections is
  'Ordered typed blocks per page. The renderer maps (type, variant) to a component and passes content as props.';


-- ============================================================================
-- 6. CONTENT — categories & posts
--
-- The posts column shape MUST match the Askable content studio exactly.
-- Do not simplify. Drifting this schema breaks publishing silently.
-- ============================================================================

create table public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  type         text not null default 'topic',
  description  text,
  created_at   timestamptz not null default now()
);

comment on column public.categories.type is
  'topic | location. Drives category landing page copy and schema.';


create table public.posts (
  id                    uuid primary key default gen_random_uuid(),

  -- Content
  title                 text not null,
  h1                    text,
  slug                  text not null unique,
  excerpt               text,
  content               text,          -- rendered HTML body
  featured_image_url    text,
  featured_image_alt    text,

  -- SEO
  meta_title            text,
  meta_description      text,
  canonical_url         text,
  focus_keyword         text,
  secondary_keywords    text[],
  schema_json           jsonb,

  -- Taxonomy
  category_id           uuid references public.categories(id) on delete set null,
  tags                  text[],

  -- Askable targeting fields. These are the industry-flex points: relabel
  -- their MEANING in the studio skill per client, never change the shape.
  target_loan_type      text,
  target_city           text,
  target_audience       text,
  target_county         text,
  state                 text,
  region                text,

  -- Meta
  author                text,
  status                text not null default 'draft',
  published_at          timestamptz,
  reading_time_minutes  integer,
  word_count            integer,

  -- Askable link
  askable_article_id    text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint posts_status_check check (status in ('draft','published','archived'))
);

create index posts_status_published_idx on public.posts (status, published_at desc);
create index posts_category_idx         on public.posts (category_id);

-- Partial unique index. Note: ON CONFLICT against this requires repeating the
-- predicate exactly:
--   on conflict (askable_article_id) where askable_article_id is not null
create unique index posts_askable_article_id_key
  on public.posts (askable_article_id)
  where askable_article_id is not null;

create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();


-- Post slugs and category slugs share the /resources/<slug> namespace, so a
-- collision would make one of them unreachable. Block it at write time rather
-- than letting it surface as a mystery 404.
create or replace function public.check_slug_collision()
returns trigger language plpgsql as $$
begin
  if tg_table_name = 'posts' then
    if exists (select 1 from public.categories where slug = new.slug) then
      raise exception 'Slug "%" already used by a category', new.slug;
    end if;
  else
    if exists (select 1 from public.posts where slug = new.slug) then
      raise exception 'Slug "%" already used by a post', new.slug;
    end if;
  end if;
  return new;
end;
$$;

create trigger posts_slug_collision
  before insert or update of slug on public.posts
  for each row execute function public.check_slug_collision();

create trigger categories_slug_collision
  before insert or update of slug on public.categories
  for each row execute function public.check_slug_collision();


-- ============================================================================
-- 7. OPERATIONAL TABLES
-- ============================================================================

create table public.leads (
  id            uuid primary key default gen_random_uuid(),
  source        text,
  full_name     text,
  email         text,
  phone         text,
  subject_type  text,
  message       text,
  status        text not null default 'new',
  notes         text,
  meta          jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index leads_status_idx  on public.leads (status);
create index leads_created_idx on public.leads (created_at desc);

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();


create table public.team_members (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  title           text,
  license_no      text,
  phone           text,
  email           text,
  photo_url       text,
  photo_position  text default 'center',
  bio             text,
  linkedin_url    text,
  sort_order      integer not null default 0,
  status          text not null default 'published',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index team_members_sort_idx on public.team_members (sort_order);

create trigger team_members_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

comment on column public.team_members.linkedin_url is
  'Used as sameAs in Person schema. Keep consistent with the live profile.';


create table public.media (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  alt         text,
  width       integer,
  height      integer,
  folder      text default 'uploads',
  created_at  timestamptz not null default now()
);

create index media_folder_idx on public.media (folder);


create table public.integrations (
  id             boolean primary key default true,
  ga4_id         text,
  meta_pixel_id  text,
  gtm_id         text,
  clarity_id     text,
  other          jsonb default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint integrations_singleton check (id = true)
);

create trigger integrations_updated_at
  before update on public.integrations
  for each row execute function public.set_updated_at();


create table public.revisions (
  id               uuid primary key default gen_random_uuid(),
  entity_type      text not null,
  entity_id        uuid not null,
  snapshot         jsonb not null,
  created_by       uuid,
  created_by_email text,
  created_at       timestamptz not null default now()
);

create index revisions_entity_idx
  on public.revisions (entity_type, entity_id, created_at desc);


-- ============================================================================
-- 8. ROW-LEVEL SECURITY
--
-- Single-site model, so the shape is simple:
--   - Public reads published content only
--   - Admins read and write everything
--   - Leads are insert-only for the public, admin-read
--
-- EVERY new table gets RLS enabled and policies written. No exceptions.
-- ============================================================================

alter table public.site_settings enable row level security;
alter table public.pages         enable row level security;
alter table public.sections      enable row level security;
alter table public.posts         enable row level security;
alter table public.categories    enable row level security;
alter table public.leads         enable row level security;
alter table public.team_members  enable row level security;
alter table public.media         enable row level security;
alter table public.integrations  enable row level security;
alter table public.admin_users   enable row level security;
alter table public.admin_invites enable row level security;
alter table public.revisions     enable row level security;


-- Site settings: world-readable (the renderer needs it), admin-writable
create policy site_settings_read on public.site_settings
  for select using (true);
create policy site_settings_write on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());


-- Pages: published to the public, everything to admins
create policy pages_read_published on public.pages
  for select using (status = 'published' or public.is_admin());
create policy pages_admin_write on public.pages
  for all using (public.is_admin()) with check (public.is_admin());


-- Sections inherit visibility from their parent page
create policy sections_read_published on public.sections
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.pages p
      where p.id = sections.page_id and p.status = 'published'
    )
  );
create policy sections_admin_write on public.sections
  for all using (public.is_admin()) with check (public.is_admin());


-- Posts & categories
create policy posts_read_published on public.posts
  for select using (status = 'published' or public.is_admin());
create policy posts_admin_write on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

create policy categories_read on public.categories
  for select using (true);
create policy categories_admin_write on public.categories
  for all using (public.is_admin()) with check (public.is_admin());


-- Leads: the public form inserts, only admins read
create policy leads_insert_public on public.leads
  for insert with check (true);
create policy leads_admin_read on public.leads
  for select using (public.is_admin());
create policy leads_admin_write on public.leads
  for update using (public.is_admin()) with check (public.is_admin());
create policy leads_admin_delete on public.leads
  for delete using (public.is_admin());


-- Team & media: public read, admin write
create policy team_members_read on public.team_members
  for select using (status = 'published' or public.is_admin());
create policy team_members_admin_write on public.team_members
  for all using (public.is_admin()) with check (public.is_admin());

create policy media_read on public.media
  for select using (true);
create policy media_admin_write on public.media
  for all using (public.is_admin()) with check (public.is_admin());


-- Integrations: public read (tracking IDs are client-side anyway)
create policy integrations_read on public.integrations
  for select using (true);
create policy integrations_admin_write on public.integrations
  for all using (public.is_admin()) with check (public.is_admin());


-- Admin tables: admin-only
create policy admin_users_read on public.admin_users
  for select using (public.is_admin());
create policy admin_users_owner_write on public.admin_users
  for all using (public.is_owner()) with check (public.is_owner());

create policy admin_invites_admin on public.admin_invites
  for all using (public.is_admin()) with check (public.is_admin());

create policy revisions_admin on public.revisions
  for all using (public.is_admin()) with check (public.is_admin());


-- ============================================================================
-- 9. SEED — minimal starting state
--
-- noindex defaults to true. Flip it off only at launch, after preflight.
-- ============================================================================

insert into public.site_settings (name, domain, noindex)
values ('New Client Site', 'example.com', true);

insert into public.integrations (id) values (true);


-- ============================================================================
-- VERIFY
--
--   select name, domain, noindex from public.site_settings;
--   -- expect: New Client Site / example.com / true
-- ============================================================================
