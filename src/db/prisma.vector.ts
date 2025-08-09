import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { Embeddings } from "@services/embeddings.service";
import { PrismaClient, Prisma, Note } from "@prisma/client";

const db = new PrismaClient();

// Create the vector store instance for Notes
export const notesVectorStore = PrismaVectorStore.withModel<Note>(db).create(
  Embeddings,
  {
    prisma: Prisma,
    tableName: "Note", // Adjust to match your actual table name
    vectorColumnName: "vector", // The column where embeddings are stored
    columns: {
      id: PrismaVectorStore.IdColumn,
      content: PrismaVectorStore.ContentColumn, // The text content to embed
    },
  }
);

// Helper function to add embeddings to notes
export const addEmbeddingToNote = async (noteId: number) => {
  try {
    // First, find the existing note
    const note = await db.note.findUnique({
      where: { id: noteId }
    });

    if (!note) {
      throw new Error(`Note with id ${noteId} not found`);
    }

    // Add the note to the vector store (this will generate and store the embedding)
    await notesVectorStore.addModels([note]);
    
    return { success: true, noteId };
  } catch (error) {
    console.error('Error adding embedding to note:', error);
    throw error;
  }
};

// Helper function to search similar notes
export const searchSimilarNotes = async (query: string, limit: number = 5) => {
  try {
    const results = await notesVectorStore.similaritySearch(query, limit);
    return results;
  } catch (error) {
    console.error('Error searching similar notes:', error);
    throw error;
  }
};
