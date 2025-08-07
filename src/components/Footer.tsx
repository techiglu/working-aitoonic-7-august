import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ExternalLink } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-royal-dark-card border-t border-royal-dark-lighter">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-8 h-8 text-royal-gold" />
              <span className="text-xl font-bold gradient-text">Aitoonic</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Discover the best AI tools and agents for your needs. Stay updated with the latest in artificial intelligence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/ai-agent" className="text-gray-400 hover:text-white transition-colors text-sm">
                  AI Agents
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/affiliate" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Affiliate Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Business */}
          <div>
            <h3 className="text-white font-semibold mb-4">Business</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/advertise" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Advertise With Us
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:dc556316@gmail.com" 
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-royal-dark-lighter mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Aitoonic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;