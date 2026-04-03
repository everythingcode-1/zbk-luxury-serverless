// API client for ZBK to communicate with Dashboard backend
const DASHBOARD_API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:3000';

export interface Vehicle {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  seats: number;
  transmission: 'Automatic' | 'Manual';
  year: number;
  rating: number;
  isLuxury: boolean;
  features?: string[];
  specialNote?: string;
  brand?: string;
  model?: string;
  engine?: string;
  fuel?: string;
  doors?: number;
  carouselOrder?: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  category: {
    name: string;
    slug: string;
    color: string;
  };
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  readTime?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingData {
  vehicleId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation?: string;
  totalDays?: number;
  pricePerDay?: number;
  totalPrice?: number;
  withDriver?: boolean;
  driverPrice?: number;
  additionalNotes?: string;
}

export interface BookingResponse {
  success: boolean;
  booking?: {
    id: string;
    bookingNumber: string;
    vehicleName: string;
    customerName: string;
    pickupDate: string;
    returnDate: string;
    totalPrice: number;
    status: string;
  };
  error?: string;
  details?: string;
}

// Vehicle API functions
export async function getVehicles(options?: {
  category?: string;
  featured?: boolean;
}): Promise<Vehicle[]> {
  try {
    const params = new URLSearchParams();
    
    if (options?.category && options.category !== 'All') {
      params.append('category', options.category);
    }
    
    if (options?.featured) {
      params.append('featured', 'true');
    }
    
    const response = await fetch(`${DASHBOARD_API_URL}/api/zbk/vehicles?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch vehicles');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    const vehicles = await getVehicles();
    return vehicles.find(vehicle => vehicle.id === id) || null;
  } catch (error) {
    console.error('Error fetching vehicle by ID:', error);
    return null;
  }
}

export async function getVehicleCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${DASHBOARD_API_URL}/api/zbk/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'getCategories' }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching vehicle categories:', error);
    return ['All'];
  }
}

export function getVehiclesByCategory(vehicles: Vehicle[], category: string): Vehicle[] {
  if (category === 'All') return vehicles;
  return vehicles.filter(vehicle => vehicle.category === category);
}

// Article API functions
export async function getArticles(options?: {
  featured?: boolean;
  category?: string;
  limit?: number;
}): Promise<Article[]> {
  try {
    const params = new URLSearchParams();
    
    if (options?.featured) {
      params.append('featured', 'true');
    }
    
    if (options?.category) {
      params.append('category', options.category);
    }
    
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    
    const response = await fetch(`${DASHBOARD_API_URL}/api/zbk/articles?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const response = await fetch(`${DASHBOARD_API_URL}/api/zbk/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'getBySlug', slug }),
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return null;
  }
}

export async function getFeaturedArticles(limit: number = 3): Promise<Article[]> {
  return getArticles({ featured: true, limit });
}

export async function getPublishedArticles(): Promise<Article[]> {
  return getArticles();
}

export function getRelatedArticles(
  articles: Article[],
  currentArticleId: string,
  categorySlug: string,
  limit: number = 3
): Article[] {
  return articles
    .filter(article => 
      article.id !== currentArticleId && 
      article.category.slug === categorySlug
    )
    .slice(0, limit);
}

// Helper functions for backward compatibility with existing ZBK code
export { getVehicles as vehicles };
export { getVehicleCategories as vehicleCategories };
export { getArticleBySlug as getBlogPostBySlug };
export { getPublishedArticles as getPublishedPosts };
export { getFeaturedArticles as getFeaturedPosts };

// Booking API functions
export async function submitBooking(bookingData: BookingData): Promise<BookingResponse> {
  try {
    const response = await fetch(`${DASHBOARD_API_URL}/api/zbk/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to submit booking',
        details: result.details
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error submitting booking:', error);
    return {
      success: false,
      error: 'Network error occurred while submitting booking'
    };
  }
}

export async function getBookingByNumber(bookingNumber: string): Promise<any> {
  try {
    const response = await fetch(`${DASHBOARD_API_URL}/api/zbk/bookings?bookingNumber=${bookingNumber}`);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
}

// Export for articles with different naming for compatibility
export function getPostsByCategory(categorySlug: string): Promise<Article[]> {
  return getArticles({ category: categorySlug });
}
