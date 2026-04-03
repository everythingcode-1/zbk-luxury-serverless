'use client';

import { useState } from 'react';
import Breadcrumb from '@/components/molecules/Breadcrumb';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-deep-navy">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Contact Us', href: '/contact' }
        ]}
      />

      {/* Hero Section */}
      <section className="relative bg-deep-navy py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Contact ZBK Limousine Tours — Book Your Singapore Ride
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Get in touch with our team for bookings, inquiries, or any assistance. 
              We're here to make your luxury travel experience exceptional.
            </p>
            <div className="w-24 h-1 bg-luxury-gold mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-16 lg:py-20 bg-deep-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ),
                    title: "Address",
                    content: "Jurong West Street 65, ZBK Limousine Tours & Transportation Services, Singapura 640635"
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    ),
                    title: "Phone",
                    content: "+65 9747 6453"
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ),
                    title: "Email",
                    content: "info@zbkluxury.com"
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    title: "Business Hours",
                    content: "Mon - Sun: 24/7 Available"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-luxury-gold bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-luxury-gold">
                        {item.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-300">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Emergency Contact */}
              <div className="mt-8 p-6 bg-red-50 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  24/7 Emergency Support
                </h3>
                <p className="text-red-700 mb-2">
                  For urgent assistance or roadside support:
                </p>
                <p className="text-xl font-bold text-red-800">
                  +65 9747 6453
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-600 rounded-compact focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors text-white placeholder-gray-400 bg-gray-700"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-600 rounded-compact focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors text-white placeholder-gray-400 bg-gray-700"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-600 rounded-compact focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors text-white placeholder-gray-400 bg-gray-700"
                      placeholder="+65 9747 6453"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-600 rounded-compact focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors text-white bg-gray-700"
                    >
                      <option value="" className="text-gray-400 bg-gray-700">Select a subject</option>
                      <option value="booking" className="text-white bg-gray-700">New Booking</option>
                      <option value="inquiry" className="text-white bg-gray-700">General Inquiry</option>
                      <option value="support" className="text-white bg-gray-700">Customer Support</option>
                      <option value="feedback" className="text-white bg-gray-700">Feedback</option>
                      <option value="partnership" className="text-white bg-gray-700">Partnership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-600 rounded-compact focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors resize-vertical text-white placeholder-gray-400 bg-gray-700"
                    placeholder="Please provide details about your inquiry or booking requirements..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-luxury-gold text-deep-navy py-4 px-6 rounded-compact hover:bg-luxury-gold-hover transition-colors duration-300 font-semibold text-lg"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Find Us
            </h2>
            <p className="text-lg text-gray-300">
              Visit our showroom to see our luxury fleet in person
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
            <iframe
              src="https://www.google.com/maps?q=Jurong+West+Street+65,+ZBK+Limo+Tours+%26+Transportation+Services,+Singapore+640635&output=embed"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-96"
              title="ZBK Limousine Tours & Transportation Services - Jurong West Street 65, Singapore 640635"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
