import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zbktransportservices.com';

  // Generate Schema.org BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@id": baseUrl,
          "name": "Home"
        }
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "item": {
          "@id": item.href ? `${baseUrl}${item.href}` : undefined,
          "name": item.label
        }
      }))
    ]
  };

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb UI */}
      <nav 
        aria-label="Breadcrumb" 
        className={`bg-gray-50 py-4 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm">
            {/* Home Link */}
            <li className="flex items-center">
              <Link 
                href="/" 
                className="flex items-center text-gray-600 hover:text-luxury-gold transition-colors duration-200"
                aria-label="Home"
              >
                <Home className="w-4 h-4" />
                <span className="ml-1">Home</span>
              </Link>
            </li>

            {/* Breadcrumb Items */}
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              
              return (
                <li key={index} className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  
                  {item.href && !isLast ? (
                    <Link 
                      href={item.href}
                      className="text-gray-600 hover:text-luxury-gold transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span 
                      className={`${isLast ? 'text-deep-navy font-semibold' : 'text-gray-600'}`}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
