import BoundaryReview from './components/activities/BoundaryReview.jsx'
import { flushSync } from 'react-dom'
import { fantasyEvidence } from './lib/eligibility.js'
import { reviewBoundaries } from './lib/boundaryReview.js'
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
import { eraseAppState, loadAppState, saveAppState } from './lib/appStorage.js'
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
  saveActivityEdit,
  undoActivityEdit,
  setActivityDetails,
  setActivityExperience,
  setActivityNote,
  setActivityStance,
  updateActivityNavigation,
  focusUnansweredActivities,
  focusActivityForReview,
  prepareActivityExplorerState
} from './lib/activityProfile.js'

const COLLECTION_CATEGORIES = { 'material-interests': 'fetish_materials', 'roleplay-interests': 'roleplay', 'context-interests': 'sexual_context', 'feature-interests': 'body_features', 'tattoo-interests': 'tattoo_interests', 'sensory-interests': 'sensory_fetishes', 'scent-interests': 'body_scent', 'toy-interests': 'toys_devices' }

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
  const [appState, setAppState] = useState(() =>
    normalizeAppState(fantasyProfile, activityCatalog, loadAppState())
  )
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
      fantasyEvidence: evidence,
      attraction: basics.values
    }),
    [storedActivities, appState.exploration, evidence, basics.values]
  )
  const boundaryCount = useMemo(() => reviewBoundaries(activityCatalog, activities).blockers.length, [activities])
  const skipNextSave = useRef(false)
  const [printingPrivate, setPrintingPrivate] = useState(false)
  const [printIncludePlayPreferences, setPrintIncludePlayPreferences] =
    useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    saveAppState(appState)
  }, [appState])

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
    if (route === 'activity_intro' && settings.adultConfirmed) { handleStartActivities(); return }
    setAppState((prev) => {
      const next = { ...prev, ...updates }
      return { ...next, route: resolveAppRoute(route, next.settings, next.basics),
        basics: route === 'activity_explorer' && (!next.basics.aboutYouComplete || !next.basics.complete) ? { ...next.basics, nextRoute: 'activity_explorer' } : next.basics }
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
      if (!hasProgress && nextActivities.navigation.categoryId === 'all') nextActivities.navigation.categoryId = categoryOrder[0]
      return {
        ...prev,
        exploration: { ...prev.exploration, session: null },
        activities: nextActivities,
        route: resolveAppRoute(
          !prev.basics.aboutYouComplete
            ? 'about_you'
            : !prev.basics.complete
              ? 'basics'
              : 'activity_explorer',
          prev.settings
        ),
        basics: { ...prev.basics, nextRoute: 'activity_explorer' }
      }
    })
    scrollTop()
  }

  const handleAboutYouContinue = (facts) => {
    setAppState((prev) => {
      const nextRoute = prev.basics?.complete
        ? prev.basics?.nextRoute || 'home'
        : 'basics'
      return {
        ...prev,
        exploration: facts ? { ...prev.exploration, facts } : prev.exploration,
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

  const eraseAllData = () => {
    if (
      !window.confirm(
        'Erase ALL answers, notes, settings, and profiles saved in this browser? This cannot be undone. Download any private or debug export you want to keep first.'
      )
    )
      return
    try {
      eraseAppState()
    } catch {
      window.alert(
        'Browser storage could not be cleared. No data was erased. Check your browser settings and try again.'
      )
      return
    }
    skipNextSave.current = true
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

  return (
    <div className="app-root fantasy-app-root">
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
          ['activity_results', 'profile'].includes(
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
            onSave={handleAboutYouContinue}
            onContinue={() => handleAboutYouContinue()}
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
                  saveActivityEdit(current, activityId, (draft) =>
                    setActivityStance(draft, activityId, stance)
                  ),
                'activity_explorer'
              )
            }
            onExperience={(activityId, experience) =>
              updateActivity(
                (current) =>
                  saveActivityEdit(current, activityId, (draft) =>
                    setActivityExperience(draft, activityId, experience)
                  ),
                'activity_explorer'
              )
            }
            onDetails={(activityId, details) =>
              updateActivity(
                (current) =>
                  saveActivityEdit(current, activityId, (draft) =>
                    setActivityDetails(draft, activityId, details)
                  ),
                'activity_explorer'
              )
            }
            onNote={(activityId, note) =>
              updateActivity(
                (current) =>
                  saveActivityEdit(current, activityId, (draft) =>
                    setActivityNote(draft, activityId, note)
                  ),
                'activity_explorer'
              )
            }
            onUndo={() => updateActivity(undoActivityEdit, 'activity_explorer')}
            boundaryCount={boundaryCount}
            onClear={(activityId) =>
              updateActivity(
                (current) => clearActivityAnswer(current, activityId),
                'activity_explorer'
              )
            }
            onResults={() => navigate('activity_results')}
            onPause={() => navigate('home')}
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
            onEdit={(activityId) => Object.hasOwn(COLLECTION_CATEGORIES, activityId)
              ? setAppState(prev => ({ ...prev, route: 'activity_explorer',
                  activities: { ...prev.activities, navigation: { ...prev.activities.navigation, reviewActivityId: null, categoryId: COLLECTION_CATEGORIES[activityId] } },
                  exploration: { ...prev.exploration, guided: { ...prev.exploration.guided, topicId: COLLECTION_CATEGORIES[activityId], trail: [], cursor: -1, pendingPreference: null, done: false, flowComplete: false } }
                }))
              : updateActivity(
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
            onEditBody={() => navigate('about_you', { basics: { ...basics, nextRoute: 'profile' } })}
            onEditAttraction={() => navigate('basics', { basics: { ...basics, nextRoute: 'profile' } })}
            onPlayPreferences={() => navigate('activity_play_preferences')}
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
