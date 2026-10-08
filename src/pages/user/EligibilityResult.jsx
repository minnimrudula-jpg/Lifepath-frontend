import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'

export default function EligibilityResult() {
  const { id } = useParams()
  const [result, setResult] = useState(null), [error, setError] = useState('')
  useEffect(() => { setResult(null); setError(''); api.post(`/eligibility/check/${id}`).then(({ data }) => setResult(data)).catch(err => setError(err.response?.data?.error || 'Eligibility could not be checked. Please try again.')) }, [id])
  return <><PageHeader title="Eligibility result" subtitle="Your result is evaluated and returned by LifePath services."/>{error ? <><div role="alert" className="alert alert-danger">{error}</div><Link to={`/user/opportunities/${id}`} className="btn btn-outline-secondary">Back to opportunity</Link></> : !result ? <div className="skeleton skeleton-detail" aria-label="Checking eligibility"/> : <>
    <section className="eligibility-result-hero"><div className="eligibility-result-mark"><i className="bi bi-shield-check"/></div><div className="eligibility-result-copy"><span>ELIGIBILITY REVIEW</span><h2>{result.finalStatus}</h2><p>{result.opportunityTitle}</p></div><StatusBadge status={result.finalStatus}/></section>
    {result.results?.length ? <section className="eligibility-review"><div className="section-title"><div><h2>Criteria review</h2><p>Each item reflects a rule result returned by the backend.</p></div></div><div className="rule-list">{result.results.map((rule, index) => <article className="rule-card" key={rule.ruleId ?? `${rule.criterion}-${index}`} style={{ '--stagger': `${index * 55}ms` }}><div className="rule-heading"><div><span className="rule-label">CRITERION</span><h3>{rule.criterion}</h3></div><StatusBadge status={rule.status}/></div><div className="rule-values"><div><span>Requirement</span><strong>{rule.requirement || 'Not provided'}</strong></div><div><span>Your value</span><strong>{rule.userValue ?? 'Not provided'}</strong></div></div>{rule.explanation && <p className="rule-explanation"><i className="bi bi-info-circle me-2"/>{rule.explanation}</p>}</article>)}</div></section> : <EmptyState icon="sliders" title="No rule details returned">The backend did not return any rule level results for this check.</EmptyState>}
    <p className="eligibility-disclaimer"><i className="bi bi-lock me-2"/>Eligibility is determined by the LifePath backend. This page displays the response without recalculating it.</p>
  </>}</>
}
