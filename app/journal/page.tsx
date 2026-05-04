import Link from 'next/link'
import { getSupabase, JournalEntry } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
}

function formatDate(iso: string): string {
  return iso.slice(0, 10)
}

export default async function JournalPage() {
  const { data: entries } = await getSupabase()
    .from('journal_entries')
    .select('id, slug, title, body, created_at')
    .order('created_at', { ascending: false })
    .returns<JournalEntry[]>()

  return (
    <div className="site-wrap">
      <header className="journal-header">
        <div className="header-eyebrow">Patch / Session Notes</div>
        <h1 className="phase-title" style={{ fontSize: 'clamp(28px, 5vw, 48px)', opacity: 1, animation: 'none' }}>
          Journal
        </h1>
        <div style={{ marginTop: '16px' }}>
          <Link href="/" className="header-nav-link">
            ← Guide
          </Link>
        </div>
      </header>

      <div className="journal-list">
        {!entries || entries.length === 0 ? (
          <div className="empty-state">no entries yet</div>
        ) : (
          entries.map((entry) => {
            const excerpt = stripHtml(entry.body).slice(0, 200)
            const truncated = stripHtml(entry.body).length > 200 ? excerpt + '…' : excerpt
            return (
              <Link key={entry.id} href={`/journal/${entry.slug}`} className="entry-card">
                <div className="entry-card-date">{formatDate(entry.created_at)}</div>
                <div className="entry-card-title">{entry.title}</div>
                <div className="entry-card-excerpt">{truncated}</div>
                <span className="entry-card-read">Read →</span>
              </Link>
            )
          })
        )}
      </div>

      <footer>
        <span className="footer-text">Generative Ambient — Eurorack Learning Guide</span>
        <a className="footer-link" href="https://modulargrid.net" target="_blank" rel="noopener noreferrer">
          modulargrid.net ↗
        </a>
      </footer>
    </div>
  )
}
