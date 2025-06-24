// pages/[business_urlname]/[section_name].js
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import prisma from '../../src/lib/prisma'; // Adjusted path
import { hexToRgb } from '../../src/utils/colors'; // Adjusted path

import '../../public/css/business.css';

// Re-import the Header, and full modals (adjusted paths if needed based on component location)
import BusinessProfileHeader from '../../components/BusinessProfileHeader';
import ProfileMenuOverlay from '../../components/modals/ProfileMenuOverlay';
import ContactModal from '../../components/modals/ContactModal';
import PaymentsModal from '../../components/modals/PaymentsModal';
import MenuItemCard from '../../components/MenuItemCard'; // Adjusted path for MenuItemCard

// Hardcoded Fonts (Must match the PHP logic for consistency)
const AVAILABLE_FONTS_PUBLIC = [{
  font_id: 1,
  font_name: 'Font1',
  font_css_stack: 'Font1, Arial, serif'
}, {
  font_id: 2,
  font_name: 'Font2',
  font_css_stack: 'Font2, Arial, serif'
}, {
  font_id: 3,
  font_name: 'Font3',
  font_css_stack: 'Font3, Arial, serif'
}, {
  font_id: 4,
  font_name: 'Font4',
  font_css_stack: "Font4, Arial, serif"
}, {
  font_id: 5,
  font_name: 'Font5',
  font_css_stack: "Font5, Arial, serif"
}, ];


