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

  // Default social icons if none provided
  const defaultSocialLinks = socialLinks.length > 0 ? socialLinks : [
    { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
    { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
    { type: 'web', icon: '/icons/web.png', url: '#' }
  ];

  if (variant === 'mobile') {
    return (
      <div className={`bg-white rounded-3xl shadow-2xl p-1 ${className}`} style={{ fontFamily: theme.fontFamily }}>
        <div className="w-[240px] h-[460px] rounded-2xl overflow-hidden relative" style={{ backgroundColor: theme.backgroundColor }}>
          {/* Mobile Cover Image */}
          <div className="w-full h-28 relative" style={{ background: `linear-gradient(to bottom right, ${theme.primaryColor}, ${theme.secondaryColor})` }}>
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
            <div className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg z-10">
              <div className="flex flex-col gap-1">
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Mobile Profile Image */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-white shadow-lg">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt=""
                  width={64}
                  height={64}
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
          <div className="pt-10 px-4 text-center">
            {/* Business Name */}
            <h2 className="text-lg font-bold mb-2" style={{ color: theme.textColor }}>{name}</h2>
            
            {/* Description */}
            {description && (
              <p className="text-xs mb-3 leading-relaxed" style={{ color: theme.textColor }}>
                {description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-lg" style={{ backgroundColor: theme.buttonBgColor }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-lg" style={{ backgroundColor: theme.buttonBgColor }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-lg" style={{ backgroundColor: theme.buttonBgColor }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-2">
              {defaultSocialLinks.map((social, index) => (
                <div key={index} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <Image
                    src={social.icon}
                    alt={social.type}
                    width={14}
                    height={14}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Tabs */}
            <div className="mt-4 border-t border-gray-200 pt-3">
              <div className="flex justify-around text-xs">
                <span className="font-medium border-b-2 pb-1" style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}>Servizi</span>
                <span style={{ color: theme.textColor }}>Prodotti</span>
                <span style={{ color: theme.textColor }}>Promozioni</span>
                <span style={{ color: theme.textColor }}>Rewards</span>
              </div>
            </div>

            {/* Service Card */}
            <div className="mt-4 mx-2 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${theme.accentColor}20` }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.accentColor }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: theme.textColor }}>Servizio Base</h4>
                  <p className="text-xs" style={{ color: theme.textColor }}>€50</p>
                </div>
              </div>
              <div className="w-full text-white text-xs font-medium rounded-lg py-2 text-center" style={{ backgroundColor: theme.buttonBgColor }}>
                Prenota
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className={`bg-white rounded-lg shadow-2xl overflow-hidden ${className}`} style={{ fontFamily: theme.fontFamily }}>
      <div className="w-full max-w-7xl">
        {/* Desktop Navigation Bar */}
        <div className="w-full bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left side - Profile image and business name */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
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
              <h1 className="text-lg font-semibold" style={{ color: theme.textColor }}>{name}</h1>
            </div>

            {/* Center - Navigation links */}
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium border-b-2 pb-1" style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}>Servizi</span>
              <span className="text-sm font-medium" style={{ color: theme.textColor }}>Prodotti</span>
              <span className="text-sm font-medium" style={{ color: theme.textColor }}>Promozioni</span>
              <span className="text-sm font-medium" style={{ color: theme.textColor }}>Rewards</span>
            </div>

            {/* Right side - Social links and action buttons */}
            <div className="flex items-center space-x-3">
              {/* Social Links */}
              <div className="flex items-center space-x-2">
                {defaultSocialLinks.map((social, index) => (
                  <div key={index} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
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
              <div className="px-4 py-2 text-white text-sm font-medium rounded-lg" style={{ backgroundColor: theme.buttonBgColor }}>
                Chiama
              </div>
              <div className="px-4 py-2 text-white text-sm font-medium rounded-lg" style={{ backgroundColor: theme.buttonBgColor }}>
                Email
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Cover Image - Big Card with Margins */}
        <div className="mx-8 my-6">
          <div className="w-full h-56 relative rounded-xl overflow-hidden shadow-lg" style={{ background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})` }}>
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
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-10">
              <div className="text-white">
                <h2 className="text-5xl font-bold mb-3">{name}</h2>
                {description && (
                  <p className="text-2xl opacity-90 line-clamp-2">{description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Services Cards Section - 3-Column Layout */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-3 gap-6">
            {/* Service Card 1 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.accentColor}20` }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.accentColor }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>Servizio Base</h3>
              <p className="text-sm mb-4" style={{ color: theme.textColor }}>Descrizione del servizio base offerto dall'azienda.</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: theme.primaryColor }}>€50</span>
                <div className="px-4 py-2 text-white text-sm rounded-lg" style={{ backgroundColor: theme.buttonBgColor }}>
                  Prenota
                </div>
              </div>
            </div>

            {/* Service Card 2 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.accentColor}20` }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.accentColor }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>Servizio Premium</h3>
              <p className="text-sm mb-4" style={{ color: theme.textColor }}>Servizio avanzato con funzionalità esclusive.</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: theme.primaryColor }}>€120</span>
                <div className="px-4 py-2 text-white text-sm rounded-lg" style={{ backgroundColor: theme.buttonBgColor }}>
                  Prenota
                </div>
              </div>
            </div>

            {/* Service Card 3 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.accentColor}20` }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.accentColor }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>Servizio VIP</h3>
              <p className="text-sm mb-4" style={{ color: theme.textColor }}>Servizio di lusso con assistenza dedicata.</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: theme.primaryColor }}>€250</span>
                <div className="px-4 py-2 text-white text-sm rounded-lg" style={{ backgroundColor: theme.buttonBgColor }}>
                  Prenota
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
