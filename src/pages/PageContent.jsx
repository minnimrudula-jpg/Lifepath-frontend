import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true)
    const form = new FormData(event.currentTarget)
    try {
      const user = await login({ email: form.get('email'), password: form.get('password') })
      navigate(location.state?.from?.pathname || (user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'), { replace: true })
    } catch (err) { setError(err.response?.data?.error || 'Unable to sign in. Check your credentials and try again.') }
    finally { setBusy(false) }
  }
  return <AuthPage title="Welcome back" subtitle="Sign in to continue your LifePath journey."><form onSubmit={submit}><label className="form-label" htmlFor="login-email">Email address</label><input id="login-email" name="email" type="email" className="form-control mb-3" autoComplete="email" required/><label className="form-label" htmlFor="login-password">Password</label><input id="login-password" name="password" type="password" className="form-control mb-3" autoComplete="current-password" required/>{error && <div role="alert" className="alert alert-danger">{error}</div>}<button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Connecting…' : 'Sign in'}</button></form></AuthPage>
}

export function Register() {
  const { register } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event) => {
    event.preventDefault(); setMessage(''); setError(''); setBusy(true)
    const form = new FormData(event.currentTarget)
    try { await register({ name: form.get('name'), email: form.get('email'), password: form.get('password') }); setMessage('Registration complete. Sign in to continue.') }
    catch (err) { setError(err.response?.data?.error || 'Unable to register. Check the service connection and try again.') }
    finally { setBusy(false) }
  }
  return <AuthPage title="Create your account" subtitle="One place to discover opportunities that fit your path."><form onSubmit={submit}><label className="form-label" htmlFor="register-name">Full name</label><input id="register-name" name="name" className="form-control mb-3" autoComplete="name" required/><label className="form-label" htmlFor="register-email">Email address</label><input id="register-email" name="email" type="email" className="form-control mb-3" autoComplete="email" required/><label className="form-label" htmlFor="register-password">Password</label><input id="register-password" name="password" type="password" className="form-control mb-3" autoComplete="new-password" minLength="8" required/>{error && <div role="alert" className="alert alert-danger">{error}</div>}{message && <div role="status" className="alert alert-success">{message} <Link to="/login">Sign in</Link></div>}<button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button></form></AuthPage>
}

function AuthPage({ title, subtitle, children }) { return <main className="auth-page"><Link className="auth-brand" to="/"><span className="brand-mark"><i className="bi bi-signpost-split-fill"/></span><strong>LifePath</strong></Link><section className="auth-card"><span className="eyebrow">YOUR NEXT CHAPTER</span><h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>{children}<div className="auth-switch">{title.startsWith('Welcome') ? <>New to LifePath? <Link to="/register">Create an account</Link></> : <>Already have an account? <Link to="/login">Sign in</Link></>}</div></section><small className="auth-caption">Personalized Eligibility and Opportunity Discovery Platform</small></main> }

