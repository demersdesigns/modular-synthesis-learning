import NewEntryForm from './NewEntryForm'

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

      <NewEntryForm />
    </div>
  )
}
