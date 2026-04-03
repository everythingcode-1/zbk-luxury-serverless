'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';

export interface TestimonialsSectionProps {
  className?: string;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Defer loading until after critical rendering
    const timer = setTimeout(() => {
      const proxySrc = '/api/elfsight/elfsightcdn.com/platform.js';

      // Load Elfsight script with performance optimizations
      if (!document.querySelector(`script[src="${proxySrc}"]`)) {
        const script = document.createElement('script');
        script.src = proxySrc;
        script.async = true;
        script.defer = true; // Add defer for non-blocking
        script.onload = () => {
          // Add small delay to ensure widget is ready
          setTimeout(() => setIsLoaded(true), 100);
        };
        document.head.appendChild(script);
      } else {
        setIsLoaded(true);
      }

      // Rewrite any Elfsight script injected later
      const rewriteElfsightScript = (el: HTMLScriptElement) => {
        const src = el.getAttribute('src');
        if (!src) return;

        try {
          const url = new URL(src, window.location.origin);
          const host = url.hostname;
          if (!host.includes('elfsight')) return;
          if (url.origin === window.location.origin) return;

          const proxy = `/api/elfsight/${host}${url.pathname}${url.search}`;
          el.setAttribute('src', proxy);
        } catch {
          // ignore invalid URLs
        }
      };

      const observer = new MutationObserver((mutations) => {
        requestAnimationFrame(() => { // Use RAF for better performance
          for (const m of mutations) {
            m.addedNodes.forEach((node) => {
              if (node instanceof HTMLScriptElement) {
                rewriteElfsightScript(node);
              } else if (node instanceof HTMLElement) {
                node.querySelectorAll('script[src]').forEach((s) => rewriteElfsightScript(s as HTMLScriptElement));
              }
            });
          }
        });
      });

      observer.observe(document.head, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
      };
    }, 800); // Increased defer time for better performance

    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <section className={cn('py-20 bg-gradient-to-br from-gray-50 to-white', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-deep-navy mb-6">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real reviews from our valued customers who have experienced our premium luxury transportation services.
          </p>
          
          {/* Decorative divider */}
          <div className="w-16 h-1 bg-luxury-gold mx-auto rounded-full mt-8"></div>
        </div>

        {/* Google Reviews Embed with Lazy Loading */}
        <div ref={containerRef} className="flex justify-center">
          {/* Reserve space to prevent layout shift */}
          <div 
            className="w-full max-w-2xl min-h-[400px] flex items-center justify-center"
            style={{ 
              contain: 'layout',
              contentVisibility: isVisible ? 'visible' : 'hidden'
            }}
          >
            {!isLoaded && isVisible && (
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                </div>
                <p className="text-sm text-gray-500 mt-4">Loading reviews...</p>
              </div>
            )}
            <div 
              className={`elfsight-app-abad4134-b8dc-4a21-8519-cd78ff490635 transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0 absolute'
              }`}
              data-elfsight-app-lazy
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
