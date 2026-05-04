import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabase, JournalEntry } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function formatDate(iso: string): string {
  return iso.slice(0, 10)
}

export default async function EntryPage({ params }: { params: { slug: string } }) {
  const { data: entry } = await getSupabase()
    .from('journal_entries')
    .select('*')
    .eq('slug', params.slug)
    .single<JournalEntry>()

  if (!entry) notFound()

  return (
    <div className="site-wrap">
      <div className="entry-page-header">
        <Link href="/journal" className="entry-back">
          ← Journal
        </Link>
        <h1 className="entry-title">{entry.title}</h1>
        <div className="entry-date">{formatDate(entry.created_at)}</div>
      </div>

      <div
        className="entry-body"
        dangerouslySetInnerHTML={{ __html: entry.body }}
      />

      <footer>
        <span className="footer-text">Generative Ambient — Eurorack Learning Guide</span>
        <a className="footer-link" href="https://modulargrid.net" target="_blank" rel="noopener noreferrer">
          modulargrid.net ↗
        </a>
      </footer>
    </div>
  )
}
