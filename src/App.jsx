import BoundaryReview from './components/activities/BoundaryReview.jsx'
import { flushSync } from 'react-dom'
import { fantasyEvidence } from './lib/eligibility.js'
import { recordSessionAction } from './lib/explorationSessions.js'
import { parsePrivateBackup } from './lib/profileExports.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import fantasyProfile from './data/fantasyProfile.json'
import activityCatalog from './data/activityCatalog.json'
import ProductNav from './components/product/ProductNav.jsx'
import Home from './components/product/Home.jsx'
import MyProfile, {
  PrivateProfileReport
} from './components/product/MyProfile.jsx'
import PartnerPrintReport from './components/product/PartnerPrintReport.jsx'
import AboutYou from './components/product/AboutYou.jsx'
import Basics from './components/product/Basics.jsx'
import FantasyIntro from './components/fantasy/FantasyIntro.jsx'
import FantasyQuestionnaire from './components/fantasy/FantasyQuestionnaire.jsx'
import FantasyResults from './components/fantasy/FantasyResults.jsx'
import FantasyThemeDetail from './components/fantasy/FantasyThemeDetail.jsx'
import FantasyAnswerReview from './components/fantasy/FantasyAnswerReview.jsx'
import ActivityIntro from './components/activities/ActivityIntro.jsx'
import ActivityExplorer from './components/activities/ActivityExplorer.jsx'
import ActivityResults from './components/activities/ActivityResults.jsx'
import PlayPreferences from './components/activities/PlayPreferences.jsx'
import {
  addThemeDeepDive,
  answerFantasyQuestion,
  fantasyProgress,
  activeFantasyAnswers,
  goToFantasyQuestion,
  restartFantasyProfile,
  startFantasyProfile
} from './lib/fantasyRouting.js'
import { buildFantasyResults } from './lib/fantasyResults.js'
import {
  createAppState,
  normalizeAppState,
  resolveAppRoute,
  withActivityState,
  withFantasyState
} from './lib/appState.js'
import { createAppStorage, STORAGE_KEY } from './lib/appStorage.js'
import { buildActivityCategorySuggestions } from './lib/activityRecommendations.js'
import { buildFantasyRealityObservations } from './lib/profileIntegration.js'
import {
  buildDebugAnswerExport,
  buildPartnerShareExport,
  buildPrivateBackup,
  jsonDownloadName
} from './lib/profileExports.js'
import { updatePlayPreferences } from './lib/playPreferences.js'
import {
  clearActivityAnswer,
  editActivityDraft,
  discardActivityDraft,
  saveActivityDraft,
  undoActivitySave,
  setActivityDetails,
  setActivityExperience,
  setActivityNote,
  setActivityStance,
  toggleHiddenActivity,
  updateActivityNavigation,
  focusUnansweredActivities,
  focusActivityForReview,
  prepareActivityExplorerState
} from './lib/activityProfile.js'

