import React, { useState } from 'react';

interface FallbackRendererProps {
  actionType: string;
  details: any;
  missingFields?: string[];
}

// Helper function to format values for display
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'Sì' : 'No';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (Array.isArray(value)) return `${value.length} elementi`;
  if (typeof value === 'object') return 'Oggetto';
  return String(value);
};

// Helper function to render key-value pairs recursively
const renderKeyValuePairs = (obj: any, depth: number = 0): JSX.Element[] => {
  const pairs: JSX.Element[] = [];
  
  Object.entries(obj).forEach(([key, value]) => {
    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const formattedValue = formatValue(value);
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Nested object
      pairs.push(
        <div key={key} className={`${depth > 0 ? 'ml-4' : ''} mb-2`}>
          <div className="font-medium text-gray-700 text-sm">{formattedKey}:</div>
          <div className="ml-4 mt-1">
            {renderKeyValuePairs(value, depth + 1)}
          </div>
        </div>
      );
    } else {
      // Simple value
      pairs.push(
        <div key={key} className={`${depth > 0 ? 'ml-4' : ''} mb-2 flex items-center`}>
          <span className="font-medium text-gray-700 text-sm min-w-0 flex-shrink-0">{formattedKey}:</span>
          <span className="ml-2 text-gray-600 text-sm break-all">{formattedValue}</span>
        </div>
      );
    }
  });
  
  return pairs;
};

export default function FallbackRenderer({ actionType, details, missingFields = [] }: FallbackRendererProps) {
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="space-y-4">
      {/* Key-Value List View - User Friendly Card First */}
      <div className="bg-white rounded border p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Dettagli Azione</h4>
        <div className="max-h-60 overflow-y-auto">
          {renderKeyValuePairs(details)}
        </div>
      </div>

      {/* Warning Card - After Data */}
      <div className="p-2 lg:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs lg:text-sm text-yellow-800">
                <span className="font-medium">Errore durante la validazione dei dati ({actionType})</span>
              </div>
              <button
                onClick={() => setShowJson(!showJson)}
                className="flex items-center text-xs font-medium text-gray-600 hover:text-gray-800"
              >
                <svg 
                  className={`w-4 h-4 mr-1 transition-transform ${showJson ? 'rotate-90' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                JSON
              </button>
            </div>
            
            <div className="text-sm text-yellow-700">
              {missingFields.length > 0 && (
                <div className="mt-2 mb-3">
                  <p className="font-medium">Campi mancanti:</p>
                  <ul className="list-disc list-inside mt-1">
                    {missingFields.map((field, index) => (
                      <li key={index} className="text-xs">{field}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* JSON View - Collapsed by Default */}
      {showJson && (
        <div className="bg-white rounded border p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">JSON Completo</h4>
          <div className="max-h-60 overflow-auto">
            <pre className="text-xs text-gray-800 whitespace-pre-wrap">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