export async function getServerSideProps(context) {
  const { business_urlname, section_name } = context.params;
  const activeSection = section_name || 'products'; // Fallback for safety

  // Define what to include based on the activeSection
  let includeData = {
    businessprofilesettings: true,
    businesslink: true,
    businesspaymentmethod: {
      include: {
        paymentmethod: true
      }
    },
    // Add other base includes that are always needed regardless of section
  };

  // Conditionally include data based on the section
  switch (activeSection) {
    case 'products':
      includeData.menuitem = {
        include: {
          menuitemvariation: {
            orderBy: {
              variation_name: 'asc'
            }
          }
        },
        orderBy: {
          display_order: 'asc', // Changed from item_order to display_order
        },
      };
      break;
    case 'promotions':
      includeData.promo = {
        orderBy: {
          date_created: 'desc'
        }
      };
      break;
    case 'services': // Example: if you have a 'services' section for bookingservices
      includeData.bookingservice = {
        include: {
          bookingcategory: true
        },
        orderBy: {
          service_name: 'asc'
        }
      };
      break;
      // Add other cases for 'rewards' or any other specific sections
    case 'rewards':
      // If rewards data comes from the DB, add its include here
      break;
    default:
      // Redirect to the default products page or show a 404 for unknown sections
      return {
        redirect: {
          destination: `/${business_urlname}/products`,
          permanent: false,
        },
      };
  }

  try {
    const businessData = await prisma.business.findUnique({
      where: {
        business_urlname: business_urlname,
      },
      include: includeData, // Use the dynamically built include object
    });

    if (!businessData) {
      return {
        notFound: true
      };
    }

    const defaultSettings = {
      default_page: 'home',
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

    const businessSettings = businessData.businessprofilesettings ? {
      ...businessData.businessprofilesettings,
      last_updated: businessData.businessprofilesettings.last_updated?.toISOString() || null,
    } : defaultSettings;

    const selectedFont = AVAILABLE_FONTS_PUBLIC.find(
      (font) => font.font_id === parseInt(businessSettings.theme_font, 10)
    );
    const themeFontCssStack = selectedFont ? selectedFont.font_css_stack : 'Arial, sans-serif';

    const processedBusinessLinks = businessData.businesslink.map(link => {
      const iconFileName = link.link_type.toLowerCase();
      let iconPath = `/icons/links-icons/${iconFileName}.svg`;

      if (link.link_type === 'google_review') {
        iconPath = '/icons/links-icons/google.png';
      }

      return {
        ...link,
        label: link.link_name || link.link_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        icon: iconPath
      };
    });

    let websiteLinkUrl = null;
    let googleReviewLinkUrl = null;
    let bookingLinkUrl = `/booking?b=${business_urlname}`;

    businessData.businesslink.forEach(link => {
      if (link.link_type === 'website') {
        websiteLinkUrl = link.link_url;
      }
      if (link.link_type === 'google_review') {
        googleReviewLinkUrl = link.link_url;
      }
    });

    const data = {
      businessData: {
        business_name: businessData.business_name,
        business_descr: businessData.business_descr,
        business_city: businessData.business_city,
        business_country: businessData.business_country,
        business_region: businessData.business_region,
        business_address: businessData.business_address,
        business_phone: businessData.business_phone,
        business_email: businessData.business_email,
        business_img_profile: businessData.business_img_profile,
        business_img_cover: businessData.business_img_cover,
        business_public_uuid: businessData.business_public_uuid,
        business_urlname: businessData.business_urlname,
        business_urlname_last_edited: businessData.business_urlname_last_edited?.toISOString() || null,
        date_created: businessData.date_created?.toISOString() || null,
      },
      businessSettings: {
        ...businessSettings,
        theme_font_css_stack: themeFontCssStack,
      },
      businessLinks: processedBusinessLinks,
      websiteLinkUrl: websiteLinkUrl,
      googleReviewLinkUrl: googleReviewLinkUrl,
      bookingLinkUrl: bookingLinkUrl,
      businessPaymentMethods: businessData.businesspaymentmethod.map(method => ({
        ...method,
        details: method.paymentmethod.method_details ? JSON.parse(method.paymentmethod.method_details) : {},
        label: method.paymentmethod.method_name,
        icon: `/icons/${method.paymentmethod.method_name.toLowerCase().replace(/\s/g, '_')}.svg`
      })),
      // Conditionally pass data based on section. If the section data isn't fetched, it will be an empty array.
      businessMenuItems: activeSection === 'products' ? businessData.menuitem?.map(item => ({
        ...item,
        price: item.price?.toString() || null,
        date_created: item.date_created?.toISOString() || null,
        date_updated: item.date_updated?.toISOString() || null,
        date_update: item.date_update?.toISOString() || null, // Ensure date_update is serialized for menuitem
        menuitemvariation: item.menuitemvariation?.map(variation => ({
          ...variation,
          variation_price: variation.variation_price?.toString() || null,
          price_modifier: variation.price_modifier?.toString() || null, // Serialize price_modifier
          date_created: variation.date_created?.toISOString() || null,
          date_updated: variation.date_updated?.toISOString() || null,
          date_update: variation.date_update?.toISOString() || null, // Serialize date_update for menuitemvariation
        })) || [],
      })) || [] : [],
      businessPromos: activeSection === 'promotions' ? businessData.promo?.map(promo => ({
        ...promo,
        date_start: promo.date_start?.toISOString() || null,
        date_end: promo.date_end?.toISOString() || null,
        date_created: promo.date_created?.toISOString() || null,
        date_update: promo.date_update?.toISOString() || null,
      })) || [] : [],
      businessServices: activeSection === 'services' ? businessData.bookingservice?.map(service => ({
        ...service,
        price: service.price?.toString() || null,
        date_created: service.date_created?.toISOString() || null,
        date_updated: service.date_updated?.toISOString() || null,
      })) || [] : [],
      activeSection: activeSection,
    };

    return {
      props: {
        data,
      },
    };
  } catch (error) {
    console.error(`Error fetching business data for section ${activeSection}:`, error);
    return {
      props: {
        data: null,
        error: 'Failed to load business data.'
      },
    };
  }
}

// Re-use your existing BusinessProfile component
// The component itself is largely generic and renders based on the `data` prop.
// The main difference is that this file's `getServerSideProps` will only fetch
// the data relevant to its `[section_name]`.
export default function BusinessProfile({ data, error }) {
  const [showMenuOverlay, setShowMenuOverlay] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [activeContactTab, setActiveContactTab] = useState('phone');

  if (error) {
    return <div className="text-center py-10 text-red-500">Errore: {error}</div>;
  }

  if (!data) {
    return <div className="text-center py-10">Caricamento...</div>;
  }

  const {
    businessData,
    businessSettings,
    businessLinks,
    businessPaymentMethods, // Make sure this is destructured here
    businessServices,
    businessPromos,
    businessMenuItems,
    websiteLinkUrl,
    googleReviewLinkUrl,
    bookingLinkUrl,
    activeSection,
  } = data;

  const themeColorText = businessSettings.theme_color_text || '#000000';
  const themeColorBackground = businessSettings.theme_color_background || '#FFFFFF';
  const themeColorButton = businessSettings.theme_color_button || '#000000';
  const themeFont = businessSettings.theme_font_css_stack;
  const themeColorTextRgb = hexToRgb(themeColorText);
  const borderColorOpacity = 0.2;

  const isDarkBackground = parseInt(themeColorBackground.replace('#', ''), 16) < (0xFFFFFF / 2);
  const bodyClass = isDarkBackground ? 'body--dark-bg' : 'body--light-bg';

  const toggleMenuOverlay = () => setShowMenuOverlay(!showMenuOverlay);
  const toggleContactModal = (tab = 'phone') => {
    setActiveContactTab(tab);
    setShowContactModal(!showContactModal);
  };
  const togglePaymentsModal = () => setShowPaymentsModal(!showPaymentsModal);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{businessData.business_name}</title>

        {/* Dynamic Styles based on business_settings */}
        <style>
          {`
            body {
              background-color: ${themeColorBackground}!important;
              color: ${themeColorText}!important;
              font-family: ${themeFont}!important;
            }

            .font-bold {
                font-family: inherit!important;
                font-weight: 700!important;
            }

            .button {
                font-family: inherit!important;
                font-weight: 700!important;
            }

            #topbar-club {
                background-color: ${themeColorBackground};
                color: ${themeColorText};
            }
          
            .profile-cover::before {
                background: ${themeColorBackground};
            }

            body.body--dark-bg .profile-header {
                background: linear-gradient(to top, rgba(255, 255, 255, 0.15) ,rgba(255, 255, 255, 0) 35%);
            }
            body.body--light-bg .profile-header {
                background: linear-gradient(to top, rgba(0, 0, 0, 0.1) ,rgba(0, 0, 0, 0) 35%);
            }

            body.body--light-bg .btn-bg-settings { background: ${themeColorButton}!important; color: #fff!important; }

            body.body--dark-bg .btn-bg-settings { background: ${themeColorButton}!important; color: #fff!important; }

            /* Invert icons for dark mode if they are originally dark on light background */
            body.body--dark-bg .profile-header .contact-button img,
            body.body--dark-bg .profile-club-links-list .link-icon-wrapper img { filter: invert(1) brightness(1.5); } 
            
            /* Ensure icons are normal for light mode */
            body.body--light-bg .profile-header .contact-button img,
            body.body--light-bg .profile-club-links-list .link-icon-wrapper img { filter: invert(0); } 

            /* Icons on main buttons like Prenota, Payments, Reviews */
            body.body--dark-bg .profile-header .button img { filter: invert(0); }
            body.body--light-bg .profile-header .button img { filter: invert(0); }


            body.body--dark-bg .profile-club-links-list .link-icon-wrapper{ background-color: rgba(255, 255, 255, 0);}
            body.body--light-bg .profile-club-links-list .link-icon-wrapper{ background-color: rgba(0, 0, 0, 0);}

            body.body--dark-bg .profile-nav-sections{ border-color:rgba(255, 255, 255, 0.19); }
            body.body--light-bg .profile-nav-sections{ border-color: #00000030; }

            body.body--dark-bg .profile-nav-sections .section-active{ border-color:rgb(255, 255, 255); }
            body.body--light-bg .profile-nav-sections .section-active{ border-color:rgb(14, 14, 14); }

            body.body--dark-bg .category-pills-container{ background: ${themeColorBackground}; }
            body.body--light-bg .category-pills-container{ background: ${themeColorBackground}; }

            body.body--dark-bg .category-pills-container .pills-wrapper{ background: rgba(255, 255, 255, 0.15); }
            body.body--light-bg .category-pills-container .pills-wrapper{ background: rgba(0, 0, 0, 0.075); }

            body.body--dark-bg .category-pill{ border-color: rgba(255, 255, 255, 0.5); }
            body.body--light-bg .category-pill{ border-color: rgba(0, 0, 0, 0.5); }

            body.body--dark-bg .accordion-item { border-color: rgba(255, 255, 255, 0.5); }
            body.body--light-bg .accordion-item { border-color: rgba(0, 0, 0, 0.5); }

            body.body--light-bg .card-item {
                background-color: rgb(255, 255, 255);
                border-color: rgba(${themeColorTextRgb}, ${borderColorOpacity}) !important;
                box-shadow: 0 1px 5px #03030308;
            }
            
            body.body--dark-bg .card-item {
                background-color: rgba(255, 255, 255, 0.1);
                border-color: rgba(${themeColorTextRgb}, ${borderColorOpacity}) !important;
                box-shadow: 0 1px 5px rgba(255, 255, 255, 0.2);
            }

            .link-look {
              color: ${themeColorText};
            }
            .link-look a {
              color: inherit;
              text-decoration: underline;
            }

            .btn-google-review {
                background-color: #4285F4;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 10px 20px;
                border-radius: 9999px;
                font-weight: bold;
                transition: background-color 0.3s ease;
            }
            .btn-google-review:hover {
                background-color: #357ae8;
            }
            .btn-google-review img {
                width: 24px;
                height: 24px;
                vertical-align: middle;
            }
          `}
        </style>
      </Head>

      <div className={`min-h-screen ${bodyClass}`}>
        {/* Top Bar */}
        <nav id="topbar-club" className="flex items-center w-full p-4 fixed top-0 left-0 z-40 shadow-sm"
          style={{
            backgroundColor: themeColorBackground,
            color: themeColorText
          }}>
          <div className="flex-1">
            <div className="container-profile-pic pic-xs w-8 h-8 relative rounded-full overflow-hidden">
              <Image src={businessData.business_img_profile || '/images/default-profile-xs.png'} alt="Profile" layout="fill" objectFit="cover" />
            </div>
          </div>
          <div className="flex-1 text-center">
            <span className="font-bold lg:text-md leading-none" style={{
              whiteSpace: 'nowrap'
            }}>
              {businessData.business_name}
            </span>
          </div>
          <div className="flex-1 text-right">
            <a onClick={toggleMenuOverlay} className="button-menu-topbar-profile hamburger-checkbox navbar-toggle ml-auto cursor-pointer">
              <div className="hamburger-icon menu-button">
                <label htmlFor="openmenu" id="hamburger-label">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path fill={themeColorText} stroke={themeColorText} d="M12.6661 7.33348C12.2979 7.33348 11.9994 7.63195 11.9994 8.00014C11.9994 8.36833 12.2979 8.66681 12.6661 8.66681C13.0343 8.66681 13.3328 8.36833 13.3328 8.00014C13.3328 7.63195 13.0343 7.33348 12.6661 7.33348Z"></path>
                    <path fill={themeColorText} stroke={themeColorText} d="M8.00057 7.33348C7.63238 7.33348 7.3339 7.63195 7.3339 8.00014C7.3339 8.36833 7.63238 8.66681 8.00057 8.66681C8.36876 8.66681 8.66724 8.36833 8.66724 8.00014C8.66724 7.63195 8.36876 7.33348 8.00057 7.33348Z"></path>
                    <path fill={themeColorText} stroke={themeColorText} d="M3.33333 7.33348C2.96514 7.33348 2.66667 7.63195 2.66667 8.00014C2.66667 8.36833 2.96514 8.66681 3.33333 8.66681C3.70152 8.66681 4 8.36833 4 8.00014C4 7.63195 3.70152 7.33348 3.33333 7.33348Z"></path>
                  </svg>
                </label>
              </div>
            </a>
          </div>
        </nav>

        {/* Adjust main content padding to account for fixed top bar */}
        <div className="pt-16">
          {/* Business Profile Header Section */}
          <BusinessProfileHeader
            businessData={businessData}
            businessSettings={businessSettings}
            websiteLinkUrl={websiteLinkUrl}
            googleReviewLinkUrl={googleReviewLinkUrl}
            businessLinks={businessLinks}
            bookingLinkUrl={bookingLinkUrl}
            toggleContactModal={toggleContactModal}
            togglePaymentsModal={togglePaymentsModal}
            businessUrlname={businessData.business_urlname}
            activeSection={activeSection}
            businessPaymentMethods={businessPaymentMethods} // <-- ADDED THIS PROP
          />

          {/* Order Bar (conditional, as per PHP) */}
          {activeSection === 'products' && businessSettings.show_btn_order && (
            <div id="order-bar" className="active fixed bottom-0 left-0 w-full p-4 z-30" style={{ backgroundColor: themeColorBackground, boxShadow: isDarkBackground ? '0 -2px 10px rgba(255,255,255,0.1)' : '0 -2px 10px rgba(0,0,0,0.1)' }}>
              <Link href={`/order?b=${businessData.business_urlname}`} className="button btn-md btn-bg-settings shadow-lg text-white mobile-w-full block text-center"
                style={{ backgroundColor: themeColorButton, color: 'white' }}>
                Componi Ordine
              </Link>
            </div>
          )}

          {/* Main Content Area */}
          <main className="container mx-auto px-4 py-8">
            {activeSection === 'products' && (
              <section className="business-menu-items my-8">
                {businessMenuItems.length > 0 ? (
                  businessMenuItems.map(item => (
                    <MenuItemCard
                      key={item.item_id}
                      item={item}
                      themeColorTextRgb={themeColorTextRgb}
                      borderColorOpacity={borderColorOpacity}
                      isDarkBackground={isDarkBackground}
                    />
                  ))
                ) : (
                  <p className="text-center opacity-70">Nessun prodotto disponibile al momento.</p>
                )}
              </section>
            )}

            {activeSection === 'promotions' && (
              <section className="business-promos my-8">
                {businessPromos.length > 0 ? (
                  businessPromos.map(promo => (
                    <div key={promo.promo_id} className="card-item rounded-lg p-4 mb-4" style={{ borderColor: `rgba(${themeColorTextRgb}, ${borderColorOpacity})` }}>
                      <h4 className="font-bold text-lg">{promo.promo_name}</h4>
                      {promo.promo_descr && <p className="text-sm opacity-80 mt-1">{promo.promo_descr}</p>}
                      {promo.promo_code && <p className="text-sm mt-2">Codice: <span className="font-bold">{promo.promo_code}</span></p>}
                      {promo.date_end && <p className="text-sm opacity-70">Valido fino al: {new Date(promo.date_end).toLocaleDateString()}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-center opacity-70">Nessuna promozione disponibile al momento.</p>
                )}
              </section>
            )}

            {activeSection === 'rewards' && (
              <section className="business-rewards my-8">
                <p className="text-center opacity-70">Nessun programma fedeltà disponibile al momento.</p>
              </section>
            )}

            {activeSection === 'services' && ( // Example for a 'services' section
              <section className="business-services my-8">
                {businessServices.length > 0 ? (
                  businessServices.map(service => (
                    <div key={service.service_id} className="card-item rounded-lg p-4 mb-4" style={{ borderColor: `rgba(${themeColorTextRgb}, ${borderColorOpacity})` }}>
                      <h4 className="font-bold text-lg">{service.service_name}</h4>
                      {service.service_descr && <p className="text-sm opacity-80 mt-1">{service.service_descr}</p>}
                      {service.price && <p className="text-sm mt-2">Prezzo: <span className="font-bold">€{parseFloat(service.price).toFixed(2)}</span></p>}
                      {service.bookingcategory?.category_name && <p className="text-sm opacity-70">Categoria: {service.bookingcategory.category_name}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-center opacity-70">Nessun servizio disponibile al momento.</p>
                )}
              </section>
            )}
          </main>
          {/* Add padding to the bottom of the main content if the order bar is active */}
          {activeSection === 'products' && businessSettings.show_btn_order && (
            <div className="pb-24"></div>
          )}
        </div>

        {/* Modals - Controlled by state */}
        <ProfileMenuOverlay
          show={showMenuOverlay}
          onClose={toggleMenuOverlay}
          businessUrlname={businessData.business_urlname}
          businessPublicUuid={businessData.business_public_uuid}
        />
        <ContactModal
          show={showContactModal}
          onClose={toggleContactModal}
          businessData={businessData}
          businessSettings={businessSettings}
          activeTab={activeContactTab}
        />
        <PaymentsModal
          show={showPaymentsModal}
          onClose={togglePaymentsModal}
          businessPaymentMethods={businessPaymentMethods}
        />
      </div>
      <Script src="/js/all.js" strategy="lazyOnload" />
      <Script src="/js/qrcode.js" strategy="lazyOnload" />
    </>
  );
}