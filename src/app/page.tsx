import Link from 'next/link'
import { Header, Footer, SignIn, SignOut } from '@components'

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Recapify
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your AI-powered knowledge base. Upload sources, generate summaries,
            and build your personal learning repository.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/projects"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              My Knowledge Base
            </Link>
            <Link
              href="/upload"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Upload Sources
            </Link>
            <Link
              href="/quiz"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Generate Quiz
            </Link>
          </div>

          <div className="flex justify-center space-x-4">
            <SignIn />
            <SignOut />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
