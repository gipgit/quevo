import { redirect } from 'next/navigation'

export default function ManagerSignInRedirectPage() {
  // Redirect to default locale (Italian)
  redirect('/it/signin/manager')
} 