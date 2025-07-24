import { redirect } from 'next/navigation'

export default function SignUpRootPage() {
  // Redirect to default locale (Italian) and default signup type (business)
  redirect('/it/signup/business')
} 