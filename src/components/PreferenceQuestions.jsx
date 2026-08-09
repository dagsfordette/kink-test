function normalizeMultiValue(value) {
  if (Array.isArray(value)) return { selected: value, otherText: '' }
  if (value && typeof value === 'object') {
    return {
      selected: Array.isArray(value.selected) ? value.selected : [],
      otherText: typeof value.otherText === 'string' ? value.otherText : '',
    }
  }
  return { selected: [], otherText: '' }
}

function compactMultiValue(field, state) {
  const selected = [...new Set(state.selected || [])]
  const otherText = (state.otherText || '').trimStart()
  if (!field.otherOption) return selected.length ? selected : undefined
  if (!selected.length && !otherText) return undefined
  return { selected, otherText }
}

export function ExtensibleMultiSelect({ field, value, onChange }) {
  const state = normalizeMultiValue(value)
  const selected = new Set(state.selected)
  const exclusive = new Set(field.exclusiveOptions || [])
  const selectableIds = (field.options || []).map((option) => option.id).filter((id) => !exclusive.has(id))
  const allSelected = selectableIds.length > 1 && selectableIds.every((id) => selected.has(id))
  const otherSelected = Boolean(field.otherOption && selected.has(field.otherOption.id))

  const commit = (nextSelected, otherText = state.otherText) => {
    onChange(compactMultiValue(field, { selected: nextSelected, otherText }))
  }

  const toggle = (id) => {
    const next = new Set(selected)
    if (next.has(id)) {
      next.delete(id)
    } else if (exclusive.has(id)) {
      next.clear()
      next.add(id)
    } else {
      for (const selectedId of [...next]) {
        if (exclusive.has(selectedId)) next.delete(selectedId)
      }
      next.add(id)
    }
    const nextOtherText = exclusive.has(id) && next.has(id)
      ? ''
      : (id === field.otherOption?.id && !next.has(id) ? '' : state.otherText)
    commit([...next], nextOtherText)
  }

  const selectAll = () => {
    if (allSelected) commit([], '')
    else commit(selectableIds, '')
  }

  return (
    <div className="extensible-multi-select">
      <div className="field-label-row">
        <span className="field-label">{field.label}</span>
        {selectableIds.length > 1 && (
          <button type="button" className="field-clear" onClick={selectAll}>{allSelected ? 'Clear all' : 'Select all'}</button>
        )}
      </div>
      {field.help && <p className="field-help preference-help">{field.help}</p>}
      <div className="choice-chips negotiation-chips" aria-label={field.label}>
        {(field.options || []).map((option) => (
          <button
            type="button"
            className={`chip ${selected.has(option.id) ? 'selected' : ''}`}
            aria-pressed={selected.has(option.id)}
            onClick={() => toggle(option.id)}
            key={option.id}
          >{option.label}</button>
        ))}
        {field.otherOption && (
          <button
            type="button"
            className={`chip ${otherSelected ? 'selected' : ''}`}
            aria-pressed={otherSelected}
            onClick={() => toggle(field.otherOption.id)}
          >{field.otherOption.label}</button>
        )}
      </div>
      {otherSelected && (
        <label className="other-response-field">
          <span className="sr-only">{field.otherOption.textLabel || `Describe ${field.otherOption.label}`}</span>
          <input
            type="text"
            value={state.otherText}
            placeholder={field.otherOption.placeholder || 'Optional — add your own response'}
            onChange={(event) => commit([...selected], event.target.value)}
          />
        </label>
      )}
    </div>
  )
}

