'use client'
import { useRef } from 'react'
import Link from 'next/link'
import JournalEditor, { type JournalEditorHandle } from '@/components/JournalEditor'
import { type JournalEntry } from '@/lib/supabase'

interface Props {
  entry: JournalEntry
  updateEntry: (formData: FormData) => Promise<void>
}

export default function EditEntryForm({ entry, updateEntry }: Props) {
  const editorRef = useRef<JournalEditorHandle>(null)

  function syncEditor() {
    editorRef.current?.syncValue()
  }

  return (
    <form action={updateEntry} onSubmit={syncEditor} className="entry-form">
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
        <JournalEditor ref={editorRef} name="body" initialContent={entry.body} />
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
  )
}
