// components/landing/BusinessProfileScreenshot.jsx
'use client';

import React from 'react';
import Image from 'next/image';

const BusinessProfileScreenshot = ({ 
  business, 
  variant = 'desktop', 
  className = '' 
}) => {
  const {
    name,
    description,
    category,
    coverImage,
    profileImage,
    socialLinks = [],
    theme = {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      accentColor: '#60a5fa',
      backgroundColor: '#f8fafc',
      textColor: '#1f2937',
      buttonBgColor: '#3b82f6',
      buttonTextColor: '#ffffff',
      fontFamily: 'Inter'
    }
  } = business;

  // Default social icons if none provided - using better colored SVGs from links-icons folder
  const defaultSocialLinks = socialLinks.length > 0 ? socialLinks : [
    { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
    { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
    { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
    { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
  ];

  if (variant === 'mobile') {
    return (
      <div className={`bg-white rounded-3xl shadow-2xl p-0 ${className}`} style={{ fontFamily: theme.fontFamily, width: '220px', height: '420px' }}>
        <div className="w-full h-full rounded-2xl overflow-hidden flex flex-col" style={{ backgroundColor: theme.backgroundColor }}>
          {/* Mobile Cover Image */}
          <div className="w-full relative flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${theme.primaryColor}, ${theme.secondaryColor})`, height: '100px' }}>
            {coverImage ? (
              <Image
                src={coverImage}
                alt=""
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full" style={{ background: `linear-gradient(to bottom right, ${theme.primaryColor}, ${theme.primaryColor})` }} />
            )}
            
            {/* Gradient Overlay for Smooth Blend */}
            <div 
              className="absolute inset-0" 
              style={{ 
                background: `linear-gradient(to bottom, transparent 0%, transparent 40%, ${theme.backgroundColor} 100%)`
              }}
            />
            
            {/* Mobile Menu Button */}
            <div className="absolute top-2 right-2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg z-10">
              <div className="flex flex-row gap-0.5 px-1">
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Mobile Profile Image */}
          <div className="absolute left-1/2 transform -translate-x-1/2 z-10" style={{ top: '70px' }}>
            <div className="w-14 h-14 rounded-full overflow-hidden" style={{ backgroundColor: theme.backgroundColor, border: `3px solid ${theme.backgroundColor}` }}>
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt=""
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-gray-600 text-xs font-medium">{name?.charAt(0)}</span>
                  </div>
                )}
            </div>
          </div>

          {/* Mobile Content */}
          <div className="px-1 text-center flex-1 flex flex-col" style={{ paddingTop: '28px' }}>
            {/* Business Name */}
            <div className="flex items-center justify-center mb-2 h-6">
              <h2 className="text-sm font-bold leading-tight text-center px-2 truncate" style={{ color: theme.textColor }}>{name}</h2>
            </div>
            
            {/* Description removed for mobile component */}

            {/* Action Buttons */}
            <div className="flex justify-center gap-1 mb-2 h-7">
              <div className="w-6 h-6 rounded-full text-white flex items-center justify-center shadow-lg" style={{ backgroundColor: theme.buttonBgColor }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="w-6 h-6 rounded-full text-white flex items-center justify-center shadow-lg" style={{ backgroundColor: theme.buttonBgColor }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="w-6 h-6 rounded-full text-white flex items-center justify-center shadow-lg" style={{ backgroundColor: theme.buttonBgColor }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-0 h-6">
              {defaultSocialLinks.map((social, index) => (
                <div key={index} className="w-6 h-6 flex items-center justify-center -mx-0.5">
                  <Image
                    src={social.icon}
                    alt={social.type}
                    width={12}
                    height={12}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 pt-2 mb-2 h-8">
              <div className="flex justify-around items-end h-full">
                <span className="font-medium border-b-4 pb-1" style={{ color: theme.primaryColor, borderColor: theme.primaryColor, borderBottomWidth: '4px', fontSize: '10px' }}>Servizi</span>
                <span className="border-b-4 border-transparent pb-1" style={{ color: theme.textColor, fontSize: '10px' }}>Promozioni</span>
                <span className="border-b-4 border-transparent pb-1" style={{ color: theme.textColor, fontSize: '10px' }}>Rewards</span>
              </div>
            </div>

            {/* Service Cards */}
            <div className="space-y-3">
              {/* Service Card 1 */}
              <div className="mx-2 rounded-lg overflow-hidden shadow-sm h-24">
                {/* Service Image with Gradient Background */}
                <div className="w-full h-full rounded-lg overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)` }}>
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  {/* Service content in overlay */}
                  <div className="absolute inset-0 px-2 py-1.5 flex flex-col justify-end">
                    <div className="flex items-center justify-between h-8">
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-1 mb-0.5">
                          <h4 className="text-white font-bold leading-tight truncate text-left" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>Servizio Base</h4>
                          <p className="text-white text-left" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>€50</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-white opacity-80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>Simula Preventivo</span>
                          <span className="text-white opacity-80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>Prenotabile</span>
                        </div>
                      </div>
                      <button className="px-1.5 py-0.5 text-xs rounded-lg font-medium text-white flex-shrink-0 ml-2 flex items-center justify-center" style={{ backgroundColor: theme.buttonBgColor, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                  </div>
                  </div>
                </div>
              </div>

              {/* Service Card 2 */}
              <div className="mx-2 rounded-lg overflow-hidden shadow-sm h-24">
                {/* Service Image with Gradient Background */}
                <div className="w-full h-full rounded-lg overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${theme.accentColor} 0%, ${theme.primaryColor} 100%)` }}>
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  {/* Service content in overlay */}
                  <div className="absolute inset-0 px-2 py-1.5 flex flex-col justify-end">
                    <div className="flex items-center justify-between h-8">
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-1 mb-0.5">
                          <h4 className="text-white font-bold leading-tight truncate text-left" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>Servizio Premium</h4>
                          <p className="text-white text-left" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>€120</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-white opacity-80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>Simula Preventivo</span>
                          <span className="text-white opacity-80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>Prenotabile</span>
                        </div>
                      </div>
                      <button className="px-1.5 py-0.5 text-xs rounded-lg font-medium text-white flex-shrink-0 ml-2 flex items-center justify-center" style={{ backgroundColor: theme.buttonBgColor, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className={`rounded-2xl shadow-2xl overflow-hidden ${className}`} style={{ fontFamily: theme.fontFamily, backgroundColor: theme.backgroundColor, width: '1000px', minWidth: '1000px', maxWidth: '1000px', height: '500px', minHeight: '500px', maxHeight: '500px' }}>
      <div className="w-full h-full flex flex-col" style={{ width: '1000px', minWidth: '1000px', maxWidth: '1000px', height: '500px', minHeight: '500px', maxHeight: '500px' }}>
        {/* Desktop Navigation Bar */}
        <div className="w-full border-b border-gray-200 flex-shrink-0 h-16" style={{ backgroundColor: theme.backgroundColor }}>
          <div className="flex items-center justify-between px-8 py-4 h-full">
            {/* Left side - Profile image, business name, and navigation links */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt=""
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">{name?.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="h-8 flex items-center">
                <h1 className="text-base font-semibold leading-tight truncate" style={{ color: theme.textColor }}>{name}</h1>
              </div>
              
              {/* Navigation links moved here */}
              <div className="flex items-end space-x-4 ml-4 h-8">
                <span className="text-sm font-medium border-b-3 pb-0.5" style={{ color: theme.primaryColor, borderColor: theme.primaryColor, borderBottomWidth: '3px' }}>Servizi</span>
                <span className="text-sm font-medium pb-1" style={{ color: theme.textColor }}>Promozioni</span>
                <span className="text-sm font-medium pb-1" style={{ color: theme.textColor }}>Rewards</span>
              </div>
            </div>

            {/* Right side - Social links and action buttons */}
            <div className="flex items-center space-x-3">
              {/* Social Links */}
              <div className="flex items-center -space-x-1 h-8">
                {defaultSocialLinks.map((social, index) => (
                  <div key={index} className="w-8 h-8 flex items-center justify-center">
                    <Image
                      src={social.icon}
                      alt={social.type}
                      width={16}
                      height={16}
                    />
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="text-white text-sm font-medium rounded-lg px-4 py-2 h-8 flex items-center justify-center gap-2" style={{ backgroundColor: theme.buttonBgColor }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Chiama
              </div>
              <div className="text-white text-sm font-medium rounded-lg px-4 py-2 h-8 flex items-center justify-center gap-2" style={{ backgroundColor: theme.buttonBgColor }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Cover Image - Big Card with Margins */}
        <div className="mx-8 my-6 flex-1">
          <div className="w-full h-full relative rounded-xl overflow-hidden shadow-lg" style={{ background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})` }}>
            {coverImage ? (
              <Image
                src={coverImage}
                alt=""
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full" style={{ background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})` }} />
            )}
            
            {/* Hero Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8 h-24">
              <div className="text-white h-full flex flex-col justify-end">
                <div className="h-10 flex items-end">
                  <h2 className="text-2xl font-bold leading-tight truncate">{name}</h2>
                </div>
                {description && (
                  <div className="h-6 flex items-center mt-1">
                    <p className="text-base opacity-90 truncate">{description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Services Cards Section - 3-Column Layout */}
        <div className="px-8 pb-8 flex-shrink-0">
          <div className="grid grid-cols-3 gap-6" style={{ height: '140px' }}>
            {/* Service Card 1 */}
            <div className="rounded-xl overflow-hidden shadow-sm h-full">
              {/* Service Image with Gradient Background */}
              <div className="w-full h-full rounded-xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)` }}>
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                {/* Service content in overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <div className="flex items-start justify-between h-12">
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white text-sm font-bold leading-tight truncate text-left" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Servizio Base</h3>
                        <p className="text-white text-xs text-left" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>€50</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-white opacity-80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>Simula Preventivo</span>
                        <span className="text-white opacity-80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>Prenotabile</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm rounded-lg font-medium text-white flex-shrink-0 ml-2 flex items-center gap-1" style={{ backgroundColor: theme.buttonBgColor, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                      Prenota
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Card 2 */}
            <div className="rounded-xl overflow-hidden shadow-sm h-full">
              {/* Service Image with Gradient Background */}
              <div className="w-full h-full rounded-xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${theme.accentColor} 0%, ${theme.primaryColor} 100%)` }}>
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                {/* Service content in overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <div className="flex items-start justify-between h-12">
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white text-sm font-bold leading-tight truncate text-left" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Servizio Premium</h3>
                        <p className="text-white text-xs text-left" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>€120</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-white opacity-80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>Simula Preventivo</span>
                        <span className="text-white opacity-80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>Prenotabile</span>
                      </div>
              </div>
                    <button className="px-4 py-2 text-sm rounded-lg font-medium text-white flex-shrink-0 ml-2 flex items-center gap-1" style={{ backgroundColor: theme.buttonBgColor, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                      Prenota
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Card 3 */}
            <div className="rounded-xl overflow-hidden shadow-sm h-full">
              {/* Service Image with Gradient Background */}
              <div className="w-full h-full rounded-xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${theme.secondaryColor} 0%, ${theme.accentColor} 100%)` }}>
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                {/* Service content in overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <div className="flex items-start justify-between h-12">
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white text-sm font-bold leading-tight truncate text-left" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Servizio VIP</h3>
                        <p className="text-white text-xs text-left" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>€250</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-white opacity-80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>Simula Preventivo</span>
                        <span className="text-white opacity-80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '10px' }}>Prenotabile</span>
                      </div>
              </div>
                    <button className="px-4 py-2 text-sm rounded-lg font-medium text-white flex-shrink-0 ml-2 flex items-center gap-1" style={{ backgroundColor: theme.buttonBgColor, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                      Prenota
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfileScreenshot;
