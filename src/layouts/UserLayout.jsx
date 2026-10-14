import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
export default function UserLayout() { const [open, setOpen] = useState(false); return <div className="app-shell"><Sidebar open={open} close={() => setOpen(false)} />{open && <button aria-label="Close menu" className="sidebar-backdrop d-lg-none" onClick={() => setOpen(false)} />}<main className="main-area"><Navbar onMenu={() => setOpen(!open)} /><div className="page-content"><Outlet /></div><footer className="app-footer">LifePath <span>•</span> Personalized opportunity discovery</footer></main></div> }
