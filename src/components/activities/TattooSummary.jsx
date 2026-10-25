import FeatureSummary from './FeatureSummary.jsx'
import { TATTOO_GROUP } from '../../lib/featureInterests.js'

export default function TattooSummary(props) {
  return <FeatureSummary title="Tattoos" editLabel="Edit tattoo activities" {...props} groups={[TATTOO_GROUP]} />
}
