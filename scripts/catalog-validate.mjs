import { readFileSync } from 'node:fs'
import { validateCatalog } from './catalog-validation.mjs'

const catalog = JSON.parse(readFileSync(new URL('../src/data/catalog.json', import.meta.url), 'utf8'))
const errors = validateCatalog(catalog)

if (errors.length) {
  console.error(`Catalog validation failed with ${errors.length} error(s):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`Catalog validation passed: ${catalog.concepts.length} current concepts across ${catalog.categories.length} categories.`)
}
