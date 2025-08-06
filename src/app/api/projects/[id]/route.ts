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
  
  const { id } = await params
  
  const project = await prisma.project.findUnique({
    where: { id: Number(id) },
    include: { notes: true },
  })
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(project)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { id } = await params
  const { name } = await req.json()
  
  const project = await prisma.project.findUnique({
    where: { id: Number(id) },
  })
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const updatedProject = await prisma.project.update({
    where: { id: Number(id) },
    data: { name },
  })
  return NextResponse.json(updatedProject)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { id } = await params
  
  const project = await prisma.project.findUnique({
    where: { id: Number(id) },
  })
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  await prisma.project.delete({
    where: { id: Number(id) },
  })
  return NextResponse.json({ success: true })
}