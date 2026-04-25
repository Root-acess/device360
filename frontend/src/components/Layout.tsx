import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, MapPin, Phone, Mail, Clock, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import logo from '../assets/logo.svg';

interface LayoutProps {
  children: React.ReactNode;
}

const POPULAR_LOCATIONS = [
  'Indiranagar', 'Koramangala', 'Whitefield', 'Marathahalli',
  'HSR Layout', 'Bannerghatta Road', 'Electronic City', 'Hoskote',
  'Jayanagar', 'Malleshwaram', 'Yelahanka', 'Sarjapur Road',
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Top announcement bar */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
        <span className="inline-flex items-center gap-4 flex-wrap justify-center">
          <span>⚡ Same-day repair</span>
          <span className="opacity-40">|</span>
          <span>🚗 Free pickup &amp; delivery</span>
          <span className="opacity-40">|</span>
          <span>🛡️ 6-month warranty on all repairs</span>
          <span className="opacity-40">|</span>
          <span>📍 Serving all of Bengaluru</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="logo-link">
              <img
                src={logo}
                alt="Device360"
                className="h-10 object-contain transition-transform duration-300 hover:scale-105"
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600">
              <Link to="/" className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all">
                Home
              </Link>
              <Link to="/repair" className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all">
                Get a Quote
              </Link>
              <Link to="/repair" className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all">
                Track Repair
              </Link>
            </div>

            {/* Desktop CTA — icons only */}
            <div className="hidden md:flex items-center gap-2">
              {/* WhatsApp icon button */}
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp us"
                data-testid="nav-whatsapp-button"
                className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-green-50 hover:bg-green-500 border border-green-200 hover:border-green-500 text-green-600 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-green-200 hover:-translate-y-0.5"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>

              {/* Call icon button */}
              <a
                href="tel:+919876543210"
                title="Call us"
                data-testid="nav-call-button"
                className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 text-blue-600 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
              >
                <FiPhone className="w-4 h-4" />
              </a>

              {/* Book repair CTA */}
              <Link
                to="/repair"
                className="ml-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
              >
                Book Repair
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t border-gray-100 bg-white"
            data-testid="mobile-menu"
          >
            <div className="px-4 pt-3 pb-4 space-y-1">
              <Link to="/" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/repair" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                Get a Quote
              </Link>
              <Link to="/repair" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                Track Repair
              </Link>
            </div>
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-all"
                data-testid="mobile-nav-whatsapp-button"
              >
                <FaWhatsapp className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all"
                data-testid="mobile-nav-call-button"
              >
                <FiPhone className="w-4 h-4" />
                Call Now
              </a>
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>

      {/* ─── Footer ─── */}
      <footer className="bg-gray-950 text-gray-400 pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={logo} alt="Device360" className="h-9 object-contain brightness-0 invert opacity-90" />
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                India's first mobile repair service with <span className="text-white font-medium">live video tracking</span>. Transparent pricing, free pickup &amp; delivery, 6-month warranty.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                {[
                  { icon: Instagram, href: '#', label: 'Instagram' },
                  { icon: Facebook, href: '#', label: 'Facebook' },
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Youtube, href: '#', label: 'YouTube' },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Popular Locations */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Popular Locations
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {POPULAR_LOCATIONS.map((loc) => (
                  <Link
                    key={loc}
                    to={`/repair/${loc.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-xs text-gray-500 hover:text-blue-400 transition-colors leading-relaxed"
                  >
                    {loc}
                  </Link>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Our Services</h4>
              <ul className="space-y-2">
                {[
                  'Screen Replacement',
                  'Battery Replacement',
                  'Charging Port Repair',
                  'Camera Fix',
                  'Water Damage Repair',
                  'Back Glass Repair',
                  'Laptop Repair',
                  'iPad Repair',
                ].map((s) => (
                  <li key={s}>
                    <Link to="/repair" className="text-xs text-gray-500 hover:text-blue-400 transition-colors">
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li>
                  <a href="tel:+919876543210" className="flex items-start gap-3 group">
                    <Phone className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-gray-500 group-hover:text-blue-400 transition-colors">+91 98765 43210</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:support@device360.com" className="flex items-start gap-3 group">
                    <Mail className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-gray-500 group-hover:text-blue-400 transition-colors">support@device360.com</span>
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    Indiranagar, Bengaluru,<br />Karnataka – 560038
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    Mon–Sat: 9 AM – 9 PM<br />Sunday: 10 AM – 6 PM
                  </span>
                </li>
              </ul>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-all"
              >
                <FaWhatsapp className="w-3.5 h-3.5" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">
              © 2026 Device360. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((l) => (
                <Link key={l} to="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
