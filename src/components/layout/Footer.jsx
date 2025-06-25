// components/layout/Footer.jsx

import Link from 'next/link'; // Use Link for internal navigation

export default function Footer() {
    return (
        <footer className="text-sm container-x-lg py-3">
            <div className="d-flex flex-wrap flex-col lg:flex-row justify-between lg:items-start gap-3 my-8">

                <div className="d-flex items-center flex-col lg:flex-row gap-3">
                    <div className="d-flex items-center flex-col lg:flex-row flex-wrap gap-1">
                        <div><Link href="/" className="logo logo-lg">Twnter</Link></div>
                        <div>per i Business</div>
                    </div>

                    <div>
                        {/* Image paths should be absolute from the public directory */}
                        <img src="/assets/images/icons/icon-facebook.png" alt="Facebook" className="footer-icon-social" />
                        <img src="/assets/images/icons/icon-instagram.png" alt="Instagram" className="footer-icon-social" />
                        <img src="/assets/images/icons/icon-youtube.png" alt="YouTube" className="footer-icon-social" />
                    </div>
                </div>

                <ul className="mt-2 d-flex gap-y-1 gap-x-4 flex-wrap list-unstyled text-xs lg:text-sm">
                    <li><Link href="/signupmanager">Twenter per i Business</Link></li>
                    <li><Link href="/assistenza">Assistenza</Link></li> {/* Assuming a route for assistenza */}
                    <li><Link href="/faq">FAQ</Link></li> {/* Assuming a route for faq */}
                    <li><Link href="/contatti">Contatti</Link></li> {/* Assuming a route for contatti */}
                    <li><Link href="/termini-e-condizioni">Termini e condizioni</Link></li> {/* Assuming a route */}
                    <li><Link href="/protezione-dei-dati">Protezione dei dati</Link></li> {/* Assuming a route */}
                    <li><Link href="/cookies">Cookies</Link></li> {/* Assuming a route */}
                </ul>

            </div>
        </footer>
    );
}