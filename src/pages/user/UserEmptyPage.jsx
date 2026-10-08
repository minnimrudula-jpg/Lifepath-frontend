import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

const pages = { documents: ['Documents', 'documents'], preparation: ['Preparation', 'preparation tasks'], notifications: ['Notifications', 'notifications'], settings: ['Settings', 'account preferences'] }
export default function UserEmptyPage({ type }) {
  const [title, label] = pages[type] || ['Workspace', 'workspace data']
  return <><PageHeader title={title} subtitle={`${label} are not available from the backend yet.`}/><EmptyState icon="database" title={`${title} are not connected yet`}>This section will show information when its backend service is available.</EmptyState></>
}
