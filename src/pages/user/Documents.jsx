import { useEffect, useState } from 'react'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

const statuses = ['REQUIRED', 'SUBMITTED', 'PENDING']
export default function Documents() {
  const [items, setItems] = useState(null), [error, setError] = useState(''), [message, setMessage] = useState(''), [saving, setSaving] = useState(null)
  const reload = () => api.get('/documents').then(({ data }) => setItems(Array.isArray(data) ? data : [])).catch(() => setError('Documents could not be loaded. Please try again.'))
  useEffect(() => { reload() }, [])
  const update = async (item, status) => {
    if (saving !== null) return
    setSaving(item.id); setError(''); setMessage('')
    try { await api.put(`/documents/${item.id}`, { status }); setItems(current => current.map(row => row.id === item.id ? { ...row, status } : row)); setMessage(`${item.name} checklist status updated.`) }
    catch (err) { setError(err.response?.data?.error || 'Document status could not be updated.') }
    finally { setSaving(null) }
  }
  const count = status => items?.filter(item => item.status === status).length || 0
  const ready = count('SUBMITTED') + count('VERIFIED')
  return <><PageHeader title="Documents" subtitle="Track the documents requested by your opportunities. LifePath does not store uploaded files."/>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}
    {items === null && !error ? <div className="skeleton skeleton-table" aria-label="Loading documents"/> : items?.length ? <><section className="document-overview mb-4"><div className="document-overview-copy"><span className="document-overview-icon"><i className="bi bi-folder-check"/></span><div><strong>Document checklist</strong><p>{ready} of {items.length} documents submitted or verified</p></div></div><div className="document-overview-progress"><div className="progress" role="progressbar" aria-label="Documents submitted or verified" aria-valuenow={Math.round(ready/items.length*100)} aria-valuemin="0" aria-valuemax="100"><div className="progress-bar" style={{width:`${Math.round(ready/items.length*100)}%`}}/></div><strong>{Math.round(ready/items.length*100)}%</strong></div><div className="document-counts">{[['Required',count('REQUIRED')],['Submitted',count('SUBMITTED')],['Verified',count('VERIFIED')],['Pending',count('PENDING')]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section><div className="row g-3">{items.map(item => <article className="col-md-6" key={item.id}><div className={`card document-card document-${String(item.status).toLowerCase()} h-100`}><div className="card-body"><div className="document-card-title"><span className="document-card-icon"><i className={`bi bi-${item.status === 'VERIFIED' ? 'patch-check' : item.status === 'SUBMITTED' ? 'file-earmark-check' : 'file-earmark-text'}`}/></span><div><h2 className="h5">{item.name}</h2><span className="badge text-bg-light">{item.status}</span></div></div>{item.description && <p className="text-secondary">{item.description}</p>}{item.opportunities?.length > 0 && <p className="small mb-3"><i className="bi bi-link-45deg me-1"/>For: {item.opportunities.join(', ')}</p>}<label className="form-label" htmlFor={`doc-${item.id}`}>Checklist status</label><select id={`doc-${item.id}`} className="form-select" value={item.status === 'VERIFIED' || statuses.includes(item.status) ? item.status : 'REQUIRED'} disabled={saving !== null || item.status === 'VERIFIED'} onChange={event => update(item, event.target.value)}>{item.status === 'VERIFIED' && <option value="VERIFIED">VERIFIED (staff review)</option>}{statuses.map(status => <option key={status}>{status}</option>)}</select></div></div></article>)}</div></> : error ? null : <EmptyState icon="folder2" title="No required documents">Required documents will appear when opportunities are added.</EmptyState>}
  </>
}
