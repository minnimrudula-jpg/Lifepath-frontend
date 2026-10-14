import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const links = [['dashboard','Dashboard','speedometer2'],['users','Users','people'],['opportunities','Opportunities','compass'],['categories','Categories','grid'],['eligibility-rules','Eligibility Rules','sliders'],['deadlines','Deadlines','calendar3'],['analytics','Analytics','bar-chart'],['settings','Settings','gear']]
export default function AdminSidebar({ open, close }) {
  const { user, logout } = useAuth()
  return <aside className={`sidebar admin-sidebar ${open ? 'sidebar-open' : ''}`}><NavLink to="/admin/dashboard" className="brand" onClick={close}><span className="brand-mark"><i className="bi bi-signpost-split-fill"/></span><span>LifePath<small>ADMIN CONSOLE</small></span></NavLink><div className="sidebar-label">MANAGEMENT</div><nav>{links.map(([path,label,icon]) => <NavLink key={path} to={`/admin/${path}`} onClick={close} className={({isActive}) => `side-link ${isActive ? 'active' : ''}`}><i className={`bi bi-${icon}`}/>{label}</NavLink>)}</nav><div className="sidebar-account"><span className="avatar"><i className="bi bi-shield-check"/></span><div className="sidebar-account-details">{user?.name && <strong>{user.name}</strong>}{user?.email && <small>{user.email}</small>}</div><button className="sidebar-logout" onClick={logout} aria-label="Log out"><i className="bi bi-box-arrow-right"/></button></div></aside>
}
