'use client';

import { useState } from 'react';

interface CopyButtonProps {
  boardRef: string;
  businessUrlname: string;
}

export default function CopyButton({ boardRef, businessUrlname }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/${businessUrlname}/s/${boardRef}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
      title="Copy link"
    >
      {copied ? '✓' : '📋'}
    </button>
  );
} 