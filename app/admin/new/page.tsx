import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import JournalEditor from '@/components/JournalEditor'

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

async function createEntry(formData: FormData) {
  'use server'
  const title = (formData.get('title') as string).trim()
  const body = (formData.get('body') as string).trim()

  if (!title || !body) return

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

  await db.from('journal_entries').insert({ slug, title, body })

  redirect('/admin')
}

export default function NewEntryPage() {
  return (
    <div className="site-wrap">
      <div className="admin-page-header">
        <div>
          <div className="header-eyebrow" style={{ opacity: 1, animation: 'none', marginBottom: '8px' }}>
            Admin
          </div>
          <div className="admin-title">New entry</div>
        </div>
      </div>

      <form action={createEntry} className="entry-form">
        <div className="form-field">
          <label className="form-label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            className="form-input"
            placeholder="Entry title…"
            required
            autoFocus
          />
        </div>

        <div className="form-field">
          <label className="form-label">Body</label>
          <JournalEditor name="body" />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Save entry
          </button>
          <Link href="/admin" className="btn-cancel">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
