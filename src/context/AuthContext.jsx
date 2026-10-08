import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('lifepath_access_token'))
  const [user, setUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem('lifepath_user')) } catch { return null } })
  const [ready, setReady] = useState(() => !sessionStorage.getItem('lifepath_access_token'))
  const logout = useCallback(() => { sessionStorage.removeItem('lifepath_access_token'); sessionStorage.removeItem('lifepath_user'); setToken(null); setUser(null); setReady(true) }, [])
  useEffect(() => { window.addEventListener('lifepath:unauthorized', logout); return () => window.removeEventListener('lifepath:unauthorized', logout) }, [logout])
  useEffect(() => {
    if (!token) { setReady(true); return }
    let active = true
    api.get('/auth/me').then(({ data }) => {
      if (!active) return
      sessionStorage.setItem('lifepath_user', JSON.stringify(data))
      setUser(data)
    }).catch(() => { if (active) logout() }).finally(() => { if (active) setReady(true) })
    return () => { active = false }
  }, [token, logout])
  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    sessionStorage.setItem('lifepath_access_token', data.token)
    sessionStorage.setItem('lifepath_user', JSON.stringify(data.user))
    setToken(data.token); setUser(data.user); setReady(true); return data.user
  }, [])
  const register = useCallback((payload) => api.post('/auth/register', payload), [])
  const value = useMemo(() => ({ user, token, role: user?.role ?? null, isAuthenticated: Boolean(token && user), ready, login, logout, register }), [user, token, ready, login, logout, register])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
