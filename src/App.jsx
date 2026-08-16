import { useEffect, useMemo, useState } from 'react'
import fantasyProfile from './data/fantasyProfile.json'
import activityCatalog from './data/activityCatalog.json'
import ProductNav from './components/product/ProductNav.jsx'
import Home from './components/product/Home.jsx'
import MyProfile from './components/product/MyProfile.jsx'
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
import { addThemeDeepDive, answerFantasyQuestion, fantasyProgress, goToFantasyQuestion, restartFantasyProfile, startFantasyProfile } from './lib/fantasyRouting.js'
import { buildFantasyResults } from './lib/fantasyResults.js'
import { createAppState, normalizeAppState, resolveAppRoute, withActivityState, withFantasyState } from './lib/appState.js'
import { loadAppState, saveAppState } from './lib/appStorage.js'
import { buildActivityCategorySuggestions } from './lib/activityRecommendations.js'
import { buildFantasyRealityObservations } from './lib/profileIntegration.js'
import { buildDebugAnswerExport, buildPartnerShareExport, buildPrivateBackup, jsonDownloadName } from './lib/profileExports.js'
import { updatePlayPreferences } from './lib/playPreferences.js'
import {
  clearActivityAnswer,
  setActivityDetails,
  setActivityExperience,
  setActivityNote,
  setActivityStance,
  toggleHiddenActivity,
  toggleSkippedCategory,
  updateActivityNavigation,
  focusUnansweredActivities,
} from './lib/activityProfile.js'

