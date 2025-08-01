import { ChatOpenAI } from "@langchain/openai";

import '@env.config';

export const llm = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.2,
    maxTokens: 1000,
    streaming: true,
    openAIApiKey:  process.env.OPENAI_API_KEY,
});

