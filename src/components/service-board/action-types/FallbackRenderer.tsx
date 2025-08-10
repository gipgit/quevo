import React from 'react';

interface FallbackRendererProps {
  actionType: string;
  details: any;
  missingFields?: string[];
}

export default function FallbackRenderer({ actionType, details, missingFields = [] }: FallbackRendererProps) {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Dettagli azione non validi per il tipo: {actionType}
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-2">I dati salvati non sono compatibili con il renderer per questo tipo di azione.</p>
            {missingFields.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Campi mancanti:</p>
                <ul className="list-disc list-inside mt-1">
                  {missingFields.map((field, index) => (
                    <li key={index} className="text-xs">{field}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-3 p-2 bg-white rounded border">
              <p className="text-xs font-medium text-gray-600 mb-1">Dati salvati:</p>
              <pre className="text-xs text-gray-800 overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
