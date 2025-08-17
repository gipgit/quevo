// src/app/[locale]/[business_urlname]/ai/layout.tsx
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { BusinessProfileClientWrapper } from '../BusinessProfileClientWrapper';
import { hexToRgb, adjustColor } from '@/lib/utils/colors';

interface AIChatLayoutParams {
  locale: string;
  business_urlname: string;
}

// Available fonts (matching main layout)
const AVAILABLE_FONTS_PUBLIC = [
  { font_id: 1, font_name: 'Font1', font_css_stack: 'Font1, Arial, serif' },
  { font_id: 2, font_name: 'Font2', font_css_stack: 'Font2, Arial, serif' },
  { font_id: 3, font_name: 'Font3', font_css_stack: 'Font3, Arial, serif' },
  { font_id: 4, font_name: 'Font4', font_css_stack: "Font4, Arial, serif" },
  { font_id: 5, font_name: 'Font5', font_css_stack: "Font5, Arial, serif" }
];

// Server-side function to calculate theme variables (matching main layout)
const calculateThemeVariables = (businessSettings: any) => {
  const themeColorText = businessSettings.theme_color_text || '#000000';
  const themeColorBackground = businessSettings.theme_color_background || '#FFFFFF';
  const themeColorButton = businessSettings.theme_color_button || '#000000';
  
  const themeColorTextRgb = hexToRgb(themeColorText);
  const borderColorOpacity = 0.2;
  const themeColorBorder = `rgba(${themeColorTextRgb}, ${borderColorOpacity})`;
  
  // Generate new background colors based on luminance
  const themeColorBackgroundSecondary = adjustColor(themeColorBackground, 0.18, 0.025);
  const themeColorBackgroundCard = adjustColor(themeColorBackground, 0.18, 0.135); 
  
  const isDarkBackground = parseInt(themeColorBackground.replace('#', ''), 16) < (0xFFFFFF / 2);

  // Calculate button text color using proper luminance formula
  const getButtonContentColor = (bgColor: string) => {
    if (!bgColor) return 'white';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'black' : 'white';
  };
  
  const buttonContentColor = getButtonContentColor(themeColorButton);

  return {
    themeColorText,
    themeColorBackground,
    themeColorButton,
    themeColorBackgroundSecondary,
    themeColorBackgroundCard,
    themeColorBorder,
    isDarkBackground,
    buttonContentColor,
    themeVariables: {
      '--theme-font': businessSettings.theme_font_css_stack || 'Arial, sans-serif',
      '--theme-color-background': themeColorBackground,
      '--theme-color-background-secondary': themeColorBackgroundSecondary,
      '--theme-color-background-card': themeColorBackgroundCard,
      '--theme-color-text': themeColorText,
      '--theme-color-button': themeColorButton,
      '--theme-color-text-rgb': themeColorTextRgb ? themeColorTextRgb.join(',') : '0,0,0',
      '--border-color-opacity': borderColorOpacity,
      '--profile-nav-border-color': isDarkBackground ? 'rgba(255, 255, 255, 0.19)' : 'rgba(0, 0, 0, 0.18)',
      '--section-active-border-color': isDarkBackground ? 'rgb(255, 255, 255)' : 'rgb(14, 14, 14)',
      '--category-pills-wrapper-background': isDarkBackground ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.075)',
      '--category-pill-border-color': isDarkBackground ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
      '--accordion-item-border-color': isDarkBackground ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
      '--card-item-background': isDarkBackground ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.025)',
      '--card-item-box-shadow': isDarkBackground ? '0 1px 5px rgba(255, 255, 255, 0.2)' : '0 1px 5px #03030308',
      '--order-bar-box-shadow': isDarkBackground ? '0 -2px 10px rgba(255,255,255,0.1)' : '0 -2px 10px rgba(0,0,0,0.1)',
      '--is-dark-background': isDarkBackground ? '1' : '0',
    }
  };
};

