#!/usr/bin/env node
// scripts/upload-assets.mjs
//
// Upload files into the site's Supabase Storage bucket (`Public`) and print
// the public URLs to paste into site_settings / sections.
//
//   node --env-file=.env.local scripts/upload-assets.mjs docs/client-input/2026-10-09-anthony/assets/*
//   node --env-file=.env.local scripts/upload-assets.mjs --prefix=team path/to/anthony-v2.jpg
//
// Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
// (pull with `vercel env pull .env.local`).
//
// Filenames are normalized to lowercase-kebab (bucket objects are case-sensitive
// and the DB URL must match exactly). Re-uploading the same name overwrites, but
// browsers/CDN may keep the old bytes - use a new name to cache-bust.

import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'

const BUCKET = 'Public'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (run with --env-file=.env.local)')
  process.exit(1)
}

const args = process.argv.slice(2)
const prefixArg = args.find((a) => a.startsWith('--prefix='))
const prefix = prefixArg ? prefixArg.slice('--prefix='.length).replace(/^\/+|\/+$/g, '') + '/' : ''
const files = args.filter((a) => !a.startsWith('--'))
if (files.length === 0) {
  console.error('No files given.')
  process.exit(1)
}

const mime = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
}

const slug = (name) => {
  const ext = extname(name).toLowerCase()
  const stem = basename(name, extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${stem}${ext}`
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

for (const file of files) {
  const object = prefix + slug(file)
  const body = await readFile(file)
  const { error } = await supabase.storage.from(BUCKET).upload(object, body, {
    contentType: mime[extname(file).toLowerCase()] ?? 'application/octet-stream',
    upsert: true,
    cacheControl: '31536000',
  })
  if (error) {
    console.error(`✗ ${file} → ${object}: ${error.message}`)
    continue
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(object)
  console.log(`✓ ${file}\n  ${data.publicUrl}`)
}
