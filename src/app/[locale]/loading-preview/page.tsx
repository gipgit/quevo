'use client'

import React, { useState } from 'react'
import { AIAssistantIcon } from '@/components/ui/ai-assistant-icon'
import { LoadingAIGeneration } from '@/components/ui/loading-ai-generation'
import { Button } from '@/components/ui/button'
import { AIActionButton } from '@/components/ui/ai-action-button'
import { 
  Dialog, 
  DialogContent
} from '@/components/ui/dialog'

export default function LoadingPreviewPage() {
  const [open, setOpen] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-center">
          <Button onClick={() => setOpen(true)}>Open Confirm Generation</Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="no-scroll max-w-xl min-w-[520px] relative overflow-visible p-0">
            {/* Accent Blur Layers */}
            <div 
              className="absolute z-0"
              style={{
                background: 'var(--ai-panel-accent-1)',
                filter: 'blur(40px)',
                opacity: 0.2,
                height: '80px',
                bottom: '-40px',
                left: '0',
                width: '50%',
                borderRadius: '100%'
              }}
            ></div>
            <div 
              className="absolute z-0"
              style={{
                background: 'var(--ai-panel-accent-2)',
                filter: 'blur(40px)',
                opacity: 0.2,
                height: '80px',
                bottom: '-40px',
                right: '0',
                width: '50%',
                borderRadius: '100%'
              }}
            ></div>

            <div className="relative z-10 text-center space-y-4 p-6">
              <div className="flex justify-center">
                {!isGenerating && <AIAssistantIcon size="md" />}
              </div>
              <h3 className="text-lg font-medium ai-panel-text">Generate AI Response</h3>

              {isGenerating ? (
                <div className="py-6">
                  <LoadingAIGeneration size="lg" text="Generating response..." />
                </div>
              ) : (
                <div className="ai-panel-card p-3 rounded-lg text-left">
                  <div className="text-xs ai-panel-text-secondary mb-1">Request Summary</div>
                  <div className="text-xs ai-panel-text space-y-0.5">
                    <div><span className="ai-panel-text-secondary">Category:</span> Example</div>
                    <div><span className="ai-panel-text-secondary">Priority:</span> Medium</div>
                    <div><span className="ai-panel-text-secondary">Message:</span> This is a preview simulation.</div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <AIActionButton
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  text="Generate"
                  loadingText="Generating..."
                  size="md"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
