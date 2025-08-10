// import { llm } from "@services/ollama.service"
import { llm } from '@services/openai.service'
import { SystemMessage, ToolMessage } from '@langchain/core/messages'

import { LookupTool } from './tools/lookup.tool'
// import { QuizGeneratorTool } from "./tools/quiz.tool";

import { createReactAgent } from '@langchain/langgraph/prebuilt'

const SYSTEM_PROMPT = `You are Recapify, an AI assistant that excels at creating educational summaries and learning materials.

CORE PRINCIPLES:
- Accuracy: Always verify information and cite sources
- Clarity: Use simple language and clear structure
- Engagement: Make content interesting and memorable
- Completeness: Cover all important aspects thoroughly

RESPONSE FORMAT:
- Start with a brief overview
- Use headers and bullet points for organization
- Include examples and analogies when helpful
- End with key takeaways or next steps

TOOL USAGE:
- Use lookup tools to verify facts and gather additional context, however, do not use them to generate content
- Always cite sources when using external information
- Cross-reference multiple sources when possible
- DO NOT SEND ANY CONTEXT FROM THE TOOLS BACK TO THE USER. ONLY USE THEM TO FORMULATE YOUR RESPONSE.

Remember: Your goal is to help users learn and understand complex topics effectively.`

export const agent = createReactAgent({
  llm: llm,
  tools: [LookupTool],
  stateModifier: (state) => {
    const filteredMessages = state.messages.map((message) => {
      // If it's a tool message, add instruction to not repeat content
      if (message._getType() === 'tool') {
        const toolMessage = message as ToolMessage
        return new ToolMessage({
          content: `CONTEXT FOR BACKGROUND USE ONLY - DO NOT QUOTE OR REPEAT: ${toolMessage.content}`,
          tool_call_id: toolMessage.tool_call_id,
          name: toolMessage.name,
        })
      }
      return message
    })

    return [new SystemMessage(SYSTEM_PROMPT), ...filteredMessages]
  },
})

export async function invokeAgent(query: string, context?: string) {
  const messages = []

  if (context) {
    messages.push({
      role: 'user' as const,
      content: `Context: ${context}\n\nQuery: ${query}`,
    })
  } else {
    messages.push({ role: 'user' as const, content: query })
  }

  const response = await agent.invoke({
    messages: messages,
  })

  return response
}

export async function streamAgent(query: string, context?: string) {
  const messages = []

  if (context) {
    messages.push({
      role: 'user' as const,
      content: `Context: ${context}\n\nQuery: ${query}`,
    })
  } else {
    messages.push({ role: 'user' as const, content: query })
  }

  const stream = await agent.stream({
    messages: messages,
  })

  return stream
}
