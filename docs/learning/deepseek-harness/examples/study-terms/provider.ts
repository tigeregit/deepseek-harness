import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { StudyTerms } from './service.ts'

export const name = 'study-terms-memory'

export interface Config {
  entries: Record<string, string>
}

export const Config: Schema<Config> = Schema.object({
  entries: Schema.dict(String).required(),
})

class MemoryStudyTerms extends StudyTerms {
  constructor(ctx: Context, private readonly config: Config) {
    super(ctx)
  }

  async lookup(term: string, signal: AbortSignal): Promise<string | null> {
    signal.throwIfAborted()
    return this.config.entries[term] ?? null
  }
}

export function apply(ctx: Context, config: Config) {
  ctx.plugin(MemoryStudyTerms, config)
}
