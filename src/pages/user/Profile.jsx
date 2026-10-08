import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

const sections = [
  { title: 'Personal information', note: 'Your personal details help the eligibility service understand your profile.', fields: [['dateOfBirth', 'Date of birth', 'date'], ['gender', 'Gender', 'text'], ['phone', 'Phone', 'tel']] },
  { title: 'Education', note: 'Add your latest education details.', fields: [['education', 'Highest education', 'text'], ['branch', 'Branch or discipline', 'text']] },
  { title: 'Eligibility information', note: 'These values are used by backend eligibility checks.', fields: [['category', 'Category', 'text'], ['annualIncome', 'Annual income', 'number'], ['experienceYears', 'Experience in years', 'number']] },
  { title: 'Location', note: 'Location details can help you keep relevant opportunities together.', fields: [['address', 'Address', 'text'], ['city', 'City', 'text'], ['state', 'State', 'text']] },
]
const profileFields = sections.flatMap(section => section.fields.map(([name]) => name))
export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [message, setMessage] = useState(''), [error, setError] = useState('')
  useEffect(() => { api.get('/profile').then(({ data }) => setProfile(data)).catch(() => setError('Your profile could not be loaded. Please try again.')).finally(() => setLoading(false)) }, [])
  const completed = useMemo(() => profileFields.filter(field => profile?.[field] !== null && profile?.[field] !== undefined && profile?.[field] !== '').length, [profile])
  const percent = Math.round(completed / profileFields.length * 100)
  const change = event => setProfile(current => ({ ...current, [event.target.name]: event.target.value }))
  const save = async event => {
    event.preventDefault(); setBusy(true); setMessage(''); setError('')
    try { const { data } = await api.put('/profile', { ...profile, annualIncome: profile.annualIncome === '' ? null : profile.annualIncome, experienceYears: profile.experienceYears === '' ? null : profile.experienceYears }); setProfile(data); setMessage('Your profile has been saved.') }
    catch (err) { setError(err.response?.data?.error || 'Your profile could not be saved. Please try again.') }
    finally { setBusy(false) }
  }
  return <><PageHeader title="Your profile" subtitle="Build a profile that helps LifePath services understand what fits your path."/>{error && <div className="alert alert-danger" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}
    {loading ? <div className="skeleton skeleton-detail" aria-label="Loading profile"/> : !profile ? <EmptyState icon="person-vcard" title="Profile unavailable">Your profile could not be displayed right now.</EmptyState> : <>
      <section className="card profile-summary mb-4"><div className="card-body"><div className="profile-identity"><span className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || <i className="bi bi-person"/>}</span><div><h2>{user?.name || 'Your account'}</h2><p>{user?.email || ''}</p></div></div><div className="profile-completion"><div className="d-flex justify-content-between align-items-center mb-2"><span>Profile completion</span><strong>{percent}%</strong></div><div className="progress" role="progressbar" aria-label="Profile completion" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100"><div className="progress-bar" style={{ width: `${percent}%` }}/></div><small>{completed} of {profileFields.length} profile details completed</small></div></div></section>
      <form onSubmit={save}><div className="row g-4">{sections.map((section, sectionIndex) => <div className="col-lg-6" key={section.title}><section className="card section-card h-100" style={{ '--stagger': `${sectionIndex * 55}ms` }}><div className="card-body"><h2 className="h5">{section.title}</h2><p className="profile-section-note">{section.note}</p><div className="row g-3">{section.fields.map(([name, label, type]) => <div className="col-12" key={name}><label className="form-label" htmlFor={name}>{label}</label><input className="form-control" id={name} name={name} type={type} min={type === 'number' ? '0' : undefined} value={profile[name] ?? ''} onChange={change}/></div>)}</div></div></section></div>)}</div><div className="d-flex justify-content-end mt-4"><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile'} <i className="bi bi-arrow-right ms-2"/></button></div></form>
    </>}
  </>
}
