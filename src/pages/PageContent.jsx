import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
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
  return <AuthPage title="Welcome back" subtitle="Sign in to continue your LifePath journey."><form onSubmit={submit}><label className="form-label" htmlFor="login-email">Email address</label><input id="login-email" name="email" type="email" className="form-control mb-3" autoComplete="email" required /><label className="form-label" htmlFor="login-password">Password</label><input id="login-password" name="password" type="password" className="form-control mb-3" autoComplete="current-password" required />{error && <div role="alert" className="alert alert-danger">{error}</div>}<button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Connectingâ€¦' : 'Sign in'}</button></form></AuthPage>
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
  return <AuthPage title="Create your account" subtitle="One place to discover opportunities that fit your path."><form onSubmit={submit}><label className="form-label" htmlFor="register-name">Full name</label><input id="register-name" name="name" className="form-control mb-3" autoComplete="name" required /><label className="form-label" htmlFor="register-email">Email address</label><input id="register-email" name="email" type="email" className="form-control mb-3" autoComplete="email" required /><label className="form-label" htmlFor="register-password">Password</label><input id="register-password" name="password" type="password" className="form-control mb-3" autoComplete="new-password" minLength="8" required />{error && <div role="alert" className="alert alert-danger">{error}</div>}{message && <div role="status" className="alert alert-success">{message} <Link to="/login">Sign in</Link></div>}<button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Creating accountâ€¦' : 'Create account'}</button></form></AuthPage>
}

function AuthPage({ title, subtitle, children }) { return <main className="auth-page"><Link className="auth-brand" to="/"><span className="brand-mark"><i className="bi bi-signpost-split-fill" /></span><strong>LifePath</strong></Link><section className="auth-card"><span className="eyebrow">YOUR NEXT CHAPTER</span><h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>{children}<div className="auth-switch">{title.startsWith('Welcome') ? <>New to LifePath? <Link to="/register">Create an account</Link></> : <>Already have an account? <Link to="/login">Sign in</Link></>}</div></section><small className="auth-caption">Personalized Eligibility and Opportunity Discovery Platform</small></main> }

