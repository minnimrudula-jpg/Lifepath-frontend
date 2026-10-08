import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'
export default function AdminLayout() { const [open,setOpen]=useState(false); return <div className="app-shell"><AdminSidebar open={open} close={()=>setOpen(false)} />{open&&<button aria-label="Close menu" className="sidebar-backdrop d-lg-none" onClick={()=>setOpen(false)} />}<main className="main-area"><Navbar admin onMenu={()=>setOpen(!open)} /><div className="page-content"><Outlet /></div><footer className="app-footer">LifePath Administration</footer></main></div> }
