import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/useAuth'
import StatCard from '../../components/StatCard'
import EmptyState from '../../components/EmptyState'

const profileFields = ['dateOfBirth', 'gender', 'category', 'annualIncome', 'education', 'branch', 'experienceYears', 'phone', 'address', 'city', 'state']
const featureCards = [
  { title: 'Discover opportunities', description: 'Find jobs, exams and scholarships that match your profile.', to: '/user/opportunities', image: 'discover', action: 'Explore opportunities' },
  { title: 'Check my eligibility', description: 'See whether you meet an opportunityâ€™s requirements.', to: '/user/eligibility', image: 'eligibility', action: 'Check eligibility' },
  { title: 'My saved opportunities', description: 'Keep the opportunities you like together in one place.', to: '/user/saved', image: 'saved', action: 'View saved' },
  { title: 'Track deadlines', description: 'Know which application dates are coming soon.', to: '/user/deadlines', image: 'deadlines', action: 'View deadlines' },
  { title: 'My documents', description: 'Keep track of the documents you need for applications.', to: '/user/documents', image: 'documents', action: 'View documents' },
  { title: 'Preparation planner', description: 'Plan your next steps and track your progress.', to: '/user/preparation', image: 'preparation', action: 'Open planner' },
]

const asList = result => result.status === 'fulfilled' && Array.isArray(result.value.data) ? result.value.data : null

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({ profile: null, opportunities: null, saved: null, deadlines: null, notifications: null })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [requestErrors, setRequestErrors] = useState({})

  useEffect(() => {
    Promise.allSettled([api.get('/profile'), api.get('/opportunities'), api.get('/saved-opportunities'), api.get('/deadlines'), api.get('/notifications')])
      .then(([profile, opportunities, saved, deadlines, notifications]) => {
        const next = { profile: null, opportunities: asList(opportunities), saved: asList(saved), deadlines: asList(deadlines), notifications: asList(notifications) }
        const errors = {}
        if (profile.status === 'fulfilled') next.profile = profile.value.data
        else errors.profile = 'Profile information could not be loaded.'
        if (opportunities.status === 'rejected') errors.opportunities = 'Opportunity totals are unavailable right now.'
        if (saved.status === 'rejected') errors.saved = 'Saved opportunity totals are unavailable right now.'
        if (deadlines.status === 'rejected') errors.deadlines = 'Deadlines could not be loaded.'
        if (notifications.status === 'rejected') errors.notifications = 'Recent updates could not be loaded.'
        setData(next)
        setRequestErrors(errors)
      })
      .finally(() => setLoading(false))
  }, [])

  const upcomingDeadlines = useMemo(() => (data.deadlines || []).filter(item => item.status !== 'PASSED' && item.status !== 'UNSCHEDULED' && item.deadline), [data.deadlines])
  const completedFields = profileFields.filter(field => data.profile?.[field] !== null && data.profile?.[field] !== undefined && data.profile?.[field] !== '').length
  const profilePercent = data.profile ? Math.round(completedFields / profileFields.length * 100) : null
  const stats = [
    ['Profile completion', profilePercent === null ? (loading ? 'â€”' : 'Unavailable') : `${profilePercent}%`, 'person-check', 'Based on your profile details'],
    ['Available opportunities', data.opportunities === null ? (loading ? 'â€”' : 'Unavailable') : data.opportunities.length, 'compass', 'From the opportunity catalogue'],
    ['Saved opportunities', data.saved === null ? (loading ? 'â€”' : 'Unavailable') : data.saved.length, 'bookmark', 'Saved to your account'],
    ['Upcoming deadlines', data.deadlines === null ? (loading ? 'â€”' : 'Unavailable') : upcomingDeadlines.length, 'calendar-event', 'Recorded in LifePath'],
  ]
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'
  const submitSearch = event => {
    event.preventDefault()
    const value = search.trim()
    navigate(`/user/opportunities${value ? `?search=${encodeURIComponent(value)}` : ''}`)
  }

  return <>
    <section className="dashboard-welcome" aria-labelledby="dashboard-welcome-title">
      <div className="dashboard-welcome-copy"><span className="dashboard-welcome-kicker"><i className="bi bi-compass me-2"/>YOUR NEXT STEP STARTS HERE</span><h1 id="dashboard-welcome-title">{user?.name ? `${greeting}, ${user.name}` : 'Welcome to LifePath'}</h1><p>Discover opportunities, check your eligibility and keep track of what to do next.</p>
        <form className="dashboard-search" role="search" onSubmit={submitSearch}><label className="visually-hidden" htmlFor="dashboard-opportunity-search">Search opportunities</label><i className="bi bi-search" aria-hidden="true"/><input id="dashboard-opportunity-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search scholarships, jobs or exams"/><button type="submit" className="btn btn-primary">Search</button></form>
      </div><img src="/illustrations/discover.svg" alt="" aria-hidden="true"/>
    </section>

    <section className="dashboard-overview" aria-label="Your LifePath overview"><div className="row g-3">{stats.map(([label, value, icon, detail], index) => <div className="col-sm-6 col-xl-3" key={label}><StatCard label={label} value={value} icon={icon} detail={requestErrors[label === 'Profile completion' ? 'profile' : label === 'Available opportunities' ? 'opportunities' : label === 'Saved opportunities' ? 'saved' : 'deadlines'] || detail} loading={loading} delay={index}/></div>)}</div></section>

    <section className="dashboard-feature-section" aria-labelledby="dashboard-features-title"><div className="section-title"><div><h2 id="dashboard-features-title">What would you like to do?</h2><p>Choose a feature to continue.</p></div></div><div className="dashboard-feature-grid">{featureCards.map(card => <Link className="dashboard-feature-card" key={card.to} to={card.to}>
      <div className="dashboard-feature-art"><img src={`/illustrations/${card.image}.svg`} alt="" aria-hidden="true"/></div><div className="dashboard-feature-copy"><h3>{card.title}</h3><p>{card.description}</p><span>{card.action}<i className="bi bi-arrow-right" aria-hidden="true"/></span></div>
    </Link>)}</div></section>

    <div className="dashboard-summary-grid">
      <section className="card section-card dashboard-summary-card"><div className="card-body"><div className="section-title"><div><h2>Upcoming deadlines</h2><p>Your next application dates.</p></div><Link to="/user/deadlines" className="btn btn-outline-primary btn-sm">All deadlines <i className="bi bi-arrow-right ms-1"/></Link></div>
        {loading ? <div className="skeleton skeleton-table" aria-label="Loading deadlines"/> : data.deadlines === null ? <p className="dashboard-summary-error" role="status">{requestErrors.deadlines}</p> : upcomingDeadlines.length === 0 ? <EmptyState icon="calendar2-check" title="No upcoming deadlines">Dates from your opportunities will appear here.</EmptyState> : <div className="dashboard-deadline-list">{upcomingDeadlines.slice(0, 4).map(item => <article className="dashboard-deadline-row" key={item.id}><span className={`dashboard-deadline-icon ${item.status === 'DUE_SOON' ? 'is-due-soon' : ''}`}><i className="bi bi-calendar-event" aria-hidden="true"/></span><div><strong>{item.opportunityTitle || item.title}</strong><small>{item.title && item.opportunityTitle ? item.title : item.daysRemaining === 0 ? 'Due today' : item.daysRemaining > 0 ? `${item.daysRemaining} days left` : 'Upcoming date'}</small></div><time>{item.deadline ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(item.deadline)) : 'Date not specified'}</time></article>)}</div>}
      </div></section>
      <section className="card section-card dashboard-summary-card"><div className="card-body"><div className="section-title"><div><h2>Recent updates</h2><p>Latest notifications from LifePath.</p></div><Link to="/user/notifications" className="btn btn-outline-primary btn-sm">All updates <i className="bi bi-arrow-right ms-1"/></Link></div>
        {loading ? <div className="skeleton skeleton-table" aria-label="Loading updates"/> : data.notifications === null ? <p className="dashboard-summary-error" role="status">{requestErrors.notifications}</p> : data.notifications.length === 0 ? <EmptyState icon="bell" title="You are all caught up">New account updates will appear here.</EmptyState> : <div className="dashboard-update-list">{data.notifications.slice(0, 4).map(item => <article className={`dashboard-update-row ${item.read ? '' : 'is-unread'}`} key={item.id}><span className="dashboard-update-icon"><i className="bi bi-bell" aria-hidden="true"/></span><div><strong>{item.message}</strong>{item.createdAt && <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>}</div>{!item.read && <span className="dashboard-update-unread" aria-label="Unread"/>}</article>)}</div>}
      </div></section>
    </div>
    {requestErrors.opportunities && <p className="dashboard-data-note" role="status">{requestErrors.opportunities}</p>}
  </>
}
