import Link from 'next/link'
import { Footer, Header } from '@components'
export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <Header />
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
      <Footer />
    </main>
  )
}