export function Landing() {
  const [preview, setPreview] = useState([])
  const [previewLoading, setPreviewLoading] = useState(true)
  const [previewError, setPreviewError] = useState(false)
  useEffect(() => {
    let active = true
    api.get('/opportunities').then(({ data }) => { if (active) setPreview(Array.isArray(data) ? data.slice(0, 3) : []) }).catch(() => { if (active) setPreviewError(true) }).finally(() => { if (active) setPreviewLoading(false) })
    return () => { active = false }
  }, [])
  return <div className="landing"><nav className="landing-nav"><Link to="/" className="brand"><span className="brand-mark"><i className="bi bi-signpost-split-fill" /></span><span>LifePath</span></Link><div className="d-flex align-items-center gap-2"><Link className="btn btn-link text-decoration-none" to="/login">Sign in</Link><Link className="btn btn-primary" to="/register">Get started <i className="bi bi-arrow-up-right ms-1" /></Link></div></nav><main><section className="landing-hero"><div className="hero-copy"><span className="hero-kicker"><i className="bi bi-compass me-2" />A clearer way forward</span><h1>Find opportunities<br />that <span>fit YOU.</span></h1><p>Explore opportunities, understand your eligibility, and keep every next step together in one thoughtful space.</p><div className="d-flex flex-wrap gap-3"><Link to="/register" className="btn btn-primary btn-lg">Find your next step <i className="bi bi-arrow-right ms-2" /></Link><Link to="/login" className="btn btn-outline-secondary btn-lg">Sign in</Link></div><div className="hero-foot"><span className="hero-line" /><span>Discover thoughtfully. Move forward confidently.</span></div></div><div className="landing-aside" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit-center"><i className="bi bi-signpost-split" /></div><span className="orbit-point point-one" /><span className="orbit-point point-two" /><span className="orbit-point point-three" /><div className="hero-float float-one"><i className="bi bi-check2-circle" /> Eligibility made clear</div><div className="hero-float float-two"><i className="bi bi-calendar-event" /> Your next deadline</div></div></section><section className="landing-section category-section"><div className="landing-section-inner"><div className="section-kicker">A world of possibilities</div><h2>One place for the opportunities<br />that move you forward.</h2><div className="landing-categories">{[['mortarboard', 'Scholarships'], ['briefcase', 'Careers'], ['bank', 'Government programs'], ['lightbulb', 'More to explore']].map(([icon, label]) => <div className="landing-category" key={label}><span><i className={`bi bi-${icon}`} /></span><strong>{label}</strong><i className="bi bi-arrow-up-right category-arrow" /></div>)}</div></div></section><section className="landing-section how-section"><div className="landing-section-inner"><div className="section-kicker">A simpler journey</div><h2>From searching to ready.</h2><div className="how-grid">{[['01', 'bi-search', 'Discover', 'Browse opportunities in one place and save the ones worth a closer look.'], ['02', 'bi-shield-check', 'Understand', 'See how your profile maps to each opportunityâ€™s eligibility criteria.'], ['03', 'bi-check2-square', 'Prepare', 'Track documents, dates, and tasks so your next step feels manageable.']].map(([n, icon, title, copy]) => <article className="how-card" key={n}><div className="how-card-top"><span>{n}</span><i className={`bi ${icon}`} /></div><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section><section className="eligibility-showcase"><div className="showcase-copy"><span className="section-kicker">Clarity, not guesswork</span><h2>Know where you stand.<br /><span>See what comes next.</span></h2><p>LifePath checks your profile against opportunity requirements and explains each result, so you can focus on the next useful action.</p><Link to="/register" className="btn btn-light">Explore your eligibility <i className="bi bi-arrow-right ms-2" /></Link></div><div className="showcase-visual" aria-hidden="true"><div className="showcase-ring"><i className="bi bi-shield-check" /></div><div className="showcase-check check-a"><i className="bi bi-check-circle-fill" /> Criteria review <b>Requirement by requirement</b></div><div className="showcase-check check-b"><i className="bi bi-check-circle-fill" /> Your profile <b>Compared by LifePath</b></div></div></section><section className="landing-section feature-section"><div className="landing-section-inner feature-grid"><div><div className="section-kicker">Built around your path</div><h2>Less scattered effort.<br />More confident progress.</h2></div><div className="feature-list"><div><i className="bi bi-bookmark-heart" /><span><strong>Your shortlist stays yours</strong><small>Keep interesting opportunities close.</small></span></div><div><i className="bi bi-bell" /><span><strong>Stay ahead of important dates</strong><small>See deadlines alongside your plans.</small></span></div><div><i className="bi bi-list-check" /><span><strong>Make preparation visible</strong><small>Turn requirements into clear next steps.</small></span></div></div></div></section><section className="landing-section preview-section"><div className="landing-section-inner"><div className="section-title"><div><div className="section-kicker">A first look</div><h2>Opportunities in LifePath</h2><p>Current listings provided by the opportunity service.</p></div><Link to="/register" className="btn btn-outline-primary">Explore all <i className="bi bi-arrow-right ms-1" /></Link></div>{previewLoading ? <div className="preview-empty" role="status"><span>Loading current opportunity listingsâ€¦</span></div> : previewError ? <div className="preview-empty" role="alert"><i className="bi bi-cloud-slash" /><span>Current opportunity listings could not be loaded.</span></div> : preview.length ? <div className="landing-preview-grid">{preview.map(item => <article className="landing-preview-card" key={item.id}><span><i className="bi bi-stars" />{item.category || 'Opportunity'}</span><h3>{item.title}</h3><p>{item.description || item.provider || 'Explore the details and eligibility requirements.'}</p>{item.deadline && <small><i className="bi bi-calendar3 me-1" />Deadline {new Date(item.deadline).toLocaleDateString()}</small>}<Link to="/register">View opportunity <i className="bi bi-arrow-up-right ms-1" /></Link></article>)}</div> : <div className="preview-empty"><i className="bi bi-compass" /><span>Opportunity listings will appear here when available.</span></div>}</div></section><section className="landing-cta"><div><span className="section-kicker">Your next chapter starts here</span><h2>Make room for the right opportunity.</h2><p>Build your profile and start exploring with LifePath.</p><Link to="/register" className="btn btn-primary btn-lg">Create your account <i className="bi bi-arrow-right ms-2" /></Link></div></section></main><footer className="landing-footer"><Link to="/" className="brand"><span className="brand-mark"><i className="bi bi-signpost-split-fill" /></span><span>LifePath</span></Link><span>Personalized opportunity discovery</span><div><Link to="/login">Sign in</Link><Link to="/register">Get started</Link></div></footer></div>
}

