"use client";

import React, { useState, useEffect } from 'react';
import { UserDefinedTag } from '@/types/service-board';

interface TagManagerProps {
  businessId: string;
  actionType: string;
  selectedTags: UserDefinedTag[];
  onTagsChange: (tags: UserDefinedTag[]) => void;
  onTitleChange?: (title: string) => void;
  currentTitle?: string;
  locale?: string;
}

export default function TagManager({
  businessId,
  actionType,
  selectedTags,
  onTagsChange,
  onTitleChange,
  currentTitle,
  locale = 'it'
}: TagManagerProps) {
  const [availableTags, setAvailableTags] = useState<UserDefinedTag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagType, setNewTagType] = useState<'appointment_title' | 'payment_title' | 'general_tag' | 'category'>('general_tag');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch available tags for this business
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`/api/business/${businessId}/tags?type=${filterType}`);
        if (response.ok) {
          const tags = await response.json();
          setAvailableTags(tags);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, [businessId, filterType]);

  const handleTagToggle = (tag: UserDefinedTag) => {
    const isSelected = selectedTags.some(t => t.tag_id === tag.tag_id);
    
    if (isSelected) {
      // Remove tag
      const updatedTags = selectedTags.filter(t => t.tag_id !== tag.tag_id);
      onTagsChange(updatedTags);
      
      // If this was a title tag, clear the title
      if (tag.tag_type === `${actionType}_title` && onTitleChange) {
        onTitleChange('');
      }
    } else {
      // Add tag
      const updatedTags = [...selectedTags, tag];
      onTagsChange(updatedTags);
      
      // If this is a title tag, set it as the title
      if (tag.tag_type === `${actionType}_title` && onTitleChange) {
        onTitleChange(tag.tag_name);
      }
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreatingTag(true);
    try {
      const response = await fetch(`/api/business/${businessId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag_name: newTagName.trim(),
          tag_type: newTagType,
        }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setAvailableTags(prev => [...prev, newTag]);
        setNewTagName('');
        
        // Auto-select the new tag if it's a title type
        if (newTagType === `${actionType}_title`) {
          onTagsChange([...selectedTags, newTag]);
          if (onTitleChange) {
            onTitleChange(newTag.tag_name);
          }
        }
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const getTagTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment_title': return 'Titolo Appuntamento';
      case 'payment_title': return 'Titolo Pagamento';
      case 'general_tag': return 'Tag Generale';
      case 'category': return 'Categoria';
      default: return type;
    }
  };

  const getTagTypeColor = (type: string) => {
    switch (type) {
      case 'appointment_title': return 'bg-blue-100 text-blue-800';
      case 'payment_title': return 'bg-green-100 text-green-800';
      case 'general_tag': return 'bg-gray-100 text-gray-800';
      case 'category': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTags = availableTags.filter(tag => 
    filterType === 'all' || tag.tag_type === filterType
  );

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 text-sm rounded-full ${
            filterType === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tutti
        </button>
        <button
          onClick={() => setFilterType(`${actionType}_title`)}
          className={`px-3 py-1 text-sm rounded-full ${
            filterType === `${actionType}_title` 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Titoli
        </button>
        <button
          onClick={() => setFilterType('general_tag')}
          className={`px-3 py-1 text-sm rounded-full ${
            filterType === 'general_tag' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tag
        </button>
        <button
          onClick={() => setFilterType('category')}
          className={`px-3 py-1 text-sm rounded-full ${
            filterType === 'category' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Categorie
        </button>
      </div>

      {/* Create New Tag */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-3">Crea Nuovo Tag</h4>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Nome del tag..."
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newTagType}
            onChange={(e) => setNewTagType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="general_tag">Tag Generale</option>
            <option value="category">Categoria</option>
            <option value={`${actionType}_title`}>Titolo {actionType}</option>
          </select>
          <button
            onClick={handleCreateTag}
            disabled={!newTagName.trim() || isCreatingTag}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingTag ? 'Creando...' : 'Crea'}
          </button>
        </div>
      </div>

      {/* Available Tags */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Tag Disponibili</h4>
        <div className="flex flex-wrap gap-2">
          {filteredTags.map((tag) => {
            const isSelected = selectedTags.some(t => t.tag_id === tag.tag_id);
            return (
              <button
                key={tag.tag_id}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  isSelected
                    ? 'bg-blue-500 text-white border-blue-500'
                    : `${getTagTypeColor(tag.tag_type)} border-gray-300 hover:bg-gray-200`
                }`}
              >
                <span className="mr-1">{tag.tag_name}</span>
                <span className={`text-xs px-1 py-0.5 rounded ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {getTagTypeLabel(tag.tag_type)}
                </span>
              </button>
            );
          })}
          {filteredTags.length === 0 && (
            <p className="text-gray-500 text-sm">Nessun tag disponibile per questo tipo.</p>
          )}
        </div>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Tag Selezionati</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <div
                key={tag.tag_id}
                className={`px-3 py-1 text-sm rounded-full ${getTagTypeColor(tag.tag_type)} border border-gray-300`}
              >
                <span className="mr-1">{tag.tag_name}</span>
                <span className="text-xs px-1 py-0.5 rounded bg-gray-200 text-gray-600">
                  {getTagTypeLabel(tag.tag_type)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 