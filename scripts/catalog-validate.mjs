#!/usr/bin/env node
import path from 'node:path'
import { loadCatalog, validateCatalog, validationExitCode } from './catalog-audit-lib.mjs'

const catalogPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(process.cwd(), 'src/data/catalog.json')
const catalog = loadCatalog(catalogPath)
const findings = validateCatalog(catalog)
const errors = findings.filter((finding) => finding.severity === 'error')
const warnings = findings.filter((finding) => finding.severity === 'warning')

console.log(`Catalog validation: ${errors.length} error(s), ${warnings.length} warning(s)`)
const grouped = new Map()
for (const finding of findings) {
  const key = `${finding.severity}:${finding.code}`
  grouped.set(key, (grouped.get(key) || 0) + 1)
}
for (const [key, count] of [...grouped.entries()].sort()) console.log(`- ${key} (${count})`)
if (errors.length) {
  console.error('\nFatal findings:')
  for (const finding of errors.slice(0, 50)) console.error(`- [${finding.code}] ${finding.message}`)
}
process.exitCode = validationExitCode(findings)
