import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('../../../../../', import.meta.url))
const requireFromRepo = createRequire(resolve(root, 'package.json'))
const ts = requireFromRepo('typescript')
const raw = ts.readConfigFile(resolve(root, 'tsconfig.base.json'), ts.sys.readFile)
if (raw.error) throw new Error(ts.flattenDiagnosticMessageText(raw.error.messageText, '\n'))
const parsed = ts.parseJsonConfigFileContent(raw.config, ts.sys, root)
const paths = Object.fromEntries(Object.entries(parsed.options.paths).map(([name, candidates]) => [
  name,
  candidates.map(candidate => resolve(root,
    candidate.includes('/examples/') ? candidate : candidate.replace('/src', '/lib/types').replace(/\.ts$/, '.d.ts'))),
]))
const files = ['service.ts', 'provider.ts', 'tool.ts', 'verify.ts', 'trace.ts', 'scopes.ts']
  .map(name => fileURLToPath(new URL(name, import.meta.url)))
const options = {
  ...parsed.options, paths, noEmit: true, composite: false, incremental: false,
  declaration: false, declarationMap: false, sourceMap: false,
  typeRoots: [resolve(root, 'node_modules/@types')],
}
const program = ts.createProgram(files, options)
const diagnostics = ts.getPreEmitDiagnostics(program)
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCurrentDirectory: () => root,
    getCanonicalFileName: name => name,
    getNewLine: () => '\n',
  }))
  process.exitCode = 1
} else {
  console.log('PASS: six example TypeScript files checked against the built Host declarations with repository strict options')
}
