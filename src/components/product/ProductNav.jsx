const ITEMS = [
  ['home', 'Home'],
  ['fantasy_intro', 'Fantasy Profile'],
  ['activity_intro', 'Activity Explorer'],
  ['profile', 'My Profile'],
]

function activeFor(route, target) {
  if (target === 'home') return route === 'home'
  if (target === 'profile') return route === 'profile'
  if (target === 'fantasy_intro') return route.startsWith('fantasy_')
  if (target === 'activity_intro') return route.startsWith('activity_')
  return false
}

export default function ProductNav({ route, onNavigate }) {
  return (
    <header className="product-nav no-print">
      <button type="button" className="product-brand" onClick={() => onNavigate('home')}>
        <span aria-hidden="true">✦</span>
        <span><strong>Kink Exploration</strong><small>Find what you like. Sort out what you want.</small></span>
      </button>
      <nav aria-label="Main navigation">
        {ITEMS.map(([target, label]) => (
          <button type="button" key={target} className={activeFor(route, target) ? 'active' : ''} onClick={() => onNavigate(target)}>{label}</button>
        ))}
      </nav>
    </header>
  )
}
