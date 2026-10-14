import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

export default function Preparation() {
  const [items, setItems] = useState(null), [error, setError] = useState(''), [message, setMessage] = useState(''), [saving, setSaving] = useState(null)
  useEffect(() => { api.get('/preparation').then(({ data }) => setItems(Array.isArray(data) ? data : [])).catch(() => setError('Preparation tasks could not be loaded. Please try again.')) }, [])
  const completed = useMemo(() => items?.filter(item => item.status === 'COMPLETED').length || 0, [items])
  const progress = items?.length ? Math.round(completed / items.length * 100) : 0
  const update = async (item, status) => {
    if (saving !== null) return
    setSaving(item.id); setError(''); setMessage('')
    try { const { data } = await api.put(`/preparation/${item.id}`, { status }); setItems(current => current.map(row => row.id === item.id ? { ...row, ...(data && typeof data === 'object' ? data : {}), status } : row)); setMessage('Preparation progress saved.') }
    catch (err) { setError(err.response?.data?.error || 'Task status could not be updated.') }
    finally { setSaving(null) }
  }
  return <><PageHeader title="Preparation" subtitle="Build a steady routine and track your progress."/>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}
    {items === null && !error ? <div className="skeleton skeleton-table" aria-label="Loading tasks"/> : items?.length ? <><section className="card section-card mb-3"><div className="card-body"><div className="d-flex justify-content-between mb-2"><strong>Overall progress</strong><span>{completed} of {items.length} complete</span></div><div className="progress" role="progressbar" aria-label="Preparation progress" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"><div className="progress-bar" style={{ width: `${progress}%` }}/></div></div></section><div className="row g-3">{items.map(item => { const status = item.status || 'NOT_STARTED'; return <article className="col-md-6" key={item.id}><div className="card section-card h-100"><div className="card-body"><div className="d-flex justify-content-between gap-2"><h2 className="h5">{item.title || 'Preparation task'}</h2><span className="badge text-bg-light">{status.replaceAll('_', ' ')}</span></div>{item.opportunityTitle && <p className="small text-secondary">{item.opportunityTitle}</p>}{item.description && <p className="text-secondary">{item.description}</p>}<label className="form-label" htmlFor={`task-${item.id}`}>Task status</label><select id={`task-${item.id}`} className="form-select" value={status} disabled={saving !== null} onChange={event => update(item, event.target.value)}><option value="NOT_STARTED">Not started</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select></div></div></article>})}</div></> : error ? null : <EmptyState icon="journal-check" title="No preparation tasks">Tasks linked to opportunities will appear here.</EmptyState>}
  </>
}
