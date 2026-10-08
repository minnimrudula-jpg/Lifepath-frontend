import { useEffect, useState } from 'react'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import OpportunityCard from '../../components/OpportunityCard'
import EmptyState from '../../components/EmptyState'

export default function SavedOpportunities() {
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('')
  useEffect(() => { api.get('/saved-opportunities').then(({ data }) => setItems(Array.isArray(data) ? data : [])).catch(() => setError('Saved opportunities could not be loaded.')).finally(() => setLoading(false)) }, [])
  const remove = async item => { try { await api.delete(`/saved-opportunities/${item.id}`); setItems(current => current.filter(saved => saved.id !== item.id)) } catch { setError('This opportunity could not be removed from your saved list.') } }
  return <><PageHeader title="Saved opportunities" subtitle="A considered shortlist of options you want to revisit."/>{error && <div className="alert alert-danger" role="alert">{error}</div>}{loading ? <div className="row g-3" aria-label="Loading saved opportunities">{[1, 2].map(n => <div className="col-md-6 col-xl-4" key={n}><div className="skeleton skeleton-card"/></div>)}</div> : error ? <EmptyState icon="cloud-slash" title="Saved opportunities are unavailable">Please try again when the service is reachable.</EmptyState> : items.length === 0 ? <EmptyState icon="bookmark-heart" title="Your shortlist is waiting">Save an opportunity to keep its details and deadline close at hand.</EmptyState> : <div className="row g-3">{items.map(item => <div className="col-md-6 col-xl-4" key={item.id}><OpportunityCard opportunity={item} saved onToggleSave={remove}/></div>)}</div>}</>
}
