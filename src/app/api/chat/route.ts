import { llm } from '@services/openai.service';
import { agent } from '@agent/agent'
import { NextRequest, NextResponse } from 'next/server';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    // Convert messages to LangChain format
    const langchainMessages = messages?.map((msg: any) => {
      switch (msg.role) {
        case 'user':
          return new HumanMessage(msg.content);
        case 'assistant':
          return new AIMessage(msg.content);
        case 'system':
          return new SystemMessage(msg.content);
        default:
          return new HumanMessage(msg.content);
      }
    }) || [new HumanMessage('Hello! Tell me about yourself.')];

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const streamResponse = await llm.stream(langchainMessages);
          
          for await (const chunk of streamResponse) {
            const content = chunk.content;
            if (content) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}