'use client'

import { useState } from 'react'
import { type Source } from '@schemas/source.model'
import { uploadPdf } from '@utils/api.client'

interface PdfUploadFormProps {
  onSuccess?: (source: Source) => void
  onError?: (error: string) => void
  className?: string
}

export default function PdfUploadForm({
  onSuccess,
  onError,
  className = '',
}: PdfUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        const errorMessage = 'Please select a PDF file'
        setError(errorMessage)
        onError?.(errorMessage)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      const errorMessage = 'Please select a PDF file'
      setError(errorMessage)
      onError?.(errorMessage)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const source = await uploadPdf(file)

      // Clear form on success
      setFile(null)
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      if (fileInput) fileInput.value = ''

      onSuccess?.(source)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload PDF'
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
            htmlFor="pdf-file"
            className="block text-sm font-medium text-gray-700"
          >
            PDF Document
          </label>
          <div className="mt-1">
            <input
              type="file"
              id="pdf-file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              disabled={loading}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
              Processing PDF...
            </>
          ) : (
            'Upload PDF'
          )}
        </button>

        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </form>
    </div>
  )
}
