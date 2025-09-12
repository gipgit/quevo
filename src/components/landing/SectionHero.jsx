// components/landing/SectionHero.jsx
'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import BusinessProfileScreenshot from './BusinessProfileScreenshot';

// Example businesses data based on actual database entries
const exampleBusinesses = {
  it: [
    {
      id: 1,
      name: "Azienda Edilizia",
      url: "azienda_edilizia",
      category: "Edilizia",
      description: "Servizi di edilizia e ristrutturazione per la casa e l'ufficio.",
      coverImage: "/uploads/business/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/cover-desktop.webp",
      profileImage: "/uploads/business/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#262625", // From BusinessProfileSettings theme_color_button
        secondaryColor: "#1a1a19", // Darker version
        accentColor: "#404040", // Medium gray
        backgroundColor: "#F5F5F5", // From BusinessProfileSettings theme_color_background
        textColor: "#333333", // From BusinessProfileSettings theme_color_text
        buttonBgColor: "#262625", // From BusinessProfileSettings theme_color_button
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Font1"
      }
    },
    {
      id: 2,
      name: "Azienda Traslochi",
      url: "azienda_traslochi",
      category: "Traslochi",
      description: "Servizi di traslochi e trasporti per casa e ufficio.",
      coverImage: "/uploads/business/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6f/cover-desktop.webp",
      profileImage: "/uploads/business/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6f/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#262625", // From BusinessProfileSettings theme_color_button
        secondaryColor: "#1a1a19", // Darker version
        accentColor: "#404040", // Medium gray
        backgroundColor: "#F5F5F5", // From BusinessProfileSettings theme_color_background
        textColor: "#333333", // From BusinessProfileSettings theme_color_text
        buttonBgColor: "#262625", // From BusinessProfileSettings theme_color_button
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Font1"
      }
    },
    {
      id: 3,
      name: "Digital Marketing Agency",
      url: "digital_marketing_agency",
      category: "Marketing Digitale",
      description: "Agenzia di marketing digitale e comunicazione strategica.",
      coverImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/cover-desktop.webp",
      profileImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#8826ff", // From BusinessProfileSettings theme_color_button
        secondaryColor: "#6b1fcc", // Darker purple
        accentColor: "#a855f7", // Light purple
        backgroundColor: "#212121", // From BusinessProfileSettings theme_color_background
        textColor: "#C4E8FF", // From BusinessProfileSettings theme_color_text
        buttonBgColor: "#8826ff", // From BusinessProfileSettings theme_color_button
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Font4"
      }
    },
    {
      id: 4,
      name: "Studio Commercialista",
      url: "studio_commercialista",
      category: "Consulenza",
      description: "Consulenza fiscale, bilanci, dichiarazioni e pianificazione.",
      coverImage: "/uploads/business/b8e2f3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b/cover-desktop.webp",
      profileImage: "/uploads/business/b8e2f3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#1E40AF", // From BusinessProfileSettings theme_color_button
        secondaryColor: "#1e3a8a", // Darker blue
        accentColor: "#3b82f6", // Light blue
        backgroundColor: "#FFFFFF", // From BusinessProfileSettings theme_color_background
        textColor: "#0B0B0B", // From BusinessProfileSettings theme_color_text
        buttonBgColor: "#1E40AF", // From BusinessProfileSettings theme_color_button
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Font3"
      }
    },
    {
      id: 5,
      name: "Studio Legale",
      url: "studio_legale",
      category: "Consulenza Legale",
      description: "Consulenza legale specializzata in diritto civile, commerciale e del lavoro.",
      coverImage: "/uploads/business/f8a5c3b9-1e7d-4c0a-9d2e-0f1a2b3c4d5e/cover-desktop.webp",
      profileImage: "/uploads/business/f8a5c3b9-1e7d-4c0a-9d2e-0f1a2b3c4d5e/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#313131", // From BusinessProfileSettings theme_color_button
        secondaryColor: "#1f1f1f", // Darker gray
        accentColor: "#525252", // Medium gray
        backgroundColor: "#F8F8F7", // From BusinessProfileSettings theme_color_background
        textColor: "#725D58", // From BusinessProfileSettings theme_color_text
        buttonBgColor: "#313131", // From BusinessProfileSettings theme_color_button
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Font5"
      }
    },
    {
      id: 6,
      name: "Studio Notarile",
      url: "studio_notarile",
      category: "Servizi Notarili",
      description: "Atti notarili, autenticazioni, stipule e consulenze.",
      coverImage: "/uploads/business/a7f1e2d3-4c5b-6a7d-8e9f-0a1b2c3d4e5f/cover-desktop.webp",
      profileImage: "/uploads/business/a7f1e2d3-4c5b-6a7d-8e9f-0a1b2c3d4e5f/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#1E40AF", // From BusinessProfileSettings theme_color_button
        secondaryColor: "#1e3a8a", // Darker blue
        accentColor: "#3b82f6", // Light blue
        backgroundColor: "#FFFFFF", // From BusinessProfileSettings theme_color_background
        textColor: "#0B0B0B", // From BusinessProfileSettings theme_color_text
        buttonBgColor: "#1E40AF", // From BusinessProfileSettings theme_color_button
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Font1"
      }
    },
    {
      id: 7,
      name: "Agenzia Immobiliare",
      url: "agenzia_immobiliare",
      category: "Immobiliare",
      description: "Servizi immobiliari completi a Roma.",
      coverImage: "/uploads/business/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/cover-desktop.webp",
      profileImage: "/uploads/business/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#6C757D", // From BusinessProfileSettings theme_color_button
        secondaryColor: "#495057", // Darker gray
        accentColor: "#868e96", // Light gray
        backgroundColor: "#F8F9FA", // From BusinessProfileSettings theme_color_background
        textColor: "#495057", // From BusinessProfileSettings theme_color_text
        buttonBgColor: "#6C757D", // From BusinessProfileSettings theme_color_button
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Font1"
      }
    },
    {
      id: 8,
      name: "Concessionaria Auto",
      url: "concessionaria_auto",
      category: "Auto",
      description: "Vendita e assistenza auto nuove e usate.",
      coverImage: "/uploads/business/c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f/cover-desktop.webp",
      profileImage: "/uploads/business/c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#6C757D", // From BusinessProfileSettings theme_color_button
        secondaryColor: "#495057", // Darker gray
        accentColor: "#868e96", // Light gray
        backgroundColor: "#F8F9FA", // From BusinessProfileSettings theme_color_background
        textColor: "#495057", // From BusinessProfileSettings theme_color_text
        buttonBgColor: "#6C757D", // From BusinessProfileSettings theme_color_button
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Font1"
      }
    }
  ],
  en: [
    {
      id: 1,
      name: "Construction Company",
      url: "azienda_edilizia",
      category: "Construction",
      description: "Construction and renovation services for home and office.",
      coverImage: "/uploads/business/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/cover-desktop.webp",
      profileImage: "/uploads/business/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#262625",
        secondaryColor: "#1a1a19",
        accentColor: "#404040",
        backgroundColor: "#F5F5F5",
        textColor: "#333333",
        buttonBgColor: "#262625",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 2,
      name: "Moving Company",
      url: "azienda_traslochi",
      category: "Moving Services",
      description: "Moving and transport services for home and office.",
      coverImage: "/uploads/business/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6f/cover-desktop.webp",
      profileImage: "/uploads/business/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6f/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#262625",
        secondaryColor: "#1a1a19",
        accentColor: "#404040",
        backgroundColor: "#F5F5F5",
        textColor: "#333333",
        buttonBgColor: "#262625",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 3,
      name: "Digital Marketing Agency",
      url: "digital_marketing_agency",
      category: "Digital Marketing",
      description: "Digital marketing agency and strategic communication.",
      coverImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/cover-desktop.webp",
      profileImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#8826ff",
        secondaryColor: "#6b1fcc",
        accentColor: "#a855f7",
        backgroundColor: "#212121",
        textColor: "#C4E8FF",
        buttonBgColor: "#8826ff",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font2"
      }
    },
    {
      id: 4,
      name: "Accounting Studio",
      url: "studio_commercialista",
      category: "Consulting",
      description: "Tax consulting, financial statements, declarations and planning.",
      coverImage: "/uploads/business/b8e2f3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b/cover-desktop.webp",
      profileImage: "/uploads/business/b8e2f3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#1E40AF",
        secondaryColor: "#1e3a8a",
        accentColor: "#3b82f6",
        backgroundColor: "#FFFFFF",
        textColor: "#0B0B0B",
        buttonBgColor: "#1E40AF",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font3"
      }
    },
    {
      id: 5,
      name: "Law Firm",
      url: "studio_legale",
      category: "Legal Consulting",
      description: "Legal consulting specialized in civil, commercial and labor law.",
      coverImage: "/uploads/business/f8a5c3b9-1e7d-4c0a-9d2e-0f1a2b3c4d5e/cover-desktop.webp",
      profileImage: "/uploads/business/f8a5c3b9-1e7d-4c0a-9d2e-0f1a2b3c4d5e/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#313131",
        secondaryColor: "#1f1f1f",
        accentColor: "#525252",
        backgroundColor: "#F8F8F7",
        textColor: "#725D58",
        buttonBgColor: "#313131",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 6,
      name: "Notary Office",
      url: "studio_notarile",
      category: "Notary Services",
      description: "Notarial acts, authentications, stipulations and consultations.",
      coverImage: "/uploads/business/a7f1e2d3-4c5b-6a7d-8e9f-0a1b2c3d4e5f/cover-desktop.webp",
      profileImage: "/uploads/business/a7f1e2d3-4c5b-6a7d-8e9f-0a1b2c3d4e5f/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#1E40AF",
        secondaryColor: "#1e3a8a",
        accentColor: "#3b82f6",
        backgroundColor: "#FFFFFF",
        textColor: "#0B0B0B",
        buttonBgColor: "#1E40AF",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 7,
      name: "Real Estate Agency",
      url: "agenzia_immobiliare",
      category: "Real Estate",
      description: "Complete real estate services in Rome.",
      coverImage: "/uploads/business/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/cover-desktop.webp",
      profileImage: "/uploads/business/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#6C757D",
        secondaryColor: "#495057",
        accentColor: "#868e96",
        backgroundColor: "#F8F9FA",
        textColor: "#495057",
        buttonBgColor: "#6C757D",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 8,
      name: "Auto Dealership",
      url: "concessionaria_auto",
      category: "Automotive",
      description: "New and used car sales and service.",
      coverImage: "/uploads/business/c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f/cover-desktop.webp",
      profileImage: "/uploads/business/c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#6C757D",
        secondaryColor: "#495057",
        accentColor: "#868e96",
        backgroundColor: "#F8F9FA",
        textColor: "#495057",
        buttonBgColor: "#6C757D",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    }
  ],
  es: [
    {
      id: 1,
      name: "Empresa de Construcción",
      url: "azienda_edilizia",
      category: "Construcción",
      description: "Servicios de construcción y renovación para hogar y oficina.",
      coverImage: "/uploads/business/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/cover-desktop.webp",
      profileImage: "/uploads/business/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#262625",
        secondaryColor: "#1a1a19",
        accentColor: "#404040",
        backgroundColor: "#F5F5F5",
        textColor: "#333333",
        buttonBgColor: "#262625",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 2,
      name: "Empresa de Mudanzas",
      url: "azienda_traslochi",
      category: "Mudanzas",
      description: "Servicios de mudanzas y transporte para hogar y oficina.",
      coverImage: "/uploads/business/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6f/cover-desktop.webp",
      profileImage: "/uploads/business/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6f/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#262625",
        secondaryColor: "#1a1a19",
        accentColor: "#404040",
        backgroundColor: "#F5F5F5",
        textColor: "#333333",
        buttonBgColor: "#262625",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 3,
      name: "Agencia de Marketing Digital",
      url: "digital_marketing_agency",
      category: "Marketing Digital",
      description: "Agencia de marketing digital y comunicación estratégica.",
      coverImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/cover-desktop.webp",
      profileImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#8826ff",
        secondaryColor: "#6b1fcc",
        accentColor: "#a855f7",
        backgroundColor: "#212121",
        textColor: "#C4E8FF",
        buttonBgColor: "#8826ff",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font2"
      }
    },
    {
      id: 4,
      name: "Estudio Contable",
      url: "studio_commercialista",
      category: "Consultoría",
      description: "Consultoría fiscal, balances, declaraciones y planificación.",
      coverImage: "/uploads/business/b8e2f3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b/cover-desktop.webp",
      profileImage: "/uploads/business/b8e2f3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#1E40AF",
        secondaryColor: "#1e3a8a",
        accentColor: "#3b82f6",
        backgroundColor: "#FFFFFF",
        textColor: "#0B0B0B",
        buttonBgColor: "#1E40AF",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font3"
      }
    },
    {
      id: 5,
      name: "Bufete de Abogados",
      url: "studio_legale",
      category: "Consultoría Legal",
      description: "Consultoría legal especializada en derecho civil, comercial y laboral.",
      coverImage: "/uploads/business/f8a5c3b9-1e7d-4c0a-9d2e-0f1a2b3c4d5e/cover-desktop.webp",
      profileImage: "/uploads/business/f8a5c3b9-1e7d-4c0a-9d2e-0f1a2b3c4d5e/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#313131",
        secondaryColor: "#1f1f1f",
        accentColor: "#525252",
        backgroundColor: "#F8F8F7",
        textColor: "#725D58",
        buttonBgColor: "#313131",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 6,
      name: "Notaría",
      url: "studio_notarile",
      category: "Servicios Notariales",
      description: "Actos notariales, autenticaciones, estipulaciones y consultas.",
      coverImage: "/uploads/business/a7f1e2d3-4c5b-6a7d-8e9f-0a1b2c3d4e5f/cover-desktop.webp",
      profileImage: "/uploads/business/a7f1e2d3-4c5b-6a7d-8e9f-0a1b2c3d4e5f/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#1E40AF",
        secondaryColor: "#1e3a8a",
        accentColor: "#3b82f6",
        backgroundColor: "#FFFFFF",
        textColor: "#0B0B0B",
        buttonBgColor: "#1E40AF",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 7,
      name: "Agencia Inmobiliaria",
      url: "agenzia_immobiliare",
      category: "Inmobiliaria",
      description: "Servicios inmobiliarios completos en Roma.",
      coverImage: "/uploads/business/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/cover-desktop.webp",
      profileImage: "/uploads/business/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#6C757D",
        secondaryColor: "#495057",
        accentColor: "#868e96",
        backgroundColor: "#F8F9FA",
        textColor: "#495057",
        buttonBgColor: "#6C757D",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 8,
      name: "Concesionario Auto",
      url: "concessionaria_auto",
      category: "Automóviles",
      description: "Venta y asistencia de autos nuevos y usados.",
      coverImage: "/uploads/business/c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f/cover-desktop.webp",
      profileImage: "/uploads/business/c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#6C757D",
        secondaryColor: "#495057",
        accentColor: "#868e96",
        backgroundColor: "#F8F9FA",
        textColor: "#495057",
        buttonBgColor: "#6C757D",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    }
  ]
};

