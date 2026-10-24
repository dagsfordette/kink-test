import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const images = JSON.parse(readFileSync(new URL('../src/data/activityImages.json', import.meta.url)))
const catalog = JSON.parse(readFileSync(new URL('../src/data/activityCatalog.json', import.meta.url)))

test('example images map to real activities and ship with credits and local WebP assets', () => {
  const ids = new Set(catalog.activities.map((a) => a.id))
  assert.equal(new Set(images.map((image) => image.id)).size, images.length)
  for (const image of images) {
    assert.match(image.src, /^activity-images\/[a-z0-9-]+\.webp$/)
    for (const field of ['alt', 'caption', 'title', 'credit', 'license', 'changes', 'verifiedOn'])
      assert.ok(image[field]?.trim(), `${image.id}: missing ${field}`)
    for (const field of ['sourceUrl', 'licenseUrl']) assert.equal(new URL(image[field]).protocol, 'https:')
    assert.ok(image.width > 0 && image.height > 0)
    assert.ok(image.activityIds.length)
    assert.equal(new Set(image.activityIds).size, image.activityIds.length)
    for (const id of image.activityIds) assert.ok(ids.has(id), `${image.id}: unknown activity ${id}`)
    const bytes = readFileSync(new URL(`../public/${image.src}`, import.meta.url))
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF')
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP')
  }
})
