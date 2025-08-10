import { z } from 'zod'

// Types for chat functionality
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface StreamChunk {
  content?: string
  done?: boolean
}

// Schema for validation
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string()
})

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema)
})

// Chat API functions
export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<Response> {
  // Validate input
  const validatedData = ChatRequestSchema.parse({ messages })
  
  const response = await fetch('/api/chat/agent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validatedData)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Chat request failed' }))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  return response
}

export async function* streamChatResponse(
  messages: ChatMessage[],
  signal?: AbortSignal
): AsyncGenerator<StreamChunk, void, unknown> {
  const response = await fetch('/api/chat/agent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
    signal
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Chat request failed' }))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body reader available')
  }

  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        yield { done: true }
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          
          if (data === '[DONE]') {
            yield { done: true }
            return
          }

          if (data) {
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                yield { content: parsed.content }
              }
            } catch (parseError) {
              console.warn('Failed to parse chunk:', data, parseError)
              // Continue processing other chunks
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// Convenience function for streaming with accumulated content
export async function streamChatWithAccumulation(
  messages: ChatMessage[],
  onChunk: (accumulatedContent: string) => void,
  signal?: AbortSignal
): Promise<string> {
  let accumulatedContent = ''
  
  try {
    for await (const chunk of streamChatResponse(messages, signal)) {
      if (chunk.done) {
        break
      }
      
      if (chunk.content) {
        accumulatedContent += chunk.content
        onChunk(accumulatedContent)
      }
    }
    
    return accumulatedContent
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Chat request was aborted')
      throw error
    }
    
    console.error('Chat streaming error:', error)
    throw new Error(error instanceof Error ? error.message : 'Chat request failed')
  }
}

// Helper function to create a properly formatted message
export function createChatMessage(
  role: ChatMessage['role'], 
  content: string
): ChatMessage {
  return { role, content }
}

// Helper function to convert internal message format to API format
export function formatMessagesForAPI(
  messages: Array<{ role: string; content: string }>
): ChatMessage[] {
  return messages.map(msg => ({
    role: msg.role as ChatMessage['role'],
    content: msg.content
  }))
}