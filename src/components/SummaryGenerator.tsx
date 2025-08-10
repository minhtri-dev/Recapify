'use client'

import { useState } from 'react'
import { generateNoteSummary } from '@utils/api.client'
import { type Source } from '@schemas/source.model'

interface SummaryGeneratorProps {
  projectId?: number
  availableSources: Source[]
  onSuccess?: (noteId: number) => void
  onError?: (error: string) => void
  className?: string
}

export default function SummaryGenerator({
  availableSources,
  onSuccess,
  onError,
  className = '',
}: SummaryGeneratorProps) {
  const [selectedSources, setSelectedSources] = useState<number[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSourceToggle = (sourceId: number) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId)
        ? prev.filter((id) => id !== sourceId)
        : [...prev, sourceId],
    )
  }

  const handleSelectAll = () => {
    setSelectedSources(availableSources.map((source) => source.id))
  }

  const handleClearAll = () => {
    setSelectedSources([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedSources.length === 0) {
      const errorMessage = 'Please select at least one source'
      setError(errorMessage)
      onError?.(errorMessage)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await generateNoteSummary(
        selectedSources,
        title.trim() || undefined,
      )

      // Clear form on success
      setSelectedSources([])
      setTitle('')

      onSuccess?.(result.note.id)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate summary'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Summary Title (Optional)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a custom title for your summary..."
            disabled={loading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Source Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Sources ({selectedSources.length} of{' '}
              {availableSources.length} selected)
            </label>
            <div className="space-x-2">
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={loading || availableSources.length === 0}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={loading || selectedSources.length === 0}
                className="text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2">
            {availableSources.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No sources available. Upload some sources first.
              </p>
            ) : (
              availableSources.map((source) => (
                <label
                  key={source.id}
                  className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source.id)}
                    onChange={() => handleSourceToggle(source.id)}
                    disabled={loading}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {source.url || `Source ${source.id}`}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {source.content.substring(0, 100)}...
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || selectedSources.length === 0}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
              Generating Summary...
            </>
          ) : (
            `Generate Summary from ${selectedSources.length} Source${selectedSources.length !== 1 ? 's' : ''}`
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
