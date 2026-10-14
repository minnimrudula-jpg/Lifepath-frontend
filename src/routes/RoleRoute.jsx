import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
export default function RoleRoute({ role }) { const { role: currentRole } = useAuth(); return currentRole === role ? <Outlet /> : <Navigate to={currentRole === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'} replace /> }
