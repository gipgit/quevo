// components/layout/Header.jsx
'use client'; // This component will run on the client-side

import { useState, useEffect } from 'react';
import Link from 'next/link'; // For client-side routing

// ... (your fetchSession, useEffects, and toggle functions are fine)

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [session, setSession] = useState({ logged: false });
    // In Next.js, Link hrefs and image srcs are typically absolute from /public
    // so `rootDir` is often an empty string or removed entirely.
    const rootDir = '';

    // ... (rest of your useEffects and toggle functions)

    return (
        <>
            <nav id="navsite">
                <div className="navsite-container grid grid-cols-2 lg:grid-cols-3">
                    {/* Desktop Navigation */}
                    <div className="flex-grow hidden lg:flex items-center justify-start">
                        <ul className="flex gap-x-8 justify-center">
                            <li><Link href="/funzionalita" className="">Le funzionalità</Link></li> {/* Cleaned up rootDir */}
                            <li><Link href="/plans" className="">Piani e Prezzi</Link></li>
                            <li><Link href="/prova-gratis" className="">Prova Gratis</Link></li>
                        </ul>
                    </div>

                    {/* Logo and Mobile Menu Toggle */}
                    <div className="flex-grow flex items-center lg:justify-center gap-x-2">
                        {/* ... (mobile menu button code) ... */}
                        <Link className='logo logo-md' href="/browse">Queva</Link> {/* Cleaned up rootDir */}
                    </div>

                    {/* User Authentication Section */}
                    <div className="flex items-center justify-end text-right">
                        {session.logged ? (
                            <div className="flex gap-x-2 lg:gap-x-5 items-center justify-end">
                                {/* ... (profile menu button code) ... */}

                                <div className="lg:flex items-center">
                                    {session.userType === "customer" && (
                                        <Link className="nav-link" href="/boarding/mycard"> {/* Cleaned up rootDir, no .php */}
                                            <img src="/assets/images/icons/icon-qr-card.png" className="icon-boarding" alt="My Card QR" /> {/* Cleaned up rootDir */}
                                        </Link>
                                    )}
                                    {session.userType === "manager" && (
                                        <Link className="nav-link" href="/boarding/scan"> {/* Cleaned up rootDir, no .php */}
                                            <img src="/assets/images/icons/icon-qr-phone.png" className="icon-boarding" alt="Scan QR" /> {/* Cleaned up rootDir */}
                                        </Link>
                                    )}
                                </div>
                                <span className="text-xs leading-none">{session.userName}</span>
                                <div className="container-profile-pic pic-xs">
                                    {/* THIS WAS THE PROBLEM LINE: */}
                                    <img src={`/uploads/profile_pictures/${session.userId}.jpg`} alt="Profile" onError={(e) => e.target.src = 'https://via.placeholder.com/40'} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-x-3">
                                <Link href="/signin/manager" className="text-sm">Accedi</Link> {/* Cleaned up rootDir */}
                                <Link href="/signup/business" className="button btn-sm md:btn-md btn-gradient-radial text-sm md:text-md">Registrati</Link> {/* Cleaned up rootDir */}
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Profile Menu */}
            <div id="profile-menu" className={`absolute z-10 top-16 right-4 bg-white shadow-lg rounded-md p-4 w-64 ${isProfileMenuOpen ? '' : 'hidden'}`}>
                <div className="h-full w-full flex flex-col justify-between gap-y-4" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <div className="flex justify-between gap-x-2">
                        <p className="text-sm md:text-lg">{session.userName}</p>
                        <div className="container-profile-pic pic-xs">
                            {/* Check this line too, removed rootDir if it's not actually needed */}
                            <img src={`/uploads/users/${session.userId}.jpg`} alt="Profile" onError={(e) => e.target.src = 'https://via.placeholder.com/40'} />
                        </div>
                    </div>

                    <div className="profile-menu-links flex flex-col">
                        <div className="my-4">
                            {session.userType === "customer" && (
                                <Link className="button btn-md btn-white flex items-center gap-x-2" href="/boarding/mycard"> {/* Cleaned up rootDir */}
                                    <img src="/assets/images/icons/icon-qr-card.png" className="icon-boarding" alt="My Card" />La mia Carta
                                </Link>
                            )}
                            {session.userType === "manager" && (
                                <Link className="button btn-md btn-white flex items-center gap-x-2" href="/boarding/scan"> {/* Cleaned up rootDir */}
                                    <img src="/assets/images/icons/icon-qr-phone.png" className="icon-boarding" alt="Scan" /> Scannerizza
                                </Link>
                            )}
                        </div>

                        {session.userType === "customer" && (
                            <ul>
                                <li><Link href="/profile/myaccount" role="menuitem">Il mio account</Link></li>
                                <li><Link href="/boarding/mycard" role="menuitem">La mia Carta</Link></li>
                                <li><Link href="/profile/myCardScans" role="menuitem">Le mie registrazioni</Link></li>
                                <li><Link href="/profile/myPoints" role="menuitem">I miei punti</Link></li>
                            </ul>
                        )}
                        {session.userType === "manager" && (
                            <ul>
                                <li><Link href="/oi/welcome" role="menuitem">Gestione Locali</Link></li>
                                <li><Link href="/oi/business-selection" role="menuitem">Cambia Locale</Link></li>
                                <li><Link href="/oi/myaccount" role="menuitem">Il mio account</Link></li>
                            </ul>
                        )}
                    </div>

                    <div>
                        <Link href="/api/logout" className="button btn-md w-full btn-border-b" role="menuitem">Esci</Link> {/* Cleaned up rootDir */}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div id="mobile-menu" className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:hidden`}>
                <div id="mobile-menu-content" className="p-4 h-full flex flex-col justify-between">
                    {/* ... (mobile menu close button code) ... */}
                    <Link href="/" className="logo">twenter</Link> {/* Cleaned up rootDir */}

                    {session.logged && (
                        <div>
                            <ul className="mobile-menu-links-user mt-4">
                                {session.userType === "customer" && (
                                    <>
                                        <li><Link href="/boarding/mycard" className="button btn-md btn-white w-full">La mia Carta</Link></li>
                                        <li><Link href="/profile/myaccount">Il mio profilo</Link></li>
                                        <li><Link href="/profile/myCardScans">Le mie registrazioni</Link></li>
                                        <li><Link href="/profile/myPoints">I miei punti</Link></li>
                                    </>
                                )}
                                {session.userType === "manager" && (
                                    <>
                                        <li><Link href="/oi/welcome">Gestione</Link></li>
                                        <li><Link href="/boarding/scan">Scan</Link></li>
                                    </>
                                )}
                            </ul>
                        </div>
                    )}

                    <ul className="mobile-menu-links-main mt-4">
                        <li><Link href="/">Twenter Business</Link></li> {/* Cleaned up rootDir */}
                    </ul>

                    <div className="mt-auto">
                        {session.logged ? (
                            <Link href="/api/logout" className="button mobile-w-full btn-sm btn-border-b">Esci</Link>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link href="/login" className="button btn-md btn-border-b">Accedi</Link>
                                <Link href="/signup-business" className="button btn-md btn-border-bs">Registrati</Link>
                                <Link href="/signup" className="button btn-md btn-gradient-blue">Prova Gratis</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}