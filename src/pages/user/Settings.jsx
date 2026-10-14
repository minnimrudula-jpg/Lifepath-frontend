import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/useAuth'
import PageHeader from '../../components/PageHeader'

export default function Settings() {
  const { logout } = useAuth()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [settingsError, setSettingsError] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const loadAccount = async () => {
    setLoading(true)
    setSettingsError('')
    try {
      const { data } = await api.get('/settings')
      setAccount(data)
    } catch {
      setSettingsError('Account settings could not be loaded.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    let active = true
    api.get('/settings').then(({ data }) => { if (active) setAccount(data) }).catch(() => { if (active) setSettingsError('Account settings could not be loaded.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const changePassword = async event => {
    event.preventDefault()
    setError('')
    setMessage('')
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const currentPassword = form.get('currentPassword')
    const newPassword = form.get('newPassword')
    const confirmation = form.get('confirmation')
    if (newPassword !== confirmation) {
      const field = formElement.elements.confirmation
      field.setCustomValidity('The new password entries do not match.')
      field.reportValidity()
      setError('The new password entries do not match.')
      return
    }
    setBusy(true)
    try {
      await api.put('/settings/password', { currentPassword, newPassword })
      formElement.reset()
      setMessage('Password changed successfully.')
    } catch (err) {
      setError(err.response?.data?.error || 'Password could not be changed.')
    } finally {
      setBusy(false)
    }
  }

  return <><PageHeader title="Settings" subtitle="Manage your account security and sign-in session."/>
    {settingsError && <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2" role="alert"><span>{settingsError}</span><button type="button" className="btn btn-sm btn-outline-danger" onClick={loadAccount}>Retry</button></div>}
    {error && <div className="alert alert-danger" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}
    <div className="row g-3">
      <section className="col-lg-6"><div className="card section-card h-100"><div className="card-body"><h2 className="h5">Account</h2>{loading ? <div className="skeleton skeleton-detail" aria-label="Loading account details"/> : account ? <dl className="row mb-0"><dt className="col-sm-4">Name</dt><dd className="col-sm-8">{account.name || 'â€”'}</dd><dt className="col-sm-4">Email</dt><dd className="col-sm-8">{account.email || 'â€”'}</dd><dt className="col-sm-4">Role</dt><dd className="col-sm-8">{account.role || 'â€”'}</dd></dl> : <p className="text-secondary mb-0">Account details are unavailable right now.</p>}</div></div></section>
      <section className="col-lg-6"><div className="card section-card h-100"><div className="card-body"><h2 className="h5">Change password</h2><form onSubmit={changePassword}><label className="form-label" htmlFor="current-password">Current password</label><input className="form-control mb-3" id="current-password" name="currentPassword" type="password" autoComplete="current-password" required/><label className="form-label" htmlFor="new-password">New password</label><input className="form-control mb-3" id="new-password" name="newPassword" type="password" minLength="8" maxLength="72" autoComplete="new-password" required/><label className="form-label" htmlFor="confirm-password">Confirm new password</label><input className="form-control mb-3" id="confirm-password" name="confirmation" type="password" minLength="8" maxLength="72" autoComplete="new-password" required onChange={event => event.currentTarget.setCustomValidity('')}/><button className="btn btn-primary" disabled={busy}>{busy ? 'Savingâ€¦' : 'Update password'}</button></form></div></div></section>
      <section className="col-12"><div className="card section-card"><div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3"><div><h2 className="h5 mb-1">Sign out</h2><p className="text-secondary mb-0">End this session and clear the saved access token from this browser.</p></div><button className="btn btn-outline-danger" onClick={logout}>Log out</button></div></div></section>
    </div>
  </>
}
