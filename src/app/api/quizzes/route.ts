import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@db/prisma.client'
import { auth } from '@auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    
    // Verify quiz belongs to user
    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(id) }
    })

    if (!quiz || quiz.userId !== session.user.id) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    const questions = await prisma.question.findMany({
      where: { quizId: Number(id) },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}