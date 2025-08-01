import { expect, test } from 'vitest'

import { llm } from "@services/openai.service";

test('Check OpenAI service invocation', async () => {
    const res = await llm.invoke("Tell me a fun fact about space.");
    console.log(res);
    expect(res.content).not.toBeNull();
});