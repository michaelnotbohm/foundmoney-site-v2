-- Multi-Tenant Schema for Bay to Bay Lending Platform
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Tenants table - business identity, domains, theme
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  domain text UNIQUE,
  domains text[] DEFAULT '{}',
  logo_url text,
  logo_alt text,
  tagline text,
  phone text,
  phone_tollfree text,
  fax text,
  email text,
  address jsonb,
  social_links jsonb DEFAULT '{}',
  license_label text,
  license_number text,
  nmls text,
  theme jsonb DEFAULT '{}',
  nav_links jsonb DEFAULT '[]',
  apply_url text DEFAULT '/apply',
  noindex boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Pages table - CMS pages
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  h1 text,
  meta_title text,
  meta_description text,
  canonical_url text,
  og_image text,
  noindex boolean DEFAULT false,
  parent_id uuid REFERENCES pages(id),
  sort_order int DEFAULT 0,
  status text DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- 3. Sections table - page content blocks
CREATE TABLE IF NOT EXISTS sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE,
  type text NOT NULL,
  variant text DEFAULT 'default',
  content jsonb DEFAULT '{}',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. Categories table - blog categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- 5. Posts table - blog articles
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id),
  slug text NOT NULL,
  title text NOT NULL,
  h1 text,
  excerpt text,
  content text,
  featured_image_url text,
  featured_image_alt text,
  meta_title text,
  meta_description text,
  canonical_url text,
  focus_keyword text,
  secondary_keywords text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  author text,
  status text DEFAULT 'draft',
  published_at timestamptz,
  reading_time_minutes int,
  word_count int,
  schema_json jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- 6. Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text,
  nmls text,
  phone text,
  email text,
  bio text,
  photo_url text,
  sort_order int DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 7. Leads table - form submissions
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  source text,
  full_name text,
  email text,
  phone text,
  subject_type text,
  message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 8. Media table - uploaded assets
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  mime_type text,
  size_bytes int,
  created_at timestamptz DEFAULT now()
);

-- 9. Integrations table - GA4, GTM, etc.
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  type text NOT NULL,
  config jsonb DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, type)
);

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - public read for published content
DROP POLICY IF EXISTS "tenants_public_read" ON tenants;
CREATE POLICY "tenants_public_read" ON tenants FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "pages_public_read" ON pages;
CREATE POLICY "pages_public_read" ON pages FOR SELECT TO anon USING (status = 'published');

DROP POLICY IF EXISTS "sections_public_read" ON sections;
CREATE POLICY "sections_public_read" ON sections FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM pages WHERE pages.id = sections.page_id AND pages.status = 'published')
);

DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "posts_public_read" ON posts;
CREATE POLICY "posts_public_read" ON posts FOR SELECT TO anon USING (status = 'published');

DROP POLICY IF EXISTS "team_members_public_read" ON team_members;
CREATE POLICY "team_members_public_read" ON team_members FOR SELECT TO anon USING (active = true);

DROP POLICY IF EXISTS "leads_public_insert" ON leads;
CREATE POLICY "leads_public_insert" ON leads FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "media_public_read" ON media;
CREATE POLICY "media_public_read" ON media FOR SELECT TO anon USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_tenant_slug ON pages(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_posts_tenant_slug ON posts(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_sections_page ON sections(page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
