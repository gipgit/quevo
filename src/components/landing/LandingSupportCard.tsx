'use client'

import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

interface LandingSupportCardProps {
  title: string
  description: string
  buttonText: string
}

export default function LandingSupportCard({ 
  title, 
  description, 
  buttonText 
}: LandingSupportCardProps) {
  return (
    <div className="mt-12 mb-8">
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 p-8" style={{ background: 'linear-gradient(135deg, rgb(224, 242, 254) 0%, rgb(237, 233, 254) 50%, rgb(254, 240, 252) 100%)' }}>
        {/* Gradient Layer 1 */}
        <div 
          className="absolute z-0"
          style={{
            background: 'linear-gradient(143.241deg, rgb(167, 139, 250) 0%, rgb(236, 72, 153) 50%, rgb(251, 146, 60) 100%)',
            filter: 'blur(60px)',
            borderRadius: '100%',
            opacity: 0.25,
            height: '300px',
            left: '-100px',
            bottom: '-120px',
            width: '400px'
          }}
        ></div>
        
        {/* Gradient Layer 2 */}
        <div 
          className="absolute z-0"
          style={{
            background: 'linear-gradient(140.017deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 60%, rgb(236, 72, 153) 100%)',
            filter: 'blur(60px)',
            borderRadius: '100%',
            opacity: 0.2,
            height: '250px',
            right: '-80px',
            bottom: '-100px',
            width: '350px'
          }}
        ></div>
        
        {/* Bottom Accent Layer */}
        <div 
          className="absolute z-0"
          style={{
            background: 'linear-gradient(90deg, rgb(192, 132, 252) 0%, rgb(219, 39, 119) 100%)',
            filter: 'blur(40px)',
            opacity: 0.15,
            height: '100px',
            bottom: '-50px',
            left: '0',
            width: '100%',
            borderRadius: '100%'
          }}
        ></div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            {/* App Logo */}
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg z-10">
              <span className="text-white font-bold text-2xl">Q</span>
            </div>
            {/* Chat Icon - Overlapping */}
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg -ml-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-700 mb-6">
            {description}
          </p>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <MessageSquare className="w-5 h-5" />
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  )
}

