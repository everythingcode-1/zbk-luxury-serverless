// Cloudinary upload utility for production
// This is a simple implementation that works with Cloudinary's Upload API

interface CloudinaryResponse {
  secure_url: string
  public_id: string
  format: string
  width: number
  height: number
  bytes: number
}

/**
 * Upload image to Cloudinary
 * @param file - File to upload
 * @param folder - Folder in Cloudinary (e.g., 'vehicles' or 'blog')
 * @returns Cloudinary URL
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'zbk'
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'zbk_uploads'

  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not configured')
  }

  // Create form data for Cloudinary upload
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  // Upload to Cloudinary
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Cloudinary upload failed: ${error}`)
  }

  const data: CloudinaryResponse = await response.json()
  return data.secure_url
}

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of files to upload
 * @param folder - Folder in Cloudinary
 * @returns Array of Cloudinary URLs
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  folder: string = 'zbk'
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, folder))
  return Promise.all(uploadPromises)
}












