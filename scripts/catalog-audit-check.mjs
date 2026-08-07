#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { buildAudit, loadCatalog, renderAuditMarkdown } from './catalog-audit-lib.mjs'

const root = process.cwd()
const catalog = loadCatalog(path.join(root, 'src/data/catalog.json'))
const audit = buildAudit(catalog)
const expected = new Map([
  [path.join(root, 'reports/catalog-audit.json'), `${JSON.stringify(audit, null, 2)}\n`],
  [path.join(root, 'reports/catalog-audit.md'), renderAuditMarkdown(audit)],
])

let stale = false
for (const [filePath, content] of expected) {
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null
  if (current !== content) {
    console.error(`Audit baseline is stale: ${path.relative(root, filePath)}`)
    stale = true
  }
}

if (stale) {
  console.error('Run `npm run audit` and commit the regenerated baseline.')
  process.exitCode = 1
} else {
  console.log('Audit baseline matches the current catalog.')
}
