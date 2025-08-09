import { llm } from "@services/ollama.service"
// import { llm } from "@services/openai.service"

import { LookupTool } from "./tools/lookup.tool"
import { QuizGeneratorTool } from "./tools/quiz.tool";

//TODO: Determine which llm to use here and update to have memory and use react agent
export const agent = llm.bindTools([LookupTool, QuizGeneratorTool])