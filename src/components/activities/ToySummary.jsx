import FeatureSummary from './FeatureSummary.jsx'
import { TOY_GROUPS } from '../../lib/featureInterests.js'

export default function ToySummary(props) {
  return <FeatureSummary title="Toys & devices" editLabel="Edit toy and device interests" {...props} groups={TOY_GROUPS} />
}