function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
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
  const [appState, setAppState] = useState(() => normalizeAppState(fantasyProfile, activityCatalog, loadAppState()) || createAppState(fantasyProfile, activityCatalog))
  const { fantasy, basics, activities, playPreferences, settings } = appState

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  useEffect(() => {
    saveAppState(appState)
  }, [appState])

  const fantasyResults = useMemo(() => buildFantasyResults(fantasyProfile, fantasy.answers), [fantasy.answers])
  const progress = useMemo(() => fantasyProgress(fantasyProfile, fantasy), [fantasy])
  const activityCategorySuggestions = useMemo(
    () => fantasy.status === 'complete' ? buildActivityCategorySuggestions(activityCatalog, fantasyProfile, fantasy.answers) : [],
    [fantasy.status, fantasy.answers],
  )
  const observations = useMemo(
    () => fantasy.status === 'complete' ? buildFantasyRealityObservations(activityCatalog, fantasyResults, activities) : [],
    [fantasy.status, fantasyResults, activities],
  )

  const scrollTop = () => window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
  const navigate = (route, updates = {}) => {
    setAppState((prev) => {
      const next = { ...prev, ...updates }
      return { ...next, route: resolveAppRoute(route, next.settings) }
    })
    scrollTop()
  }

  const updateSettings = (patch) => setAppState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  const updateActivity = (updater, route = appState.route) => {
    setAppState((prev) => withActivityState(prev, updater(prev.activities), route))
  }

  const handleStartFantasy = () => {
    const next = startFantasyProfile(fantasyProfile, fantasy)
    setAppState((prev) => ({
      ...withFantasyState(prev, next, prev.basics?.complete ? 'fantasy_questions' : 'basics'),
      basics: prev.basics?.complete ? prev.basics : { ...prev.basics, nextRoute: 'fantasy_questions' },
    }))
    scrollTop()
  }

  const handleStartActivities = (categoryId = null) => {
    setAppState((prev) => {
      let nextActivities = prev.activities
      if (categoryId) {
        if (categoryId === 'all') {
          nextActivities = updateActivityNavigation(prev.activities, {
            categoryId: 'all',
            entryCategoryId: 'all',
            adaptiveHiddenCategoryIds: [],
            search: '',
            stanceFilter: 'all',
            experienceFilter: 'all',
            answerFilter: 'all',
            depth: 'all',
            showHidden: true,
          })
        } else {
          const currentSuggestions = prev.fantasy.status === 'complete'
            ? buildActivityCategorySuggestions(activityCatalog, fantasyProfile, prev.fantasy.answers)
            : []
          const suggestedIds = new Set(currentSuggestions.map((row) => row.category.id))
          suggestedIds.add(categoryId)
          const adaptiveHiddenCategoryIds = currentSuggestions.length > 0
            ? activityCatalog.categories.filter((row) => !suggestedIds.has(row.id)).map((row) => row.id)
            : []
          nextActivities = updateActivityNavigation(prev.activities, {
            categoryId,
            entryCategoryId: categoryId,
            adaptiveHiddenCategoryIds,
            skippedCategoryIds: (prev.activities.navigation?.skippedCategoryIds || []).filter((id) => id !== categoryId),
            search: '',
            stanceFilter: 'all',
            experienceFilter: 'all',
            answerFilter: 'all',
            depth: 'all',
            showHidden: false,
          })
        }
      }
      return {
        ...prev,
        activities: nextActivities,
        route: prev.basics?.complete ? resolveAppRoute('activity_explorer', prev.settings) : 'basics',
        basics: prev.basics?.complete ? prev.basics : { ...prev.basics, nextRoute: 'activity_explorer' },
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
        basics: { ...prev.basics, complete: true, nextRoute: null },
      }
    })
    scrollTop()
  }

  const handleAnswer = (response) => {
    const questionId = fantasy.questionSequence[fantasy.currentIndex]
    const next = answerFantasyQuestion(fantasyProfile, fantasy, questionId, response)
    setAppState((prev) => withFantasyState(prev, next, next.status === 'complete' ? 'fantasy_results' : 'fantasy_questions'))
    if (next.status === 'complete') scrollTop()
  }

  const handleRestart = () => {
    if (!window.confirm('Start Fantasy Profile over? Your fantasy answers will be cleared, but your Activity Explorer answers will stay.')) return
    setAppState((prev) => ({ ...prev, fantasy: restartFantasyProfile(fantasyProfile), selectedThemeId: null, route: 'fantasy_intro' }))
    scrollTop()
  }

  const handleOpenTheme = (dimensionId) => navigate('fantasy_theme', { selectedThemeId: dimensionId })
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
        currentIndex: Math.max(0, Math.min(prev.fantasy.currentIndex + delta, prev.fantasy.questionSequence.length - 1)),
      },
    }))
    scrollTop()
  }

  const exportPrivate = () => {
    const payload = buildPrivateBackup(appState, fantasyProfile, activityCatalog, { fantasyResults })
    downloadJson(payload, jsonDownloadName('private'))
  }
  const exportPartner = (includePlayPreferences = false) => {
    const payload = buildPartnerShareExport(appState, activityCatalog, { includePlayPreferences })
    downloadJson(payload, jsonDownloadName('partner'))
  }
  const exportDebugAnswers = () => {
    const payload = buildDebugAnswerExport(appState, fantasyProfile, activityCatalog)
    downloadJson(payload, jsonDownloadName('debug'))
  }

  return (
    <div className="app-root fantasy-app-root">
      <ProductNav route={appState.route} onNavigate={navigate} />
      <button
        type="button"
        className="theme-toggle no-print"
        aria-label="Toggle theme"
        onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
      >
        {settings.theme === 'dark' ? '☼' : '◐'}
      </button>

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

      {appState.route === 'basics' && (
        <Basics
          values={basics?.values || {}}
          onChange={(patch) => setAppState((prev) => ({ ...prev, basics: { ...prev.basics, values: { ...(prev.basics?.values || {}), ...patch } } }))}
          onContinue={handleBasicsContinue}
          onBack={() => navigate(basics?.nextRoute === 'activity_explorer' ? 'activity_intro' : 'fantasy_intro')}
        />
      )}

      {appState.route === 'fantasy_intro' && (
        <FantasyIntro profile={fantasyProfile} fantasy={fantasy} adultConfirmed={settings.adultConfirmed} onAdultConfirmed={(value) => updateSettings({ adultConfirmed: value })} onStart={handleStartFantasy} onResume={handleStartFantasy} onResults={() => navigate('fantasy_results')} onActivity={() => navigate('activity_intro')} />
      )}

      {appState.route === 'fantasy_questions' && (
        <FantasyQuestionnaire profile={fantasyProfile} fantasy={fantasy} progress={progress} onAnswer={handleAnswer} onBack={() => questionNav(-1)} onNext={() => questionNav(1)} onLeave={() => navigate('fantasy_intro')} onRestart={handleRestart} />
      )}

      {appState.route === 'fantasy_results' && (
        <FantasyResults profile={fantasyProfile} answers={fantasy.answers} results={fantasyResults} onOpenTheme={handleOpenTheme} onReview={() => navigate('fantasy_review')} onRestart={handleRestart} onActivity={() => navigate('activity_intro')} />
      )}

      {appState.route === 'fantasy_theme' && (
        <FantasyThemeDetail profile={fantasyProfile} answers={fantasy.answers} dimensionId={appState.selectedThemeId} onBack={() => navigate('fantasy_results')} onOpenTheme={handleOpenTheme} onExploreMore={handleExploreMore} />
      )}

      {appState.route === 'fantasy_review' && (
        <FantasyAnswerReview profile={fantasyProfile} fantasy={fantasy} onBack={() => navigate('fantasy_results')} onEdit={handleEdit} />
      )}

      {appState.route === 'activity_intro' && (
        <ActivityIntro catalog={activityCatalog} activity={activities} fantasyComplete={fantasy.status === 'complete'} categorySuggestions={activityCategorySuggestions} adultConfirmed={settings.adultConfirmed} onAdultConfirmed={(value) => updateSettings({ adultConfirmed: value })} onStart={handleStartActivities} onResume={() => handleStartActivities()} onResults={() => navigate('activity_results')} onFantasy={() => navigate('fantasy_intro')} />
      )}

      {appState.route === 'activity_explorer' && (
        <ActivityExplorer
          catalog={activityCatalog}
          activityState={activities}
          onNavigation={(patch) => updateActivity((current) => updateActivityNavigation(current, patch), 'activity_explorer')}
          onStance={(activityId, stance) => updateActivity((current) => setActivityStance(current, activityId, stance), 'activity_explorer')}
          onExperience={(activityId, experience) => updateActivity((current) => setActivityExperience(current, activityId, experience), 'activity_explorer')}
          onDetails={(activityId, details) => updateActivity((current) => setActivityDetails(current, activityId, details), 'activity_explorer')}
          onNote={(activityId, note) => updateActivity((current) => setActivityNote(current, activityId, note), 'activity_explorer')}
          onClear={(activityId) => updateActivity((current) => clearActivityAnswer(current, activityId), 'activity_explorer')}
          onToggleHidden={(activityId) => updateActivity((current) => toggleHiddenActivity(current, activityId), 'activity_explorer')}
          onToggleSkipped={(categoryId) => updateActivity((current) => toggleSkippedCategory(current, categoryId), 'activity_explorer')}
          onResults={() => navigate('activity_results')}
          onPlayPreferences={() => navigate('activity_play_preferences')}
        />
      )}

      {appState.route === 'activity_results' && (
        <ActivityResults catalog={activityCatalog} activityState={activities} playPreferences={playPreferences} onBack={() => navigate('activity_explorer')} onUnanswered={() => updateActivity((current) => focusUnansweredActivities(current), 'activity_explorer')} onIntro={() => navigate('activity_intro')} onPlayPreferences={() => navigate('activity_play_preferences')} onPartnerExport={exportPartner} />
      )}

      {appState.route === 'activity_play_preferences' && (
        <PlayPreferences values={playPreferences} onChange={(patch) => setAppState((prev) => ({ ...prev, playPreferences: updatePlayPreferences(prev.playPreferences, patch) }))} onBack={() => navigate('activity_explorer')} />
      )}

      {appState.route === 'profile' && (
        <MyProfile
          catalog={activityCatalog}
          fantasyComplete={fantasy.status === 'complete'}
          fantasyResults={fantasyResults}
          activities={activities}
          playPreferences={playPreferences}
          observations={observations}
          onFantasy={() => navigate(fantasy.status === 'complete' ? 'fantasy_results' : 'fantasy_intro')}
          onActivities={() => handleStartActivities()}
          onPrivateExport={exportPrivate}
          onDebugExport={exportDebugAnswers}
          onPartnerExport={exportPartner}
          onPrintPrivate={() => window.print()}
        />
      )}
    </div>
  )
}
