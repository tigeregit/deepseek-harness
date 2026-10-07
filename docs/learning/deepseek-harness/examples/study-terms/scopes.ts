import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { Context } from '@deepseek-ai/cordis'
import { createScope } from '@deepseek-ai/dsh-scope'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime, { defineTool } from '@deepseek-ai/dsh-tools'

const ctx = new Context()
try {
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  await ctx.plugin({
    inject: ['tools'],
    async apply(owner: Context) {
      const parentKey = {}
      const childKey = {}
      const siblingKey = {}
      const parent = createScope(owner, parentKey)
      const child = createScope(owner, childKey, { parent: parentKey })
      const sibling = createScope(owner, siblingKey)
      const register = (owner: Context, description: string) => owner.tools.register(defineTool({
        name: 'study_scoped', description, parameters: {},
        output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
        async execute() { return description },
      }))
      register(owner, 'global')
      register(parent.ctx, 'parent')
      register(child.ctx, 'child')
      const description = (key?: object) => ctx.tools.schemas(key).find(schema => schema.name === 'study_scoped')?.description
      assert.equal(description(), 'global')
      assert.equal(description(parentKey), 'parent')
      assert.equal(description(childKey), 'child')
      assert.equal(description(siblingKey), 'global')
      await child.dispose()
      assert.equal(description(childKey), 'parent')
      await parent.dispose()
      assert.equal(description(parentKey), 'global')
      await sibling.dispose()
      const report = 'PASS: nearest scope shadows ancestors, sibling remains global, and disposal restores inherited visibility\n'
      await writeFile(new URL('./scopes-verification.txt', import.meta.url), report)
      console.log(report.trim())
    },
  })
} finally {
  await ctx.fiber.dispose()
}
