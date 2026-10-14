import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'

const blankOpportunity = { title: '', categoryId: '', description: '', provider: '', officialUrl: '', status: 'ACTIVE' }
const textMessage = value => typeof value === 'string' ? value : Array.isArray(value) ? value.map(textMessage).filter(Boolean).join(' ') : value && typeof value === 'object' ? Object.values(value).map(textMessage).filter(Boolean).join(' ') : ''
const getError = error => {
  if (error.response?.status === 404) return 'The opportunity service could not find this record or endpoint.'
  if (error.response?.status === 403) return 'Your account is not authorized to perform this action.'
  if (error.response?.status === 409) return error.response?.data?.message || error.response?.data?.error || 'This opportunity cannot be deleted while it is referenced by other records.'
  const body = error.response?.data
  return textMessage(typeof body === 'string' ? body : body?.message || body?.error || body?.details || body?.errors) || error.message || 'The request could not be completed.'
}

export default function AdminOpportunities() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryError, setCategoryError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(blankOpportunity)
  const [busy, setBusy] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.get('/opportunities')
      setItems(Array.isArray(data) ? data : [])
    } catch (requestError) { setError(getError(requestError)) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => {
    let active = true
    api.get('/opportunities').then(({ data }) => { if (active) setItems(Array.isArray(data) ? data : []) }).catch(requestError => { if (active) setError(getError(requestError)) }).finally(() => { if (active) setLoading(false) })
    api.get('/categories').then(({ data }) => { if (active) setCategories(Array.isArray(data) ? data : []) }).catch(() => { if (active) { setCategories([]); setCategoryError('Categories could not be loaded. You can still save an opportunity without a category.') } })
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => items.filter(item => {
    const search = `${item.title || ''} ${item.provider || ''} ${item.description || ''}`.toLowerCase()
    return search.includes(query.trim().toLowerCase()) && (!categoryFilter || String(item.categoryId || '') === categoryFilter) && (!statusFilter || item.status === statusFilter)
  }), [items, query, categoryFilter, statusFilter])
  const statuses = useMemo(() => [...new Set(items.map(item => item.status).filter(Boolean))].sort(), [items])

  const openCreate = () => { setEditingId(null); setForm(blankOpportunity); setFormError(''); setFeedback(''); setDialogOpen(true) }
  const openEdit = item => { setEditingId(item.id); setForm({ title: item.title || '', categoryId: item.categoryId ? String(item.categoryId) : '', description: item.description || '', provider: item.provider || '', officialUrl: item.officialUrl || '', status: item.status || 'ACTIVE' }); setFormError(''); setFeedback(''); setDialogOpen(true) }
  const closeForm = () => { if (!busy) { setDialogOpen(false); setFormError('') } }
  const updateField = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async event => {
    event.preventDefault()
    if (busy) return
    if (!form.title.trim()) { setFormError('Enter an opportunity title.'); return }
    setBusy(true); setFormError(''); setFeedback('')
    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      provider: form.provider.trim() || null,
      officialUrl: form.officialUrl.trim() || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      status: form.status.trim() || 'ACTIVE',
    }
    try {
      if (editingId) await api.put(`/opportunities/${editingId}`, payload)
      else await api.post('/opportunities', payload)
      setDialogOpen(false); setFeedback(editingId ? 'Opportunity updated.' : 'Opportunity created.')
      await load()
    } catch (requestError) { setFormError(getError(requestError)) }
    finally { setBusy(false) }
  }

  const remove = async item => {
    if (deletingId) return
    const confirmed = window.confirm(`Delete “${item.title}”? This action cannot be undone.`)
    if (!confirmed) return
    setDeletingId(item.id); setError(''); setFeedback('')
    try { await api.delete(`/opportunities/${item.id}`); setFeedback('Opportunity deleted.'); await load() }
    catch (requestError) { setError(getError(requestError)) }
    finally { setDeletingId(null) }
  }

  return <>
    <PageHeader title="Opportunities" subtitle="Create and maintain the opportunities shown to LifePath users." action={<button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-2"/>Add opportunity</button>}/>
    {feedback && <div className="alert alert-success" role="status">{feedback}</div>}
    {error && <div className="alert alert-danger" role="alert">{error}</div>}

    <section className="card section-card mb-4"><div className="card-body"><div className="row g-3 align-items-end">
      <div className="col-lg-6"><label className="form-label" htmlFor="admin-opportunity-search">Search opportunities</label><div className="input-group"><span className="input-group-text"><i className="bi bi-search"/></span><input id="admin-opportunity-search" className="form-control" value={query} onChange={event => setQuery(event.target.value)} placeholder="Title, provider or description"/></div></div>
      <div className="col-sm-6 col-lg-3"><label className="form-label" htmlFor="admin-opportunity-category">Category</label><select id="admin-opportunity-category" className="form-select" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}><option value="">All categories</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
      <div className="col-sm-6 col-lg-3"><label className="form-label" htmlFor="admin-opportunity-status">Status</label><select id="admin-opportunity-status" className="form-select" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="">All statuses</option>{statuses.map(status => <option key={status}>{status}</option>)}</select></div>
    </div></div></section>

    {loading ? <div className="skeleton skeleton-table" aria-label="Loading opportunities"/> : error && !items.length ? <EmptyState icon="cloud-slash" title="Opportunities are unavailable">{error}</EmptyState> : !filtered.length ? <EmptyState icon="search" title={items.length ? 'No matching opportunities' : 'No opportunities yet'}>{items.length ? 'Try a different search or filter.' : 'Add an opportunity when you are ready. No sample records are shown.'}</EmptyState> : <div className="card section-card"><div className="card-body p-0"><div className="table-responsive"><table className="table align-middle admin-opportunity-table mb-0"><thead><tr><th>Opportunity</th><th>Category</th><th>Status</th><th>Official link</th><th className="text-end">Actions</th></tr></thead><tbody>{filtered.map(item => <tr key={item.id}>
      <td><strong>{item.title}</strong>{item.provider && <small className="d-block text-secondary mt-1">{item.provider}</small>}{item.description && <span className="admin-opportunity-description">{item.description}</span>}</td>
      <td>{item.category || 'Uncategorized'}</td><td><StatusBadge status={item.status}/></td><td>{item.officialUrl ? <a href={item.officialUrl} target="_blank" rel="noreferrer">Visit site <i className="bi bi-box-arrow-up-right ms-1"/></a> : <span className="text-secondary">Not provided</span>}</td>
      <td className="text-end text-nowrap"><button className="btn btn-sm btn-outline-primary me-2" disabled={deletingId !== null} onClick={() => openEdit(item)} aria-label={`Edit ${item.title}`}><i className="bi bi-pencil me-1"/>Edit</button><button className="btn btn-sm btn-outline-danger" disabled={deletingId !== null} onClick={() => remove(item)} aria-label={`Delete ${item.title}`}><i className="bi bi-trash me-1"/>{deletingId === item.id ? 'Deleting...' : 'Delete'}</button></td>
    </tr>)}</tbody></table></div></div></div>}
    <p className="small text-secondary mt-3">Eligibility requirements are managed separately. <Link to="/admin/eligibility-rules">Open eligibility rules <i className="bi bi-arrow-right"/></Link></p>

    {dialogOpen && <div className="admin-form-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) closeForm() }} onKeyDown={event => { if (event.key === 'Escape') closeForm() }}><section className="admin-opportunity-dialog" role="dialog" aria-modal="true" aria-labelledby="opportunity-form-title" aria-busy={busy}><div className="admin-opportunity-dialog-header"><div><span className="admin-form-eyebrow">OPPORTUNITY DETAILS</span><h2 id="opportunity-form-title">{editingId ? 'Edit opportunity' : 'Add opportunity'}</h2><p>Fields follow the opportunity API. Only the title is required.</p></div><button type="button" className="btn-close" aria-label="Close" onClick={closeForm} disabled={busy}/></div>
      <form onSubmit={submit}><div className="admin-opportunity-form-grid">
        <div className="admin-form-field admin-form-field-wide"><label className="form-label" htmlFor="opportunity-title">Title <span className="text-danger">*</span></label><input id="opportunity-title" name="title" className="form-control" maxLength="255" required autoFocus value={form.title} onChange={updateField} aria-describedby="opportunity-title-help"/><small id="opportunity-title-help">Up to 255 characters.</small></div>
        <div className="admin-form-field"><label className="form-label" htmlFor="opportunity-category">Category</label><select id="opportunity-category" name="categoryId" className="form-select" value={form.categoryId} onChange={updateField}><option value="">No category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{categoryError && <small role="status">{categoryError}</small>}</div>
        <div className="admin-form-field"><label className="form-label" htmlFor="opportunity-status">Status</label><input id="opportunity-status" name="status" className="form-control" list="opportunity-status-options" maxLength="50" value={form.status} onChange={updateField}/><datalist id="opportunity-status-options"><option value="ACTIVE"/><option value="INACTIVE"/><option value="CLOSED"/></datalist><small>Up to 50 characters. Default is ACTIVE.</small></div>
        <div className="admin-form-field"><label className="form-label" htmlFor="opportunity-provider">Provider</label><input id="opportunity-provider" name="provider" className="form-control" maxLength="255" value={form.provider} onChange={updateField}/><small>Up to 255 characters.</small></div>
        <div className="admin-form-field"><label className="form-label" htmlFor="opportunity-url">Official URL</label><input id="opportunity-url" name="officialUrl" className="form-control" type="url" maxLength="2048" value={form.officialUrl} onChange={updateField} placeholder="https://"/><small>Up to 2,048 characters.</small></div>
        <div className="admin-form-field admin-form-field-wide"><label className="form-label" htmlFor="opportunity-description">Description</label><textarea id="opportunity-description" name="description" className="form-control" rows="5" maxLength="4000" value={form.description} onChange={updateField}/><small>Up to 4,000 characters.</small></div>
      </div>{formError && <div className="alert alert-danger mt-3" role="alert">{formError}</div>}<div className="admin-opportunity-form-actions"><button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={closeForm}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : editingId ? 'Save changes' : 'Create opportunity'}</button></div></form>
    </section></div>}
  </>
}
