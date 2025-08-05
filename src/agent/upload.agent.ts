import { llm } from "@services/ollama.service"

import { ScraperTool } from "./tools/langchain.scraper.tool";

export const agent = llm.bindTools([ScraperTool])