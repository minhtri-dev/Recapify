import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@db/prisma.client'
import { auth } from '@auth'
import { CreateQuestionSchema } from '@schemas/question.model'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = CreateQuestionSchema.parse(body)

    // Verify quiz exists and belongs to user
    const quiz = await prisma.quiz.findUnique({
      where: { id: validatedData.quizId },
    })

    if (!quiz || quiz.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Quiz not found or unauthorized' },
        { status: 404 },
      )
    }

    const newQuestion = await prisma.question.create({
      data: validatedData,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
      },
    })

    return NextResponse.json(newQuestion)
  } catch (error) {
    console.error('Error creating question:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to create question'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
