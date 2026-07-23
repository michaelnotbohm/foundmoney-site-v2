// lib/resources/queries.ts
//
// Server-side data access for the Resources (blog) surface.
//
// URL model: articles live FLAT at /resources/<post-slug>. Category pages are
// at /resources/<category-slug>. The category is never a path segment on an
// article URL. Post and category slugs share that namespace, so the schema
// enforces uniqueness across both with a trigger.
//
// Body column: the posts table has exactly one body column, `content`, storing
// rendered HTML. There is no content_html and no body. Selecting a column that
// doesn't exist makes PostgREST return 400, the JS client take its error
// branch and return null, and the route 404 with no visible error. Verify
// column names against information_schema.columns before blaming routing or RLS.
//
// These queries use the anon client, so RLS is enforced. Do not swap in the
// service role key — the published/draft split lives in the policies, and
// bypassing them would expose unpublished content.

import { createClient } from '@/lib/supabase/server'
import type { Category, Post } from '@/lib/types/database'

export type ResourceCategory = Pick<
  Category,
  'id' | 'name' | 'slug' | 'type' | 'description'
>

export type ResourcePost = Pick<
  Post,
  | 'id'
  | 'slug'
  | 'title'
  | 'excerpt'
  | 'featured_image_url'
  | 'featured_image_alt'
  | 'published_at'
  | 'reading_time_minutes'
  | 'target_city'
  | 'category_id'
> & { category?: ResourceCategory | null }

export type ResourceArticle = ResourcePost &
  Pick<
    Post,
    | 'content'
    | 'meta_title'
    | 'meta_description'
    | 'canonical_url'
    | 'schema_json'
    | 'author'
    | 'word_count'
    | 'featured_image_alt'
  >

const CATEGORY_FIELDS = 'id, name, slug, type, description'

const POST_FIELDS =
  'id, slug, title, excerpt, featured_image_url, featured_image_alt, published_at, reading_time_minutes, target_city, category_id'

const ARTICLE_FIELDS = `${POST_FIELDS}, content, meta_title, meta_description, canonical_url, schema_json, author, word_count`

/** All categories, both location and topic types. */
export async function getCategories(): Promise<ResourceCategory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_FIELDS)
    .order('name', { ascending: true })

  if (error || !data) return []
  return data as ResourceCategory[]
}

/** A single category by slug, or null. */
export async function getCategoryBySlug(
  slug: string,
): Promise<ResourceCategory | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_FIELDS)
    .eq('slug', slug)
    .limit(1)

  if (error || !data || data.length === 0) return null
  return data[0] as ResourceCategory
}

/** A single category by id, or null. */
export async function getCategoryById(
  categoryId: string,
): Promise<ResourceCategory | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_FIELDS)
    .eq('id', categoryId)
    .limit(1)

  if (error || !data || data.length === 0) return null
  return data[0] as ResourceCategory
}

/** All published posts, newest first. Used by /resources. */
export async function getAllPosts(): Promise<ResourcePost[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(POST_FIELDS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error || !data) return []
  return data as ResourcePost[]
}

/** Published posts in one category, newest first. */
export async function getPostsByCategory(
  categoryId: string,
): Promise<ResourcePost[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(POST_FIELDS)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .order('published_at', { ascending: false })

  if (error || !data) return []
  return data as ResourcePost[]
}

/** A single published article by slug, or null. */
export async function getPostBySlug(
  slug: string,
): Promise<ResourceArticle | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(ARTICLE_FIELDS)
    .eq('status', 'published')
    .eq('slug', slug)
    .limit(1)

  if (error || !data || data.length === 0) return null
  return data[0] as ResourceArticle
}

/** All published post slugs and dates, for the sitemap. */
export async function getPostSlugs(): Promise<
  { slug: string; published_at: string | null; updated_at: string }[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('slug, published_at, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error || !data) return []
  return data
}

/** Convenience splitter for the filter bar. */
export function splitCategories(categories: ResourceCategory[]) {
  return {
    locationCategories: categories.filter((c) => c.type === 'location'),
    topicCategories: categories.filter((c) => c.type === 'topic'),
  }
}
