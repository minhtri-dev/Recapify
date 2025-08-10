import axios from 'axios'
import { CreateNoteSchema, type Note } from '@schemas/note.model'
import {
  CreateSourceSchema,
  UpdateSourceSchema,
  type Source,
} from '@schemas/source.model'
import {
  CreateQuizSchema,
  UpdateQuizSchema,
  GenerateQuizRequestSchema,
  type Quiz,
  type QuizResponse,
} from '@schemas/quiz.model'

import {
  CreateQuestionSchema,
  UpdateQuestionSchema,
  type Question,
  type QuestionResponse,
} from '@schemas/question.model'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error || error.message || 'Unknown error'
    throw new Error(message)
  },
)

// Note API functions
export async function getNotes(): Promise<Note[]> {
  const response = await apiClient.get<Note[]>('/notes')
  return response.data
}

export async function getNote(id: number): Promise<Note> {
  const response = await apiClient.get<Note>(`/notes/${id}`)
  return response.data
}

export async function addNote(noteData: unknown): Promise<Note> {
  const validatedData = CreateNoteSchema.parse(noteData)
  const response = await apiClient.post<Note>('/notes', validatedData)
  return response.data
}

// Summary generation function
export async function generateNoteSummary(
  sourceIds: number[],
  title?: string,
): Promise<{
  success: boolean
  note: Note & {
    sources: Array<{ id: number; url: string | null; content: string }>
  }
  metadata: {
    sourcesUsed: number
    totalSources: number
    generatedAt: string
  }
}> {
  if (!Array.isArray(sourceIds) || sourceIds.length === 0) {
    throw new Error('At least one source ID is required')
  }

  const requestBody = {
    sourceIds,
    ...(title && { title }),
  }

  const response = await apiClient.post('/notes/summary', requestBody)
  return response.data
}

// Source API functions
export async function getSources(): Promise<Source[]> {
  const response = await apiClient.get<Source[]>('/sources')
  return response.data
}

export async function getSource(id: number): Promise<Source> {
  const response = await apiClient.get<Source>(`/sources/${id}`)
  return response.data
}

export async function addSource(sourceData: unknown): Promise<Source> {
  const validatedData = CreateSourceSchema.parse(sourceData)
  const response = await apiClient.post<Source>('/sources', validatedData)
  return response.data
}

export async function updateSource(
  id: number,
  sourceData: unknown,
): Promise<Source> {
  const validatedData = UpdateSourceSchema.parse(sourceData)
  const response = await apiClient.put<Source>(`/sources/${id}`, validatedData)
  return response.data
}

export async function deleteSource(id: number): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(
    `/sources/${id}`,
  )
  return response.data
}

// Upload API functions
export async function uploadUrls(urls: string[]): Promise<{
  success: boolean
  results: Source[]
  errors: { url: string; error: string }[]
  summary: { total: number; successful: number; failed: number }
}> {
  // Validate URLs array
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error('At least one URL is required')
  }

  // Basic URL validation
  urls.forEach((url) => {
    try {
      new URL(url)
    } catch {
      throw new Error(`Invalid URL: ${url}`)
    }
  })

  const response = await apiClient.post('/upload', { urls })
  return response.data
}

// Convenience function for single URL
export async function uploadUrl(url: string): Promise<Source> {
  const response = await uploadUrls([url])

  if (response.results.length === 0) {
    throw new Error(response.errors[0]?.error || 'Failed to upload URL')
  }

  return response.results[0]
}

// PDF Upload API functions
export async function uploadPdfs(files: File[]): Promise<{
  success: boolean
  results: Source[]
  errors: { filename: string; error: string }[]
  summary: { total: number; successful: number; failed: number }
}> {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('At least one file is required')
  }

  // Validate all files are PDFs
  const invalidFiles = files.filter((file) => file.type !== 'application/pdf')
  if (invalidFiles.length > 0) {
    throw new Error(
      `Invalid file types detected. Only PDF files are supported. Invalid files: ${invalidFiles.map((f) => f.name).join(', ')}`,
    )
  }

  // Create FormData for multipart upload
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Upload failed' }))
    throw new Error(
      errorData.error || `Upload failed with status ${response.status}`,
    )
  }

  return response.json()
}

// Convenience function for single PDF
export async function uploadPdf(file: File): Promise<Source> {
  const response = await uploadPdfs([file])

  if (response.results.length === 0) {
    const errorMessage = response.errors[0]?.error || 'Failed to upload PDF'
    throw new Error(errorMessage)
  }

  return response.results[0]
}

// Quiz API functions
export async function getQuizzes(): Promise<QuizResponse[]> {
  const response = await apiClient.get<QuizResponse[]>('/quizzes')
  return response.data
}

export async function getQuiz(id: number): Promise<QuizResponse> {
  const response = await apiClient.get<QuizResponse>(`/quizzes/${id}`)
  return response.data
}

export async function addQuiz(quizData: unknown): Promise<Quiz> {
  const validatedData = CreateQuizSchema.parse(quizData)
  const response = await apiClient.post<Quiz>('/quizzes', validatedData)
  return response.data
}

export async function updateQuiz(id: number, quizData: unknown): Promise<Quiz> {
  const validatedData = UpdateQuizSchema.parse(quizData)
  const response = await apiClient.put<Quiz>(`/quizzes/${id}`, validatedData)
  return response.data
}

export async function deleteQuiz(id: number): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(
    `/quizzes/${id}`,
  )
  return response.data
}

// Question API functions
export async function getQuestions(
  quizId: number,
): Promise<QuestionResponse[]> {
  const response = await apiClient.get<QuestionResponse[]>(
    `/quizzes/${quizId}/questions`,
  )
  return response.data
}

export async function getQuestion(id: number): Promise<QuestionResponse> {
  const response = await apiClient.get<QuestionResponse>(`/questions/${id}`)
  return response.data
}

export async function addQuestion(questionData: unknown): Promise<Question> {
  const validatedData = CreateQuestionSchema.parse(questionData)
  const response = await apiClient.post<Question>('/questions', validatedData)
  return response.data
}

export async function updateQuestion(
  id: number,
  questionData: unknown,
): Promise<Question> {
  const validatedData = UpdateQuestionSchema.parse(questionData)
  const response = await apiClient.put<Question>(
    `/questions/${id}`,
    validatedData,
  )
  return response.data
}

export async function deleteQuestion(
  id: number,
): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(
    `/questions/${id}`,
  )
  return response.data
}

export async function generateQuiz(requestData: unknown): Promise<{
  success: boolean
  quiz: QuizResponse
  metadata: {
    questionsGenerated: number
    notesUsed?: number
    contextLength?: number
    generatedAt: string
    prompt: string
    settings?: {
      questionCount: number
      questionTypes: string[]
      difficulty: string
    }
  }
}> {
  const validatedData = GenerateQuizRequestSchema.parse(requestData)
  const response = await apiClient.post('/quizzes/generate', validatedData)
  return response.data
}

export * from './agent.client'
