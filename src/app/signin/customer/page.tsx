import { redirect } from 'next/navigation'

export default function CustomerSignInRedirectPage() {
  // Redirect to default locale (Italian)
  redirect('/it/signin/customer')
} 