function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json'
  })
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
  const [storage] = useState(() => createAppStorage())
  const [appState, setAppState] = useState(() =>
    normalizeAppState(fantasyProfile, activityCatalog, storage.load())
  )
  const [storageStatus, setStorageStatus] = useState(() => storage.check())
  const {
    fantasy,
    basics,
    activities: storedActivities,
    playPreferences,
    settings
  } = appState
  const evidence = useMemo(
    () => fantasyEvidence(fantasyProfile, fantasy),
    [fantasy]
  )
  const activities = useMemo(
    () => ({
      ...storedActivities,
      exploration: appState.exploration,
      fantasyEvidence: evidence
    }),
    [storedActivities, appState.exploration, evidence]
  )
  const skipNextSave = useRef(false)
  const lastState = useRef(appState)
  const [printingPrivate, setPrintingPrivate] = useState(false)
  const [printIncludePlayPreferences, setPrintIncludePlayPreferences] =
    useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  useEffect(() => {
    if (lastState.current === appState) return
    lastState.current = appState
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    storage.save(appState).then(() => reportStorageStatus(storage.check()))
  }, [appState])

  function reportStorageStatus(status) {
    if (status === 'erased') {
      skipNextSave.current = true
      setAppState(createAppState(fantasyProfile, activityCatalog))
    }
    setStorageStatus(status)
  }

  useEffect(() => {
    const check = () => reportStorageStatus(storage.check())
    const changed = (event) => {
      if (event.key === STORAGE_KEY || event.key === null) check()
    }
    window.addEventListener('storage', changed)
    window.addEventListener('focus', check)
    return () => {
      window.removeEventListener('storage', changed)
      window.removeEventListener('focus', check)
    }
  }, [storage])

  const activeAnswers = useMemo(() => activeFantasyAnswers(fantasy), [fantasy])
  const fantasyResults = useMemo(
    () => buildFantasyResults(fantasyProfile, activeAnswers),
    [activeAnswers]
  )
  const progress = useMemo(
    () => fantasyProgress(fantasyProfile, fantasy),
    [fantasy]
  )
  const observations = useMemo(
    () =>
      fantasy.status === 'complete'
        ? buildFantasyRealityObservations(
            activityCatalog,
            fantasyResults,
            activities
          )
        : [],
    [fantasy.status, fantasyResults, activities]
  )

  const scrollTop = () =>
    window.requestAnimationFrame(() =>
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    )
  const navigate = (route, updates = {}) => {
    setAppState((prev) => {
      const next = { ...prev, ...updates }
      return { ...next, route: resolveAppRoute(route, next.settings) }
    })
    scrollTop()
  }

  const updateSettings = (patch) =>
    setAppState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch }
    }))
  const updateActivity = (updater, route = appState.route) => {
    setAppState((prev) => {
      const result = updater({
        ...prev.activities,
        exploration: prev.exploration
      })
      const { exploration, ...nextActivities } = result
      return {
        ...withActivityState(prev, nextActivities, route),
        exploration: exploration || prev.exploration
      }
    })
  }

  const handleStartFantasy = () => {
    const next = startFantasyProfile(fantasyProfile, fantasy)
    setAppState((prev) => {
      const setupRoute = !prev.basics?.aboutYouComplete
        ? 'about_you'
        : !prev.basics?.complete
          ? 'basics'
          : 'fantasy_questions'
      return {
        ...withFantasyState(prev, next, setupRoute),
        basics:
          setupRoute === 'fantasy_questions'
            ? prev.basics
            : { ...prev.basics, nextRoute: 'fantasy_questions' }
      }
    })
    scrollTop()
  }

  const handleStartActivities = (mode = 'resume') => {
    setAppState((prev) => {
      const currentSuggestions =
        prev.fantasy.status === 'complete'
          ? buildActivityCategorySuggestions(
              activityCatalog,
              fantasyProfile,
              activeFantasyAnswers(prev.fantasy)
            )
          : []
      const suggestedIds = currentSuggestions.map((row) => row.category.id)
      const defaultIds = activityCatalog.categories.map((row) => row.id)
      const categoryOrder = [...new Set([...suggestedIds, ...defaultIds])]
      const hasProgress = Object.keys(prev.activities.answers || {}).length > 0
      const nextActivities = prepareActivityExplorerState(
        activityCatalog,
        prev.activities,
        {
          categoryOrder,
          resetView: mode === 'start' && !hasProgress
        }
      )
      return {
        ...prev,
        activities: nextActivities,
        route: resolveAppRoute('activity_explorer', prev.settings)
      }
    })
    scrollTop()
  }

  const handleAboutYouContinue = () => {
    setAppState((prev) => {
      const nextRoute = prev.basics?.complete
        ? prev.basics?.nextRoute || 'home'
        : 'basics'
      return {
        ...prev,
        route: resolveAppRoute(nextRoute, prev.settings),
        basics: {
          ...prev.basics,
          aboutYouComplete: true,
          nextRoute: prev.basics?.complete ? null : prev.basics?.nextRoute
        }
      }
    })
    scrollTop()
  }

  const handleBasicsContinue = () => {
    setAppState((prev) => {
      const nextRoute = prev.basics?.nextRoute || 'home'
      return {
        ...prev,
        route: resolveAppRoute(nextRoute, prev.settings),
        basics: { ...prev.basics, complete: true, nextRoute: null }
      }
    })
    scrollTop()
  }

  const handleAnswer = (response) => {
    const questionId = fantasy.questionSequence[fantasy.currentIndex]
    const next = answerFantasyQuestion(
      fantasyProfile,
      fantasy,
      questionId,
      response
    )
    setAppState((prev) =>
      withFantasyState(
        prev,
        next,
        next.status === 'complete' ? 'fantasy_results' : 'fantasy_questions'
      )
    )
    if (next.status === 'complete') scrollTop()
  }

  const handleRestart = () => {
    if (
      !window.confirm(
        'Start Fantasy Profile over? Your fantasy answers will be cleared, but your Activity Explorer answers will stay.'
      )
    )
      return
    setAppState((prev) => ({
      ...prev,
      fantasy: restartFantasyProfile(fantasyProfile),
      selectedThemeId: null,
      route: 'fantasy_intro'
    }))
    scrollTop()
  }

  const handleOpenTheme = (dimensionId) =>
    navigate('fantasy_theme', { selectedThemeId: dimensionId })
  const handleExploreMore = (dimensionId) => {
    const next = addThemeDeepDive(fantasyProfile, fantasy, dimensionId)
    if (next.questionSequence.length === fantasy.questionSequence.length) return
    setAppState((prev) => withFantasyState(prev, next, 'fantasy_questions'))
    scrollTop()
  }
  const handleEdit = (questionId) => {
    const next = goToFantasyQuestion(fantasyProfile, fantasy, questionId)
    setAppState((prev) => withFantasyState(prev, next, 'fantasy_questions'))
    scrollTop()
  }
  const questionNav = (delta) => {
    setAppState((prev) => ({
      ...prev,
      fantasy: {
        ...prev.fantasy,
        currentIndex: Math.max(
          0,
          Math.min(
            prev.fantasy.currentIndex + delta,
            prev.fantasy.questionSequence.length - 1
          )
        )
      }
    }))
    scrollTop()
  }

  const eraseAllData = async () => {
    if (
      !window.confirm(
        'Erase ALL answers, notes, settings, and profiles saved in this browser? This cannot be undone. Download any private or debug export you want to keep first.'
      )
    )
      return
    const result = await storage.erase()
    if (result !== 'ready') {
      reportStorageStatus(result)
      if (result === 'unavailable')
        window.alert(
          'Browser storage could not be cleared. No data was erased. Check your browser settings and try again.'
        )
      return
    }
    skipNextSave.current = true
    setStorageStatus('ready')
    setAppState(createAppState(fantasyProfile, activityCatalog))
    scrollTop()
  }

  const exportPrivate = () => {
    const payload = buildPrivateBackup(
      appState,
      fantasyProfile,
      activityCatalog
    )
    downloadJson(payload, jsonDownloadName('private'))
  }
  const exportPartner = (includePlayPreferences = false) => {
    try {
      const payload = buildPartnerShareExport(
        { ...appState, activities },
        activityCatalog,
        { includePlayPreferences }
      )
      downloadJson(payload, jsonDownloadName('partner'))
    } catch (err) {
      window.alert(err.message)
    }
  }
  const exportDebugAnswers = () => {
    const payload = buildDebugAnswerExport(
      appState,
      fantasyProfile,
      activityCatalog
    )
    downloadJson(payload, jsonDownloadName('debug'))
  }

  if (storageStatus === 'conflict' || storageStatus === 'erased') {
    return (
      <main className="fantasy-shell">
        <section className="fantasy-intro-card" role="alert">
          <h1>{storageStatus === 'erased' ? 'Profile erased in another tab' : 'Newer profile found in another tab'}</h1>
          <p>This tab has stopped saving. Reload to continue with the current profile.</p>
          {storageStatus === 'conflict' && (
            <>
              <p>Any work still in this tab can be downloaded as a private backup before reloading.</p>
              <button type="button" onClick={exportPrivate}>Download this tab’s private backup</button>
            </>
          )}
          <button type="button" className="primary-button" onClick={() => window.location.reload()}>
            Reload current profile
          </button>
        </section>
      </main>
    )
  }

  return (
    <div className="app-root fantasy-app-root">
      {storageStatus === 'unavailable' && (
        <section className="boundary-review no-print" role="alert">
          <strong>Changes are only kept in this tab. Browser saving is unavailable.</strong>
          <p>Download a private backup before closing or reloading.</p>
          <button type="button" onClick={exportPrivate}>Download private backup</button>
        </section>
      )}
      <div className="app-workspace">
        <ProductNav route={appState.route} onNavigate={navigate} />
        <button
          type="button"
          className="theme-toggle no-print"
          aria-label="Toggle theme"
          onClick={() =>
            updateSettings({
              theme: settings.theme === 'dark' ? 'light' : 'dark'
            })
          }
        >
          {settings.theme === 'dark' ? '☼' : '◐'}
        </button>

        {settings.adultConfirmed &&
          ['activity_explorer', 'activity_results', 'profile'].includes(
            appState.route
          ) && (
            <BoundaryReview
              catalog={activityCatalog}
              state={activities}
              onChange={(fn) => updateActivity(fn)}
              onEdit={(id) =>
                updateActivity(
                  (s) => focusActivityForReview(s, activityCatalog, id),
                  'activity_explorer'
                )
              }
            />
          )}
        {appState.route === 'home' && (
          <Home
            fantasy={fantasy}
            activities={activities}
            onFantasy={() => navigate('fantasy_intro')}
            onFantasyResults={() => navigate('fantasy_results')}
            onActivities={() => navigate('activity_intro')}
            onActivityResults={() => navigate('activity_results')}
            onProfile={() => navigate('profile')}
          />
        )}

        {appState.route === 'about_you' && (
          <AboutYou
            facts={appState.exploration.facts}
            onFacts={(facts) =>
              setAppState((prev) => ({
                ...prev,
                exploration: { ...prev.exploration, facts }
              }))
            }
            onContinue={handleAboutYouContinue}
            onBack={() =>
              navigate(
                basics?.nextRoute === 'activity_explorer'
                  ? 'activity_intro'
                  : 'fantasy_intro'
              )
            }
          />
        )}

        {appState.route === 'basics' && (
          <Basics
            values={basics?.values || {}}
            onChange={(patch) =>
              setAppState((prev) => ({
                ...prev,
                basics: {
                  ...prev.basics,
                  values: { ...(prev.basics?.values || {}), ...patch }
                }
              }))
            }
            onContinue={handleBasicsContinue}
            onBack={() => navigate('about_you')}
          />
        )}

        {appState.route === 'fantasy_intro' && (
          <FantasyIntro
            profile={fantasyProfile}
            fantasy={fantasy}
            adultConfirmed={settings.adultConfirmed}
            onAdultConfirmed={(value) =>
              updateSettings({ adultConfirmed: value })
            }
            onStart={handleStartFantasy}
            onResume={handleStartFantasy}
            onResults={() => navigate('fantasy_results')}
            onActivity={() => navigate('activity_intro')}
          />
        )}

        {appState.route === 'fantasy_questions' && (
          <FantasyQuestionnaire
            profile={fantasyProfile}
            fantasy={fantasy}
            progress={progress}
            onAnswer={handleAnswer}
            onBack={() => questionNav(-1)}
            onNext={() => questionNav(1)}
            onLeave={() => navigate('fantasy_intro')}
            onRestart={handleRestart}
          />
        )}

        {appState.route === 'fantasy_results' && (
          <FantasyResults
            profile={fantasyProfile}
            answers={activeAnswers}
            results={fantasyResults}
            onOpenTheme={handleOpenTheme}
            onReview={() => navigate('fantasy_review')}
            onRestart={handleRestart}
            onActivity={() => navigate('activity_intro')}
          />
        )}

        {appState.route === 'fantasy_theme' && (
          <FantasyThemeDetail
            profile={fantasyProfile}
            answers={activeAnswers}
            dimensionId={appState.selectedThemeId}
            onBack={() => navigate('fantasy_results')}
            onOpenTheme={handleOpenTheme}
            onExploreMore={handleExploreMore}
          />
        )}

        {appState.route === 'fantasy_review' && (
          <FantasyAnswerReview
            profile={fantasyProfile}
            fantasy={fantasy}
            onBack={() => navigate('fantasy_results')}
            onEdit={handleEdit}
          />
        )}

        {appState.route === 'activity_intro' && (
          <ActivityIntro
            activity={activities}
            adultConfirmed={settings.adultConfirmed}
            onAdultConfirmed={(value) =>
              updateSettings({ adultConfirmed: value })
            }
            onStart={() => handleStartActivities('start')}
            onResume={() => handleStartActivities('resume')}
            onResults={() => navigate('activity_results')}
          />
        )}

        {appState.route === 'activity_explorer' && (
          <ActivityExplorer
            catalog={activityCatalog}
            activityState={activities}
            onExploration={(exploration) =>
              setAppState((prev) => ({ ...prev, exploration }))
            }
            onNavigation={(patch) =>
              updateActivity(
                (current) => updateActivityNavigation(current, patch),
                'activity_explorer'
              )
            }
            onStance={(activityId, stance) =>
              updateActivity(
                (current) =>
                  editActivityDraft(current, activityId, (draft) =>
                    setActivityStance(draft, activityId, stance)
                  ),
                'activity_explorer'
              )
            }
            onExperience={(activityId, experience) =>
              updateActivity(
                (current) =>
                  editActivityDraft(current, activityId, (draft) =>
                    setActivityExperience(draft, activityId, experience)
                  ),
                'activity_explorer'
              )
            }
            onDetails={(activityId, details) =>
              updateActivity(
                (current) =>
                  editActivityDraft(current, activityId, (draft) =>
                    setActivityDetails(draft, activityId, details)
                  ),
                'activity_explorer'
              )
            }
            onNote={(activityId, note) =>
              updateActivity(
                (current) =>
                  editActivityDraft(current, activityId, (draft) =>
                    setActivityNote(draft, activityId, note)
                  ),
                'activity_explorer'
              )
            }
            onSave={(activityId) =>
              updateActivity((current) => {
                const next = saveActivityDraft(current, activityId)
                return {
                  ...next,
                  exploration: recordSessionAction(
                    next.exploration,
                    activityId,
                    'save'
                  )
                }
              }, 'activity_explorer')
            }
            onDiscard={(activityId) =>
              updateActivity(
                (current) => discardActivityDraft(current, activityId),
                'activity_explorer'
              )
            }
            onUndo={() => updateActivity(undoActivitySave, 'activity_explorer')}
            onClear={(activityId) =>
              updateActivity(
                (current) => clearActivityAnswer(current, activityId),
                'activity_explorer'
              )
            }
            onToggleHidden={(activityId) =>
              updateActivity(
                (current) => toggleHiddenActivity(current, activityId),
                'activity_explorer'
              )
            }
            onResults={() => navigate('activity_results')}
            onPlayPreferences={() => navigate('activity_play_preferences')}
          />
        )}

        {appState.route === 'activity_results' && (
          <ActivityResults
            printIncludePlayPreferences={printIncludePlayPreferences}
            onPrintPreferencesChange={setPrintIncludePlayPreferences}
            catalog={activityCatalog}
            activityState={activities}
            playPreferences={playPreferences}
            onBack={() => navigate('activity_explorer')}
            onUnanswered={() =>
              updateActivity(
                (current) => focusUnansweredActivities(current),
                'activity_explorer'
              )
            }
            onEdit={(activityId) =>
              updateActivity(
                (current) =>
                  focusActivityForReview(current, activityCatalog, activityId),
                'activity_explorer'
              )
            }
            onIntro={() => navigate('activity_intro')}
            onPlayPreferences={() => navigate('activity_play_preferences')}
            onPartnerExport={exportPartner}
          />
        )}

        {appState.route === 'activity_play_preferences' && (
          <PlayPreferences
            values={playPreferences}
            onChange={(patch) =>
              setAppState((prev) => ({
                ...prev,
                playPreferences: updatePlayPreferences(
                  prev.playPreferences,
                  patch
                )
              }))
            }
            onBack={() => navigate('activity_explorer')}
          />
        )}

        {appState.route === 'profile' && (
          <MyProfile
            catalog={activityCatalog}
            fantasyComplete={fantasy.status === 'complete'}
            fantasyResults={fantasyResults}
            activities={activities}
            playPreferences={playPreferences}
            observations={observations}
            onFantasy={() =>
              navigate(
                fantasy.status === 'complete'
                  ? 'fantasy_results'
                  : 'fantasy_intro'
              )
            }
            onActivities={() => handleStartActivities()}
            onPrivateExport={exportPrivate}
            onDebugExport={exportDebugAnswers}
            onEraseAllData={eraseAllData}
            onPartnerExport={exportPartner}
            printIncludePlayPreferences={printIncludePlayPreferences}
            onPrintPreferencesChange={setPrintIncludePlayPreferences}
            printingPrivate={printingPrivate}
            onPrintPrivate={() => {
              flushSync(() => setPrintingPrivate(true))
              try {
                window.print()
              } finally {
                flushSync(() => setPrintingPrivate(false))
              }
            }}
            onPrivateImport={async (file) => {
              try {
                const raw = parsePrivateBackup(
                  JSON.parse(await file.text()),
                  activityCatalog,
                  fantasyProfile
                )
                setAppState(
                  normalizeAppState(fantasyProfile, activityCatalog, raw)
                )
                scrollTop()
              } catch (err) {
                window.alert(err.message)
              }
            }}
          />
        )}
      </div>
      <div className="print-surface print-only">
        {printingPrivate ? (
          <PrivateProfileReport
            catalog={activityCatalog}
            fantasyComplete={fantasy.status === 'complete'}
            fantasyResults={fantasyResults}
            activities={activities}
            playPreferences={playPreferences}
          />
        ) : (
          <PartnerPrintReport
            catalog={activityCatalog}
            activities={activities}
            playPreferences={playPreferences}
            includePlayPreferences={printIncludePlayPreferences}
          />
        )}
      </div>
    </div>
  )
}
