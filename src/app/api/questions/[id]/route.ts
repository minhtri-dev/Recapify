import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@db/prisma.client'
import { auth } from '@auth'
import { UpdateQuestionSchema } from '@schemas/question.model'

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
    
    const question = await prisma.question.findUnique({
      where: { id: Number(id) },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      }
    })

    if (!question || question.quiz.userId !== session.user.id) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 })
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
    const validatedData = UpdateQuestionSchema.parse(body)

    // Check question exists and user has access via quiz ownership
    const existingQuestion = await prisma.question.findUnique({
      where: { id: Number(id) },
      include: {
        quiz: true
      }
    })

    if (!existingQuestion || existingQuestion.quiz.userId !== session.user.id) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: Number(id) },
      data: validatedData,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      }
    })

    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error('Error updating question:', error)
    const message = error instanceof Error ? error.message : 'Failed to update question'
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

    // Check question exists and user has access via quiz ownership
    const existingQuestion = await prisma.question.findUnique({
      where: { id: Number(id) },
      include: {
        quiz: true
      }
    })

    if (!existingQuestion || existingQuestion.quiz.userId !== session.user.id) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    await prisma.question.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}