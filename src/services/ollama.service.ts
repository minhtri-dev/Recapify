import { ChatOllama } from '@langchain/ollama'

import '@env.config'

export const llm = new ChatOllama({
  baseUrl: process.env.OLLAMA_BASE_URL,
  model: process.env.OLLAMA_MODEL,
  temperature: 0.2,
  headers: {
    Authorization: `Basic ${Buffer.from(`${process.env.OLLAMA_USERNAME}:${process.env.OLLAMA_PASSWORD}`).toString('base64')}`,
  },
})
