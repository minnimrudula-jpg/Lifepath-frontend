import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const titles = { dashboard: 'Dashboard', profile: 'Profile', opportunities: 'Opportunities', saved: 'Saved opportunities', eligibility: 'Eligibility', documents: 'Documents', deadlines: 'Deadlines', preparation: 'Preparation', notifications: 'Notifications', settings: 'Settings', users: 'Users', categories: 'Categories', 'eligibility-rules': 'Eligibility rules', analytics: 'Analytics' }
export default function Navbar({ admin = false, onMenu }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const segment = location.pathname.split('/').filter(Boolean).at(-1)
  const title = titles[segment] || (admin ? 'Opportunity management' : 'Opportunity details')
  return <header className="topbar"><button className="btn btn-light d-lg-none" onClick={onMenu} aria-label="Toggle navigation"><i className="bi bi-list"/></button><div className="topbar-context"><span>{admin ? 'Administration' : 'My workspace'}</span><strong>{title}</strong></div><div className="ms-auto d-flex align-items-center gap-3">{!admin && <Link to="/user/notifications" className="topbar-icon-link" aria-label="Notifications" title="Notifications"><i className="bi bi-bell"/></Link>}<div className="user-chip"><span className="avatar">{user?.name ? user.name.slice(0, 1).toUpperCase() : <i className="bi bi-person"/>}</span><span className="d-none d-sm-block">{user?.name && <strong>{user.name}</strong>}{user?.email && <small>{user.email}</small>}</span></div><button className="btn btn-outline-secondary btn-sm" onClick={logout}>Log out</button></div></header>
}
