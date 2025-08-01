import { Ollama } from "@langchain/ollama";

import '@env.config';

export const llm = new Ollama({
    baseUrl: process.env.OLLAMA_BASE_URL,
    model: process.env.OLLAMA_MODEL,
    headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.OLLAMA_USERNAME}:${process.env.OLLAMA_PASSWORD}`).toString('base64')}`
    }
})