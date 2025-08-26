'use client'

import React, { useState } from 'react'
import { LoadingSparkles } from '@/components/ui/loading-sparkles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function LoadingTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg')
  const [showText, setShowText] = useState(true)
  const [showSpinner, setShowSpinner] = useState(true)
  const [customText, setCustomText] = useState('Generating Content...')
  const [customSubtext, setCustomSubtext] = useState('AI is crafting your perfect email')

  const handleStartLoading = () => {
    setIsLoading(true)
    // Simulate loading for 5 seconds
    setTimeout(() => {
      setIsLoading(false)
    }, 5000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading Sparkles Component Demo</h1>
          <p className="text-lg text-gray-600">Test and refine the loading animation without wasting API calls</p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Component Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label>Size</Label>
                <Select value={size} onValueChange={(value: any) => setSize(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small (32px)</SelectItem>
                    <SelectItem value="md">Medium (48px)</SelectItem>
                    <SelectItem value="lg">Large (80px)</SelectItem>
                    <SelectItem value="xl">Extra Large (96px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Custom Text</Label>
                <Input
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Loading text..."
                />
              </div>

              <div>
                <Label>Custom Subtext</Label>
                <Input
                  value={customSubtext}
                  onChange={(e) => setCustomSubtext(e.target.value)}
                  placeholder="Subtext..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={showText}
                    onCheckedChange={setShowText}
                  />
                  <Label>Show Text</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={showSpinner}
                    onCheckedChange={setShowSpinner}
                  />
                  <Label>Show Spinner</Label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                onClick={handleStartLoading}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Loading...' : 'Start Loading Demo (5 seconds)'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Area */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] flex items-center justify-center bg-white rounded-lg border-2 border-dashed border-gray-300">
              {isLoading ? (
                <LoadingSparkles
                  size={size}
                  showText={showText}
                  text={customText}
                  subtext={customSubtext}
                  showSpinner={showSpinner}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-lg">Click "Start Loading Demo" to see the animation</p>
                  <p className="text-sm mt-2">Current settings: {size} size, {showText ? 'with' : 'without'} text, {showSpinner ? 'with' : 'without'} spinner</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preset Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Preset Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Small Loading</h4>
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded">
                  <LoadingSparkles size="sm" text="Loading..." />
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Medium with Custom Text</h4>
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded">
                  <LoadingSparkles 
                    size="md" 
                    text="Processing..." 
                    subtext="Please wait while we prepare your data"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Large without Spinner</h4>
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded">
                  <LoadingSparkles 
                    size="lg" 
                    text="AI Thinking..." 
                    showSpinner={false}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Extra Large without Text</h4>
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded">
                  <LoadingSparkles 
                    size="xl" 
                    showText={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Usage:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<LoadingSparkles />`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Custom Configuration:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<LoadingSparkles
  size="lg"
  text="Generating Content..."
  subtext="AI is crafting your perfect email"
  showSpinner={true}
/>`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Minimal Version:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<LoadingSparkles
  showText={false}
  showSpinner={false}
/>`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">In Modal Overlay:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-50">
  <LoadingSparkles />
</div>`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
