import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSupabase, JournalEntry } from '@/lib/supabase'
import JournalEditor from '@/components/JournalEditor'

export const dynamic = 'force-dynamic'

async function updateEntry(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const title = (formData.get('title') as string).trim()
  const body = (formData.get('body') as string).trim()

  if (!title || !body) return

  const db = getSupabase()
  await db
    .from('journal_entries')
    .update({ title, body, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/journal')
  revalidatePath(`/journal/${formData.get('slug')}`)
  redirect('/admin')
}

export default async function EditEntryPage({ params }: { params: { id: string } }) {
  const { data: entry } = await getSupabase()
    .from('journal_entries')
    .select('*')
    .eq('id', params.id)
    .single<JournalEntry>()

  if (!entry) notFound()

  return (
    <div className="site-wrap">
      <div className="admin-page-header">
        <div>
          <div className="header-eyebrow" style={{ opacity: 1, animation: 'none', marginBottom: '8px' }}>
            Admin
          </div>
          <div className="admin-title">Edit entry</div>
        </div>
      </div>

      <form action={updateEntry} className="entry-form">
        <input type="hidden" name="id" value={entry.id} />
        <input type="hidden" name="slug" value={entry.slug} />

        <div className="form-field">
          <label className="form-label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            className="form-input"
            defaultValue={entry.title}
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label">Body</label>
          <JournalEditor name="body" initialContent={entry.body} />
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
