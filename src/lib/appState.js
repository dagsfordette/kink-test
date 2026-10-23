export const PROFILE_VERSION = 4

import { normalizeExploration, createExploration } from './explorationState.js'
import { createFantasyState, reconcileFantasyState } from './fantasyRouting.js'
import {
  createActivityState,
  normalizeActivityState
} from './activityProfile.js'
import {
  createPlayPreferences,
  normalizePlayPreferences
} from './playPreferences.js'
import { createBasicsProfile, normalizeBasicsProfile } from './basicsProfile.js'

const ROUTES = new Set([
  'home',
  'fantasy_intro',
  'fantasy_questions',
  'fantasy_results',
  'fantasy_theme',
  'fantasy_review',
  'activity_intro',
  'activity_explorer',
  'activity_results',
  'activity_play_preferences',
  'about_you',
  'basics',
  'profile'
])

export function resolveAppRoute(route, settings = {}) {
  const safeRoute = ROUTES.has(route) ? route : 'home'
  if (safeRoute === 'activity_explorer' && settings?.adultConfirmed !== true)
    return 'activity_intro'
  return safeRoute
}

export function createAppState(fantasyProfile, activityCatalog) {
  return {
    profileVersion: PROFILE_VERSION,
    exploration: createExploration(),
    route: 'home',
    settings: {
      theme: 'dark',
      adultConfirmed: false
    },
    selectedThemeId: null,
    fantasy: createFantasyState(fantasyProfile),
    basics: createBasicsProfile(),
    activities: createActivityState(activityCatalog),
    playPreferences: createPlayPreferences()
  }
}

export function normalizeAppState(fantasyProfile, activityCatalog, saved) {
  const clean = createAppState(fantasyProfile, activityCatalog)
  if (!saved || saved.profileVersion !== PROFILE_VERSION) return clean

  return {
    ...clean,
    exploration: normalizeExploration(saved.exploration, activityCatalog),
    route: resolveAppRoute(saved.route, {
      adultConfirmed: saved.settings?.adultConfirmed === true
    }),
    settings: {
      ...clean.settings,
      theme: saved.settings?.theme === 'light' ? 'light' : 'dark',
      adultConfirmed: saved.settings?.adultConfirmed === true
    },
    selectedThemeId:
      typeof saved.selectedThemeId === 'string' ? saved.selectedThemeId : null,
    fantasy: reconcileFantasyState(
      fantasyProfile,
      saved.fantasy || clean.fantasy
    ),
    basics: normalizeBasicsProfile(saved.basics),
    activities: normalizeActivityState(activityCatalog, saved.activities),
    playPreferences: normalizePlayPreferences(saved.playPreferences)
  }
}

export function withFantasyState(appState, fantasy, route = appState.route) {
  return { ...appState, route, fantasy }
}

export function withActivityState(
  appState,
  activities,
  route = appState.route
) {
  return {
    ...appState,
    route: resolveAppRoute(route, appState.settings),
    activities
  }
}
