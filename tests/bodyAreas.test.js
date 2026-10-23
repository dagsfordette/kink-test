import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { suggestedBodyModel } from '../src/lib/bodyAreas.js'
import { normalizeExploration } from '../src/lib/explorationState.js'
const catalog = JSON.parse(fs.readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))
test('self illustration follows explicit anatomy and leaves unknown or mixed facts open', () => {
  const self = (anatomy) => suggestedBodyModel('self', { exploration: { facts: { self: { anatomy } } } })
  assert.equal(self({ penis: 'present', vagina: 'absent' }), 'male')
  assert.equal(self({ vagina: 'present' }), 'female')
  assert.equal(self({ penis: 'present', vagina: 'present' }), null)
  assert.equal(self({}), null)
})
test('partner illustration uses partner preferences independently of self anatomy', () => {
  const partner = (attraction) => suggestedBodyModel('partner', { attraction, exploration: { facts: { self: { anatomy: { penis: 'present' } } } } })
  assert.equal(partner({ partnerGender: ['women'] }), 'female')
  assert.equal(partner({ partnerGender: ['men'], partnerAnatomy: ['vagina'] }), 'male')
  assert.equal(partner({ partnerAnatomy: ['vulva_clitoris'] }), 'female')
  assert.equal(partner({ partnerAnatomy: ['penis'] }), 'male')
  assert.equal(partner({ partnerGender: ['men', 'women'] }), null)
  assert.equal(partner({ partnerAnatomy: ['penis', 'vagina'] }), null)
  assert.equal(partner({ partnerAnatomy: ['penis', 'depends_person'] }), null)
  assert.equal(partner({}), null)
})
test('manual model selections persist independently and invalid values reset to automatic', () => {
  assert.deepEqual(normalizeExploration({ bodyMapModels: { self: 'male', partner: 'female' } }, catalog).bodyMapModels, { self: 'male', partner: 'female' })
  assert.deepEqual(normalizeExploration({ bodyMapModels: { self: 'invalid' } }, catalog).bodyMapModels, { self: 'auto', partner: 'auto' })
})
