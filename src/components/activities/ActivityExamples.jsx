import { useState } from 'react'
import images from '../../data/activityImages.json'

function ExampleFigure({ image }) {
  const [failed, setFailed] = useState(false)
  return (
    <figure className="activity-example">
      {failed ? (
        <p role="status">This example image couldn’t be loaded.</p>
      ) : (
        <a href={`${import.meta.env.BASE_URL}${image.src}`} target="_blank" rel="noopener noreferrer"
          aria-label={`Open larger image: ${image.alt}`}>
          <img src={`${import.meta.env.BASE_URL}${image.src}`} alt={image.alt}
            width={image.width} height={image.height} loading="lazy" decoding="async"
            onError={() => setFailed(true)} />
        </a>
      )}
      <figcaption>
        <p>{image.caption}</p>
        <small>
          <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">{image.title}</a>
          {' — '}{image.credit}{' · '}
          <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer">{image.license}</a>
          {' · '}{image.changes}
        </small>
      </figcaption>
    </figure>
  )
}

export default function ActivityExamples({ activityId }) {
  const [open, setOpen] = useState(false)
  const examples = images.filter((image) => image.activityIds.includes(activityId))
  if (!examples.length) return null
  return (
    <details className="activity-examples no-print" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{open ? 'Hide' : 'Show'} {examples.length === 1 ? 'example image' : 'example images'}</summary>
      {open && examples.map((image) => <ExampleFigure key={image.id} image={image} />)}
    </details>
  )
}
