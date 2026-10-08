export default function EmptyState({ icon = 'inbox', title = 'Nothing here yet', children }) {
  return <div className="empty-state text-center" role="status"><i className={`bi bi-${icon}`} aria-hidden="true" /><h3>{title}</h3>{children && <p>{children}</p>}</div>
}
