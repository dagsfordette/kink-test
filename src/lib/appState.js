import { createFantasyState, reconcileFantasyState } from './fantasyRouting.js'
import { createActivityState, normalizeActivityState } from './activityProfile.js'
import { createPlayPreferences, normalizePlayPreferences } from './playPreferences.js'

export const APP_VERSION = '2.0.0'

const ROUTES = new Set([
  'home',
  'fantasy_intro', 'fantasy_questions', 'fantasy_results', 'fantasy_theme', 'fantasy_review',
  'activity_intro', 'activity_explorer', 'activity_results', 'activity_play_preferences',
  'profile',
])


export function resolveAppRoute(route, settings = {}) {
  const safeRoute = ROUTES.has(route) ? route : 'home'
  if (safeRoute === 'activity_explorer' && settings?.adultConfirmed !== true) return 'activity_intro'
  return safeRoute
}

export function createAppState(fantasyProfile, activityCatalog = null) {
  return {
    version: APP_VERSION,
    route: 'home',
    settings: {
      theme: 'dark',
      adultConfirmed: false,
    },
    selectedThemeId: null,
    fantasy: createFantasyState(fantasyProfile),
    activities: createActivityState(activityCatalog),
    playPreferences: createPlayPreferences(),
    relevancePreferences: {
      recommendationMaxItems: 10,
    },
  }
}

export function normalizeAppState(fantasyProfile, activityCatalog, saved) {
  const clean = createAppState(fantasyProfile, activityCatalog)
  if (!saved || saved.version !== APP_VERSION) return clean

  const recommendationMaxItems = Number(saved.relevancePreferences?.recommendationMaxItems)
  return {
    ...clean,
    route: resolveAppRoute(saved.route, { adultConfirmed: Boolean(saved.settings?.adultConfirmed) }),
    settings: {
      theme: saved.settings?.theme === 'light' ? 'light' : 'dark',
      adultConfirmed: Boolean(saved.settings?.adultConfirmed),
    },
    selectedThemeId: typeof saved.selectedThemeId === 'string' ? saved.selectedThemeId : null,
    fantasy: reconcileFantasyState(fantasyProfile, saved.fantasy || clean.fantasy),
    activities: normalizeActivityState(activityCatalog, saved.activities),
    playPreferences: normalizePlayPreferences(saved.playPreferences),
    relevancePreferences: {
      recommendationMaxItems: Number.isFinite(recommendationMaxItems)
        ? Math.max(4, Math.min(16, Math.round(recommendationMaxItems)))
        : clean.relevancePreferences.recommendationMaxItems,
    },
  }
}

export function withFantasyState(appState, fantasy, route = appState.route) {
  return { ...appState, route, fantasy }
}

export function withActivityState(appState, activities, route = appState.route) {
  return { ...appState, route: resolveAppRoute(route, appState.settings), activities }
}
