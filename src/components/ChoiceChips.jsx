export default function ChoiceChips({ value, onChange, options, ariaLabel }) {
  return (
    <div className="choice-chips" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          type="button"
          className={`chip ${value === option.id ? 'selected' : ''} ${option.tone ? `tone-${option.tone}` : ''}`}
          aria-pressed={value === option.id}
          key={option.id}
          onClick={() => onChange(value === option.id ? undefined : option.id)}
        >
          {option.shortLabel || option.label}
        </button>
      ))}
    </div>
  )
}
