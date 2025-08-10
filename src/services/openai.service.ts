import { ChatOpenAI } from '@langchain/openai'

import '@env.config'

export const llm = new ChatOpenAI({
  model: process.env.OPENAI_MODEL || 'gpt-4o',
  temperature: 0.2,
  maxTokens: 16384,
  streaming: true,
  openAIApiKey: process.env.OPENAI_API_KEY,
})
