/**
 * Utility function to get the correct image path
 * For uploaded files (after build), use API route
 * For static files (in build), use direct path
 */
export function getImagePath(imagePath: string | undefined | null, fallback: string = '/4.-alphard-colors-black.png'): string {
  if (!imagePath) {
    return fallback
  }
  
  // If already served via API route, keep it
  if (imagePath.startsWith('/api/uploads/')) {
    return imagePath
  }

  // Uploaded files are stored under public/uploads
  if (imagePath.startsWith('/uploads/')) {
    // Always use API route for uploaded files to ensure compatibility
    return imagePath.replace('/uploads/', '/api/uploads/')
  }
  
  // For other paths (static files), return as is
  return imagePath
}

/**
 * Check if image path is from uploads
 */
export function isUploadedImage(imagePath: string | undefined | null): boolean {
  return imagePath?.startsWith('/uploads/') || imagePath?.startsWith('/api/uploads/') || false
}