export function AdminDashboard() {
  const [data, setData] = useState({ opportunities: null, deadlines: null, users: null }), [errors, setErrors] = useState({}), [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    Promise.allSettled([api.get('/opportunities'), api.get('/deadlines'), api.get('/admin/analytics')]).then(results => {
      if (!active) return
      const keys = ['opportunities', 'deadlines', 'users']
      const next = {}, nextErrors = {}
      results.forEach((result, index) => {
        const key = keys[index]
        if (result.status === 'fulfilled') {
          if (key === 'users') {
            const total = result.value.data?.totalUsers
            next[key] = typeof total === 'number' && Number.isFinite(total) ? total : null
            if (next[key] === null) nextErrors[key] = 'The analytics API did not return a registered-user total.'
          } else next[key] = Array.isArray(result.value.data) ? result.value.data : []
        }
        else { next[key] = null; nextErrors[key] = `${key === 'users' ? 'Users' : key === 'deadlines' ? 'Deadlines' : 'Opportunities'} could not be loaded.` }
      })
      setData(next); setErrors(nextErrors)
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const metric = (label, key, description) => <div className="col-md-6 col-xl-4" key={key}><div className={`card admin-metric ${data[key] === null && !loading ? 'unavailable-metric' : ''}`}><span>{label}</span><strong>{loading ? 'â€”' : data[key] === null ? 'Unavailable' : (typeof data[key] === 'number' ? data[key] : data[key].length).toLocaleString()}</strong><small>{data[key] === null && !loading ? errors[key] : description}</small></div></div>
  return <><PageHeader title="Control center" subtitle="A clear view of activity available from connected services."/>{loading && <div className="skeleton skeleton-detail mb-4" aria-label="Loading dashboard"/>}<div className="row g-3 mb-4">{metric('Opportunities in catalogue','opportunities','Current records from the opportunity service')}{metric('Deadlines recorded','deadlines','Current records from the deadline service')}{metric('Registered users','users','Count returned by the admin analytics API')}</div><div className="row g-4"><div className="col-xl-7"><div className="card section-card"><div className="card-body"><div className="section-title"><div><h2>Opportunity overview</h2><p>Catalogue entries available to the frontend</p></div></div>{data.opportunities === null && !loading ? <div className="alert alert-danger" role="alert">{errors.opportunities}</div> : data.opportunities?.length ? <div className="table-responsive"><table className="table"><thead><tr><th>Opportunity</th><th>Provider</th><th>Category</th></tr></thead><tbody>{data.opportunities.slice(0,6).map(item=><tr key={item.id}><td>{item.title}</td><td>{item.provider||'â€”'}</td><td>{item.category||'â€”'}</td></tr>)}</tbody></table></div> : !loading && <EmptyState title="No opportunities in the catalogue"/>}</div></div></div><div className="col-xl-5"><div className="card section-card"><div className="card-body"><div className="section-title"><div><h2>Deadline overview</h2><p>Dates returned by the deadline service</p></div></div>{data.deadlines === null && !loading ? <div className="alert alert-danger" role="alert">{errors.deadlines}</div> : data.deadlines?.length ? data.deadlines.slice(0,5).map(item=><div className="admin-deadline" key={item.id}><span>{item.opportunityTitle}</span><strong>{item.deadline?new Date(item.deadline).toLocaleDateString():'â€”'}</strong></div>) : !loading && <EmptyState title="No deadlines recorded"/>}</div></div></div></div></>
}
export function AdminPage({ type }) {
  const title = ({ users: 'Users', opportunities: 'Opportunities', categories: 'Categories', 'eligibility-rules': 'Eligibility rules', documents: 'Documents', deadlines: 'Deadlines', analytics: 'Analytics', settings: 'Admin settings' })[type] || 'Administration'
  const endpoint = type === 'opportunities' ? '/opportunities' : type === 'deadlines' ? '/deadlines' : null
  const [items, setItems] = useState(null), [error, setError] = useState('')
  useEffect(() => { if (endpoint) api.get(endpoint).then(({ data }) => setItems(Array.isArray(data) ? data : [])).catch(() => { setError(`${title} could not be loaded.`); setItems([]) }) }, [endpoint, title])
  return <><PageHeader title={title} subtitle="Manage LifePath using information from connected services." />{endpoint ? error ? <EmptyState icon="cloud-slash" title={`${title} are unavailable`}>{error}</EmptyState> : items === null ? <div className="skeleton skeleton-table" aria-label={`Loading ${title.toLowerCase()}`} /> : items.length === 0 ? <EmptyState icon="database" title={`No ${title.toLowerCase()} found`}>Records will appear when they are available in the service.</EmptyState> : <div className="card section-card"><div className="card-body"><div className="table-responsive"><table className="table"><thead><tr>{(type === 'opportunities' ? ['Opportunity', 'Provider', 'Category', 'Status'] : ['Opportunity', 'Deadline', 'Date']).map(col => <th key={col}>{col}</th>)}</tr></thead><tbody>{items.map(item => <tr key={item.id}><td>{type === 'opportunities' ? item.title : item.opportunityTitle}</td>{type === 'opportunities' ? <><td>{item.provider || 'â€”'}</td><td>{item.category || 'â€”'}</td><td>{item.status || 'â€”'}</td></> : <><td>{item.title || 'â€”'}</td><td>{item.deadline ? new Date(item.deadline).toLocaleString() : 'â€”'}</td></>}</tr>)}</tbody></table></div></div></div> : <EmptyState icon="database" title={`${title} management is unavailable`}>There is no confirmed backend API contract for this admin section in the current frontend.</EmptyState>}</>
}
export function NotFound() { return <main className="auth-page"><section className="auth-card text-center"><span className="display-3 fw-bold text-primary">404</span><h1>Page not found</h1><p className="auth-subtitle">The page youâ€™re looking for doesnâ€™t exist or has moved.</p><Link to="/" className="btn btn-primary mt-3">Return home</Link></section></main> }
