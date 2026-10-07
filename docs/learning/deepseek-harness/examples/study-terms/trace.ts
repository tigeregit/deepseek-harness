import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { Context } from '@deepseek-ai/cordis'
import { createUserMessage, LlmAdapter, ToolCallId } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import { mountAgentLoopTestDependencies, mountAgentLoopTestHarness } from '@deepseek-ai/dsh-agent-loop-testkit'
import * as provider from './provider.ts'
import * as tool from './tool.ts'

/** 只替换模型端：实际 AgentLoop、Inbox、工具和 Session 仍使用项目源码。 */
class ScriptedAdapter extends LlmAdapter {
  readonly requests: GenerateOptions[] = []

  async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    options.signal?.throwIfAborted()
    this.requests.push(options)
    if (this.requests.length === 1) {
      yield { type: 'block-start', index: 0, blockType: 'tool-call' }
      yield { type: 'block-end', index: 0, block: {
        type: 'tool-call', id: ToolCallId('study-trace-call'),
        name: 'study_lookup', arguments: '{"term":"seam"}',
      } }
      yield { type: 'finish', reason: { kind: 'tool-calls' } }
    } else {
      assert(options.messages.some(message => message.role === 'tool'))
      const text = 'A seam includes Definition, Provider, and Consumer.'
      yield { type: 'block-start', index: 0, blockType: 'text' }
      yield { type: 'text-delta', index: 0, text }
      yield { type: 'block-end', index: 0, block: { type: 'text', text } }
      yield { type: 'finish', reason: { kind: 'stop' } }
    }
  }
}

const ctx = new Context()
try {
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(provider, { entries: { seam: 'Definition + Provider + Consumer' } })
  await ctx.plugin(tool)
  const adapter = new ScriptedAdapter()
  ctx.llm.registerAdapter(['study-scripted'], adapter)
  const harness = await mountAgentLoopTestHarness(ctx)
  const agent = await harness.create(SessionId('study-trace'), { provider: 'study-scripted', model: 'scripted' })
  agent.followup(createUserMessage({ content: [{ type: 'text', text: 'What is a seam?' }], source: { kind: 'user' } }))
  await agent.whenIdle()
  assert.equal(adapter.requests.length, 2)
  const events = agent.session.snapshotEvents()
  assert.equal(events.filter(event => event.type === 'turn/start').length, 1)
  assert.equal(events.filter(event => event.type === 'step/start').length, 2)
  const ending = events.findLast(event => event.type === 'turn/end')
  if (ending?.type === 'turn/end' && ending.data.reason.kind !== 'completed') {
    console.log(JSON.stringify(ending.data.reason, null, 2))
  }
  assert(ending?.type === 'turn/end' && ending.data.reason.kind === 'completed')
  assert.equal(events.filter(event => event.type === 'tool/result').length, 1)
  const lines = events.map(event => `${event.seq} ${event.type}`)
  await writeFile(new URL('./trace.txt', import.meta.url), lines.join('\n') + '\n')
  console.log(lines.join('\n'))
  console.log('PASS: one turn, two real steps, and a tool result in the second request')
} finally {
  await ctx.fiber.dispose()
}
