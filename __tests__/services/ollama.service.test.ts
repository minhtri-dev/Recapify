import { expect, test } from 'vitest'

import { llm } from '@services/ollama.service'

test('Check Ollama service invocation', async () => {
  const res = await llm.invoke(
    'Tell me a fun fact about space. In less than 10 words.',
  )
  console.log(res)
  expect(res).not.toBeNull()
}, 30000)
