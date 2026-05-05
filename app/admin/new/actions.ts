'use server'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'

function generateSlug(title: string, suffix?: string): string {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (suffix) slug = `${slug}-${suffix}`
  return slug
}

export type ActionState = { error: string } | null

export async function createEntry(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = ((formData.get('title') as string) ?? '').trim()
  const body = ((formData.get('body') as string) ?? '').trim()

  if (!title) return { error: 'Title is required.' }
  if (!body || body === '<p></p>') return { error: 'Body is required.' }

  let slug = generateSlug(title)
  const db = getSupabaseAdmin()

  const { data: existing } = await db
    .from('journal_entries')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    const suffix = crypto.randomUUID().slice(0, 6)
    slug = generateSlug(title, suffix)
  }

  const { error } = await db.from('journal_entries').insert({ slug, title, body })

  if (error) return { error: error.message }

  redirect('/admin')
}
