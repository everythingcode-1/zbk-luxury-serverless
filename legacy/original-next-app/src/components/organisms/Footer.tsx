import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/utils/cn';

const Footer: React.FC = () => {
  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Fleet', href: '/fleet' },
    { name: 'Services', href: '/services' },
    { name: 'How to Book', href: '/how-to-book' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' },
  ];

  const supportLinks = [
    { name: 'Booking Guide', href: '/how-to-book' },
    { name: 'Contact Us', href: '/contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://web.facebook.com/p/ZBK-Limo-Tour-Services-SG-100090587093370/?_rdc=1&_rdr#',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/zbksingapore/',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323C6.001 8.198 7.152 7.708 8.449 7.708s2.448.49 3.323 1.416c.875.926 1.365 2.077 1.365 3.374s-.49 2.448-1.365 3.323c-.875.875-2.026 1.365-3.323 1.365zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.875-.926-1.365-2.077-1.365-3.374s.49-2.448 1.365-3.323c.875-.926 2.026-1.416 3.323-1.416s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.374c-.875.875-2.026 1.365-3.323 1.365z"/>
        </svg>
      ),
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@zbklimotourservic',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/zbk-limousine-tours',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-deep-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Image
                src="/Logo.png"
                alt="ZBK Limousine Tours & Transportation Services"
                width={120}
                height={40}
                className="h-10 w-auto filter invert"
              />
            </div>
            
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              ZBK Limousine Tours & Transportation Services - Premium luxury transportation 
              in Singapore. Experience exceptional limousine and vehicle rental services 
              for weddings, corporate events, airport transfers, and special occasions.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-luxury-gold transition-colors duration-micro"
                  aria-label={social.name}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-luxury-gold hover:underline transition-colors duration-micro"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold text-white mb-6">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-luxury-gold hover:underline transition-colors duration-micro"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-white mb-6">Contact</h3>
            <div className="space-y-4">
              <div>
                <p className="text-base font-bold text-luxury-gold mb-1">
                  +65 9747 6453
                </p>
                <p className="text-sm text-gray-300">24/7 Customer Support</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-300 mb-1">
                  info@zbkluxury.com
                </p>
                <p className="text-sm text-gray-300">
                  support@zbkluxury.com
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400">
                  Mon-Sun: 24/7 Available
                </p>
                <p className="text-xs text-gray-400">
                  Emergency Support Always
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white border-opacity-10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-xs text-gray-400">
              © 2025 ZBK Luxury Car Rental. All rights reserved.
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-400">We Accept:</span>
              <div className="flex space-x-2">
                {/* Visa */}
                <div className="w-8 h-5 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">VISA</span>
                </div>
                {/* Mastercard */}
                <div className="w-8 h-5 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">MC</span>
                </div>
                {/* PayPal */}
                <div className="w-8 h-5 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-500">PP</span>
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-luxury-gold transition-colors duration-micro"
                  >
                    {link.name}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className="text-gray-600">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
