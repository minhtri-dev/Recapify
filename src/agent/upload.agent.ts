import { llm } from "@services/ollama.service"

import { ScraperTool } from "./tools/scraper.tool";
import { PdfTool } from "./tools/pdf.tool";

//TODO: Determine which llm to use here
export const agent = llm.bindTools([ScraperTool, PdfTool])