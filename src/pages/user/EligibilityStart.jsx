import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

export default function EligibilityStart() {
  const [items, setItems] = useState(null), [error, setError] = useState('')
  useEffect(() => { api.get('/opportunities').then(({ data }) => setItems(Array.isArray(data) ? data : [])).catch(() => setError('Opportunities could not be loaded. Please try again.')) }, [])
  return <><PageHeader title="Check eligibility" subtitle="Choose an opportunity to request an eligibility result from LifePath."/>{error ? <div className="alert alert-danger" role="alert">{error}</div> : items === null ? <div className="skeleton skeleton-table" aria-label="Loading opportunities"/> : items.length === 0 ? <EmptyState icon="check2-circle" title="No opportunities to check">Opportunities will appear here when they are available.</EmptyState> : <div className="card section-card"><div className="card-body"><div className="eligibility-choice-list">{items.map(item => <article className="eligibility-choice" key={item.id}><div><h2>{item.title}</h2>{item.provider && <p>{item.provider}</p>}{item.category && <span className="detail-category">{item.category}</span>}</div><Link className="btn btn-primary" to={`/user/eligibility/${item.id}`}>Check eligibility <i className="bi bi-arrow-right ms-2"/></Link></article>)}</div></div></div>}</>
}
