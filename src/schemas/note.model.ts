import { z } from 'zod'

// Note model schema
export const NoteSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string().cuid(),
  content: z.string().min(1, 'Content is required'),
  vector: z.any().optional(), // Unsupported vector type
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Schema for creating a new note (excluding auto-generated fields)
export const CreateNoteSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  sources: z.array(z.number().int().positive()).optional(), // Array of source IDs
})

// Schema for updating a note
export const UpdateNoteSchema = z.object({
  content: z.string().min(1, 'Content is required').optional(),
  sources: z.array(z.number().int().positive()).optional(), // Array of source IDs
})

// Schema for note API responses (including relations if needed)
export const NoteResponseSchema = NoteSchema.extend({
  sources: z
    .array(
      z.object({
        id: z.number(),
        content: z.string(),
        url: z.string().nullable(),
        userId: z.string(),
      }),
    )
    .optional(),
})

// Type exports
export type Note = z.infer<typeof NoteSchema>
export type CreateNote = z.infer<typeof CreateNoteSchema>
export type UpdateNote = z.infer<typeof UpdateNoteSchema>
export type NoteResponse = z.infer<typeof NoteResponseSchema>
