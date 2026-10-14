import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

const textMessage = value => typeof value === 'string' ? value : Array.isArray(value) ? value.map(textMessage).filter(Boolean).join(' ') : value && typeof value === 'object' ? Object.values(value).map(textMessage).filter(Boolean).join(' ') : ''
const message = (error) => {
  if (error.response?.status === 404) return 'This admin API is not available in the connected backend.'
  if (error.response?.status === 403) return 'Your account is not authorized to use this admin API.'
  if (error.response?.status === 409) return error.response?.data?.message || error.response?.data?.error || 'This record cannot be deleted while it is referenced by other records.'
  const body = error.response?.data
  const detail = textMessage(typeof body === 'string' ? body : body?.message || body?.error || body?.details || body?.errors)
  return detail || error.message || 'Request failed.'
}
const adminPreferences = () => { try { return JSON.parse(localStorage.getItem('lifepath_admin_preferences') || '{}') } catch { return {} } }
const mayDelete = (label) => adminPreferences().confirmDeletes === false || window.confirm(`Delete ${label}?`)
const tableClass = (extra = '') => `table${adminPreferences().compactTables ? ' table-sm' : ''} ${extra}`.trim()

function LoadState({ loading, error, empty, onRetry, children }) {
  if (loading) return <div className="skeleton skeleton-table" aria-label="Loading" />
  if (error) return <><div role="alert" className="alert alert-danger">{error}</div>{onRetry && <button type="button" className="btn btn-outline-primary" onClick={onRetry}>Retry</button>}</>
  if (empty) return <EmptyState icon="database" title={empty} />
  return children
}

