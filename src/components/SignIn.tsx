import { signInAction } from '@/lib/auth-actions'

export default function SignIn() {
  return (
    <form action={signInAction}>
      <button type="submit">Sign in with GitHub</button>
    </form>
  )
}
