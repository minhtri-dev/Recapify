import { z } from 'zod'
import {
  QuestionSchema,
  QuestionTypeSchema,
  DifficultySchema,
} from './question.model'

// Quiz model schema
export const QuizSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string().cuid(),
  title: z.string().min(1, 'Quiz title is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Schema for creating a new quiz
export const CreateQuizSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  questionCount: z.number().int().min(1).max(50).default(10),
  questionTypes: z
    .array(QuestionTypeSchema)
    .min(1)
    .default(['MULTIPLE_CHOICE']),
  difficulty: DifficultySchema.default('MEDIUM'),
  title: z.string().optional(),
})

// Schema for quiz generation request
export const GenerateQuizRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  questionCount: z.number().int().min(1).max(50).default(10),
  questionTypes: z
    .array(QuestionTypeSchema)
    .min(1)
    .default(['MULTIPLE_CHOICE']),
  difficulty: DifficultySchema.default('MEDIUM'),
})

// Schema for quiz API responses
export const QuizResponseSchema = QuizSchema.extend({
  questions: z.array(QuestionSchema).optional(),
  sourceNotes: z
    .array(
      z.object({
        id: z.number(),
        content: z.string(),
        url: z.string().nullable(),
      }),
    )
    .optional(),
  user: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      email: z.string(),
    })
    .optional(),
})

// Update schemas for updating
export const UpdateQuizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required').optional(),
  prompt: z.string().min(1, 'Prompt is required').optional(),
})

// Type exports
export type Quiz = z.infer<typeof QuizSchema>
export type CreateQuiz = z.infer<typeof CreateQuizSchema>
export type GenerateQuizRequest = z.infer<typeof GenerateQuizRequestSchema>
export type QuizResponse = z.infer<typeof QuizResponseSchema>
export type UpdateQuiz = z.infer<typeof UpdateQuizSchema>
