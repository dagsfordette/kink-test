import { ACTIVITY_EXPERIENCES } from '../../lib/collectionActivityAnswers.js'

export default function CollectionActivitySummary({ answer = {}, privateDetails = false }) {
  const experience = ACTIVITY_EXPERIENCES.find(([id]) => id === answer.experience)?.[1]
  return <>{experience && <p>{experience}</p>}{privateDetails && answer.rating === 'soft_limit' && answer.conditions && <p>Conditions: {answer.conditions}</p>}</>
}
