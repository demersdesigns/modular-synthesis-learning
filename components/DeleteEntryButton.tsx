'use client'

interface DeleteEntryButtonProps {
  id: string
  deleteAction: (formData: FormData) => Promise<void>
}

export default function DeleteEntryButton({ id, deleteAction }: DeleteEntryButtonProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm('Delete this entry?')) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteAction} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="action-btn">
        delete
      </button>
    </form>
  )
}
