import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [['dashboard','Dashboard','speedometer2'],['profile','Profile','person'],['opportunities','Opportunities','compass'],['saved','Saved Opportunities','bookmark'],['eligibility','Eligibility','check2-circle'],['documents','Documents','folder2'],['deadlines','Deadlines','calendar3'],['preparation','Preparation','journal-check'],['notifications','Notifications','bell'],['settings','Settings','gear']]
export default function Sidebar({ open, close }) {
  const { user, logout } = useAuth()
  return <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}><NavLink to="/user/dashboard" className="brand" onClick={close}><span className="brand-mark"><i className="bi bi-signpost-split-fill"/></span><span>LifePath<small>OPPORTUNITY DISCOVERY</small></span></NavLink><div className="sidebar-label">WORKSPACE</div><nav>{links.map(([path,label,icon]) => <NavLink key={path} to={`/user/${path}`} end={path === 'eligibility'} onClick={close} className={({isActive}) => `side-link ${isActive ? 'active' : ''}`}><i className={`bi bi-${icon}`}/>{label}</NavLink>)}</nav><div className="sidebar-account"><span className="avatar">{user?.name ? user.name.slice(0,1).toUpperCase() : <i className="bi bi-person"/>}</span><div className="sidebar-account-details">{user?.name && <strong>{user.name}</strong>}{user?.email && <small>{user.email}</small>}</div><button className="sidebar-logout" onClick={logout} aria-label="Log out"><i className="bi bi-box-arrow-right"/></button></div></aside>
}
