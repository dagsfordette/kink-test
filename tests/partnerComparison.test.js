import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import React, { useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { createAppState } from '../src/lib/appState.js'
import { buildPartnerShareExport } from '../src/lib/profileExports.js'
import { PLAY_PREFERENCE_FIELDS } from '../src/lib/playPreferences.js'

const load = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url)))

function find(node, predicate) {
  if (!node || typeof node !== 'object') return null
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = find(child, predicate)
      if (match) return match
    }
    return null
  }
  return predicate(node) ? node : find(node.props?.children, predicate)
}

test('partner comparison renders explicitly shared preferences and distinguishes omitted from empty', async () => {
  const catalog = load('activityCatalog'), fantasy = load('fantasyProfile')
  const own = createAppState(fantasy, catalog), partner = createAppState(fantasy, catalog)
  own.activities.answers.give_massage = { stance: 'want' }
  partner.activities.answers.receive_massage = { stance: 'want', note: 'PRIVATE_NOTE', details: { conditions: 'PRIVATE_DETAIL' } }
  for (const [id] of PLAY_PREFERENCE_FIELDS)
    partner.playPreferences[id] = `SHARED_${id}`
  partner.playPreferences.stopSignals += '\nPause & stop <here>'
  const server = await createServer({
    root: fileURLToPath(new URL('../', import.meta.url)),
    configFile: false,
    esbuild: { jsx: 'automatic' },
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false }
  })
  try {
    const { default: PartnerComparison } = await server.ssrLoadModule('/src/components/activities/PartnerComparison.jsx')
    const render = (payload) => {
      function Flow() {
        const step = useRef(0)
        // Exercise the actual paste and compare callbacks through render-phase updates.
        const view = PartnerComparison({ catalog, activityState: { ...own.activities, exploration: own.exploration } })
        if (step.current === 0) {
          step.current++
          find(view, (n) => n.type === 'textarea' && !n.props.readOnly).props.onChange({ target: { value: JSON.stringify(payload) } })
        } else if (step.current === 1) {
          step.current++
          find(view, (n) => n.type === 'button' && n.props.children === 'Compare answers').props.onClick()
        }
        return view
      }
      return renderToStaticMarkup(React.createElement(Flow))
    }
    const html = render(buildPartnerShareExport(partner, catalog, { includePlayPreferences: true }))
    assert.ok(html.includes('activity-comparison-results'))
    for (const [id, label] of PLAY_PREFERENCE_FIELDS) {
      assert.ok(html.includes(`SHARED_${id}`), id)
      assert.ok(html.includes(label), label)
    }
    assert.ok(html.includes('\nPause &amp; stop &lt;here&gt;'))
    assert.ok(html.indexOf('SHARED_stopSignals') < html.indexOf('activity-comparison-summary'))
    assert.ok(!html.includes('PRIVATE_NOTE') && !html.includes('PRIVATE_DETAIL'))
    const omitted = render(buildPartnerShareExport(partner, catalog))
    assert.ok(omitted.includes('did not include Play Preferences'))
    assert.ok(!omitted.includes('SHARED_'))
    partner.playPreferences = { aftercare: '   ' }
    const empty = render(buildPartnerShareExport(partner, catalog, { includePlayPreferences: true }))
    assert.ok(empty.includes('shared this section without any entries'))
    assert.ok(!empty.includes('did not include Play Preferences'))
  } finally {
    await server.close()
  }
})
