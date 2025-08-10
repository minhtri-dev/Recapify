'use client'

import { useState } from 'react'
import { uploadUrl } from '@utils/api.client'
import { type Source } from '@schemas/source.model'

interface UrlUploadFormProps {
  onSuccess?: (source: Source) => void
  onError?: (error: string) => void
  className?: string
}

export default function UrlUploadForm({
  onSuccess,
  onError,
  className = '',
}: UrlUploadFormProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      const errorMessage = 'Please enter a URL'
      setError(errorMessage)
      onError?.(errorMessage)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const source = await uploadUrl(url.trim())
      setUrl('') // Clear form on success
      onSuccess?.(source)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload URL'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700"
          >
            Website URL
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={loading}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </div>

        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </form>
    </div>
  )
}
