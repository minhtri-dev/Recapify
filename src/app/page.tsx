import { Header, Footer, SignIn, SignOut } from '@components'

export default function Home() {
  return (
    <main className="flex flex-col">
      <Header />
      <p>Hello, world!</p>
      <SignIn />
      <SignOut />
      <Footer />
    </main>
  )
}