export function ScaleQuestion({ field, value, onChange }) {
  return (
    <fieldset className="scale-question">
      <legend className="field-label-row">
        <span className="field-label">{field.label}</span>
        {value && <button type="button" className="field-clear" onClick={() => onChange(undefined)}>Clear</button>}
      </legend>
      {field.help && <p className="field-help preference-help">{field.help}</p>}
      <div className="scale-options" role="radiogroup" aria-label={field.label}>
        {(field.options || []).map((option, index) => (
          <button
            type="button"
            role="radio"
            aria-checked={value === option.id}
            className={`scale-option ${value === option.id ? 'selected' : ''}`}
            onClick={() => onChange(value === option.id ? undefined : option.id)}
            key={option.id}
          >
            <span className="scale-option-index" aria-hidden="true">{index + 1}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      {field.interpretation && value && <p className="scale-interpretation">{field.interpretation.replace('{selection}', (field.options || []).find((option) => option.id === value)?.label || value)}</p>}
    </fieldset>
  )
}

function normalizeMatrixValue(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { values: {}, note: '' }
  if (value.values && typeof value.values === 'object') return { values: { ...value.values }, note: typeof value.note === 'string' ? value.note : '' }
  return { values: { ...value }, note: '' }
}

export function MatrixQuestion({ field, value, onChange }) {
  const state = normalizeMatrixValue(value)
  const scale = [...(field.scale || []), ...(field.notApplicable ? [field.notApplicable] : [])]
  const allowed = new Set(scale.map((option) => option.id))
  const values = Object.fromEntries(Object.entries(state.values).filter(([, id]) => allowed.has(id)))
  const effectiveValue = (rowId) => values[rowId] ?? field.defaultValue ?? ''
  const shortcutActive = Boolean(field.shortcut && (field.rows || []).length && field.rows.every((row) => values[row.id] === field.shortcut.value))

  const commit = (nextValues, note = state.note) => {
    const cleanValues = Object.fromEntries(Object.entries(nextValues).filter(([, id]) => allowed.has(id)))
    const cleanNote = note || ''
    if (!Object.keys(cleanValues).length && !cleanNote.trim()) onChange(undefined)
    else onChange({ values: cleanValues, note: cleanNote })
  }

  const setRow = (rowId, nextValue) => {
    const next = { ...values }
    if (!nextValue || next[rowId] === nextValue) delete next[rowId]
    else next[rowId] = nextValue
    commit(next)
  }

  const toggleShortcut = () => {
    if (!field.shortcut) return
    if (shortcutActive) commit({})
    else commit(Object.fromEntries((field.rows || []).map((row) => [row.id, field.shortcut.value])))
  }

  return (
    <fieldset className="matrix-question">
      <legend className="field-label">{field.label}</legend>
      {field.help && <p className="field-help preference-help">{field.help}</p>}
      {field.shortcut && (
        <button type="button" className={`matrix-shortcut ${shortcutActive ? 'selected' : ''}`} aria-pressed={shortcutActive} onClick={toggleShortcut}>
          {field.shortcut.label}
        </button>
      )}
      <div className="matrix-scroll" role="region" aria-label={`${field.label} matrix`} tabIndex="0">
        <table className="matrix-table">
          <thead>
            <tr>
              <th scope="col">{field.rowHeader || 'Area'}</th>
              {scale.map((option) => <th scope="col" key={option.id}>{option.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {(field.rows || []).map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                {scale.map((option) => (
                  <td key={option.id}>
                    <button
                      type="button"
                      role="radio"
                      aria-label={`${row.label}: ${option.label}`}
                      aria-checked={effectiveValue(row.id) === option.id}
                      className={`matrix-cell-choice ${effectiveValue(row.id) === option.id ? 'selected' : ''}`}
                      onClick={() => setRow(row.id, option.id)}
                    >
                      <span aria-hidden="true">{effectiveValue(row.id) === option.id ? '●' : '○'}</span>
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {field.note && (
        <label className="matrix-note">
          <span className="field-label">{field.note.label || 'Optional note'}</span>
          <textarea rows="2" value={state.note} placeholder={field.note.placeholder || 'Optional'} onChange={(event) => commit(values, event.target.value)} />
        </label>
      )}
      {field.requireEveryRow && <p className="field-help preference-help">Answer each row before continuing.</p>}
    </fieldset>
  )
}