export function Categories() {
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [saveError, setSaveError] = useState(''), [feedback, setFeedback] = useState(''), [busy, setBusy] = useState(false), [deletingId, setDeletingId] = useState(null), [editing, setEditing] = useState(null), [form, setForm] = useState({ name: '', description: '' })
  const load = useCallback(async () => { setLoading(true); setError(''); try { const { data } = await api.get('/categories'); setItems(Array.isArray(data) ? data : []) } catch (e) { setError(message(e)) } finally { setLoading(false) } }, [])
  useEffect(() => {
    let active = true
    api.get('/categories').then(({ data }) => { if (active) setItems(Array.isArray(data) ? data : []) }).catch(e => { if (active) setError(message(e)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const reset = () => { setEditing(null); setForm({ name: '', description: '' }); setSaveError('') }
  const submit = async e => {
    e.preventDefault()
    if (busy) return
    if (!form.name.trim()) { setSaveError('Enter a category name.'); return }
    setBusy(true); setSaveError(''); setFeedback('')
    try { const wasEditing = Boolean(editing); if (wasEditing) await api.put(`/categories/${editing}`, { ...form, name: form.name.trim() }); else await api.post('/categories', { ...form, name: form.name.trim() }); reset(); setFeedback(wasEditing ? 'Category updated.' : 'Category created.'); await load() }
    catch (err) { setSaveError(message(err)) }
    finally { setBusy(false) }
  }
  const remove = async item => {
    if (deletingId !== null || !mayDelete(`category "${item.name}"`)) return
    setDeletingId(item.id); setSaveError(''); setFeedback('')
    try { await api.delete(`/categories/${item.id}`); setFeedback('Category deleted.'); await load() }
    catch (e) { setSaveError(message(e)) }
    finally { setDeletingId(null) }
  }
  return <><PageHeader title="Categories" subtitle="Manage the opportunity categories in the catalogue."/>{feedback && <div role="status" className="alert alert-success">{feedback}</div>}<div className="row g-4"><div className="col-xl-4"><div className="card section-card"><div className="card-body"><h2 className="h5">{editing ? 'Edit category' : 'Add category'}</h2><form onSubmit={submit}><label className="form-label" htmlFor="category-name">Name</label><input id="category-name" className="form-control mb-3" maxLength="120" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><label className="form-label" htmlFor="category-description">Description</label><textarea id="category-description" className="form-control mb-3" maxLength="1000" rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>{saveError&&<div role="alert" className="alert alert-danger">{saveError}</div>}<div className="d-flex gap-2"><button className="btn btn-primary" disabled={busy||deletingId!==null}>{busy?'Saving…':editing?'Save changes':'Create category'}</button>{editing&&<button type="button" className="btn btn-outline-secondary" onClick={reset} disabled={busy}>Cancel</button>}</div></form></div></div></div><div className="col-xl-8"><LoadState loading={loading} error={error} onRetry={load} empty={!items.length&&'No categories found.'}>{saveError&&!editing&&<div role="alert" className="alert alert-danger">{saveError}</div>}<div className="card section-card"><div className="card-body table-responsive"><table className={tableClass("align-middle")}><thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td>{x.name}</td><td>{x.description||'—'}</td><td className="text-nowrap"><button className="btn btn-sm btn-outline-primary me-2" disabled={busy||deletingId!==null} onClick={()=>{setEditing(x.id);setForm({name:x.name||'',description:x.description||''});setSaveError('')}}>Edit</button><button className="btn btn-sm btn-outline-danger" disabled={busy||deletingId!==null} onClick={()=>remove(x)}>{deletingId===x.id?'Deleting…':'Delete'}</button></td></tr>)}</tbody></table></div></div></LoadState></div></div></>
}

const fields = [{key:'age',type:'INTEGER'},{key:'education',type:'STRING'},{key:'annual_income',type:'DECIMAL'},{key:'experience_years',type:'INTEGER'},{key:'branch',type:'STRING'},{key:'category',type:'STRING'}]
const operators = ['=','!=','>','>=','<','<=']
const blankRule = {field_key:'age',operator:'>=',value_type:'INTEGER',expected_value:'',required:true,active:true}
export function EligibilityRules() {
  const [opportunities,setOpportunities]=useState([]),[opportunityId,setOpportunityId]=useState(''),[items,setItems]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState(''),[opError,setOpError]=useState(''),[feedback,setFeedback]=useState(''),[deletingId,setDeletingId]=useState(null),[editing,setEditing]=useState(null),[form,setForm]=useState(blankRule),[busy,setBusy]=useState(false)
  const requestVersion=useRef(0)
  useEffect(()=>{api.get('/opportunities').then(({data})=>setOpportunities(Array.isArray(data)?data:[])).catch(e=>setOpError(message(e)))},[])
  const load=useCallback(async(id)=>{const version=++requestVersion.current;if(!id){setItems([]);setLoading(false);setError('');return}setLoading(true);setError('');try{const {data}=await api.get(`/admin/opportunities/${id}/rules`);if(version===requestVersion.current)setItems(Array.isArray(data)?data:[])}catch(e){if(version===requestVersion.current)setError(message(e))}finally{if(version===requestVersion.current)setLoading(false)}},[])
  const type=fields.find(f=>f.key===form.field_key)?.type||'STRING', allowed=type==='STRING'?['=','!=']:operators
  const setField=(key)=>{const t=fields.find(f=>f.key===key)?.type||'STRING';setForm(f=>({...f,field_key:key,value_type:t,operator:t==='STRING'?(f.operator==='='||f.operator==='!='?f.operator:'='):(f.operator||'>=')}))}
  const reset=()=>{setEditing(null);setForm(blankRule)}
  const submit=async e=>{e.preventDefault();if(busy||!opportunityId)return;if(form.expected_value.trim()==='')return;setBusy(true);setError('');setFeedback('');try{const wasEditing=Boolean(editing);const body={...form,value_type:type,expected_value:String(form.expected_value).trim()};if(wasEditing)await api.put(`/admin/opportunities/${opportunityId}/rules/${editing}`,body);else await api.post(`/admin/opportunities/${opportunityId}/rules`,body);reset();setFeedback(wasEditing?'Eligibility rule updated.':'Eligibility rule created.');await load(opportunityId)}catch(err){setError(message(err))}finally{setBusy(false)}}
  const remove=async r=>{if(deletingId!==null||!mayDelete('this eligibility rule'))return;setDeletingId(r.id);setError('');setFeedback('');try{await api.delete(`/admin/opportunities/${opportunityId}/rules/${r.id}`);setFeedback('Eligibility rule deleted.');await load(opportunityId)}catch(e){setError(message(e))}finally{setDeletingId(null)}}
  return <><PageHeader title="Eligibility rules" subtitle="Configure backend evaluated requirements for an opportunity."/>{feedback&&<div className="alert alert-success" role="status">{feedback}</div>}<div className="card section-card mb-4"><div className="card-body"><label className="form-label" htmlFor="rule-opportunity">Opportunity</label><select id="rule-opportunity" className="form-select" value={opportunityId} disabled={busy||deletingId!==null} onChange={e=>{const nextId=e.target.value;setOpportunityId(nextId);reset();setFeedback('');load(nextId)}}><option value="">Select an opportunity…</option>{opportunities.map(o=><option key={o.id} value={o.id}>{o.title}</option>)}</select>{opError&&<div className="alert alert-danger mt-3 mb-0" role="alert">{opError}</div>}</div></div>{opportunityId&&<div className="row g-4"><div className="col-xl-5"><div className="card section-card"><div className="card-body"><h2 className="h5">{editing?'Edit rule':'Add rule'}</h2><p className="small text-secondary">Choose a supported profile field and operator. The backend evaluates saved rules.</p><form onSubmit={submit}><label className="form-label" htmlFor="rule-field">Profile field</label><select id="rule-field" className="form-select mb-3" value={form.field_key} disabled={busy} onChange={e=>setField(e.target.value)}>{fields.map(f=><option key={f.key} value={f.key}>{f.key}</option>)}</select><label className="form-label" htmlFor="rule-operator">Operator</label><select id="rule-operator" className="form-select mb-3" value={form.operator} disabled={busy} onChange={e=>setForm({...form,operator:e.target.value})}>{allowed.map(o=><option key={o}>{o}</option>)}</select><label className="form-label" htmlFor="rule-value">Expected value ({type})</label><input id="rule-value" className="form-control mb-3" type={type==='STRING'?'text':'number'} step={type==='DECIMAL'?'any':type==='INTEGER'?'1':undefined} required disabled={busy} value={form.expected_value} onChange={e=>setForm({...form,expected_value:e.target.value})}/><div className="form-check mb-2"><input id="rule-required" className="form-check-input" type="checkbox" checked={form.required} disabled={busy} onChange={e=>setForm({...form,required:e.target.checked})}/><label className="form-check-label" htmlFor="rule-required">Required</label></div><div className="form-check mb-3"><input id="rule-active" className="form-check-input" type="checkbox" checked={form.active} disabled={busy} onChange={e=>setForm({...form,active:e.target.checked})}/><label className="form-check-label" htmlFor="rule-active">Active</label></div>{error&&<div role="alert" className="alert alert-danger">{error}</div>}<button className="btn btn-primary" disabled={busy||deletingId!==null}>{busy?'Saving…':editing?'Save changes':'Create rule'}</button>{editing&&<button type="button" className="btn btn-outline-secondary ms-2" onClick={reset} disabled={busy}>Cancel</button>}</form></div></div></div><div className="col-xl-7"><LoadState loading={loading} error={error} onRetry={()=>load(opportunityId)} empty={!items.length&&'No rules configured for this opportunity.'}><div className="card section-card"><div className="card-body table-responsive"><table className={tableClass("align-middle")}><thead><tr><th>Requirement</th><th>Required</th><th>Active</th><th>Actions</th></tr></thead><tbody>{items.map(r=><tr key={r.id}><td><code>{r.field_key} {r.operator} {r.expected_value}</code><div className="small text-muted">{r.value_type}</div></td><td>{r.required?'Yes':'No'}</td><td>{r.active?'Yes':'No'}</td><td className="text-nowrap"><button className="btn btn-sm btn-outline-primary me-2" disabled={busy||deletingId!==null} onClick={()=>{setEditing(r.id);setError('');setFeedback('');setForm({field_key:r.field_key,operator:r.operator,value_type:r.value_type,expected_value:r.expected_value,required:r.required,active:r.active})}}>Edit</button><button className="btn btn-sm btn-outline-danger" disabled={busy||deletingId!==null} onClick={()=>remove(r)}>{deletingId===r.id?'Deleting…':'Delete'}</button></td></tr>)}</tbody></table></div></div></LoadState></div></div>}</>
}

export function Users() {
  const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState('')
  const load=useCallback(async()=>{setLoading(true);setError('');try{const {data}=await api.get('/admin/users');setItems(Array.isArray(data)?data:[])}catch(e){setError(message(e))}finally{setLoading(false)}},[])
  useEffect(()=>{
    let active=true
    api.get('/admin/users').then(({data})=>{if(active)setItems(Array.isArray(data)?data:[])}).catch(e=>{if(active)setError(message(e))}).finally(()=>{if(active)setLoading(false)})
    return ()=>{active=false}
  },[])
  const filtered=useMemo(()=>items.filter(x=>`${x.name||''} ${x.email||''}`.toLowerCase().includes(query.toLowerCase())),[items,query])
  return <><PageHeader title="Users" subtitle="Review registered accounts and their roles."/><div className="admin-user-search mb-3"><label className="visually-hidden" htmlFor="admin-user-search">Search users by name or email</label><div className="input-group"><span className="input-group-text"><i className="bi bi-search" aria-hidden="true"/></span><input id="admin-user-search" className="form-control" placeholder="Search by name or email" value={query} onChange={e=>setQuery(e.target.value)}/></div></div><LoadState loading={loading} error={error} empty={items.length&&!filtered.length?'No users match your search.':!items.length?'No users found.':null}><div className="card section-card"><div className="card-body table-responsive"><table className={tableClass()}><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead><tbody>{filtered.map(u=><tr key={u.id}><td>{u.name||'—'}</td><td>{u.email||'—'}</td><td><span className="badge text-bg-secondary">{u.role||'—'}</span></td><td>{u.createdAt?new Date(u.createdAt).toLocaleDateString():'—'}</td></tr>)}</tbody></table></div></div></LoadState>{error&&<button className="btn btn-outline-primary mt-3" onClick={load}>Retry</button>}</>
}

export function AdminDocuments() { return <><PageHeader title="Documents" subtitle="Admin document catalogue management."/><EmptyState icon="cloud-slash" title="Admin document API is not available">The current backend exposes only the authenticated userâ€™s document checklist at <code>/api/documents</code>. No admin catalogue endpoint is present, so this page does not modify user documents.</EmptyState></> }

export function Analytics() {
  const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('')
  const load=useCallback(async()=>{setLoading(true);setError('');try{const {data:d}=await api.get('/admin/analytics');setData(d)}catch(e){setError(message(e))}finally{setLoading(false)}},[])
  useEffect(()=>{
    let active=true
    api.get('/admin/analytics').then(({data:d})=>{if(active)setData(d)}).catch(e=>{if(active)setError(message(e))}).finally(()=>{if(active)setLoading(false)})
    return ()=>{active=false}
  },[])
  const metrics = [
    ['Registered users', 'totalUsers', 'people'],
    ['Total opportunities', 'totalOpportunities', 'compass'],
    ['Saved opportunities', 'totalSavedOpportunities', 'bookmark-heart'],
    ['Eligibility checks', 'totalEligibilityChecks', 'shield-check'],
  ]
  const registrations = data?.userRegistrationsByDate && typeof data.userRegistrationsByDate === 'object' && !Array.isArray(data.userRegistrationsByDate)
    ? Object.entries(data.userRegistrationsByDate).filter(([date, value]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(new Date(`${date}T00:00:00`).getTime()) && Number.isFinite(Number(value)) && Number(value) >= 0).sort(([a], [b]) => a.localeCompare(b)) : []
  const statuses = data?.eligibilityChecksByFinalStatus && typeof data.eligibilityChecksByFinalStatus === 'object' && !Array.isArray(data.eligibilityChecksByFinalStatus)
    ? Object.entries(data.eligibilityChecksByFinalStatus).filter(([, value]) => Number.isFinite(Number(value)) && Number(value) >= 0) : []
  const savedOpportunities = Array.isArray(data?.savedOpportunitiesByOpportunity)
    ? [...data.savedOpportunitiesByOpportunity].filter(item => item && Number.isFinite(Number(item.savedCount)) && Number(item.savedCount) >= 0).sort((a, b) => Number(b.savedCount) - Number(a.savedCount)) : []
  const maxSaved = Math.max(1, ...savedOpportunities.map(item => Number(item.savedCount)))
  return <><PageHeader title="Analytics" subtitle="Live totals and activity summaries returned by LifePath."/>
    {loading ? <div className="skeleton skeleton-table" aria-label="Loading analytics"/> : error ? <><div className="alert alert-danger" role="alert">{error}</div><button className="btn btn-outline-primary" onClick={load}>Retry</button></> : !data ? <EmptyState icon="database" title="Analytics are unavailable">The analytics service did not return a response.</EmptyState> : <>
      <div className="row g-3 mb-4">{metrics.map(([label, key, icon]) => { const value = data[key]; const available = typeof value === 'number' && Number.isFinite(value); return <div className="col-sm-6 col-xl-3" key={key}><div className="card analytics-metric"><span className="analytics-metric-icon"><i className={`bi bi-${icon}`} aria-hidden="true"/></span><span className="analytics-metric-label">{label}</span><strong>{available ? value.toLocaleString() : 'Unavailable'}</strong><small>{available ? 'Current count from the analytics API' : 'This metric was not returned by the API'}</small></div></div> })}</div>
      <div className="row g-4"><div className="col-xl-7"><section className="card section-card analytics-chart-card h-100"><div className="card-body"><div className="section-title"><div><h2>User registrations over time</h2><p>Daily registrations returned by the analytics API.</p></div><span className="analytics-chart-icon"><i className="bi bi-people"/></span></div>{registrations.length ? <RegistrationChart entries={registrations}/> : <div className="analytics-chart-empty"><i className="bi bi-graph-up"/><strong>No registration history returned</strong><span>This chart appears when the API provides dated registration counts.</span></div>}</div></section></div>
        <div className="col-xl-5"><section className="card section-card analytics-chart-card h-100"><div className="card-body"><div className="section-title"><div><h2>Eligibility check results</h2><p>Checks grouped by their final status.</p></div><span className="analytics-chart-icon violet"><i className="bi bi-shield-check"/></span></div>{statuses.length ? <div className="analytics-status-chart">{statuses.map(([status, count]) => { const total = Math.max(1, ...statuses.map(([, value]) => Number(value))); const tone = status === 'ELIGIBLE' ? 'eligible' : status === 'NOT_CURRENTLY_ELIGIBLE' ? 'ineligible' : status === 'MISSING_INFORMATION' ? 'missing' : 'other'; return <div className="analytics-status-row" key={status}><div className="analytics-status-label"><span>{status.replaceAll('_', ' ')}</span><strong>{Number(count).toLocaleString()}</strong></div><div className="analytics-bar-track"><span className={`analytics-bar analytics-${tone}`} style={{ width: `${Number(count) / total * 100}%` }}/></div></div> })}</div> : <div className="analytics-chart-empty"><i className="bi bi-shield"/><strong>No eligibility check totals returned</strong><span>The API did not return grouped final statuses.</span></div>}</div></section></div>
        <div className="col-12"><section className="card section-card analytics-chart-card"><div className="card-body"><div className="section-title"><div><h2>Most-saved opportunities</h2><p>Saved opportunity counts returned by the analytics API.</p></div><span className="analytics-chart-icon violet"><i className="bi bi-bookmark-heart"/></span></div>{savedOpportunities.length ? <div className="analytics-saved-list">{savedOpportunities.slice(0, 8).map(item => <div className="analytics-saved-row" key={item.opportunityId}><span title={item.opportunityTitle}>{item.opportunityTitle || `Opportunity ${item.opportunityId}`}</span><div className="analytics-bar-track"><span className="analytics-bar analytics-saved" style={{ width: `${Number(item.savedCount) / maxSaved * 100}%` }}/></div><strong>{Number(item.savedCount).toLocaleString()}</strong></div>)}</div> : <div className="analytics-chart-empty"><i className="bi bi-bookmark"/><strong>No saved-opportunity grouping returned</strong><span>There are no grouped saved counts available to chart.</span></div>}</div></section></div>
      </div>
    </>}
  </>
}

function RegistrationChart({ entries }) {
  const width = 760, height = 250, padX = 28, padY = 24
  const values = entries.map(([, value]) => Number(value))
  const max = Math.max(1, ...values)
  const axisMax = Math.max(0, ...values)
  const points = values.map((value, index) => ({ x: entries.length === 1 ? width / 2 : padX + index * (width - padX * 2) / (entries.length - 1), y: height - padY - value / max * (height - padY * 2), value, date: entries[index][0] }))
  const line = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
  const area = `${line} L ${points.at(-1).x} ${height - padY} L ${points[0].x} ${height - padY} Z`
  const labels = [...new Set([0, Math.floor((entries.length - 1) / 2), entries.length - 1])].map(index => entries[index][0])
  const dateLabel = value => { const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(date) }
  return <div className="analytics-line-chart"><div className="analytics-chart-plot"><div className="analytics-y-axis" aria-hidden="true"><span>{axisMax.toLocaleString()}</span><span>0</span></div><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Daily registrations over time, from 0 to ${axisMax} users per day`}><title>Daily user registrations</title><path d={area} className="analytics-line-area"/><path d={line} className="analytics-line-path"/>{points.map(point => <circle key={point.date} cx={point.x} cy={point.y} r="4" className="analytics-line-point"><title>{point.date}: {point.value} registrations</title></circle>)}</svg></div><div className="analytics-axis-labels">{labels.map(date => <span key={date}>{dateLabel(date)}</span>)}</div><p className="analytics-chart-legend"><i/>Registrations per day</p></div>
}

export function AdminSettings() {
 const [prefs,setPrefs]=useState(()=>{try{return JSON.parse(localStorage.getItem('lifepath_admin_preferences')||'{"compactTables":false,"confirmDeletes":true}') }catch{return {compactTables:false,confirmDeletes:true}}}),[saved,setSaved]=useState(false)
 const update=(key,value)=>{const next={...prefs,[key]:value};setPrefs(next);localStorage.setItem('lifepath_admin_preferences',JSON.stringify(next));setSaved(true)}
 return <><PageHeader title="Admin settings" subtitle="Local interface preferences for this browser."/><div className="card section-card"><div className="card-body"><p>These preferences are stored in this browser only. They are not saved to the LifePath server.</p><div className="form-check mb-3"><input id="confirm-deletes" className="form-check-input" type="checkbox" checked={prefs.confirmDeletes} onChange={e=>update('confirmDeletes',e.target.checked)}/><label className="form-check-label" htmlFor="confirm-deletes">Confirm before destructive actions</label></div><div className="form-check"><input id="compact-tables" className="form-check-input" type="checkbox" checked={prefs.compactTables} onChange={e=>update('compactTables',e.target.checked)}/><label className="form-check-label" htmlFor="compact-tables">Use compact admin tables</label></div>{saved&&<div role="status" className="small text-success mt-3">Preference saved in this browser.</div>}</div></div></>
}


