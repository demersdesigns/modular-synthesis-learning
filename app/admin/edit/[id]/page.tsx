import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin, JournalEntry } from '@/lib/supabase'
import EditEntryForm from './EditEntryForm'

export const dynamic = 'force-dynamic'

async function updateEntry(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const title = (formData.get('title') as string).trim()
  const body = (formData.get('body') as string).trim()

  if (!title || !body) return

  const db = getSupabaseAdmin()
  await db
    .from('journal_entries')
    .update({ title, body, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/journal')
  revalidatePath(`/journal/${formData.get('slug')}`)
  redirect('/admin')
}

export default async function EditEntryPage({ params }: { params: { id: string } }) {
  const { data: entry } = await getSupabaseAdmin()
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

      <EditEntryForm entry={entry} updateEntry={updateEntry} />
    </div>
  )
}
