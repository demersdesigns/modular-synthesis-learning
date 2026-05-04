import Link from 'next/link'
import { JournalEntry } from '@/lib/supabase'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
}

export default function EntryCard({ entry }: { entry: JournalEntry }) {
  const text = stripHtml(entry.body)
  const excerpt = text.length > 200 ? text.slice(0, 200) + '…' : text
  const date = entry.created_at.slice(0, 10)

  return (
    <Link href={`/journal/${entry.slug}`} className="entry-card">
      <div className="entry-card-date">{date}</div>
      <div className="entry-card-title">{entry.title}</div>
      <div className="entry-card-excerpt">{excerpt}</div>
      <span className="entry-card-read">Read →</span>
    </Link>
  )
}
