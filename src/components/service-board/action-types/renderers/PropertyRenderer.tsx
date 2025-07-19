"use client";

import React from 'react';
import { PropertyRendererConfig } from './types';

interface PropertyRendererProps {
  config: Record<string, PropertyRendererConfig>;
  data: Record<string, any>;
}

const PropertyRenderer: React.FC<PropertyRendererProps> = ({ config, data }) => {
  // Sort properties by priority
  const sortedProperties = Object.entries(config)
    .sort(([, a], [, b]) => (a.priority || 0) - (b.priority || 0));

  // Group properties by layout
  const fullWidthProperties = sortedProperties.filter(([, config]) => config.layout === 'full');
  const inlineProperties = sortedProperties.filter(([, config]) => config.layout === 'inline');

  const renderProperty = (key: string, value: any, propertyConfig: PropertyRendererConfig) => {
    // Check condition if provided
    if (propertyConfig.condition && !propertyConfig.condition(data)) {
      return null;
    }

    const label = propertyConfig.showLabel ? (
      <div className="text-sm font-medium text-gray-700 mb-1">
        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </div>
    ) : null;

    let content;
    switch (propertyConfig.type) {
      case 'text':
        content = (
          <div className={`${
            propertyConfig.format === 'heading' ? 'text-xl font-semibold' : 'text-sm'
          } text-gray-900`}>
            {value}
          </div>
        );
        break;

      case 'datetime':
        const date = new Date(value);
        content = (
          <div className="text-sm text-gray-600">
            {propertyConfig.showDate && date.toLocaleDateString()}
            {propertyConfig.showDate && propertyConfig.showTime && ' '}
            {propertyConfig.showTime && date.toLocaleTimeString()}
          </div>
        );
        break;

      case 'status':
        const colorMap = propertyConfig.colorMap || {
          success: 'green',
          error: 'red',
          warning: 'yellow',
          info: 'blue',
        };
        const color = colorMap[value] || 'gray';
        content = (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
            {value}
          </div>
        );
        break;

      case 'file':
        content = (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            {propertyConfig.showIcon && (
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            )}
            {propertyConfig.allowPreview ? (
              <img src={value} alt="Preview" className="max-w-xs rounded" />
            ) : (
              'View File'
            )}
          </a>
        );
        break;

      case 'custom':
        if (propertyConfig.render) {
          content = propertyConfig.render(value, propertyConfig, data);
        }
        break;

      default:
        content = <div className="text-sm text-gray-900">{String(value)}</div>;
    }

    return (
      <div key={key} className={`${propertyConfig.layout === 'full' ? 'mb-6' : 'mb-4'}`}>
        {label}
        {content}
      </div>
    );
  };

  return (
    <div>
      {/* Full width properties */}
      <div className="space-y-6">
        {fullWidthProperties.map(([key, propertyConfig]) => (
          renderProperty(key, data[key], propertyConfig)
        ))}
      </div>

      {/* Inline properties */}
      {inlineProperties.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          {inlineProperties.map(([key, propertyConfig]) => (
            renderProperty(key, data[key], propertyConfig)
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyRenderer; 