import { signOutAction } from '@/lib/auth-actions'

export default function SignOut() {
  return (
    <form action={signOutAction}>
      <button type="submit">Sign out</button>
    </form>
  )
}