export function Landing() { return <div className="landing"><nav className="landing-nav"><Link to="/" className="brand"><span className="brand-mark"><i className="bi bi-signpost-split-fill"/></span><span>LifePath</span></Link><div className="d-flex align-items-center gap-2"><Link className="btn btn-link text-decoration-none" to="/login">Sign in</Link><Link className="btn btn-primary" to="/register">Get started <i className="bi bi-arrow-up-right ms-1"/></Link></div></nav><main className="landing-hero"><span className="hero-kicker"><i className="bi bi-compass me-2"/>A clearer way forward</span><h1>Find the path that<br/><span>fits who you are.</span></h1><p>Explore opportunities, understand eligibility, and keep your next steps together in one thoughtful space.</p><div className="d-flex flex-wrap gap-3"><Link to="/register" className="btn btn-primary btn-lg">Create your account <i className="bi bi-arrow-right ms-2"/></Link><Link to="/login" className="btn btn-outline-secondary btn-lg">Sign in</Link></div><div className="hero-foot"><span className="hero-line"/><span>Discover thoughtfully. Move forward confidently.</span></div></main><div className="landing-aside" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit-center"><i className="bi bi-signpost-split"/></div><span className="orbit-point point-one"/><span className="orbit-point point-two"/><span className="orbit-point point-three"/></div></div> }

export function AdminDashboard() {
  const [data, setData] = useState(null), [error, setError] = useState('')
  useEffect(() => { Promise.all([api.get('/opportunities'), api.get('/deadlines')]).then(([opportunities, deadlines]) => setData({ opportunities: opportunities.data, deadlines: deadlines.data })).catch(() => setError('Platform activity could not be loaded.')) }, [])
  return <><PageHeader title="Control center" subtitle="A clear view of activity available from connected services."/>{error && <div role="alert" className="alert alert-danger">{error}</div>}{!data ? error ? <EmptyState icon="cloud-slash" title="Platform activity is unavailable">The connected services could not be reached.</EmptyState> : <div className="skeleton skeleton-detail" aria-label="Loading dashboard"/> : <><div className="row g-3 mb-4"><div className="col-md-6 col-xl-4"><div className="card admin-metric"><span>Opportunities in catalogue</span><strong>{data.opportunities.length}</strong><small>Current records from the opportunity service</small></div></div><div className="col-md-6 col-xl-4"><div className="card admin-metric"><span>Deadlines recorded</span><strong>{data.deadlines.length}</strong><small>Current records from the deadline service</small></div></div><div className="col-md-6 col-xl-4"><div className="card admin-metric unavailable-metric"><span>User overview</span><strong>Unavailable</strong><small>No user analytics endpoint is connected</small></div></div></div><div className="row g-4"><div className="col-xl-7"><div className="card section-card"><div className="card-body"><div className="section-title"><div><h2>Opportunity overview</h2><p>Catalogue entries available to the frontend</p></div></div>{data.opportunities.length ? <div className="table-responsive"><table className="table"><thead><tr><th>Opportunity</th><th>Provider</th><th>Category</th></tr></thead><tbody>{data.opportunities.slice(0, 6).map(item => <tr key={item.id}><td>{item.title}</td><td>{item.provider || '—'}</td><td>{item.category || '—'}</td></tr>)}</tbody></table></div> : <EmptyState title="No opportunities in the catalogue"/>}</div></div></div><div className="col-xl-5"><div className="card section-card"><div className="card-body"><div className="section-title"><div><h2>Deadline overview</h2><p>Dates returned by the deadline service</p></div></div>{data.deadlines.length ? data.deadlines.slice(0, 5).map(item => <div className="admin-deadline" key={item.id}><span>{item.opportunityTitle}</span><strong>{item.deadline ? new Date(item.deadline).toLocaleDateString() : '—'}</strong></div>) : <EmptyState title="No deadlines recorded"/>}</div></div></div></div></>}</>
}
export function AdminPage({ type }) {
  const title = ({ users: 'Users', opportunities: 'Opportunities', categories: 'Categories', 'eligibility-rules': 'Eligibility rules', documents: 'Documents', deadlines: 'Deadlines', analytics: 'Analytics', settings: 'Admin settings' })[type] || 'Administration'
  const endpoint = type === 'opportunities' ? '/opportunities' : type === 'deadlines' ? '/deadlines' : null
  const [items, setItems] = useState(null), [error, setError] = useState('')
  useEffect(() => { if (endpoint) api.get(endpoint).then(({ data }) => setItems(Array.isArray(data) ? data : [])).catch(() => { setError(`${title} could not be loaded.`); setItems([]) }) }, [endpoint, title])
  return <><PageHeader title={title} subtitle="Manage LifePath using information from connected services."/>{endpoint ? error ? <EmptyState icon="cloud-slash" title={`${title} are unavailable`}>{error}</EmptyState> : items === null ? <div className="skeleton skeleton-table" aria-label={`Loading ${title.toLowerCase()}`}/> : items.length === 0 ? <EmptyState icon="database" title={`No ${title.toLowerCase()} found`}>Records will appear when they are available in the service.</EmptyState> : <div className="card section-card"><div className="card-body"><div className="table-responsive"><table className="table"><thead><tr>{(type === 'opportunities' ? ['Opportunity', 'Provider', 'Category', 'Status'] : ['Opportunity', 'Deadline', 'Date']).map(col => <th key={col}>{col}</th>)}</tr></thead><tbody>{items.map(item => <tr key={item.id}><td>{type === 'opportunities' ? item.title : item.opportunityTitle}</td>{type === 'opportunities' ? <><td>{item.provider || '—'}</td><td>{item.category || '—'}</td><td>{item.status || '—'}</td></> : <><td>{item.title || '—'}</td><td>{item.deadline ? new Date(item.deadline).toLocaleString() : '—'}</td></>}</tr>)}</tbody></table></div></div></div> : <EmptyState icon="database" title={`${title} management is unavailable`}>There is no confirmed backend API contract for this admin section in the current frontend.</EmptyState>}</>
}
export function NotFound() { return <main className="auth-page"><section className="auth-card text-center"><span className="display-3 fw-bold text-primary">404</span><h1>Page not found</h1><p className="auth-subtitle">The page you’re looking for doesn’t exist or has moved.</p><Link to="/" className="btn btn-primary mt-3">Return home</Link></section></main> }
