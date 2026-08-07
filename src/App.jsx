import { useEffect, useMemo, useRef, useState } from 'react'
import catalog from './data/catalog.json'
import Welcome from './components/Welcome.jsx'
import TestView from './components/TestView.jsx'
import ResultsView from './components/ResultsView.jsx'
import PrintReport from './components/PrintReport.jsx'
import { clearState, loadState, saveState } from './lib/storage.js'
import { normalizeDepthMode } from './lib/depthModes.js'
import { compareResponses } from './lib/compatibility.js'
import { createResponsePayload, normalizeResponsePayload } from './lib/responseFormat.js'

const initialSettings = {
  adultConfirmed: false,
  mode: 'standard',
  theme: 'dark',
  onboardingComplete: false,
  onboardingStep: 'negotiation',
}

function normalizeSavedState(saved) {
  const settings = { ...initialSettings, ...(saved?.settings || {}) }
  settings.mode = normalizeDepthMode(settings.mode)
  if (!saved) return { screen: 'welcome', settings, answers: {}, categoryGates: {}, negotiationPreferences: {}, currentCategoryId: catalog.categories[0]?.id }
  const normalized = normalizeResponsePayload(catalog, {
    questionnaireId: catalog.questionnaire.id,
    settings,
    answers: saved.answers || {},
    categoryGates: saved.categoryGates || {},
    negotiationPreferences: saved.negotiationPreferences || {},
  })
  return {
    screen: saved.screen || 'welcome',
    settings: { ...settings, ...normalized.settings },
    answers: normalized.answers,
    categoryGates: normalized.categoryGates,
    negotiationPreferences: normalized.negotiationPreferences,
    currentCategoryId: saved.currentCategoryId || catalog.categories[0]?.id,
  }
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function App() {
  const initial = useMemo(() => normalizeSavedState(loadState()), [])
  const [screen, setScreen] = useState(initial.screen)
  const [settings, setSettings] = useState(initial.settings)
  const [answers, setAnswers] = useState(initial.answers)
  const [categoryGates, setCategoryGates] = useState(initial.categoryGates)
  const [negotiationPreferences, setNegotiationPreferences] = useState(initial.negotiationPreferences)
  const [currentCategoryId, setCurrentCategoryId] = useState(initial.currentCategoryId)
  const fileInputRef = useRef(null)
  const compareFileInputRef = useRef(null)
  const [partnerResponse, setPartnerResponse] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  useEffect(() => {
    saveState({ screen, settings, answers, categoryGates, negotiationPreferences, currentCategoryId })
  }, [screen, settings, answers, categoryGates, negotiationPreferences, currentCategoryId])

  const setAnswer = (key, value) => setAnswers((prev) => ({ ...prev, [key]: value }))
  const setCategoryGate = (categoryId, value) => setCategoryGates((prev) => {
    const next = { ...prev }
    if (value) next[categoryId] = value
    else delete next[categoryId]
    return next
  })

  const exportPayload = () => createResponsePayload(catalog, { settings, answers, categoryGates, negotiationPreferences })

  const handleExportJson = () => {
    const date = new Date().toISOString().slice(0, 10)
    downloadJson(`kink-inventory-${date}.json`, exportPayload())
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      const normalized = normalizeResponsePayload(catalog, data)
      if (!window.confirm('Replace the answers currently stored in this browser with the imported file?')) return
      setAnswers(normalized.answers)
      setCategoryGates(normalized.categoryGates)
      setNegotiationPreferences(normalized.negotiationPreferences)
      setSettings((prev) => ({ ...prev, mode: normalized.settings.mode || prev.mode, adultConfirmed: true }))
      setScreen('test')
    } catch (error) {
      window.alert(error.message || 'Could not import that file.')
    }
  }

  const handleCompareClick = () => compareFileInputRef.current?.click()

  const handleCompareImport = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      const normalized = normalizeResponsePayload(catalog, data)
      setPartnerResponse(normalized)
    } catch (error) {
      window.alert(error.message || 'Could not compare that file.')
    }
  }

  const comparison = useMemo(() => partnerResponse ? compareResponses(catalog, { answers, categoryGates, negotiationPreferences }, partnerResponse) : null, [answers, categoryGates, negotiationPreferences, partnerResponse])

  const handleReset = () => {
    if (!window.confirm('Delete all locally stored answers and restart? This cannot be undone unless you exported a copy.')) return
    clearState()
    setAnswers({})
    setCategoryGates({})
    setNegotiationPreferences({})
    setSettings(initialSettings)
    setCurrentCategoryId(catalog.categories[0]?.id)
    setScreen('welcome')
  }

  const handlePrintPdf = () => {
    window.print()
  }

  return (
    <div className="app-root">
      <input ref={fileInputRef} type="file" accept="application/json,.json" className="sr-only" onChange={handleImport} />
      <input ref={compareFileInputRef} type="file" accept="application/json,.json" className="sr-only" onChange={handleCompareImport} />

      <button
        type="button"
        className="theme-toggle no-print"
        aria-label="Toggle theme"
        onClick={() => setSettings((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
      >
        {settings.theme === 'dark' ? '☼' : '◐'}
      </button>

      {screen === 'welcome' && (
        <Welcome
          settings={settings}
          setSettings={setSettings}
          onStart={() => setScreen('test')}
          onImport={handleImportClick}
        />
      )}

      {screen === 'test' && (
        <TestView
          catalog={catalog}
          answers={answers}
          setAnswer={setAnswer}
          categoryGates={categoryGates}
          setCategoryGate={setCategoryGate}
          negotiationPreferences={negotiationPreferences}
          setNegotiationPreferences={setNegotiationPreferences}
          settings={settings}
          setSettings={setSettings}
          currentCategoryId={currentCategoryId}
          setCurrentCategoryId={setCurrentCategoryId}
          onResults={() => setScreen('results')}
          onExport={handleExportJson}
          onImport={handleImportClick}
          onReset={handleReset}
        />
      )}

      {screen === 'results' && (
        <ResultsView
          catalog={catalog}
          answers={answers}
          categoryGates={categoryGates}
          negotiationPreferences={negotiationPreferences}
          onBack={() => setScreen('test')}
          onExportJson={handleExportJson}
          onPrintPdf={handlePrintPdf}
          comparison={comparison}
          onCompareJson={handleCompareClick}
          onClearComparison={() => setPartnerResponse(null)}
        />
      )}

      <PrintReport catalog={catalog} answers={answers} categoryGates={categoryGates} negotiationPreferences={negotiationPreferences} />
    </div>
  )
}