export default async function AIChatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: AIChatLayoutParams;
}) {
  const { business_urlname } = params;

  if (!business_urlname) {
    notFound();
  }

  // Use the same query structure as the main layout
  const business = await prisma.business.findUnique({
    where: { business_urlname: business_urlname },
    select: {
      // Core business data - only essential fields
      business_id: true,
      business_name: true,
      business_descr: true,
      business_city: true,
      business_country: true,
      business_region: true,
      business_address: true,
      business_phone: true,
      business_email: true,
      business_public_uuid: true,
      business_urlname: true,
      business_img_profile: true,
      business_img_cover: true,
      // Settings for theme and layout - only essential fields
      businessprofilesettings: {
        select: {
          default_page: true,
          theme_color_background: true,
          theme_color_text: true,
          theme_color_button: true,
          theme_font: true,
          show_address: true,
          show_website: true,
          show_socials: true,
          show_btn_booking: true,
          show_btn_payments: true,
          show_btn_review: true,
          show_btn_phone: true,
          show_btn_email: true,
          show_btn_order: true,
        }
      },
      // Links for header/footer - only essential fields
      businesslink: {
        select: {
          link_type: true,
          link_url: true,
        },
        where: {
          visible: true, // Only visible links
        }
      },
    },
  }) as any; // Type assertion to handle complex Prisma types

  if (!business) {
    notFound();
  }

  const defaultSettings = {
    default_page: 'products',
    theme_color_background: '#FFFFFF', 
    theme_color_text: '#000000', 
    theme_color_button: '#000000', 
    theme_font: '1', 
    show_address: true, 
    show_website: true, 
    show_socials: true, 
    show_btn_booking: true, 
    show_btn_payments: true, 
    show_btn_review: true, 
    show_btn_phone: true, 
    show_btn_email: true, 
    show_btn_order: false,
  };

  const businessSettings = business.businessprofilesettings ? {
    ...business.businessprofilesettings,
    last_updated: business.businessprofilesettings.last_updated?.toISOString() || null,
  } : defaultSettings;

  const selectedFont = AVAILABLE_FONTS_PUBLIC.find(
    (font) => font.font_id === parseInt(businessSettings.theme_font ?? '1', 10)
  );
  const themeFontCssStack = selectedFont ? selectedFont.font_css_stack : 'Arial, sans-serif';

  const processedBusinessLinks = business.businesslink.map((link: any) => {
    return {
      ...link,
      label: link.link_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      icon: `/icons/links-icons/${link.link_type.toLowerCase()}.svg`
    };
  });

  let websiteLinkUrl: string | null = null;
  let googleReviewLinkUrl: string | null = null;
  let bookingLinkUrl = `/${business_urlname}/booking`;
  
  business.businesslink.forEach((link: any) => {
    if (link.link_type === 'website') { websiteLinkUrl = link.link_url; }
    if (link.link_type === 'google_review') { googleReviewLinkUrl = link.link_url; }
  });

  // IMAGES PATHS - R2 (same logic as main layout)
  const R2_PUBLIC_DOMAIN = "https://pub-eac238aed876421982e277e0221feebc.r2.dev";
  
  // Use local path if business_img_profile is empty/undefined, otherwise use R2 predefined path
  const profileImageUrl = !business.business_img_profile 
    ? `/uploads/business/${business.business_public_uuid}/profile.webp`
    : `${R2_PUBLIC_DOMAIN}/business/${business.business_public_uuid}/profile.webp`;
    
  // Handle dual cover images (mobile and desktop)
  const coverImageMobileUrl = !business.business_img_cover
    ? `/uploads/business/${business.business_public_uuid}/cover-mobile.webp`
    : `${R2_PUBLIC_DOMAIN}/business/${business.business_public_uuid}/cover-mobile.webp`;
    
  const coverImageDesktopUrl = !business.business_img_cover
    ? `/uploads/business/${business.business_public_uuid}/cover-desktop.webp`
    : `${R2_PUBLIC_DOMAIN}/business/${business.business_public_uuid}/cover-desktop.webp`;

  // OPTIMIZED: Calculate theme variables on server-side
  const themeData = calculateThemeVariables({
    ...businessSettings,
    theme_font_css_stack: themeFontCssStack
  });

  const data = {
    businessData: {
      business_id: business.business_id,
      business_name: business.business_name,
      business_descr: business.business_descr,
      business_city: business.business_city,
      business_country: business.business_country,
      business_region: business.business_region,
      business_address: business.business_address,
      business_phone: business.business_phone,
      business_email: business.business_email,
      business_public_uuid: business.business_public_uuid,
      business_urlname: business.business_urlname,
      business_urlname_last_edited: business.business_urlname_last_edited?.toISOString() || null,
      date_created: business.date_created?.toISOString() || null,
      business_img_profile: profileImageUrl,
      business_img_cover_mobile: coverImageMobileUrl,
      business_img_cover_desktop: coverImageDesktopUrl,
    },
    businessSettings: { ...businessSettings, theme_font_css_stack: themeFontCssStack },
    businessLinks: processedBusinessLinks,
    websiteLinkUrl: websiteLinkUrl,
    googleReviewLinkUrl: googleReviewLinkUrl,
    bookingLinkUrl: bookingLinkUrl,
    businessPaymentMethods: [], // Empty array - will be populated when modal opens
  };

  // OPTIMIZED: Add all theme data to the main data object
  const finalData = {
    ...data,
    ...themeData
  };

  const cssVariables = finalData.themeVariables;
  const bodyClass = finalData.isDarkBackground ? 'body--dark-bg' : 'body--light-bg';

  return (
    <BusinessProfileClientWrapper 
      initialServerData={finalData} 
      cssVariables={cssVariables} 
      bodyClass="ai-chat-page"
    >
      {children}
    </BusinessProfileClientWrapper>
  );
}
