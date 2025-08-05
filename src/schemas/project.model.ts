import { z } from 'zod'

// Project model schema
export const ProjectSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string().cuid(),
  name: z.string().min(1, 'Project name is required'),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Schema for creating a new project (excluding auto-generated fields)
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
})

// Schema for updating a project
export const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').optional(),
})

// Schema for project API responses (including relations if needed)
export const ProjectResponseSchema = ProjectSchema.extend({
  notes: z.array(z.object({
    id: z.number(),
    content: z.string(),
    projectId: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })).optional(),
})

// Type exports
export type Project = z.infer<typeof ProjectSchema>
export type CreateProject = z.infer<typeof CreateProjectSchema>
export type UpdateProject = z.infer<typeof UpdateProjectSchema>
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>