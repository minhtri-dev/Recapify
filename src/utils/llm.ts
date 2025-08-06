import { llm } from '@services/ollama.service'

/**
 * Generate a summary from multiple sources using the LLM
 */
export async function generateSummary(
  sources: Array<{ id: number; content: string; url: string | null }>,
  customTitle?: string
): Promise<string> {
  // Prepare the sources text
  const sourcesText = sources.map((source, index) => {
    const sourceHeader = source.url 
      ? `Source ${index + 1} (${source.url}):`
      : `Source ${index + 1}:`
    
    return `${sourceHeader}\n${source.content}\n`
  }).join('\n---\n\n')

  // Create the prompt for the LLM
  const prompt = `You are a research assistant tasked with creating a comprehensive summary from multiple sources. 

Please analyze the following sources and create a well-structured summary that:
1. Captures the key points from all sources
2. Identifies common themes and patterns
3. Highlights any contrasting viewpoints or conflicting information
4. Provides a coherent synthesis of the information
5. Is organized with clear headings and bullet points where appropriate

${customTitle ? `Focus the summary around this topic: "${customTitle}"` : ''}

Sources to summarize:

${sourcesText}

Please provide a comprehensive summary that synthesizes the information from all sources above:`

  try {
    // Generate the summary using the LLM
    const response = await llm.invoke(prompt)
    
    // Extract the content from the response
    const summaryContent = typeof response.content === 'string' 
      ? response.content.trim()
      : 'Summary generation failed - no content returned'

    if (!summaryContent || summaryContent.length < 50) {
      throw new Error('Generated summary is too short or empty')
    }

    // Add metadata header to the summary
    const finalSummary = `# ${customTitle || 'Multi-Source Summary'}

*Generated from ${sources.length} source${sources.length > 1 ? 's' : ''} on ${new Date().toLocaleDateString()}*

${summaryContent}

---

## Sources Referenced:
${sources.map((source, index) => 
  `${index + 1}. ${source.url || `Source ${source.id}`}`
).join('\n')}
`

    return finalSummary

  } catch (error) {
    console.error('LLM summary generation failed:', error)
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}