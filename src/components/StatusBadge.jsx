export default function StatusBadge({ status }) {
  if (!status) return null
  const value = String(status)
  const normalized = value.toUpperCase()
  const tone = normalized === 'ELIGIBLE' || normalized === 'SATISFIED' || normalized === 'ACTIVE' || normalized === 'OPEN' || normalized === 'AVAILABLE' ? 'success'
    : normalized.includes('MISSING') || normalized.includes('PENDING') || normalized.includes('UPCOMING') ? 'warning'
      : normalized.includes('NOT') || normalized.includes('INACTIVE') || normalized.includes('CLOSED') ? 'danger' : 'neutral'
  return <span className={`status-badge status-${tone}`}><span className="status-dot"/>{value}</span>
}
