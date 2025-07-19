import React, { useState } from 'react';

interface PasswordVerificationProps {
  businessId: string;
  boardRef: string;
  onVerified: () => void;
}

export default function PasswordVerification({ businessId, boardRef, onVerified }: PasswordVerificationProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/businesses/${businessId}/service-board/${boardRef}/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to verify password');
      }

      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-6 text-center">Password Protected Board</h2>
        <p className="text-gray-600 mb-6 text-center">
          This service board is password protected. Please enter the password to view its contents.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter board password"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Access Board'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 