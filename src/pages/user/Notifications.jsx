import { useEffect, useState } from 'react'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

const iconFor = type => {
  const value = (type || '').toLowerCase()
  if (value.includes('deadline')) return ['calendar-event', 'notification-deadline']
  if (value.includes('eligib')) return ['shield-check', 'notification-eligibility']
  if (value.includes('document')) return ['file-earmark-check', 'notification-document']
  if (value.includes('opportun')) return ['compass', 'notification-opportunity']
  return ['bell', 'notification-general']
}

export default function Notifications() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const load = () => api.get('/notifications').then(({ data }) => setItems(Array.isArray(data) ? data : [])).catch(() => setError('Notifications could not be loaded. Please try again.'))
  useEffect(() => { load() }, [])
  const markRead = async id => {
    if (busy) return
    setBusy(true); setError('')
    try { const { data } = await api.put(`/notifications/${id}/read`); setItems(current => current.map(item => item.id === id ? { ...item, ...(data && typeof data === 'object' ? data : {}), read: true } : item)) }
    catch (err) { setError(err.response?.data?.error || 'Notification could not be updated.') }
    finally { setBusy(false) }
  }
  const markAll = async () => {
    if (busy) return
    setBusy(true); setError(''); setMessage('')
    try { await api.put('/notifications/read-all'); setItems(current => current.map(item => ({ ...item, read: true }))); setMessage('All notifications marked as read.') }
    catch (err) { setError(err.response?.data?.error || 'Notifications could not be updated.') }
    finally { setBusy(false) }
  }
  const unread = items?.some(item => !item.read)
  const notificationContent = items?.map(item => {
    const [icon, tone] = iconFor(item.type)
    return <article className={`list-group-item notification-item ${item.read ? '' : 'notification-unread'}`} key={item.id}>
      <span className={`notification-type-icon ${tone}`}><i className={`bi bi-${icon}`} aria-hidden="true"/></span>
      <div className="notification-copy"><div className="notification-title-row"><strong>{item.title || item.type || 'LifePath update'}</strong>{!item.read && <span className="notification-unread-label"><span/>New</span>}</div><p>{item.message}</p>{item.createdAt && <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>}</div>
      {!item.read && <button className="btn btn-sm btn-outline-secondary notification-mark-read" disabled={busy} onClick={() => markRead(item.id)}>{busy ? 'Saving...' : 'Mark read'}</button>}
    </article>
  })
  return <><PageHeader title="Notifications" subtitle="Updates for your LifePath account." action={unread && <button className="btn btn-outline-primary" disabled={busy} onClick={markAll}>Mark all as read</button>}/>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}
    {items === null && !error ? <div className="skeleton skeleton-table" aria-label="Loading notifications"/> : items?.length ? <div className="card section-card"><div className="list-group list-group-flush notification-list">{notificationContent}</div></div> : error ? null : <EmptyState icon="bell" title="No notifications yet"><span className="notification-empty-illustration"><img src="/illustrations/notifications.svg" alt="" aria-hidden="true"/></span>Account updates will appear here.</EmptyState>}
  </>
}
