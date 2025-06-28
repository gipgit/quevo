// src/app/[locale]/[business_urlname]/page.tsx
// This is a Server Component, responsible for redirecting to the default section.

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

// This page doesn't need frequent revalidation as its main job is a redirect based on settings.
// The revalidation will happen on the target section's page.
export const revalidate = 3600; // Revalidate settings every hour to check for default_page changes

export default async function BusinessRootPage({ params }: { params: { business_urlname: string; locale: string } }) {
    const { business_urlname, locale } = params;

    if (!business_urlname) {
        notFound(); // Should ideally be caught by parent layout, but good to have
    }

    // Fetch only the default_page setting from businessprofilesettings
    const businessSettingsData = await prisma.business.findUnique({
        where: { business_urlname: business_urlname },
        select: {
            businessprofilesettings: {
                select: { default_page: true }
            }
        },
    });

    if (!businessSettingsData) {
        // If business not found or settings not available, redirect to a generic not found or a fixed default
        notFound();
    }

    const defaultPageSetting = businessSettingsData.businessprofilesettings?.default_page;

    // Map the default_page setting from your database to a URL segment.
    // Make sure these segments match the folder names you'll create under `(sections)/`
    let redirectToSegment: string;
    switch (defaultPageSetting) {
        case 'products':
            redirectToSegment = 'products';
            break;
        case 'promotions':
            redirectToSegment = 'promotions';
            break;
        case 'rewards':
            redirectToSegment = 'rewards';
            break;
        case 'booking':
            redirectToSegment = 'booking';
            break;
        // Add more cases here if you define other section types in your `default_page` setting.
        default:
            // Fallback to 'products' if the setting is null, undefined, or an unrecognized value.
            redirectToSegment = 'products';
            break;
    }

    // Perform the server-side redirect to the default section's URL
    redirect(`/${locale}/${business_urlname}/${redirectToSegment}`);
}