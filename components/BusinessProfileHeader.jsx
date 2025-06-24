// components/BusinessProfileHeader.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { hexToRgb } from '../src/utils/colors'; // Make sure this utility is available or add it if not

const BusinessProfileHeader = ({
  businessData,
  businessSettings,
  websiteLinkUrl,
  googleReviewLinkUrl,
  businessLinks,
  bookingLinkUrl,
  toggleContactModal,
  togglePaymentsModal,
  businessUrlname,
  activeSection,
  businessPaymentMethods,
}) => {
  const themeColorBackground = businessSettings.theme_color_background || '#FFFFFF';
  const themeColorButton = businessSettings.theme_color_button || '#000000';
  const themeColorText = businessSettings.theme_color_text || '#000000';

  const isDarkBackground = parseInt(themeColorBackground.replace('#', ''), 16) < (0xFFFFFF / 2);

  // Determine if the BUTTON color is dark or light
  const isDarkButtonColor = parseInt(themeColorButton.replace('#', ''), 16) < (0xFFFFFF / 2);
  const buttonContentColor = isDarkButtonColor ? 'white!important' : 'black!important';

  // Unified button class for primary action buttons (like 'Prenota')
  // Text color will be set dynamically via style
  const primaryButtonClassName = `button btn-md block text-center shadow-lg`;
  const primaryButtonStyle = {
    backgroundColor: themeColorButton,
    color: buttonContentColor // Dynamically set text color
  };

  // Class for circular contact buttons (Phone, Email, Socials)
  const circularButtonBaseClass = `flex flex-col items-center rounded-full transition-colors duration-200`;
  const circularIconWrapperStyle = {
    backgroundColor: themeColorButton, // This applies the theme button color to the circular background
    color: buttonContentColor // Dynamically set text/icon color for these circular buttons
  };

  // Icon filter class based on button content color
  const iconFilterClass = isDarkButtonColor ? 'filter-invert-0' : 'filter-invert-1';
  // Note: 'filter-invert-0' means no inversion (for dark icons on light button),
  // 'filter-invert-1' means invert to white (for dark icons on dark button).
  // You might need to define these in your CSS if not already present, or use inline style for filter.
  // Let's use inline style for filter for clarity here.
  const iconFilterStyle = isDarkButtonColor ? { filter: 'invert(0)' } : { filter: 'invert(1)' }; // Adjust if icons are naturally light

  // Helper for contact buttons' SVG/Image filter
  const getButtonIconStyle = (iconPath) => {
    // Check if the icon is naturally light (e.g., Google logo, which is usually dark on light bg, or if you use specific light icons)
    // For most standard dark SVGs, if the button is dark, invert them to white. If button is light, keep them dark.
    return {
      filter: isDarkButtonColor ? 'invert(1)' : 'invert(0)', // If button is dark, invert icon to be light. If button is light, keep icon as is (assuming it's dark).
    };
  };

  const handleContactClick = (tab) => {
    if (toggleContactModal) {
      toggleContactModal(tab);
    }
  };

  const handlePaymentsClick = () => {
    if (togglePaymentsModal) {
      togglePaymentsModal();
    }
  };

  // Filter social links to exclude website, google_review, phone, and email
  const filteredSocialLinks = businessLinks.filter(
    (link) =>
      link.link_type !== 'website' &&
      link.link_type !== 'google_review' &&
      link.link_type !== 'phone' &&
      link.link_type !== 'email'
  );

  return (
    <header className="profile-header relative">
      {/* Cover Image */}
      <div className="profile-cover w-full relative bg-gray-200">
        <Image
          src={businessData.business_img_cover || '/images/default-cover.png'}
          alt="Cover"
          layout="fill"
          objectFit="cover"
          quality={80}
          priority
        />
        {/* Overlay for aesthetic blending with background */}
        <div
          className="profile-cover-overlay absolute bottom-0 left-0 w-full h-1/2"
          style={{ background: `linear-gradient(to top, ${themeColorBackground}, rgba(255,255,255,0))` }}
        ></div>
      </div>

      {/* Profile Picture - Now absolutely positioned */}
      <div className="container-profile-pic pic-lg absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden bg-gray-100"
        style={{ width: '100px', height: '100px' }}> {/* Explicitly set size based on .pic-lg img */}
        <Image
          src={businessData.business_img_profile || '/images/default-profile.png'}
          alt="Profile"
          layout="fill"
          objectFit="cover"
          quality={80}
          priority
        />
      </div>

      {/* Main content area below the cover image and profile pic */}
      <div className="container mx-auto px-4 relative mt-[-50px]"> {/* Adjust padding-top based on half of pic-lg height + desired spacing */}
        {/* Business Info */}
        <div className="text-center mt-4">
          <p className="text-xl md:text-3xl font-bold">{businessData.business_name}</p>
          {businessData.business_descr && <p className="d-none text-sm opacity-80 mt-1 max-w-lg mx-auto">{businessData.business_descr}</p>}
          {(businessSettings.show_address && businessData.business_address) && (
            <p className="text-sm mt-1 opacity-70">
              {businessData.business_address}, {businessData.business_city}
            </p>
          )}

          {/* New position for Website Link - under the address */}
          {businessSettings.show_website && websiteLinkUrl && (
            <div className="mt-1">
              <Link href={websiteLinkUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                {websiteLinkUrl}
              </Link>
            </div>
          )}
        </div>

        {/* Social Links (only filtered social links now) */}
        <div className="flex flex-wrap justify-center gap-1 mt-1">
          {businessSettings.show_socials && filteredSocialLinks.map((link, index) => (
            <div key={index} className="text-center">
              {/* Social links are not affected by theme button color, so no dynamic style */}
              <Link href={link.link_url} target="_blank" rel="noopener noreferrer" className={circularButtonBaseClass}>
                <div className="link-icon-wrapper w-10 h-10 flex items-center justify-center rounded-full"
                     style={{ backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0)' : 'rgba(0, 0, 0, 0)' }}> {/* Background based on main theme */}
                  {link.icon && <Image src={link.icon} alt={link.label} width={24} height={24} />}
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Action Buttons: Prenota, Phone, Email */}
        <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
          {businessSettings.show_btn_booking && bookingLinkUrl && (
            <Link href={bookingLinkUrl} className={primaryButtonClassName} style={primaryButtonStyle}>
              Prenota
            </Link>
          )}

          {businessSettings.show_btn_phone && businessData.business_phone && (
            <button onClick={() => handleContactClick('phone')} className={circularButtonBaseClass} style={primaryButtonStyle}> {/* Apply primaryButtonStyle for consistent background/text */}
              <div className="link-icon-wrapper w-12 h-12 flex items-center justify-center rounded-full" >
                <Image src="/icons/iconsax/phone.svg" alt="Telefono" width={24} height={24} style={getButtonIconStyle()} />
              </div>
            </button>
          )}

          {businessSettings.show_btn_email && businessData.business_email && (
            <button onClick={() => handleContactClick('email')} className={circularButtonBaseClass} style={primaryButtonStyle}> {/* Apply primaryButtonStyle for consistent background/text */}
              <div className="link-icon-wrapper w-12 h-12 flex items-center justify-center rounded-full" >
                <Image src="/icons/iconsax/email.svg" alt="Email" width={24} height={24} style={getButtonIconStyle()} />
              </div>
            </button>
          )}
        </div>

        {/* Payments Link */}
        {businessSettings.show_btn_payments && businessPaymentMethods && businessPaymentMethods.length > 0 && (
          <div className="text-center mt-4">
            <button onClick={handlePaymentsClick} className="text-blue-600 hover:underline font-semibold text-base flex items-center justify-center mx-auto">
              Modalità di pagamento
            </button>
          </div>
        )}

        {/* Leave a Review Link */}
        {businessSettings.show_btn_review && googleReviewLinkUrl && (
          <div className="text-center mt-1">
            <Link href={googleReviewLinkUrl} target="_blank" rel="noopener noreferrer" className="btn-google-review"> {/* Use a specific class for Google review */}
              Lascia una recensione
              <Image src="/icons/google.png" alt="Google" width={24} height={24} className="inline-block" />
            </Link>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="profile-nav-sections border-b mt-8" style={{ borderColor: `rgba(${isDarkBackground ? '255,255,255' : '0,0,0'}, 0.2)` }}>
          <ul className="flex justify-around text-sm font-semibold">
            <li>
              <Link href={`/${businessUrlname}/products`} className={`block py-2 px-4 transition-colors duration-200 ${activeSection === 'products' ? 'section-active border-b-2' : ''}`} style={activeSection === 'products' ? { borderColor: themeColorText } : {}}>
                Prodotti
              </Link>
            </li>
            <li>
              <Link href={`/${businessUrlname}/promotions`} className={`block py-2 px-4 transition-colors duration-200 ${activeSection === 'promotions' ? 'section-active border-b-2' : ''}`} style={activeSection === 'promotions' ? { borderColor: themeColorText } : {}}>
                Promozioni
              </Link>
            </li>
            <li>
              <Link href={`/${businessUrlname}/rewards`} className={`block py-2 px-4 transition-colors duration-200 ${activeSection === 'rewards' ? 'section-active border-b-2' : ''}`} style={activeSection === 'rewards' ? { borderColor: themeColorText } : {}}>
                Fedeltà
              </Link>
            </li>
            <li>
              <Link href={`/${businessUrlname}/services`} className={`block py-2 px-4 transition-colors duration-200 ${activeSection === 'services' ? 'section-active border-b-2' : ''}`} style={activeSection === 'services' ? { borderColor: themeColorText } : {}}>
                Servizi
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default BusinessProfileHeader;