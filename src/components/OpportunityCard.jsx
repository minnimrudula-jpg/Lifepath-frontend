import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export default function OpportunityCard({ opportunity, saved = false, onToggleSave }) {
  return <article className="card opportunity-card h-100"><div className="card-body d-flex flex-column">
    <div className="d-flex justify-content-between gap-2 mb-3">{opportunity.category && <span className="badge rounded-pill text-bg-light">{opportunity.category}</span>}{opportunity.status && <StatusBadge status={opportunity.status} />}</div>
    <h3 className="h5">{opportunity.title}</h3>
    {opportunity.provider && <p className="text-secondary small mb-2">{opportunity.provider}</p>}
    {opportunity.description && <p className="text-secondary flex-grow-1">{opportunity.description}</p>}
    {opportunity.deadline && <div className="small mb-3"><i className="bi bi-calendar3 me-2" />Deadline {new Date(opportunity.deadline).toLocaleDateString()}</div>}
    <div className="d-flex gap-2 mt-auto"><Link className="btn btn-primary btn-sm" to={`/user/opportunities/${opportunity.id}`}>View details</Link><button className="btn btn-outline-secondary btn-sm" aria-pressed={saved} onClick={() => onToggleSave?.(opportunity)}><i className={`bi bi-bookmark${saved ? '-fill' : ''} me-1`} />{saved ? 'Saved' : 'Save'}</button></div>
  </div></article>
}
