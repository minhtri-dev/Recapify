import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@db/prisma.client'
import { auth } from '@auth'
import { UpdateQuizSchema } from '@schemas/quiz.model'

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
    
    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(id) },
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

    if (!quiz || quiz.userId !== session.user.id) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const validatedData = UpdateQuizSchema.parse(body)

    // Check quiz exists and belongs to user
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: Number(id) }
    })

    if (!existingQuiz || existingQuiz.userId !== session.user.id) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id: Number(id) },
      data: validatedData,
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(updatedQuiz)
  } catch (error) {
    console.error('Error updating quiz:', error)
    const message = error instanceof Error ? error.message : 'Failed to update quiz'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Check quiz exists and belongs to user
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: Number(id) }
    })

    if (!existingQuiz || existingQuiz.userId !== session.user.id) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Delete quiz (cascade will handle questions)
    await prisma.quiz.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 })
  }
}