import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@db/prisma.client'
import { auth } from '@auth'
import { GenerateQuizRequestSchema } from '@schemas/quiz.model'
import { CreateQuestion } from '@schemas/question.model'
import { QuizGeneratorTool } from '@agent/tools/quiz.tool'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = GenerateQuizRequestSchema.parse(body)

    // Initialize the quiz generator tool
    const quizGenerator = new QuizGeneratorTool()

    // Generate quiz using the tool (it handles vector search and LLM generation)
    const quizData = await quizGenerator.generateQuiz(
      validatedData.prompt,
      validatedData.questionCount,
      validatedData.questionTypes,
      validatedData.difficulty,
      session.user.id
    )

    // Save quiz to database
    const quiz = await prisma.quiz.create({
      data: {
        userId: session.user.id,
        title: quizData.title,
        prompt: validatedData.prompt,
        questions: {
          create: quizData.questions.map((question: CreateQuestion, index: number) => ({
            content: question.content,
            type: question.type,
            options: question.options || [],
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
            order: index + 1
          }))
        }
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      quiz,
      metadata: {
        questionsGenerated: quizData.questions.length,
        generatedAt: new Date().toISOString(),
        prompt: validatedData.prompt
      }
    })

  } catch (error) {
    console.error('Quiz generation error:', error)
    
    // Handle specific error types from the tool
    if (error instanceof Error) {
      // Check for "no relevant notes" error from the tool
      if (error.message.includes('No relevant notes found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      
      // Handle other LLM/generation errors
      if (error.message.includes('LLM returned invalid JSON') || 
          error.message.includes('missing required fields')) {
        return NextResponse.json({ 
          error: 'Failed to generate quiz - please try again with a different prompt' 
        }, { status: 500 })
      }
    }
    
    const message = error instanceof Error ? error.message : 'Failed to generate quiz'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}