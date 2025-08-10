'use client'

import { useState } from 'react'
import { generateQuiz } from '@utils/api.client'
import type { QuizResponse } from '@schemas/quiz.model'
import type { QuestionType, Difficulty } from '@schemas/question.model'

interface QuizMetadata {
  generatedAt: string
  questionsGenerated: number
  notesUsed?: number
  contextLength?: number
  prompt: string
  settings?: {
    questionCount: number
    questionTypes: string[]
    difficulty: string
  }
}

//TODO: Add "context" field to quiz generation from notes
export default function QuizTestPage() {
  const [prompt, setPrompt] = useState('')
  const [metadata, setMetadata] = useState<QuizMetadata | null>(null)
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    'MULTIPLE_CHOICE',
  ])
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM')
  const [questionCount, setQuestionCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizResponse | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError(null)
    setGeneratedQuiz(null)
    setMetadata(null)

    try {
      const result = await generateQuiz({
        prompt: prompt.trim(),
        questionCount,
        questionTypes,
        difficulty,
      })

      setGeneratedQuiz(result.quiz)
      setMetadata(result.metadata)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate quiz'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionTypeChange = (type: QuestionType, checked: boolean) => {
    if (checked) {
      setQuestionTypes((prev) => [...prev, type])
    } else {
      setQuestionTypes((prev) => prev.filter((t) => t !== type))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Quiz Generation Test
        </h1>

        {/* Generation Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prompt Input */}
            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., neural networks, machine learning algorithms, data structures..."
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={3}
                required
              />
            </div>

            {/* Question Count */}
            <div>
              <label
                htmlFor="questionCount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Number of Questions
              </label>
              <input
                type="number"
                id="questionCount"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                min="1"
                max="50"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Question Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Types
              </label>
              <div className="space-y-2">
                {(
                  ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'] as const
                ).map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={questionTypes.includes(type)}
                      onChange={(e) =>
                        handleQuestionTypeChange(type, e.target.checked)
                      }
                      disabled={loading}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {type
                        .replace('_', ' ')
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Difficulty Level
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !prompt.trim() || questionTypes.length === 0}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating Quiz...
                </>
              ) : (
                'Generate Quiz'
              )}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-800 text-sm">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}
        </div>

        {/* Generated Quiz Display */}
        {generatedQuiz && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {generatedQuiz.title}
              </h2>
              {metadata && (
                <div className="text-sm text-gray-500 text-right">
                  <div>
                    Generated: {new Date(metadata.generatedAt).toLocaleString()}
                  </div>
                  <div>Questions: {metadata.questionsGenerated}</div>
                  {metadata.notesUsed && (
                    <div>Notes Used: {metadata.notesUsed}</div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Original Prompt:</strong>{' '}
                {generatedQuiz.prompt || prompt}
              </p>
            </div>

            {/* Questions Display */}
            <div className="space-y-6">
              {generatedQuiz.questions?.map((question, index) => (
                <div
                  key={question.id}
                  className="border-l-4 border-blue-500 pl-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {index + 1}
                    </h3>
                    <div className="flex space-x-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          question.difficulty === 'EASY'
                            ? 'bg-green-100 text-green-800'
                            : question.difficulty === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {question.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                        {question.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{question.content}</p>

                  {/* Options for Multiple Choice */}
                  {question.type === 'MULTIPLE_CHOICE' && question.options && (
                    <div className="mb-3">
                      <ul className="space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <li
                            key={optionIndex}
                            className={`p-2 rounded ${
                              option === question.correctAnswer // Check if this option matches the correct answer
                                ? 'bg-green-100 border border-green-300'
                                : 'bg-gray-50'
                            }`}
                          >
                            {String.fromCharCode(65 + optionIndex)}) {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Correct Answer */}
                  {question.correctAnswer &&
                    question.type !== 'MULTIPLE_CHOICE' && (
                      <div className="mb-2">
                        <strong className="text-green-700">Answer:</strong>
                        <span className="ml-2 text-gray-700">
                          {question.correctAnswer}
                        </span>
                      </div>
                    )}

                  {/* For Multiple Choice, show the correct answer text and letter */}
                  {question.type === 'MULTIPLE_CHOICE' &&
                    question.correctAnswer &&
                    question.options && (
                      <div className="mb-2">
                        <strong className="text-green-700">
                          Correct Answer:
                        </strong>
                        <span className="ml-2 text-gray-700">
                          {(() => {
                            const correctIndex = question.options.findIndex(
                              (option) => option === question.correctAnswer,
                            )
                            return correctIndex !== -1
                              ? `${String.fromCharCode(65 + correctIndex)} - ${question.correctAnswer}`
                              : question.correctAnswer
                          })()}
                        </span>
                      </div>
                    )}

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="p-3 bg-blue-50 rounded-md">
                      <strong className="text-blue-700">Explanation:</strong>
                      <p className="mt-1 text-blue-600">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
