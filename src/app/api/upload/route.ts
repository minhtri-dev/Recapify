import { NextRequest, NextResponse } from 'next/server'
import { ScraperTool } from '@agent/tools/scraper.tool'
import { PdfTool } from '@agent/tools/pdf.tool'
import { auth } from '@auth'
import prisma from '@db/prisma.client'
import { z } from 'zod'

// Schema for validation
const UploadRequestSchema = z.object({
  urls: z.array(z.string().url()).min(1, 'At least one URL is required')
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contentType = req.headers.get('content-type') || ''
    
    // Handle multipart form data (for PDF uploads)
    if (contentType.includes('multipart/form-data')) {
      return await handleFileUploads(req, session.user.id)
    }
    
    // Handle JSON data (for URL uploads)
    if (contentType.includes('application/json')) {
      return await handleUrlUploads(req, session.user.id)
    }
    
    return NextResponse.json({ 
      error: 'Unsupported content type. Use multipart/form-data for files or application/json for URLs' 
    }, { status: 400 })
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function handleUrlUploads(req: NextRequest, userId: string) {
  const body = await req.json()
  const { urls } = UploadRequestSchema.parse(body)

  const scraper = new ScraperTool()
  const results = []
  const errors = []

  // Process each URL
  for (const url of urls) {
    try {
      const sourceData = await scraper.scrapeToSource(url)
      
      const savedSource = await prisma.source.create({
        data: { ...sourceData, userId }
      })
      
      results.push(savedSource)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      errors.push({ url, error: message })
    }
  }

  return NextResponse.json({
    success: true,
    results,
    errors,
    summary: {
      total: urls.length,
      successful: results.length,
      failed: errors.length
    }
  })
}

async function handleFileUploads(req: NextRequest, userId: string) {
  const formData = await req.formData()
  const files = formData.getAll('files') as File[]
  
  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  const pdfTool = new PdfTool()
  const results = []
  const errors = []

  // Process each file
  for (const file of files) {
    try {
      // Validate file type
      if (file.type !== 'application/pdf') {
        errors.push({ 
          filename: file.name, 
          error: 'Only PDF files are supported' 
        })
        continue
      }

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer())
      
      const sourceData = await pdfTool.pdfToSource(buffer, file.name)
      
      const savedSource = await prisma.source.create({
        data: { ...sourceData, userId }
      })
      
      results.push(savedSource)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      errors.push({ filename: file.name, error: message })
    }
  }

  return NextResponse.json({
    success: true,
    results,
    errors,
    summary: {
      total: files.length,
      successful: results.length,
      failed: errors.length
    }
  })
}