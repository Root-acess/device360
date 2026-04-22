import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, MessageCircle, Wrench } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-blue-600 text-white text-sm py-2 px-4 text-center">
        ⚡ Same-day repair • Free pickup & delivery • 6-month warranty on all repairs
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">Device<span className="text-blue-600">360</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link to="/repair" className="hover:text-blue-600 transition-colors">Get a Quote</Link>
              
            </div>

            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors"
                data-testid="nav-whatsapp-button"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
                data-testid="nav-call-button"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2 border-t border-gray-100 pt-3" data-testid="mobile-menu">
            <Link to="/repair" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileMenuOpen(false)}>Get a Quote</Link>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2.5 px-4 rounded-lg bg-green-500 text-white font-semibold justify-center" data-testid="mobile-nav-whatsapp-button">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a href="tel:+919876543210" className="flex items-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 text-white font-semibold justify-center" data-testid="mobile-nav-call-button">
              <Phone className="w-4 h-4" /> Call Now
            </a>
          </div>
        )}
      </nav>

      <main>{children}</main>

      <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl text-white">Device<span className="text-blue-400">360</span></span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                India's first mobile repair service with live video tracking. Transparent, fast, and at your doorstep.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Contact</h4>
              <p className="text-sm mb-1">+91 98765 43210</p>
              <p className="text-sm mb-1">support@device360.com</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Hours</h4>
              <p className="text-sm mb-1">Mon–Sat: 9 AM – 9 PM</p>
              <p className="text-sm">Sunday: 10 AM – 6 PM</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            © 2026 Device360. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
