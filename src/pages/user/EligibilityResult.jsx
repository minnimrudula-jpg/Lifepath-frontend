import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'

const finalStatusDetails = {
  ELIGIBLE: { label: 'You meet the listed requirements', icon: 'check-circle-fill', tone: 'eligible' },
  NOT_CURRENTLY_ELIGIBLE: { label: 'You do not currently meet the listed requirements', icon: 'x-circle-fill', tone: 'not-eligible' },
  MISSING_INFORMATION: { label: 'More profile information is needed', icon: 'exclamation-circle-fill', tone: 'missing-info' },
}

export default function EligibilityResult() {
  const { id } = useParams()
  return <EligibilityResultForId key={id} id={id} />
}

function EligibilityResultForId({ id }) {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const requestPending = useRef(null)
  const requestVersion = useRef(0)
  const check = useCallback(async () => {
    if (requestPending.current === id) return
    requestPending.current = id
    const version = ++requestVersion.current
    setLoading(true); setError(''); setResult(null)
    try { const { data } = await api.post(`/eligibility/check/${id}`); if (version === requestVersion.current) setResult(data) }
    catch (err) { if (version === requestVersion.current) setError(err.response?.data?.error || 'Eligibility could not be checked. Please try again.') }
    finally {
      if (requestPending.current === id) requestPending.current = null
      if (version === requestVersion.current) setLoading(false)
    }
  }, [id])
  useEffect(() => {
    let active = true
    const version = ++requestVersion.current
    requestPending.current = id
    api.post(`/eligibility/check/${id}`).then(({ data }) => { if (active && version === requestVersion.current) setResult(data) })
      .catch(err => { if (active && version === requestVersion.current) setError(err.response?.data?.error || 'Eligibility could not be checked. Please try again.') })
      .finally(() => {
        if (requestPending.current === id) requestPending.current = null
        if (active && version === requestVersion.current) setLoading(false)
      })
    return () => {
      active = false
      if (requestVersion.current === version) requestVersion.current += 1
      if (requestPending.current === id) requestPending.current = null
    }
  }, [id])
  const summary = useMemo(() => {
    const criteria = result?.results || []
    const count = (...statuses) => criteria.filter(rule => statuses.includes(String(rule.status || '').toUpperCase())).length
    return { total: criteria.length, satisfied: count('SATISFIED', 'ELIGIBLE', 'MET', 'PASSED'), unmet: count('NOT_SATISFIED', 'NOT_ELIGIBLE', 'UNMET', 'FAILED'), missing: count('MISSING_INFORMATION', 'MISSING', 'INCOMPLETE') }
  }, [result])
  const status = finalStatusDetails[result?.finalStatus] || { label: result?.finalStatus || 'Eligibility review', icon: 'shield-check', tone: 'unknown' }
  return <><PageHeader title="Your eligibility" subtitle="LifePath checks your profile against the opportunity requirements." action={<Link to="/user/eligibility" className="btn btn-outline-secondary"><i className="bi bi-arrow-left me-2"/>Choose another</Link>}/>
    {error ? <section className="eligibility-check-error" role="alert"><span className="eligibility-check-error-icon"><i className="bi bi-cloud-slash"/></span><h2>We could not check eligibility</h2><p>{error}</p><div className="d-flex flex-wrap justify-content-center gap-2"><button type="button" className="btn btn-primary" onClick={check}>Try again</button><Link to={`/user/opportunities/${id}`} className="btn btn-outline-secondary">View opportunity</Link></div></section> : loading || !result ? <section className="eligibility-check-loading" aria-live="polite"><img src="/illustrations/eligibility.svg" alt="" aria-hidden="true"/><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Checking eligibility</span></div><h2>Checking your information</h2><p>LifePath is comparing your profile with this opportunity’s requirements.</p></section> : <>
      <section className={`eligibility-result-hero result-${status.tone}`} aria-live="polite"><div className="eligibility-result-mark"><i className={`bi bi-${status.icon}`} aria-hidden="true"/></div><div className="eligibility-result-copy"><span>ELIGIBILITY RESULT</span><h2>{status.label}</h2><p>{result.opportunityTitle || 'Selected opportunity'}</p></div><StatusBadge status={result.finalStatus}/></section>
      {result.finalStatus === 'MISSING_INFORMATION' && <section className="missing-profile-callout"><span><i className="bi bi-person-vcard"/></span><div><strong>Complete your profile to get a clearer result</strong><p>Some information needed for this check is missing. Update your profile, then run the eligibility check again.</p></div><Link className="btn btn-primary" to="/user/profile">Update profile <i className="bi bi-arrow-right ms-2"/></Link></section>}
      {summary.total > 0 && <section className="eligibility-summary" aria-label="Criteria summary"><div className="eligibility-summary-heading"><div><h2>Your criteria summary</h2><p>Based on {summary.total} criteria returned by LifePath.</p></div><strong>{summary.total}<small> criteria</small></strong></div><div className="eligibility-summary-track" role="img" aria-label={`${summary.satisfied} satisfied, ${summary.unmet} not met, ${summary.missing} missing information`}>{summary.satisfied > 0 && <span className="summary-segment summary-satisfied" style={{ flexGrow: summary.satisfied }} />}{summary.unmet > 0 && <span className="summary-segment summary-unmet" style={{ flexGrow: summary.unmet }} />}{summary.missing > 0 && <span className="summary-segment summary-missing" style={{ flexGrow: summary.missing }} />}{summary.satisfied + summary.unmet + summary.missing < summary.total && <span className="summary-segment summary-other" style={{ flexGrow: summary.total - summary.satisfied - summary.unmet - summary.missing }} />}</div><div className="eligibility-summary-legend"><span><i className="summary-dot summary-satisfied"/>{summary.satisfied} satisfied</span><span><i className="summary-dot summary-unmet"/>{summary.unmet} not met</span><span><i className="summary-dot summary-missing"/>{summary.missing} missing</span></div></section>}
      {result.results?.length ? <section className="eligibility-review"><div className="section-title"><div><h2>Each requirement</h2><p>These details come from the LifePath eligibility service.</p></div></div><div className="rule-list">{result.results.map((rule, index) => <article className="rule-card" key={rule.ruleId ?? `${rule.criterion}-${index}`} style={{ '--stagger': `${index * 55}ms` }}><div className="rule-heading"><div><span className="rule-label">REQUIREMENT {index + 1}</span><h3>{rule.criterion || 'Eligibility criterion'}</h3></div><StatusBadge status={rule.status}/></div><div className="rule-values"><div><span>What is required</span><strong>{rule.requirement || 'Not provided'}</strong></div><div><span>Your information</span><strong>{rule.userValue ?? 'Not provided'}</strong></div></div>{rule.explanation && <p className="rule-explanation"><i className="bi bi-info-circle me-2" aria-hidden="true"/>{rule.explanation}</p>}</article>)}</div></section> : <EmptyState icon="sliders" title="No criterion details available">LifePath did not return individual requirement details for this check.</EmptyState>}
      <p className="eligibility-disclaimer"><i className="bi bi-lock me-2"/>The LifePath service determines eligibility. This page shows the result it returned.</p>
      <section className="eligibility-next"><div><span>YOUR NEXT STEP</span><h2>Keep moving forward</h2><p>You can review the opportunity or update your application materials.</p></div><div className="eligibility-next-actions"><Link to={`/user/opportunities/${id}`}><i className="bi bi-file-earmark-text"/><span>Review opportunity</span><i className="bi bi-arrow-right"/></Link><Link to="/user/documents"><i className="bi bi-folder-check"/><span>Review documents</span><i className="bi bi-arrow-right"/></Link><Link to="/user/deadlines"><i className="bi bi-calendar-event"/><span>Review deadlines</span><i className="bi bi-arrow-right"/></Link></div></section>
    </>}
  </>
}
