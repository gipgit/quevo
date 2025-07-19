import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800">
      <h1 className="text-5xl font-bold mb-4">Payment Canceled</h1>
      <p className="text-lg mb-8">Your payment was not completed. You can try again or contact support.</p>
      <Link href="/pricing" className="text-indigo-600 hover:underline">
        Back to Pricing
      </Link>
    </div>
  );
}