import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { Context } from '@deepseek-ai/cordis'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import * as provider from './provider.ts'
import * as tool from './tool.ts'

const ctx = new Context()
const report: string[] = []
try {
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  const providerFiber = ctx.plugin(provider, { entries: { seam: 'Definition + Provider + Consumer' } })
  await providerFiber
  const toolFiber = ctx.plugin(tool)
  await toolFiber
  assert(ctx.tools.schemas().some(schema => schema.name === 'study_lookup'))

  const observed: boolean[] = []
  await ctx.plugin((observerCtx: Context) => {
    observerCtx.on('tools/result', (_exec, result) => {
      observed.push(result.isError)
      return undefined
    })
  })
  let wrappers = 0
  const wrapperFiber = ctx.plugin((wrapperCtx: Context) => {
    wrapperCtx.on('tools/execute', async (_exec, next) => {
      wrappers += 1
      return next()
    })
  })
  await wrapperFiber

  let sequence = 0
  const call = (args: unknown, signal = new AbortController().signal) => ctx.tools.execute({
    callId: ToolCallId(`study-${++sequence}`), name: 'study_lookup', arguments: args, signal,
  })

  const known = await call({ term: 'seam' })
  assert.equal(known.isError, false)
  assert.deepEqual(known.value, { term: 'seam', definition: 'Definition + Provider + Consumer' })
  report.push('PASS: real registry returns the canonical object for a known term')
  const missing = await call({ term: 'unknown' })
  assert.equal(missing.isError, false)
  assert.deepEqual(missing.value, { term: 'unknown', definition: null })
  report.push('PASS: an absent term is a successful domain outcome')
  assert.equal((await call({ term: 42 })).isError, true)
  assert.equal((await call({ term: '   ' })).isError, true)
  report.push('PASS: type validation and domain validation reject invalid arguments')
  const controller = new AbortController()
  controller.abort()
  const beforeAbort = wrappers
  assert.equal((await call({ term: 'seam' }, controller.signal)).isError, true)
  assert.equal(wrappers, beforeAbort)
  report.push('PASS: pre-aborted execution skips the tool dispatch')
  assert(observed.includes(true) && observed.includes(false))
  report.push('PASS: tools/result observes normalized successes and errors')

  await wrapperFiber.dispose()
  const afterWrapperDispose = wrappers
  await call({ term: 'seam' })
  assert.equal(wrappers, afterWrapperDispose)
  report.push('PASS: unloading the middleware removes its event listener')

  await providerFiber.dispose()
  await toolFiber.await()
  assert(!ctx.tools.schemas().some(schema => schema.name === 'study_lookup'))
  report.push('PASS: removing the required provider unregisters the dependent tool')
  const replacement = ctx.plugin(provider, { entries: { seam: 'A replacement backend' } })
  await replacement
  await toolFiber.await()
  assert.deepEqual((await call({ term: 'seam' })).value, { term: 'seam', definition: 'A replacement backend' })
  report.push('PASS: replacing the provider reactivates the unchanged consumer')
} finally {
  await ctx.fiber.dispose()
}
await writeFile(new URL('./verification.txt', import.meta.url), report.join('\n') + '\n')
console.log(report.join('\n'))
