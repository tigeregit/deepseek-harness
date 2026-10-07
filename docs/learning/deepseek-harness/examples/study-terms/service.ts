import { Service, type Context } from '@deepseek-ai/cordis'

declare module '@deepseek-ai/cordis' {
  interface Context {
    studyTerms: StudyTerms
  }
}

/** 学习示例的能力定义。消费者无需知道词条存在哪里。 */
export abstract class StudyTerms extends Service {
  constructor(ctx: Context) {
    super(ctx, 'studyTerms')
  }

  abstract lookup(term: string, signal: AbortSignal): Promise<string | null>
}
