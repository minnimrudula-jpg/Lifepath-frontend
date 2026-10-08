import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
export default function ProtectedRoute() { const { isAuthenticated, ready } = useAuth(); const location = useLocation(); if (!ready) return <div className="auth-page"><p>Checking your sessionâ€¦</p></div>; return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} /> }
