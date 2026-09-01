import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const root = process.cwd()
const distDirectory = path.join(root, 'dist')
const baselinePath = path.join(root, 'config', 'bundle-baseline.json')
const warningThreshold = 500_000

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const resolved = path.join(directory, entry.name)
    return entry.isDirectory() ? filesBelow(resolved) : [resolved]
  }))
  return files.flat().sort()
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0)
}

function format(bytes) {
  return `${bytes.toLocaleString('en-US')} bytes`
}

let baseline
try {
  baseline = JSON.parse(await readFile(baselinePath, 'utf8'))
  await stat(distDirectory)
} catch (error) {
  console.error(`Bundle baseline check could not read its inputs: ${error.message}`)
  console.error('Run npm run build before npm run check:bundle.')
  process.exit(1)
}

const emittedFiles = await filesBelow(distDirectory)
const javascript = []
const css = []
for (const file of emittedFiles) {
  if (!file.endsWith('.js') && !file.endsWith('.css')) continue
  const contents = await readFile(file)
  const measurement = { raw: contents.byteLength, gzip: gzipSync(contents, { level: 9 }).byteLength }
  ;(file.endsWith('.js') ? javascript : css).push(measurement)
}

if (javascript.length === 0) {
  console.error('Bundle baseline check found no JavaScript in dist/.')
  process.exit(1)
}

const measured = {
  totalJsRawBytes: sum(javascript.map(({ raw }) => raw)),
  totalJsGzipBytes: sum(javascript.map(({ gzip }) => gzip)),
  largestJsRawBytes: Math.max(...javascript.map(({ raw }) => raw)),
  largestJsGzipBytes: Math.max(...javascript.map(({ gzip }) => gzip)),
  totalCssRawBytes: sum(css.map(({ raw }) => raw)),
  totalCssGzipBytes: sum(css.map(({ gzip }) => gzip)),
  jsChunkCount: javascript.length,
  jsChunksAbove500kB: javascript.filter(({ raw }) => raw > warningThreshold).length,
}

console.log('Bundle measurements (deterministic gzip level 9):')
for (const [key, value] of Object.entries(measured)) {
  console.log(`  ${key}: ${key.endsWith('Bytes') ? format(value) : value}`)
}

const failures = []
for (const [metric, ceiling] of Object.entries(baseline.ceilings)) {
  if (measured[metric] > ceiling) failures.push(`${metric}: ${format(measured[metric])} exceeds ${format(ceiling)}`)
}
if (failures.length > 0) {
  console.error('\nBundle regression ceiling exceeded:')
  failures.forEach((failure) => console.error(`  - ${failure}`))
  process.exit(1)
}
console.log('\nBundle regression check passed.')
