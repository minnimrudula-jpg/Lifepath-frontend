import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import OpportunityCard from '../../components/OpportunityCard'
import EmptyState from '../../components/EmptyState'

const profileFields = ['dateOfBirth', 'gender', 'category', 'annualIncome', 'education', 'branch', 'experienceYears', 'phone', 'address', 'city', 'state']
export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState({ profile: null, opportunities: [], saved: [], deadlines: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadFailed, setLoadFailed] = useState(false)
  useEffect(() => {
    Promise.all([api.get('/profile'), api.get('/opportunities'), api.get('/saved-opportunities'), api.get('/deadlines')])
      .then(([profile, opportunities, saved, deadlines]) => setData({ profile: profile.data, opportunities: opportunities.data, saved: saved.data, deadlines: deadlines.data }))
      .catch(() => { setLoadFailed(true); setError('Dashboard data could not be loaded. Please try again.') })
      .finally(() => setLoading(false))
  }, [])
  const savedIds = useMemo(() => new Set(data.saved.map(item => item.id)), [data.saved])
  const completed = profileFields.filter(field => data.profile?.[field] !== null && data.profile?.[field] !== undefined && data.profile?.[field] !== '').length
  const percent = Math.round(completed / profileFields.length * 100)
  const stats = [
    ['Profile completion', loading ? '—' : `${percent}%`, 'person-check', 'Based on your profile details'],
    ['Available opportunities', loading ? '—' : data.opportunities.length, 'compass', 'From the opportunity catalogue'],
    ['Saved opportunities', loading ? '—' : data.saved.length, 'bookmark', 'Saved to your account'],
    ['Upcoming deadlines', loading ? '—' : data.deadlines.length, 'calendar-event', 'Recorded in LifePath'],
  ]
  const toggleSave = async opportunity => {
    const isSaved = savedIds.has(opportunity.id)
    try {
      if (isSaved) { await api.delete(`/saved-opportunities/${opportunity.id}`); setData(current => ({ ...current, saved: current.saved.filter(item => item.id !== opportunity.id) })) }
      else { await api.post(`/saved-opportunities/${opportunity.id}`); setData(current => ({ ...current, saved: [...current.saved, opportunity] })) }
    } catch { setError('Your saved opportunities could not be updated. Please try again.') }
  }
  if (loadFailed) return <><PageHeader title={user?.name ? `Welcome back, ${user.name}` : 'Your LifePath'} subtitle="Your profile and opportunities, together in one place."/><div className="alert alert-danger" role="alert">{error}</div><EmptyState icon="cloud-slash" title="Your overview is unavailable">Please try again when the LifePath services are reachable.</EmptyState></>
  return <>
    <PageHeader title={user?.name ? `Welcome back, ${user.name}` : 'Your LifePath'} subtitle="Your profile and opportunities, together in one place." />
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <div className="row g-3 mb-4">{stats.map(([label, value, icon, detail], index) => <div className="col-sm-6 col-xl-3" key={label}><StatCard {...{ label, value, icon, detail, loading, delay: index }} /></div>)}</div>
    <div className="row g-4"><div className="col-lg-8"><section className="card section-card h-100"><div className="card-body"><div className="section-title"><div><h2>Opportunities to explore</h2><p>Current listings from LifePath</p></div><Link to="/user/opportunities" className="btn btn-outline-primary btn-sm">Browse all</Link></div>
      {loading ? <div className="row g-3" aria-label="Loading opportunities"><div className="col-md-6"><div className="skeleton skeleton-card"/></div><div className="col-md-6"><div className="skeleton skeleton-card"/></div></div> : data.opportunities.length === 0 ? <EmptyState icon="compass" title="No opportunities available">New opportunities will appear here when they are added.</EmptyState> : <div className="row g-3">{data.opportunities.slice(0, 3).map(item => <div className="col-md-6" key={item.id}><OpportunityCard opportunity={item} saved={savedIds.has(item.id)} onToggleSave={toggleSave}/></div>)}</div>}
    </div></section></div>
    <div className="col-lg-4"><section className="card section-card h-100"><div className="card-body"><div className="section-title"><div><h2>Your next step</h2><p>A small step makes it easier to get started</p></div></div>
      {loading ? <div className="skeleton skeleton-line"/> : <><div className="profile-progress"><div className="d-flex justify-content-between small mb-2"><span>Profile completion</span><strong>{percent}%</strong></div><div className="progress" role="progressbar" aria-label="Profile completion" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100"><div className="progress-bar" style={{ width: `${percent}%` }}/></div></div><p className="next-step-copy">{percent < 100 ? 'Add the details you are comfortable sharing so eligibility services can use your profile.' : 'Your profile details are complete. Explore opportunities that interest you.'}</p><Link className="btn btn-primary w-100" to={percent < 100 ? '/user/profile' : '/user/opportunities'}>{percent < 100 ? 'Continue your profile' : 'Explore opportunities'} <i className="bi bi-arrow-right ms-2"/></Link></>}
    </div></section></div></div>
    <section className="card section-card mt-4"><div className="card-body"><div className="section-title"><div><h2>Upcoming deadlines</h2><p>Dates recorded for opportunities</p></div><Link to="/user/deadlines" className="btn btn-link">View all</Link></div>
      {loading ? <div className="skeleton skeleton-table"/> : data.deadlines.length === 0 ? <EmptyState icon="calendar2-check" title="No upcoming deadlines">There are no future deadlines recorded for your opportunities.</EmptyState> : <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Opportunity</th><th>Deadline</th></tr></thead><tbody>{data.deadlines.slice(0, 4).map(item => <tr key={item.id}><td className="fw-semibold">{item.opportunityTitle}</td><td>{item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Date not specified'}</td></tr>)}</tbody></table></div>}
    </div></section>
  </>
}