export default function SectionHero({ locale }) {
    const t = useTranslations('Landing');
    const tCommon = useTranslations('Common');
    const [currentBusinessIndex, setCurrentBusinessIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(3000); // 3 seconds in milliseconds
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const sectionRef = useRef(null);
    
    // Use the passed locale prop instead of detecting from URL
    const currentLocale = ['it', 'en', 'es', 'de', 'fr'].includes(locale) ? locale : 'it';
    const businesses = exampleBusinesses[currentLocale] || exampleBusinesses.it;

    const renderTitleWithHighlighting = (text) => {
        const words = text.split(' ');
        return (
            <span>
                {words.map((word, index) => {
                    const cleanWord = word.replace(/[.,]/g, '');
                    
                    // AI-related word to highlight in blue
                    const isAIWord = cleanWord === 'AI-Powered' || 
                                   cleanWord === 'AI' ||
                                   cleanWord === 'Intelligent' ||
                                   cleanWord === 'Smart' ||
                                   cleanWord === 'Alimentata' ||
                                   cleanWord === 'Impulsada' ||
                                   cleanWord === 'intelligente' ||
                                   cleanWord === 'inteligente';
                    
                    // Word to highlight in italic
                    const isItalicWord = cleanWord === 'Grows' || 
                                       cleanWord === 'Grow' ||
                                       cleanWord === 'Growing' ||
                                       cleanWord === 'Evolves' ||
                                       cleanWord === 'Evolving' ||
                                       cleanWord === 'Adapts' ||
                                       cleanWord === 'Adapting' ||
                                       cleanWord === 'Cresce' ||
                                       cleanWord === 'Crece' ||
                                       cleanWord === 'Crescendo' ||
                                       cleanWord === 'Creciendo' ||
                                       cleanWord === 'Con' ||
                                       cleanWord === 'Contigo';
                    
                    return (
                        <span key={index}>
                            {isAIWord ? (
                                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">{word}</span>
                            ) : isItalicWord ? (
                                <em className="font-italic">{word}</em>
                            ) : (
                                word
                            )}
                            {index < words.length - 1 && ' '}
                        </span>
                    );
                })}
            </span>
        );
    };

    const renderTextWithItalic = (text) => {
        const words = text.split(' ');
        return (
            <span>
                {words.map((word, index) => {
                    const cleanWord = word.replace(/[.,]/g, '');
                    // Check for all translations of the specified words
                    const isItalic = cleanWord === 'one' || 
                                   cleanWord === 'single' || 
                                   cleanWord === 'intuitive' || 
                                   cleanWord === 'screen' ||
                                   cleanWord === 'increase' ||
                                   cleanWord === 'conversions' ||
                                   cleanWord === 'streamline' ||
                                   cleanWord === 'operations' ||
                                   cleanWord === 'grows' ||
                                   cleanWord === 'grow' ||
                                   cleanWord === 'growing' ||
                                   cleanWord === 'evolving' ||
                                   cleanWord === 'evolve' ||
                                   cleanWord === 'adapts' ||
                                   cleanWord === 'adapt' ||
                                   cleanWord === 'amplify' ||
                                   cleanWord === 'amplifies' ||
                                   cleanWord === 'intelligent' ||
                                   cleanWord === 'automation' ||
                                   // Italian translations
                                   cleanWord === 'unico' ||
                                   cleanWord === 'schermo' ||
                                   cleanWord === 'intuitivo' ||
                                   cleanWord === 'aumenta' ||
                                   cleanWord === 'conversioni' ||
                                   cleanWord === 'ottimizza' ||
                                   cleanWord === 'operazioni' ||
                                   // Spanish translations
                                   cleanWord === 'sola' ||
                                   cleanWord === 'pantalla' ||
                                   cleanWord === 'intuitiva' ||
                                   cleanWord === 'aumenta' ||
                                   cleanWord === 'conversiones' ||
                                   cleanWord === 'optimiza' ||
                                   cleanWord === 'operaciones';
                    
                    return (
                        <span key={index}>
                            {isItalic ? (
                                <span className="font-italic">{cleanWord}</span>
                            ) : (
                                word
                            )}
                            {index < words.length - 1 && ' '}
                        </span>
                    );
                })}
            </span>
        );
    };

    // Auto-play carousel with time tracking
    useEffect(() => {
        if (!isAutoPlaying) {
            setTimeRemaining(3000);
            return;
        }

        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 3000 - elapsed);
            setTimeRemaining(remaining);

            if (remaining <= 0) {
                setCurrentBusinessIndex((prev) => (prev + 1) % businesses.length);
                setTimeRemaining(3000);
            }
        }, 50); // Update every 50ms for smooth animation

        return () => clearInterval(interval);
    }, [isAutoPlaying, businesses.length, currentBusinessIndex]);

    // Screen size detection
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint is 1024px
        };

        checkScreenSize(); // Initial check
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Scroll detection for horizontal movement effect (mobile only)
    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current || !isMobile) {
                setScrollProgress(0);
                return;
            }

            const section = sectionRef.current;
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate scroll progress within the section
            // When section is fully visible, progress is 0
            // When section starts to leave view, progress increases
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            
            // Only apply effect when section is in view
            if (sectionTop < windowHeight && sectionTop + sectionHeight > 0) {
                // Calculate progress: 0 when section is at top, 1 when section is at bottom
                // Start movement even later by increasing the early start offset more
                const progress = Math.max(0, Math.min(1, (windowHeight - sectionTop - 350) / (windowHeight + sectionHeight - 450)));
                setScrollProgress(progress);
            } else {
                setScrollProgress(0);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial call

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMobile]);

    const handleBusinessSelect = (index) => {
        setCurrentBusinessIndex(index);
        setIsAutoPlaying(false);
        setTimeRemaining(3000);
        
        // Resume auto-play after 5 seconds of manual navigation
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    const currentBusiness = businesses[currentBusinessIndex];
    const progressPercentage = ((3000 - timeRemaining) / 3000) * 100;

    return (
        <section ref={sectionRef} className="min-h-screen flex items-center overflow-x-hidden relative">
            {/* Light Gradient Background Layers */}
            <div 
                className="absolute inset-0 z-0"
                style={{ 
                    background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 20%, rgb(250, 250, 252) 100%)'
                }}
            >
                {/* Gradient Layer 1 */}
                <div 
                    className="absolute z-1"
                    style={{
                        background: 'linear-gradient(143.241deg, rgb(240, 248, 255) 0%, rgb(245, 240, 255) 31.087%, rgb(255, 248, 240) 70.4599%, rgb(255, 240, 248) 100%)',
                        filter: 'blur(120px)',
                        borderRadius: '100%',
                        opacity: 0.8,
                        height: '800px',
                        left: '-300px',
                        top: '-200px',
                        width: '900px'
                    }}
                ></div>
                
                {/* Gradient Layer 2 */}
                <div 
                    className="absolute z-1"
                    style={{
                        background: 'linear-gradient(143.241deg, rgb(240, 255, 248) 0%, rgb(248, 240, 255) 31.087%, rgb(255, 248, 240) 70.4599%, rgb(248, 240, 255) 100%)',
                        filter: 'blur(100px)',
                        borderRadius: '100%',
                        opacity: 0.7,
                        height: '700px',
                        right: '-250px',
                        bottom: '-200px',
                        width: '800px'
                    }}
                ></div>
                
                {/* Gradient Layer 3 */}
                <div 
                    className="absolute z-1"
                    style={{
                        background: 'linear-gradient(143.241deg, rgb(255, 248, 240) 0%, rgb(240, 248, 255) 31.087%, rgb(245, 240, 255) 70.4599%, rgb(240, 255, 248) 100%)',
                        filter: 'blur(140px)',
                        borderRadius: '100%',
                        opacity: 0.6,
                        height: '1000px',
                        left: '50%',
                        top: '10%',
                        transform: 'translateX(-50%)',
                        width: '1200px'
                    }}
                ></div>
                
                {/* Prominent Light Blue Layer */}
                <div 
                    className="absolute z-1"
                    style={{
                        background: 'linear-gradient(135deg, rgb(219, 234, 254) 0%, rgb(191, 219, 254) 50%, rgb(147, 197, 253) 100%)',
                        filter: 'blur(80px)',
                        borderRadius: '100%',
                        opacity: 0.7,
                        height: '600px',
                        left: '30%',
                        top: '30%',
                        transform: 'translateX(-50%)',
                        width: '800px'
                    }}
                ></div>
            </div>
            <div className="container mx-auto px-8 lg:px-12 py-16 max-w-[1480px] relative z-10">
                <div className="flex flex-col gap-12 items-center">
                    
                    {/* Top Row - Content */}
                     <div className="space-y-6 max-w-[1000px] text-center">
                         <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-none mb-6">
                             {renderTitleWithHighlighting(t('Hero.title'))}
                         </h1>
                         <p className="text-base md:text-lg text-gray-600 leading-tight lg:leading-relaxed">
                             {t('Hero.subtitle')}
                         </p>
                         
                         {/* 3 Horizontal List Items */}
                         <div className="flex flex-wrap justify-center gap-1 lg:gap-6 mt-4">
                             <div className="flex items-center gap-1 lg:gap-2 text-blue-500">
                                 <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                 </svg>
                                 <span className="text-blue-500 font-medium text-sm lg:text-base">{t('Hero.benefits.freePlan')}</span>
                             </div>
                             <div className="flex items-center gap-1 lg:gap-2 text-blue-500">
                                 <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                 </svg>
                                 <span className="text-blue-500 font-medium text-sm lg:text-base">{t('Hero.benefits.noPaymentDetails')}</span>
                             </div>
                             <div className="flex items-center gap-1 lg:gap-2 text-blue-500">
                                 <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                 </svg>
                                 <span className="text-blue-500 font-medium text-sm lg:text-base">{t('Hero.benefits.cancelAnytime')}</span>
                             </div>
                         </div>

                        {/* Example URL Link Pill and Get Started Button */}
                        <div className="inline-flex flex-col sm:flex-row gap-4 items-center justify-center max-w-[90vw] lg:max-w-[700px]">
                               <div className="w-full inline-flex items-center gap-3 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-full px-3 lg:px-6 py-2 lg:py-3 shadow-lg relative" style={{
                               background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, #9d9fa3, #b3b5ba, #bbbfc7) border-box',
                               border: '1px solid transparent'
                             }}>
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                                        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                                        <ellipse cx="10" cy="10" rx="4" ry="9" stroke="currentColor" strokeWidth="2" />
                                        <line x1="1" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="2" />
                                        <line x1="10" y1="1" x2="10" y2="19" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    <span className="text-xs lg:text-sm text-gray-600 font-medium">{tCommon('domainPrefix')}</span>
                                    <span className="text-xs lg:text-sm text-gray-900 font-semibold truncate -ml-2">{currentBusiness.url}</span>
                                </div>
                                <Link 
                                    href={`/${locale}/${currentBusiness.url}`}
                                    className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition-colors flex-shrink-0"
                                >
                                    <span className="text-[9px] lg:text-sm hidden lg:inline">{t('Hero.viewExample')}</span>
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </Link>
                            </div>
                            <Link 
                                href="/signup" 
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 via-black to-gray-800 hover:from-black hover:to-gray-900 text-white px-8 py-3 lg:py-4 rounded-full text-md lg:text-lg transition-all duration-300 shadow-lg hover:shadow-xl  whitespace-nowrap"
                            >
                                {tCommon('getStarted')}
                            </Link>
                        </div>
                    </div>

                    {/* Bottom Column - Carousel with Gradient Background */}
                    <div className="relative">
                        {/* Gradient Background Container */}
                        <div className="relative rounded-3xl p-8 lg:p-12 overflow-hidden" style={{
                          background: 'linear-gradient(135deg, #111827 0%, #1f2937 20%, #374151 40%, #4b5563 60%, #6b7280 80%, #111827 100%)',
                          border: '4px solid transparent',
                          backgroundImage: 'linear-gradient(135deg, #111827 0%, #1f2937 20%, #374151 40%, #4b5563 60%, #6b7280 80%, #111827 100%), linear-gradient(to right, #60a5fa, #8b5cf6, #ec4899, #f59e0b, #10b981, #3b82f6)',
                          backgroundOrigin: 'border-box',
                          backgroundClip: 'padding-box, border-box'
                        }}>
                          {/* Subtle overlay for better readability */}
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                          
                          {/* Content Container */}
                          <div className="relative z-10">
                        {/* Desktop and Smartphone Views */}
                        <div className="relative flex flex-col lg:flex-row justify-center lg:items-center gap-4">
                            {/* Smartphone View */}
                            <div className="relative z-20 -left-1 flex justify-center items-center">
                                    <div className="shadow-[0_20px_40px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)] rounded-3xl">
                                        <BusinessProfileScreenshot 
                                            business={currentBusiness}
                                            variant="mobile"
                                        />
                                    </div>
                            </div>
                            {/* Desktop View */}
                            <div className="relative z-10 w-full max-w-9xl overflow-visible">
                                    <div 
                                        className="shadow-[0_25px_50px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.1)] rounded-2xl transition-transform duration-100 ease-out md:transform-none md:scale-100"
                                        style={{
                                            // Apply horizontal movement and scaling only on mobile (xs to md) with faster movement
                                            // Start positioned to the right, then move left as user scrolls
                                            // Use cubic-bezier for rounder movement curve
                                            // Only apply transform on mobile screens
                                            transform: isMobile 
                                                ? `translateX(${800 + Math.pow(scrollProgress, 0.7) * -1200}px) scale(0.75)`
                                                : 'translateX(0px) scale(1)',
                                        }}
                                    >
                                        <BusinessProfileScreenshot 
                                            business={currentBusiness}
                                            variant="desktop"
                                        />
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Pills - Moved after images */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {businesses.map((business, index) => (
                            <button
                                key={business.id}
                                onClick={() => handleBusinessSelect(index)}
                                className={`relative px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs font-medium transition-all duration-200 overflow-hidden ${
                                    index === currentBusinessIndex
                                        ? 'bg-gray-200 text-gray-500 shadow-lg'
                                        : 'bg-transparent text-gray-500 hover:text-gray-800 border border-gray-300'
                                }`}
                            >
                                {/* Loading bar background */}
                                {index === currentBusinessIndex && isAutoPlaying && (
                                    <div 
                                        className="absolute inset-0 bg-gray-300 transition-all duration-50 ease-linear"
                                        style={{ 
                                            width: `${progressPercentage}%`,
                                            left: '0',
                                            top: '0',
                                            bottom: '0'
                                        }}
                                    />
                                )}
                                {/* Text content */}
                                <span className="relative z-10">{business.category}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
} 