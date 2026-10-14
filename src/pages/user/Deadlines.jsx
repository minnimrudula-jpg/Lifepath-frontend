import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

function parseDeadline(value) {
  if (!value) return null
  // Date-only values are kept as local calendar dates to avoid UTC shifting the displayed day.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  const date = dateOnly ? new Date(`${value}T00:00:00`) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function daysFromToday(date) {
  if (!date) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

function deadlineInfo(item) {
  const date = parseDeadline(item.deadline)
  const remaining = Number.isFinite(Number(item.daysRemaining)) && item.daysRemaining !== null && item.daysRemaining !== ''
    ? Number(item.daysRemaining)
    : daysFromToday(date)
  const serverStatus = String(item.status || '').toUpperCase()
  const passed = ['PASSED', 'OVERDUE', 'CLOSED', 'EXPIRED'].some(status => serverStatus.includes(status)) || (serverStatus === '' && remaining !== null && remaining < 0)
  const dueSoon = serverStatus.includes('DUE_SOON')
  const statusLabel = item.status ? String(item.status).replaceAll('_', ' ') : passed ? 'PASSED' : 'UPCOMING'
  const dateLabel = date ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date) : 'Date not specified'
  const remainingLabel = remaining === null ? '' : remaining < 0 ? `${Math.abs(remaining)} ${Math.abs(remaining) === 1 ? 'day' : 'days'} ago` : `${remaining} ${remaining === 1 ? 'day' : 'days'} left`
  return { passed, dueSoon, statusLabel, dateLabel, remainingLabel }
}

export default function Deadlines() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    api.get('/deadlines')
      .then(({ data }) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError('Deadlines could not be loaded. Please try again.'))
  }, [])
  const groups = useMemo(() => {
    if (!items) return []
    const withInfo = items.map(item => ({ item, info: deadlineInfo(item) }))
    return [
      ['Due soon', withInfo.filter(({ info }) => info.dueSoon && !info.passed), 'exclamation-circle', 'due-soon'],
      ['Upcoming', withInfo.filter(({ info }) => !info.dueSoon && !info.passed), 'calendar-event', 'upcoming'],
      ['Passed', withInfo.filter(({ info }) => info.passed), 'calendar2-check', 'passed'],
    ]
  }, [items])

  return <><PageHeader title="Deadlines" subtitle="Keep application dates in view and plan your next step."/>
    {error ? <div role="alert" className="alert alert-danger">{error}</div> : items === null ? <div className="skeleton skeleton-table" aria-label="Loading deadlines"/> : items.length === 0 ? <EmptyState icon="calendar2-check" title="No deadlines recorded">Dates from your opportunities will appear here.</EmptyState> : <div className="deadline-groups">{groups.filter(([, rows]) => rows.length).map(([title, rows, icon, tone]) => <section className={`deadline-group deadline-group-${tone}`} key={title}>
      <div className="deadline-group-heading"><span><i className={`bi bi-${icon}`}/></span><h2>{title}<small>{rows.length} {rows.length === 1 ? 'date' : 'dates'}</small></h2></div>
      <div className="card section-card"><div className="card-body"><div className="deadline-list">{rows.map(({ item, info }) => <article className="deadline-row" key={item.id}>
        <span className="deadline-marker"><i className="bi bi-calendar-event" aria-hidden="true"/></span>
        <div className="deadline-info"><strong>{item.opportunityTitle || 'Opportunity'}</strong>{item.title && <span>{item.title}</span>}<span className={`badge deadline-status-${info.passed ? 'passed' : info.dueSoon ? 'soon' : 'upcoming'}`}>{info.statusLabel}{info.remainingLabel ? ` · ${info.remainingLabel}` : ''}</span></div>
        <time dateTime={item.deadline || undefined}>{info.dateLabel}</time>
      </article>)}</div></div></div>
    </section>)}</div>}
  </>
}
