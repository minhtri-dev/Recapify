import { Tool } from "langchain/tools";
import { searchSimilarNotes } from "@db/prisma.vector";
import { generateQuizFromNotes } from "@utils/llm";
import { 
  GenerateQuizRequestSchema, 
} from "@schemas/quiz.model";
import { 
  type QuestionType,
  type Difficulty 
} from "@schemas/question.model";

interface QuizGenerationInput {
  prompt: string;
  questionCount?: number;
  questionTypes?: QuestionType[];
  difficulty?: Difficulty;
}

export class QuizGeneratorTool extends Tool {
  name = "QuizGenerator";
  description = "Generate educational quizzes based on user notes using similarity search and LLM generation";

  async _call(input: string): Promise<string> {
    try {
      const { prompt, questionCount = 10, questionTypes = ['MULTIPLE_CHOICE'], difficulty = 'MEDIUM' } = JSON.parse(input) as QuizGenerationInput;

      // Validate the input
      const validatedRequest = GenerateQuizRequestSchema.parse({
        prompt,
        questionCount,
        questionTypes,
        difficulty
      });

      // Step 1: Perform vector similarity search to find relevant notes
      const relevantNotes = await searchSimilarNotes(prompt, Math.min(10, questionCount * 2));

      if (relevantNotes.length === 0) {
        throw new Error("No relevant notes found for the given prompt. Please ensure you have notes that relate to your topic.");
      }

      // Step 2: Prepare context from relevant notes
      const context = relevantNotes
        .map((note, index) => `Note ${index + 1}:\n${note.pageContent}`)
        .join('\n\n---\n\n');

      // Step 3: Generate quiz using the centralized LLM function
      const quizData = await generateQuizFromNotes(
        prompt,
        context,
        validatedRequest.questionCount,
        validatedRequest.questionTypes,
        validatedRequest.difficulty
      );

      // Step 4: Return success response with quiz data and metadata
      return JSON.stringify({
        success: true,
        data: quizData,
        metadata: {
          notesUsed: relevantNotes.length,
          generatedAt: new Date().toISOString(),
          contextLength: context.length,
          prompt: prompt,
          settings: {
            questionCount: validatedRequest.questionCount,
            questionTypes: validatedRequest.questionTypes,
            difficulty: validatedRequest.difficulty
          }
        }
      });

    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred during quiz generation",
      });
    }
  }

  // Helper method for direct use in API routes
  async generateQuiz(
    prompt: string, 
    questionCount: number = 10,
    questionTypes: QuestionType[] = ['MULTIPLE_CHOICE'],
    difficulty: Difficulty = 'MEDIUM',
    userId: string
  ) {
    const input = JSON.stringify({
      prompt,
      questionCount,
      questionTypes,
      difficulty,
      userId
    });

    const result = await this._call(input);
    const parsed = JSON.parse(result);

    if (!parsed.success) {
      throw new Error(parsed.error);
    }

    return parsed.data;
  }
}