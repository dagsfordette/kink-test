import { useMemo } from 'react'
import FeatureExplorer from './FeatureExplorer.jsx'
import { toyGroupsForState } from '../../lib/toyInterests.js'

export default function ToyExplorer({ catalog, activityState, onExploration }) {
  const groups = useMemo(() => toyGroupsForState(catalog, activityState), [catalog, activityState])
  return <FeatureExplorer groups={groups} pickerLabel="Explore a device" label="Toys and devices" activityState={activityState} onExploration={onExploration} />
}
