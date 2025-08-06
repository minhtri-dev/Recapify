import axios from 'axios'
import { 
  CreateProjectSchema, 
  UpdateProjectSchema, 
  type Project 
} from '@schemas/project.model'
import { 
  CreateNoteSchema, 
  UpdateNoteSchema, 
  type Note 
} from '@schemas/note.model'
import { 
  CreateSourceSchema, 
  UpdateSourceSchema, 
  type Source 
} from '@schemas/source.model'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Unknown error'
    throw new Error(message)
  }
)

// Project API functions
export async function getProjects(): Promise<Project[]> {
  const response = await apiClient.get<Project[]>('/projects')
  return response.data
}

export async function getProject(id: number): Promise<Project> {
  const response = await apiClient.get<Project>(`/projects/${id}`)
  return response.data
}

export async function addProject(projectData: unknown): Promise<Project> {
  const validatedData = CreateProjectSchema.parse(projectData)
  const response = await apiClient.post<Project>('/projects', validatedData)
  return response.data
}

export async function updateProject(
  id: number, 
  projectData: unknown
): Promise<Project> {
  const validatedData = UpdateProjectSchema.parse(projectData)
  const response = await apiClient.put<Project>(`/projects/${id}`, validatedData)
  return response.data
}

export async function deleteProject(id: number): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(`/projects/${id}`)
  return response.data
}

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

export async function updateNote(
  id: number, 
  noteData: unknown
): Promise<Note> {
  const validatedData = UpdateNoteSchema.parse(noteData)
  const response = await apiClient.put<Note>(`/notes/${id}`, validatedData)
  return response.data
}

export async function deleteNote(id: number): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(`/notes/${id}`)
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
  sourceData: unknown
): Promise<Source> {
  const validatedData = UpdateSourceSchema.parse(sourceData)
  const response = await apiClient.put<Source>(`/sources/${id}`, validatedData)
  return response.data
}

export async function deleteSource(id: number): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(`/sources/${id}`)
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
  urls.forEach(url => {
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
  const invalidFiles = files.filter(file => file.type !== 'application/pdf')
  if (invalidFiles.length > 0) {
    throw new Error(`Invalid file types detected. Only PDF files are supported. Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`)
  }

  // Create FormData for multipart upload
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(errorData.error || `Upload failed with status ${response.status}`)
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

// Summary generation function
export async function generateNoteSummary(
  projectId: number,
  sourceIds: number[],
  title?: string
): Promise<{
  success: boolean
  note: Note & {
    sources: Array<{ id: number; url: string | null; content: string }>
    project: { id: number; name: string }
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
    ...(title && { title })
  }

  const response = await apiClient.post(`/notes/summary/${projectId}`, requestBody)
  return response.data
}