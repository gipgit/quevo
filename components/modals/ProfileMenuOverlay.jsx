// components/modals/ProfileMenuOverlay.jsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfileMenuOverlay({ show, onClose, businessUrlname, businessPublicUuid }) {
  if (!show) return null;

  const handleLinkClick = () => {
    onClose(); // Close the overlay when a link is clicked
  };

  const handleCopyProfileLink = async (e) => {
    e.stopPropagation(); // Prevent parent button click
    const profileLink = `${window.location.origin}/${businessUrlname}`;
    try {
      await navigator.clipboard.writeText(profileLink);
      alert('Link Profilo Copiato!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Impossibile copiare il link.');
    }
  };

  const handleOpenQR = () => {
    handleLinkClick();
    // Assuming openOverlayQR is a global JS function or will be integrated into a new modal
    // For now, it will just close the menu. You'll need to define how this opens your QR modal.
    // if (typeof window !== 'undefined' && window.openOverlayQR) {
    //   window.openOverlayQR();
    // } else {
      console.warn("openOverlayQR function not found or QR modal not implemented yet.");
    // }
  };

  return (
    <div
      id="profile-menu-overlay-container"
      className="profile-menu-overlay fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-end"
      onClick={onClose}
    >
      <div
        id="profile-menu-overlay-content"
        className="relative bg-white w-full max-w-xs h-full p-6 shadow-lg transform transition-transform duration-300 ease-out translate-x-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold focus:outline-none">&times;</button>

        <div className="flex flex-col gap-4 mt-8">
          {/* Link Profilo */}
          <button className="option flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 w-full" onClick={handleCopyProfileLink}>
            <div className="flex flex-col items-start">
              <p>Link Profilo</p>
              <span className="text-smaller text-gray-500 truncate w-48">
                {typeof window !== 'undefined' ? window.location.origin : 'https://twenter.com'}/{businessUrlname}
              </span>
            </div>
            {/* PHP had an arrow, but a copy icon is more functional here */}
            <div><Image src="/icons/copy.svg" alt="Copy" width={16} height={16} /></div>
          </button>

          {/* Crea QR Code (button that eventually opens QR modal) */}
          <button onClick={handleOpenQR} className="option flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 w-full">
            <p>Crea</p>
            <div><Image src="/icons/arrow-right.svg" alt="Arrow" width={16} height={16} /></div>
          </button>

          {/* Scopri Twenter */}
          <Link href="/index" onClick={handleLinkClick} className="option flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 w-full">
            <p>Scopri Twenter</p>
            <div><Image src="/icons/arrow-right.svg" alt="Arrow" width={16} height={16} /></div>
          </Link>

          {/* Crea il tuo account */}
          <Link href="/signup" onClick={handleLinkClick} className="option flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 w-full">
            <p>Crea il tuo account</p>
            <div><Image src="/icons/arrow-right.svg" alt="Arrow" width={16} height={16} /></div>
          </Link>
        </div>
      </div>
    </div>
  );
}