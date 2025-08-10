import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma'
import { Embeddings } from '@services/embeddings.service'
import { PrismaClient, Prisma, Note } from '@prisma/client'
import { auth } from '@auth'

const db = new PrismaClient()

// Create the vector store instance for Notes
export const notesVectorStore = PrismaVectorStore.withModel<Note>(db).create(
  Embeddings,
  {
    prisma: Prisma,
    tableName: 'Note', // Adjust to match your actual table name
    vectorColumnName: 'vector', // The column where embeddings are stored
    columns: {
      id: PrismaVectorStore.IdColumn,
      content: PrismaVectorStore.ContentColumn, // The text content to embed
    },
  },
)

// Helper function to add embeddings to notes
export const addEmbeddingToNote = async (noteId: number) => {
  try {
    // First, find the existing note
    const note = await db.note.findUnique({
      where: { id: noteId },
    })

    if (!note) {
      throw new Error(`Note with id ${noteId} not found`)
    }

    // Add the note to the vector store (this will generate and store the embedding)
    await notesVectorStore.addModels([note])

    return { success: true, noteId }
  } catch (error) {
    console.error('Error adding embedding to note:', error)
    throw error
  }
}

// Helper function to search similar notes
export const searchSimilarNotes = async (query: string, limit: number = 5) => {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    // Get all notes that belong to the current user
    const userNotes = await db.note.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    })
    const noteIds = userNotes.map((note) => note.id)

    if (noteIds.length === 0) {
      return []
    }

    // Filter by note IDs owned by the user
    const results = await notesVectorStore.similaritySearch(query, limit, {
      id: { in: noteIds },
    })
    return results
  } catch (error) {
    console.error('Error searching similar notes:', error)
    throw error
  }
}
