import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export default function OpportunityCard({ opportunity, saved = false, saveDisabled = false, onToggleSave }) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const categoryIcon = /scholar|education|student/i.test(opportunity.category || '') ? 'mortarboard' : /job|career|work/i.test(opportunity.category || '') ? 'briefcase' : /grant|finance|fund/i.test(opportunity.category || '') ? 'cash-coin' : 'stars'
  const categoryArt = /scholar|education|student/i.test(opportunity.category || '') ? 'discover' : /job|career|work/i.test(opportunity.category || '') ? 'preparation' : /grant|finance|fund/i.test(opportunity.category || '') ? 'saved' : 'eligibility'
  const openDetails = () => navigate(`/user/opportunities/${opportunity.id}`)
  const onCardKeyDown = event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openDetails() } }
  const toggleSave = async event => { event.stopPropagation(); if (!onToggleSave || saveDisabled || saving) return; setSaving(true); try { await onToggleSave(opportunity) } finally { setSaving(false) } }
  return <article className="card opportunity-card h-100" role="link" tabIndex="0" aria-label={`View details for ${opportunity.title}`} onClick={openDetails} onKeyDown={onCardKeyDown}><div className="card-body d-flex flex-column">
    <div className="opportunity-artwork"><img src={`/illustrations/${categoryArt}.svg`} alt="" aria-hidden="true"/><div className="opportunity-card-top"><span className="opportunity-category-icon"><i className={`bi bi-${categoryIcon}`}/></span><div className="d-flex flex-wrap justify-content-end gap-2">{opportunity.category && <span className="badge rounded-pill text-bg-light">{opportunity.category}</span>}{opportunity.status && <StatusBadge status={opportunity.status} />}</div></div></div>
    <h3 className="h5">{opportunity.title}</h3>
    {opportunity.provider && <p className="text-secondary small mb-2">{opportunity.provider}</p>}
    {opportunity.description && <p className="text-secondary flex-grow-1">{opportunity.description}</p>}
    {opportunity.deadline && <div className="small mb-3"><i className="bi bi-calendar3 me-2" />Deadline {new Date(opportunity.deadline).toLocaleDateString()}</div>}
    {opportunity.eligibilityStatus && <div className="opportunity-eligibility"><i className="bi bi-shield-check"/><span>Eligibility</span><StatusBadge status={opportunity.eligibilityStatus}/></div>}
    <div className="d-flex flex-wrap gap-2 mt-auto"><button className="btn btn-primary btn-sm" onClick={event => { event.stopPropagation(); openDetails() }}>View details</button><button className="btn btn-outline-secondary btn-sm" aria-pressed={saved} disabled={saving || saveDisabled || !onToggleSave} title={saveDisabled ? 'Saved opportunities are unavailable' : undefined} onClick={toggleSave}><i className={`bi bi-bookmark${saved ? '-fill' : ''} me-1`} />{saving ? 'Saving…' : saved ? 'Saved' : 'Save'}</button><button className="btn btn-outline-primary btn-sm" onClick={event => { event.stopPropagation(); navigate(`/user/eligibility/${opportunity.id}`) }}>Check eligibility</button></div>
  </div></article>
}
