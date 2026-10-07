import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const repo = fileURLToPath(new URL('../../../../', import.meta.url))
const requireFromRepo = createRequire(resolve(repo, 'package.json'))
const { fromMarkdown } = await import(requireFromRepo.resolve('mdast-util-from-markdown'))
const { JSDOM } = await import(requireFromRepo.resolve('jsdom'))
const dom = new JSDOM('')
globalThis.window = dom.window
globalThis.document = dom.window.document
const { default: mermaid } = await import(requireFromRepo.resolve('mermaid'))
mermaid.initialize({ startOnLoad: false })

async function discover(dir) {
  const files = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name)
    if (entry.isDirectory()) files.push(...await discover(path))
    else if (entry.name.endsWith('.md')) files.push(path)
  }
  return files
}

let links = 0
let diagrams = 0
const failures = []
const files = await discover(root)
for (const file of files) {
  const content = await readFile(file, 'utf8')
  if (!content.endsWith('\n') || content.endsWith('\n\n')) failures.push(`${file}: trailing newline`)
  const tree = fromMarkdown(content)
  async function visit(node) {
    if ((node.type === 'link' || node.type === 'image' || node.type === 'definition') && node.url) {
      const target = node.url
      if (!/^[a-z]+:/i.test(target) && !target.startsWith('#')) {
        links += 1
        const path = resolve(dirname(file), decodeURIComponent(target.split('#')[0]))
        try { await stat(path) } catch { failures.push(`${file}: missing ${target}`) }
      }
    }
    if (node.type === 'code' && node.lang === 'mermaid') {
      diagrams += 1
      try { await mermaid.parse(node.value) } catch (error) { failures.push(`${file}: ${error.message}`) }
    }
    if (node.children) for (const child of node.children) await visit(child)
  }
  await visit(tree)
}
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  const report = `PASS: ${files.length} Markdown files, ${links} local links, ${diagrams} Mermaid diagrams, and trailing newlines\n`
  await writeFile(resolve(root, 'doc-verification.txt'), report)
  console.log(report.trim())
}
dom.window.close()
