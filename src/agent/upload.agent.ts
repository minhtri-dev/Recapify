import { llm } from "@services/ollama.service"

import { ScraperTool } from "./tools/scraper.tool";

export const agent = llm.bindTools([ScraperTool])