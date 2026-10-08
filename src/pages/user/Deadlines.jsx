import { useEffect, useState } from 'react'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

export default function Deadlines() {
  const [items, setItems] = useState(null), [error, setError] = useState('')
  useEffect(() => { api.get('/deadlines').then(({ data }) => setItems(Array.isArray(data) ? data : [])).catch(() => setError('Deadlines could not be loaded. Please try again.')) }, [])
  return <><PageHeader title="Deadlines" subtitle="Keep important dates from your opportunity list in view."/>{error ? <div role="alert" className="alert alert-danger">{error}</div> : items === null ? <div className="skeleton skeleton-table" aria-label="Loading deadlines"/> : items.length === 0 ? <EmptyState icon="calendar2-check" title="No upcoming deadlines">There are no future deadlines recorded for your opportunities.</EmptyState> : <div className="card section-card"><div className="card-body"><div className="deadline-list">{items.map(item => <article className="deadline-row" key={item.id}><span className="deadline-marker"><i className="bi bi-calendar-event"/></span><div className="deadline-info"><strong>{item.opportunityTitle}</strong><span>{item.title}</span></div><time>{item.deadline ? new Date(item.deadline).toLocaleString() : 'Date not specified'}</time></article>)}</div></div></div>}</>
}
