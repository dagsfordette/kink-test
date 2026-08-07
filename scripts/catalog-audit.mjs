#!/usr/bin/env node
import path from 'node:path'
import { buildAudit, loadCatalog, writeAuditFiles } from './catalog-audit-lib.mjs'

const root = process.cwd()
const catalogPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'src/data/catalog.json')
const outputDir = process.argv[3] ? path.resolve(process.argv[3]) : path.join(root, 'reports')
const catalog = loadCatalog(catalogPath)
const audit = buildAudit(catalog)
const { jsonPath, mdPath } = writeAuditFiles(audit, outputDir)

console.log(`Catalog audit: ${audit.summary.totalConcepts} concepts across ${audit.summary.totalCategories} categories`)
console.log(`Validation: ${audit.summary.errors} error(s), ${audit.summary.warnings} warning(s)`)
console.log(`Machine-readable: ${path.relative(root, jsonPath)}`)
console.log(`Human-readable:   ${path.relative(root, mdPath)}`)
