import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@db/prisma.client'
import { auth } from '@auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const sources = await prisma.source.findMany({
    where: { userId: session.user.id },
  })
  return NextResponse.json(sources)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { content, url } = await req.json()
  const newSource = await prisma.source.create({
    data: {
      content,
      url,
      userId: session.user.id,
    },
  })
  return NextResponse.json(newSource)
}