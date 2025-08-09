import { llm } from '@services/ollama.service'
// import { llm } from '@services/openai.service'
import type { QuestionType, Difficulty } from '@schemas/question.model'


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

interface GeneratedQuestion {
  content: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: Difficulty;
}

interface GeneratedQuizData {
  title: string;
  questions: GeneratedQuestion[];
}

/**
 * Generate quiz questions from context using the LLM
 */
export async function generateQuizWithLLM(
  prompt: string,
  context: string,
  questionCount: number,
  questionTypes: QuestionType[],
  difficulty: Difficulty
): Promise<GeneratedQuizData> {
  //TODO: Fix prompt so that distribution of MCQ are more equal
  const systemPrompt = `You are an expert educational content creator. Your task is to generate a comprehensive quiz based on the provided context from user notes.

REQUIREMENTS:
- Generate exactly ${questionCount} questions
- Question types allowed: ${questionTypes.join(', ')}
- Difficulty level: ${difficulty}
- Questions must be based ONLY on the provided context
- Each question should test understanding, not just memorization

QUESTION TYPE GUIDELINES:
- MULTIPLE_CHOICE: Provide 4 options and clearly specify which one is correct
- TRUE_FALSE: Statement that can be definitively answered as true or false
- SHORT_ANSWER: Questions requiring 1-3 word answers or brief explanations

DIFFICULTY GUIDELINES:
- EASY: Basic recall and recognition of concepts
- MEDIUM: Application and understanding of concepts
- HARD: Analysis, synthesis, and evaluation of concepts

MULTIPLE CHOICE FORMAT REQUIREMENT:
For multiple choice questions:
- Provide 4 distinct options
- Clearly specify which option is the correct answer in the correctAnswer field
- Make the 3 incorrect options plausible but clearly wrong to someone who knows the material

FORMAT your response as valid JSON:
{
  "title": "Generated quiz title based on the content",
  "questions": [
    {
      "content": "Question text here",
      "type": "MULTIPLE_CHOICE",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 2",
      "explanation": "Brief explanation of why this is correct",
      "difficulty": "${difficulty}"
    }
  ]
}

IMPORTANT: 
- Base questions ONLY on the provided context
- Ensure all questions are answerable from the context
- Make explanations educational and helpful
- For multiple choice: correctAnswer must exactly match one of the options`

  const userPrompt = `Original request: "${prompt}"

Context from user notes:
${context}

Generate ${questionCount} educational questions of ${difficulty} difficulty using the allowed question types: ${questionTypes.join(', ')}.

CRITICAL INSTRUCTION FOR MULTIPLE CHOICE:
- Provide 4 distinct options
- Set correctAnswer to the exact text of whichever option is correct
- Ensure correctAnswer exactly matches one of the 4 options

Remember to:
1. Base all questions strictly on the provided context
2. Create questions that test understanding of the material
3. Provide clear, unambiguous correct answers
4. Include helpful explanations for learning
5. Format as valid JSON as specified`

  try {
    // Generate the quiz using the LLM
    const response = await llm.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])

    // Extract and parse the JSON response
    const content = typeof response.content === 'string' ? response.content.trim() : ''
    
    if (!content) {
      throw new Error('LLM returned empty response')
    }

    // Try to extract JSON from the response (handle cases where LLM adds extra text)
    let jsonString = content
    const jsonStart = content.indexOf('{')
    const jsonEnd = content.lastIndexOf('}')
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonString = content.substring(jsonStart, jsonEnd + 1)
    }

    const quizData = JSON.parse(jsonString) as GeneratedQuizData

    console.log('Raw quiz data from LLM:', quizData)

    // Validate the generated data
    if (!quizData.title || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz data structure returned by LLM')
    }

    if (quizData.questions.length === 0) {
      throw new Error('No questions generated by LLM')
    }

    return quizData

  } catch (error) {
    console.error('Quiz generation error:', error)
    if (error instanceof SyntaxError) {
      throw new Error('LLM returned invalid JSON format. Please try again.')
    }
    throw error
  }
}

/**
 * Generate a quiz based on user notes using similarity search
 */
export async function generateQuizFromNotes(
  prompt: string,
  context: string,
  questionCount: number = 10,
  questionTypes: QuestionType[] = ['MULTIPLE_CHOICE'],
  difficulty: Difficulty = 'MEDIUM'
): Promise<GeneratedQuizData> {
  try {
    const quizData = await generateQuizWithLLM(
      prompt,
      context,
      questionCount,
      questionTypes,
      difficulty
    )

    return quizData
  } catch (error) {
    console.error('Quiz generation from notes failed:', error)
    throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}