import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'

function DetailSection({ title, children }) { return <section className="detail-section"><h2>{title}</h2>{children}</section> }
export default function OpportunityDetails() {
  const { id } = useParams()
  return <OpportunityDetailsForId key={id} id={id} />
}

function OpportunityDetailsForId({ id }) {
  const [item, setItem] = useState(null), [deadlines, setDeadlines] = useState([]), [deadlinesUnavailable, setDeadlinesUnavailable] = useState(false), [saved, setSaved] = useState(null), [saveUnavailable, setSaveUnavailable] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState(''), [saving, setSaving] = useState(false)
  useEffect(() => {
    let active = true
    Promise.allSettled([api.get(`/opportunities/${id}`), api.get('/deadlines'), api.get('/saved-opportunities')]).then(([opportunity, dates, savedItems]) => {
      if (!active) return
      if (opportunity.status === 'rejected') { setError('This opportunity could not be loaded.'); return }
      setItem(opportunity.value.data)
      if (dates.status === 'fulfilled' && Array.isArray(dates.value.data)) setDeadlines(dates.value.data.filter(date => String(date.opportunityId) === id))
      else setDeadlinesUnavailable(true)
      if (savedItems.status === 'fulfilled' && Array.isArray(savedItems.value.data)) setSaved(savedItems.value.data.some(entry => String(entry.id) === id))
      else setSaveUnavailable(true)
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])
  const toggleSave = async () => { if (saved === null) return; setSaving(true); setError(''); try { if (saved) await api.delete(`/saved-opportunities/${id}`); else await api.post(`/saved-opportunities/${id}`); setSaved(!saved) } catch { setError('Your saved opportunities could not be updated. Please try again.') } finally { setSaving(false) } }
  if (loading) return <><PageHeader title="Opportunity details" subtitle="Loading opportunity information."/><div className="skeleton skeleton-detail"/></>
  if (error && !item) return <EmptyState icon="exclamation-circle" title="Opportunity unavailable">{error}</EmptyState>
  if (!item) return <EmptyState icon="search" title="Opportunity not found">This opportunity is no longer available.</EmptyState>
  const criteria = item.eligibilityCriteria || item.eligibility
  const requiredDocuments = item.requiredDocuments || item.documents
  const preparation = item.preparationInformation || item.preparation
  return <><PageHeader title={item.title} subtitle={item.provider} action={<button className="btn btn-outline-secondary" onClick={toggleSave} disabled={saving || saveUnavailable || saved === null} title={saveUnavailable ? 'Saved opportunities could not be reached' : undefined}><i className={`bi bi-bookmark${saved ? '-fill' : ''} me-2`}/>{saving ? 'Saving…' : saveUnavailable ? 'Save unavailable' : saved ? 'Saved' : 'Save opportunity'}</button>}/>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    {deadlinesUnavailable && <div className="alert alert-warning" role="status">Important dates could not be loaded from the deadline service.</div>}
    <div className="row g-4"><div className="col-lg-8"><article className="card section-card"><div className="card-body opportunity-detail-body">{item.category && <span className="detail-category">{item.category}</span>}{item.status && <span className="ms-2"><StatusBadge status={item.status}/></span>}
      {item.description && <DetailSection title="About this opportunity"><p>{item.description}</p></DetailSection>}
      {criteria && <DetailSection title="Eligibility information">{typeof criteria === 'string' ? <p>{criteria}</p> : Array.isArray(criteria) ? <ul>{criteria.map((rule, index) => <li key={rule.id || index}>{typeof rule === 'string' ? rule : rule.description || rule.criterion}</li>)}</ul> : <p>{criteria.description || criteria.criterion || JSON.stringify(criteria)}</p>}</DetailSection>}
      {Array.isArray(requiredDocuments) && requiredDocuments.length > 0 && <DetailSection title="Required documents"><ul>{requiredDocuments.map((document, index) => <li key={document.id || index}>{typeof document === 'string' ? document : document.name || document.title}</li>)}</ul></DetailSection>}
      {preparation && <DetailSection title="Preparation information">{typeof preparation === 'string' ? <p>{preparation}</p> : <ul>{preparation.map((task, index) => <li key={task.id || index}>{typeof task === 'string' ? task : task.title || task.description}</li>)}</ul>}</DetailSection>}
      {!criteria && !requiredDocuments?.length && !preparation && !item.description && <EmptyState icon="file-earmark-text" title="More details are not available">The opportunity record does not include additional information yet.</EmptyState>}
    </div></article></div><div className="col-lg-4"><aside className="card section-card details-aside"><div className="card-body"><h2 className="h5">Important dates</h2>{deadlines.length ? deadlines.map(date => <div className="date-entry" key={date.id}><span>{date.title}</span><strong>{date.deadline ? new Date(date.deadline).toLocaleString() : 'Date not specified'}</strong></div>) : <p className="text-secondary small">{deadlinesUnavailable ? 'Dates are temporarily unavailable.' : 'No deadlines are recorded for this opportunity.'}</p>}{item.officialUrl && <a className="btn btn-outline-secondary w-100 mt-3" href={item.officialUrl} target="_blank" rel="noreferrer">Provider information <i className="bi bi-box-arrow-up-right ms-2"/></a>}<Link className="btn btn-primary w-100 mt-3" to={`/user/eligibility/${item.id}`}>Check eligibility <i className="bi bi-arrow-right ms-2"/></Link></div></aside></div></div>
  </>
}
