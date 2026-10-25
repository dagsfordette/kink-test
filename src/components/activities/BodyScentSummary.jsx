import FeatureSummary from './FeatureSummary.jsx'
import { BODY_SCENT_GROUP } from '../../lib/featureInterests.js'

export default function BodyScentSummary(props) {
  return <FeatureSummary title="Body scent" editLabel="Edit body-scent interests" {...props} groups={[BODY_SCENT_GROUP]} />
}
