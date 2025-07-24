import { redirect } from 'next/navigation'

export default function SignInRootPage() {
  // Redirect to default locale (Italian) and default user type (manager)
  redirect('/it/signin/manager')
} 