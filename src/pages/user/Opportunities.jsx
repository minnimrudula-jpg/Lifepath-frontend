import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import OpportunityCard from '../../components/OpportunityCard'
import EmptyState from '../../components/EmptyState'

export default function Opportunities() {
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState([]), [saved, setSaved] = useState([]), [savedUnavailable, setSavedUnavailable] = useState(false), [query, setQuery] = useState(() => searchParams.get('search') || ''), [category, setCategory] = useState(''), [eligibility, setEligibility] = useState(''), [order, setOrder] = useState('deadline'), [loading, setLoading] = useState(true), [error, setError] = useState('')
  useEffect(() => {
    let active = true
    Promise.allSettled([api.get('/opportunities'), api.get('/saved-opportunities')]).then(([all, bookmarked]) => {
      if (!active) return
      if (all.status === 'fulfilled') setItems(Array.isArray(all.value.data) ? all.value.data : [])
      else setError('Opportunities could not be loaded. Please try again.')
      if (bookmarked.status === 'fulfilled') setSaved(Array.isArray(bookmarked.value.data) ? bookmarked.value.data : [])
      else setSavedUnavailable(true)
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const savedIds = useMemo(() => new Set(saved.map(item => item.id)), [saved])
  const categories = [...new Set(items.map(item => item.category).filter(Boolean))]
  const eligibilityStatuses = [...new Set(items.map(item => item.eligibilityStatus).filter(Boolean))]
  const filtered = items.filter(item => `${item.title || ''} ${item.provider || ''}`.toLowerCase().includes(query.toLowerCase())).filter(item => !category || item.category === category).filter(item => !eligibility || item.eligibilityStatus === eligibility).sort((a, b) => order === 'title' ? (a.title || '').localeCompare(b.title || '') : (a.deadline || '9999').localeCompare(b.deadline || '9999'))
  const toggleSave = async item => {
    setError('')
    try { if (savedIds.has(item.id)) { await api.delete(`/saved-opportunities/${item.id}`); setSaved(current => current.filter(entry => entry.id !== item.id)) } else { await api.post(`/saved-opportunities/${item.id}`); setSaved(current => [...current, item]) } }
    catch { setError('Your saved opportunities could not be updated. Please try again.') }
  }
  return <><PageHeader title="Discover opportunities" subtitle="Explore opportunities currently available in LifePath."/>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}{savedUnavailable && !error && <div className="alert alert-warning" role="status">Saved opportunities are unavailable. You can browse listings, but saving is temporarily disabled.</div>}
    <div className="card section-card mb-4"><div className="card-body"><div className="row g-3 align-items-end"><div className="col-lg-6"><label className="form-label" htmlFor="opportunity-search">Search opportunities</label><div className="input-group"><span className="input-group-text"><i className="bi bi-search"/></span><input id="opportunity-search" className="form-control" placeholder="Title or organization" value={query} onChange={event => setQuery(event.target.value)}/></div></div><div className="col-sm-6 col-lg-3"><label className="form-label" htmlFor="opportunity-category">Category</label><select id="opportunity-category" className="form-select" value={category} onChange={event => setCategory(event.target.value)}><option value="">All categories</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select></div>{eligibilityStatuses.length > 0 && <div className="col-sm-6 col-lg-3"><label className="form-label" htmlFor="opportunity-eligibility">Eligibility status</label><select id="opportunity-eligibility" className="form-select" value={eligibility} onChange={event => setEligibility(event.target.value)}><option value="">All statuses</option>{eligibilityStatuses.map(value => <option key={value} value={value}>{value}</option>)}</select></div>}<div className="col-sm-6 col-lg-3"><label className="form-label" htmlFor="opportunity-sort">Sort by</label><select id="opportunity-sort" className="form-select" value={order} onChange={event => setOrder(event.target.value)}><option value="deadline">Deadline</option><option value="title">Title</option></select></div></div></div></div>
    {loading ? <div className="row g-3" aria-label="Loading opportunities">{[1, 2, 3].map(n => <div className="col-md-6 col-xl-4" key={n}><div className="skeleton skeleton-card"/></div>)}</div> : error ? <EmptyState icon="cloud-slash" title="Opportunities are unavailable">The opportunity service could not be reached.</EmptyState> : filtered.length === 0 ? <EmptyState icon="search" title={items.length ? 'No matching opportunities' : 'No opportunities available'}>{items.length ? 'Try another search or category.' : 'New opportunities will appear here when they are added.'}</EmptyState> : <div className="row g-3">{filtered.map(item => <div className="col-md-6 col-xl-4 result-item" key={item.id}><OpportunityCard opportunity={item} saved={savedIds.has(item.id)} saveDisabled={savedUnavailable} onToggleSave={toggleSave}/></div>)}</div>}
  </>
}
