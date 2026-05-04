import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { getSupabase, JournalEntry } from '@/lib/supabase'
import DeleteEntryButton from '@/components/DeleteEntryButton'

export const dynamic = 'force-dynamic'

async function deleteEntry(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await getSupabase().from('journal_entries').delete().eq('id', id)
  revalidatePath('/admin')
  revalidatePath('/journal')
}

function formatDate(iso: string): string {
  return iso.slice(0, 10)
}

export default async function AdminPage() {
  const { data: entries } = await getSupabase()
    .from('journal_entries')
    .select('id, slug, title, created_at')
    .order('created_at', { ascending: false })
    .returns<JournalEntry[]>()

  return (
    <div className="site-wrap">
      <div className="admin-page-header">
        <div>
          <div className="header-eyebrow" style={{ opacity: 1, animation: 'none', marginBottom: '8px' }}>
            Admin
          </div>
          <div className="admin-title">Journal entries</div>
        </div>
        <Link href="/admin/new" className="cat-btn active">
          New entry →
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!entries || entries.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--mono)',
                    fontSize: '12px',
                  }}
                >
                  no entries yet
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="td-n" style={{ width: '100px', whiteSpace: 'nowrap' }}>
                    {formatDate(entry.created_at)}
                  </td>
                  <td className="td-name">{entry.title}</td>
                  <td style={{ width: '120px' }}>
                    <div className="admin-actions">
                      <Link href={`/admin/edit/${entry.id}`} className="action-link">
                        edit
                      </Link>
                      <DeleteEntryButton id={entry.id} deleteAction={deleteEntry} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer>
        <span className="footer-text">Generative Ambient — Admin</span>
        <Link href="/" className="footer-link">
          ← Guide
        </Link>
      </footer>
    </div>
  )
}
