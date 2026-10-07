import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type {} from './service.ts'

export const name = 'study-terms-tool'
export const inject = ['tools', 'studyTerms']

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: 'study_lookup',
    description: 'Look up a project concept in the configured study glossary.',
    parameters: {
      term: { type: 'string', required: true, description: 'Project concept to look up' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          term: { type: 'string', required: true },
          definition: { oneOf: [{ type: 'string' }, { type: 'null' }], required: true },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: value.definition === null
          ? `No definition for ${value.term}.`
          : `${value.term}: ${value.definition}`,
      }],
    },
    async execute(args, exec) {
      const term = args.term.trim()
      if (term.length === 0) throw new Error('term must not be blank')
      return { term, definition: await ctx.studyTerms.lookup(term, exec.signal) }
    },
  }))
}
