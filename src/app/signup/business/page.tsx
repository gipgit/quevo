import { redirect } from 'next/navigation'

export default function BusinessSignUpRedirectPage() {
  // Redirect to default locale (Italian)
  redirect('/it/signup/business')
} 