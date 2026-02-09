/* eslint-disable no-console */

import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

const DEFAULT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'])
const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  '.vite',
  '.turbo',
  '.next',
  'out',
])

function isWhitespaceChar(ch) {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r'
}

function preserveOnlyNewlines(str) {
  let out = ''
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (ch === '\n' || ch === '\r') out += ch
  }
  return out
}

function stripJsxBraceComments(text) {
  let out = ''
  let i = 0

  while (i < text.length) {
    if (text[i] !== '{') {
      out += text[i]
      i++
      continue
    }

    let j = i + 1
    while (j < text.length && isWhitespaceChar(text[j])) j++

    if (text[j] === '/' && text[j + 1] === '*') {
      let k = j + 2
      while (k < text.length - 1 && !(text[k] === '*' && text[k + 1] === '/')) k++

      if (k < text.length - 1) {
        k += 2
        let m = k
        while (m < text.length && isWhitespaceChar(text[m])) m++

        if (text[m] === '}') {
          out += preserveOnlyNewlines(text.slice(i, m + 1))
          i = m + 1
          continue
        }
      }
    }

    out += text[i]
    i++
  }

  return out
}

function isPreservedDirectiveComment(rawCommentText) {
  const trimmed = rawCommentText.trim()

  if (trimmed.startsWith('///')) return true

  const lowered = trimmed.toLowerCase()
  if (lowered.includes('@ts-ignore')) return true
  if (lowered.includes('@ts-expect-error')) return true
  if (lowered.includes('@ts-nocheck')) return true
  if (lowered.includes('@ts-check')) return true

  return false
}

function stripScannerComments(text, languageVariant) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, languageVariant, text)
  const ranges = []

  while (true) {
    const token = scanner.scan()
    if (token === ts.SyntaxKind.EndOfFileToken) break

    if (
      token === ts.SyntaxKind.SingleLineCommentTrivia ||
      token === ts.SyntaxKind.MultiLineCommentTrivia
    ) {
      const start = scanner.getTokenPos()
      const end = scanner.getTextPos()
      const raw = text.slice(start, end)

      if (!isPreservedDirectiveComment(raw)) {
        ranges.push({ start, end })
      }
    }
  }

  if (ranges.length === 0) return text

  let result = text
  for (let i = ranges.length - 1; i >= 0; i--) {
    const { start, end } = ranges[i]
    const segment = result.slice(start, end)
    const replacement = segment.replace(/[^\r\n]/g, ' ')
    result = result.slice(0, start) + replacement + result.slice(end)
  }

  return result
}

async function walk(dir, files) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue
      await walk(fullPath, files)
      continue
    }

    if (!entry.isFile()) continue

    const ext = path.extname(entry.name)
    if (!DEFAULT_EXTENSIONS.has(ext)) continue
    files.push(fullPath)
  }
}

async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const isJsx = ext === '.tsx' || ext === '.jsx'

  const original = await fs.readFile(filePath, 'utf8')

  let updated = original
  if (isJsx) updated = stripJsxBraceComments(updated)

  const languageVariant = isJsx ? ts.LanguageVariant.JSX : ts.LanguageVariant.Standard
  updated = stripScannerComments(updated, languageVariant)

  if (updated !== original) {
    await fs.writeFile(filePath, updated, 'utf8')
    return true
  }

  return false
}

async function main() {
  const args = process.argv.slice(2)
  const targets = args.length ? args : ['src']

  const files = []
  for (const target of targets) {
    const resolved = path.resolve(process.cwd(), target)
    await walk(resolved, files)
  }

  let changed = 0
  for (const file of files) {
    if (path.basename(file) === 'strip-comments.mjs') continue
    const didChange = await processFile(file)
    if (didChange) changed++
  }

  console.log(`Scanned ${files.length} files. Updated ${changed}.`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
