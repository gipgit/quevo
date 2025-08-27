"use client"

import React, { useState, useRef, useEffect } from 'react'
import { sanitizeHtmlContent } from '@/lib/utils/html-sanitizer'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  theme?: 'light' | 'dark'
}

const EMOJIS = ['😊', '👍', '⭐', '💡', '📝', '🎯', '✨', '🔥', '✅', '❌', '💪', '🚀', '📈']

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter description...",
  className = "",
  theme = 'light'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  // Handle click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleBlur = () => {
    if (editorRef.current) {
      const rawContent = editorRef.current.innerHTML
      const cleanedContent = sanitizeHtmlContent(rawContent)
      
      // Only update if content was actually cleaned
      if (cleanedContent !== rawContent) {
        if (cleanedContent === '') {
          // If content is empty after cleaning, clear the editor
          editorRef.current.innerHTML = ''
        } else {
          editorRef.current.innerHTML = cleanedContent
        }
        onChange(cleanedContent)
      }
    }
    setIsFocused(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      
      if (editorRef.current) {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          
          // Check if we're in a list
          let currentNode: Node | null = range.commonAncestorContainer
          while (currentNode && currentNode.nodeType !== Node.ELEMENT_NODE) {
            currentNode = currentNode.parentNode
          }
          
          if (currentNode && currentNode.nodeName === 'LI') {
            // If we're in a list item, create a new list item
            const listItem = document.createElement('li')
            listItem.appendChild(document.createTextNode('\u00A0'))
            currentNode.parentNode?.insertBefore(listItem, currentNode.nextSibling)
            
            // Move cursor to the new list item
            const newRange = document.createRange()
            newRange.setStart(listItem, 0)
            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
          } else {
            // Insert a line break at the current position
            const br = document.createElement('br')
            range.insertNode(br)
            range.setStartAfter(br)
            range.collapse(true)
            selection.removeAllRanges()
            selection.addRange(range)
          }
          
          handleInput()
        }
      }
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      // Ensure the editor is focused first
      editorRef.current.focus()
      
      // Get the current selection after focusing
      const selection = window.getSelection()
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        
        // Check if the selection is within our editor
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          const textNode = document.createTextNode(emoji)
          range.insertNode(textNode)
          range.collapse(false)
          selection.removeAllRanges()
          selection.addRange(range)
          handleInput()
        } else {
          // If selection is not in our editor, append to the end
          editorRef.current.innerHTML += emoji
          handleInput()
        }
      } else {
        // If no selection, append to the end
        editorRef.current.innerHTML += emoji
        handleInput()
      }
    }
    setShowEmojiPicker(false)
  }

  const insertList = (type: 'ul' | 'ol') => {
    if (editorRef.current) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const selectedContent = range.toString().trim()
        
        // Check if we're already in a list
        let currentNode: Node | null = range.commonAncestorContainer
        while (currentNode && currentNode.nodeType !== Node.ELEMENT_NODE) {
          currentNode = currentNode.parentNode
        }
        
        if (currentNode && (currentNode.nodeName === 'LI' || currentNode.nodeName === 'UL' || currentNode.nodeName === 'OL')) {
          // If we're in a list, just format the current selection
          if (type === 'ul') {
            document.execCommand('insertUnorderedList', false, undefined)
          } else {
            document.execCommand('insertOrderedList', false, undefined)
          }
        } else {
          if (selectedContent) {
            // If there's selected text, wrap it in a list
            const list = document.createElement(type)
            const listItem = document.createElement('li')
            listItem.textContent = selectedContent
            list.appendChild(listItem)
            range.deleteContents()
            range.insertNode(list)
          } else {
            // If no text is selected, create an empty list item
            const list = document.createElement(type)
            const listItem = document.createElement('li')
            listItem.appendChild(document.createTextNode('\u00A0'))
            list.appendChild(listItem)
            range.insertNode(list)
            // Move cursor inside the list item
            const newRange = document.createRange()
            newRange.setStart(listItem, 0)
            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
          }
        }
        handleInput()
      } else {
        // If no selection, create a list at the end
        const list = document.createElement(type)
        const listItem = document.createElement('li')
        listItem.appendChild(document.createTextNode('\u00A0'))
        list.appendChild(listItem)
        editorRef.current.appendChild(list)
        handleInput()
        
        // Focus on the new list item
        const newRange = document.createRange()
        newRange.setStart(listItem, 0)
        newRange.collapse(true)
        const newSelection = window.getSelection()
        if (newSelection) {
          newSelection.removeAllRanges()
          newSelection.addRange(newRange)
        }
      }
    }
  }

  const isActive = (command: string) => {
    if (!isClient || typeof document === 'undefined') return false
    return document.queryCommandState(command)
  }

  // Don't render until client is ready
  if (!isClient) {
    return (
      <div className={`border rounded-lg ${className} ${
        theme === 'dark' 
          ? 'border-gray-600 bg-zinc-800' 
          : 'border-gray-300 bg-white'
      }`}>
        <div className={`p-3 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Loading editor...
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg ${className} ${
      theme === 'dark' 
        ? 'border-gray-600 bg-zinc-800' 
        : 'border-gray-300 bg-white'
    }`}>
      {/* Toolbar */}
      <div className={`flex items-center gap-1 p-2 border-b ${
        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className={`p-2 rounded hover:bg-gray-100 ${
            theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'
          } ${isActive('bold') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Bold"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.6 11.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 7.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
          </svg>
        </button>
        
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className={`p-2 rounded hover:bg-gray-100 ${
            theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'
          } ${isActive('underline') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Underline"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
          </svg>
        </button>

        <div className={`w-px h-6 ${
          theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
        }`}></div>

        <button
          type="button"
          onClick={() => insertList('ul')}
          className={`p-2 rounded hover:bg-gray-100 ${
            theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'
          }`}
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z"/>
          </svg>
        </button>

        <button
          type="button"
          onClick={() => insertList('ol')}
          className={`p-2 rounded hover:bg-gray-100 ${
            theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'
          }`}
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 4h16v2H2V4zm0 5h16v2H2V9zm0 5h16v2H2v-2z"/>
          </svg>
        </button>

        <div className={`w-px h-6 ${
          theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
        }`}></div>

        {/* Emoji Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded hover:bg-gray-100 ${
              theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'
            }`}
            title="Insert Emoji"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm7-1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
            </svg>
          </button>
          
          {/* Emoji Dropdown */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className={`absolute top-full left-0 mt-1 border rounded-lg shadow-lg p-3 z-10 ${
                theme === 'dark' 
                  ? 'bg-zinc-700 border-gray-600' 
                  : 'bg-white border-gray-200'
              }`}>
              <div className="grid grid-cols-4 gap-2 w-48">
                {EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className={`p-2 hover:bg-gray-100 rounded text-xl transition-colors ${
                      theme === 'dark' ? 'hover:bg-zinc-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        className={`min-h-[120px] p-3 outline-none ${
          theme === 'dark' 
            ? 'text-gray-100' 
            : 'text-gray-900'
        } ${!value && !isFocused ? 'text-gray-500' : ''}`}
        data-placeholder={placeholder}
        style={{
          minHeight: '120px',
          lineHeight: '1.5'
        }}
      />
    </div>
  )
} 