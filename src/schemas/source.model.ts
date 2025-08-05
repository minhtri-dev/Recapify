import { z } from 'zod'

// Source model schema
export const SourceSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string().cuid(),
  content: z.string().min(1, 'Content is required'),
  vector: z.any().optional(), // Unsupported vector type
  url: z.string().url().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Schema for creating a new source (excluding auto-generated fields)
export const CreateSourceSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  url: z.string().url().optional().nullable(),
})

// Schema for updating a source (all fields optional except content)
export const UpdateSourceSchema = z.object({
  content: z.string().min(1, 'Content is required').optional(),
  url: z.string().url().optional().nullable(),
})

// Schema for source API responses (including relations if needed)
export const SourceResponseSchema = SourceSchema.extend({
  notes: z.array(z.object({
    id: z.number(),
    content: z.string(),
    projectId: z.number(),
  })).optional(),
})

// Type exports
export type Source = z.infer<typeof SourceSchema>
export type CreateSource = z.infer<typeof CreateSourceSchema>
export type UpdateSource = z.infer<typeof UpdateSourceSchema>
export type SourceResponse = z.infer<typeof SourceResponseSchema>