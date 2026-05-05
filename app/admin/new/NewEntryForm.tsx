'use client'
import { useFormState } from 'react-dom'
import Link from 'next/link'
import JournalEditor from '@/components/JournalEditor'
import { createEntry } from './actions'

export default function NewEntryForm() {
  const [state, action] = useFormState(createEntry, null)

  return (
    <form action={action} className="entry-form">
      {state?.error && (
        <div style={{ color: 'var(--accent-red, #f87171)', fontFamily: 'var(--mono)', fontSize: '13px', marginBottom: '16px' }}>
          {state.error}
        </div>
      )}

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
  )
}
