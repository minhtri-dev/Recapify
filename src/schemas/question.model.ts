import { z } from 'zod'

// Enums
export const QuestionTypeSchema = z.enum([
  'MULTIPLE_CHOICE',
  'TRUE_FALSE', 
  'SHORT_ANSWER'
])

export const DifficultySchema = z.enum([
  'EASY',
  'MEDIUM',
  'HARD'
])

// Question model schema
export const QuestionSchema = z.object({
  id: z.number().int().positive(),
  quizId: z.number().int().positive(),
  content: z.string().min(1, 'Question content is required'),
  type: QuestionTypeSchema,
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  difficulty: DifficultySchema,
  order: z.number().int().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Schema for creating a new question
export const CreateQuestionSchema = z.object({
  quizId: z.number().int().positive(),
  content: z.string().min(1, 'Question content is required'),
  type: QuestionTypeSchema.default('MULTIPLE_CHOICE'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  difficulty: DifficultySchema.default('MEDIUM'),
  order: z.number().int().min(1),
})

// Schema for updating a question
export const UpdateQuestionSchema = z.object({
  content: z.string().min(1, 'Question content is required').optional(),
  type: QuestionTypeSchema.optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  difficulty: DifficultySchema.optional(),
  order: z.number().int().min(1).optional(),
})

// Schema for question API responses
export const QuestionResponseSchema = QuestionSchema.extend({
  quiz: z.object({
    id: z.number(),
    title: z.string(),
    userId: z.string(),
  }).optional(),
})

// Type exports
export type Question = z.infer<typeof QuestionSchema>
export type CreateQuestion = z.infer<typeof CreateQuestionSchema>
export type UpdateQuestion = z.infer<typeof UpdateQuestionSchema>
export type QuestionResponse = z.infer<typeof QuestionResponseSchema>
export type QuestionType = z.infer<typeof QuestionTypeSchema>
export type Difficulty = z.infer<typeof DifficultySchema>