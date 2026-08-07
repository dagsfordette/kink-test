import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const workflow = fs.readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8')

test('release gate runs tests, deterministic audit, and production build', () => {
  assert.match(pkg.scripts['release:verify'], /npm test/)
  assert.match(pkg.scripts['release:verify'], /audit:check/)
  assert.match(pkg.scripts['release:check'], /release:verify/)
  assert.match(pkg.scripts['release:check'], /npm run build/)
  assert.match(workflow, /npm run release:check/)
})

test('release regression command includes compatibility, fixtures, import/export, branching, and print/export tests', () => {
  for (const script of ['test:compatibility','test:fixtures','test:response-format','test:user-testing','test:print-export','test:release-process']) assert.ok(pkg.scripts[script], script)
  for (const token of ['test:compatibility','test:fixtures','test:response-format','test:user-testing','test:print-export','test:release-process']) assert.match(pkg.scripts.test, new RegExp(token.replace(':', '\\:')))
})

test('Plan 09 process deliverables are committed', () => {
  for (const file of [
    '../docs/user-test-script.md','../docs/user-test-findings-template.md','../docs/partner-comparison-model.md','../docs/release-checklist.md','../docs/version-and-migration-policy.md','../reports/branching-validation.md','../fixtures/regression-fixtures.json',
  ]) assert.equal(fs.existsSync(new URL(file, import.meta.url)), true, file)
})
