'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash, CheckCircle, XCircle, X, Save } from '@/components/admin/Icons'

interface HeroSection {
  id: string
  headline: string
  description: string
  image?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function HeroSectionPage() {
  const [heroSections, setHeroSections] = useState<HeroSection[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedHero, setSelectedHero] = useState<HeroSection | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    headline: '',
    description: '',
    image: '',
    isActive: true
  })

  // Fetch hero sections from API
  useEffect(() => {
    fetchHeroSections()
  }, [])

  const fetchHeroSections = async () => {
    try {
      const response = await fetch('/api/admin/hero-section')
      if (response.ok) {
        const data = await response.json()
        setHeroSections(data)
      }
    } catch (error) {
      console.error('Error fetching hero sections:', error)
      setMessage({ type: 'error', text: 'Failed to fetch hero sections' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedHero(null)
    setModalMode('add')
    setFormData({
      headline: '',
      description: '',
      image: '',
      isActive: true
    })
    setIsModalOpen(true)
  }

  const handleEdit = (hero: HeroSection) => {
    setSelectedHero(hero)
    setModalMode('edit')
    setFormData({
      headline: hero.headline,
      description: hero.description,
      image: hero.image || '',
      isActive: hero.isActive
    })
    setIsModalOpen(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    setIsUploading(true)

    try {
      // Upload to server
      const uploadFormData = new FormData()
      uploadFormData.append('files', file)
      uploadFormData.append('type', 'hero')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      if (data.success && data.files && data.files.length > 0) {
        // Get uploaded file path
        const uploadedPath = data.files[0]
        // Ensure path starts with /uploads/
        const imagePath = uploadedPath.startsWith('/') ? uploadedPath : `/${uploadedPath}`
        setFormData(prev => ({ ...prev, image: imagePath }))
        
        // Show success notification
        setUploadSuccess(true)
        setTimeout(() => setUploadSuccess(false), 3000)
      } else {
        throw new Error('No file returned from server')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage({ type: 'error', text: 'Failed to upload image' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }))
  }

  const handleDelete = async (heroId: string) => {
    if (deleteConfirm === heroId) {
      try {
        const response = await fetch(`/api/admin/hero-section/${heroId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setHeroSections(heroSections.filter(h => h.id !== heroId))
          setDeleteConfirm(null)
          setMessage({ type: 'success', text: 'Hero section deleted successfully' })
          setTimeout(() => setMessage(null), 3000)
        } else {
          setMessage({ type: 'error', text: 'Failed to delete hero section' })
          setTimeout(() => setMessage(null), 3000)
        }
      } catch (error) {
        console.error('Error deleting hero section:', error)
        setMessage({ type: 'error', text: 'Error deleting hero section' })
        setTimeout(() => setMessage(null), 3000)
      }
    } else {
      setDeleteConfirm(heroId)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.headline.trim() || !formData.description.trim()) {
      setMessage({ type: 'error', text: 'Headline and description are required' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    try {
      const url = modalMode === 'add' 
        ? '/api/admin/hero-section' 
        : `/api/admin/hero-section/${selectedHero?.id}`
      const method = modalMode === 'add' ? 'POST' : 'PATCH'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        if (modalMode === 'add') {
          setHeroSections([data, ...heroSections])
        } else {
          setHeroSections(heroSections.map(h => h.id === data.id ? data : h))
        }
        setIsModalOpen(false)
        setMessage({ type: 'success', text: `Hero section ${modalMode === 'add' ? 'created' : 'updated'} successfully` })
        setTimeout(() => setMessage(null), 3000)
        fetchHeroSections() // Refresh to get updated active status
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to save hero section' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error saving hero section:', error)
      setMessage({ type: 'error', text: 'Error saving hero section' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const filteredSections = heroSections

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hero Section</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your homepage hero section headline and description
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Hero Sections List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {filteredSections.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No hero sections found. Create your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Headline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSections.map((hero) => (
                  <tr key={hero.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hero.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          <XCircle className="w-4 h-4" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white max-w-md truncate">
                        {hero.headline}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">
                        {hero.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(hero.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(hero)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(hero.id)}
                          className={`text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ${
                            deleteConfirm === hero.id ? 'font-bold' : ''
                          }`}
                        >
                          {deleteConfirm === hero.id ? (
                            <span className="text-xs">Confirm?</span>
                          ) : (
                            <Trash className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 z-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {modalMode === 'add' ? 'Add New Hero Section' : 'Edit Hero Section'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Headline *
                  </label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Enter headline (e.g., Premium Limousine Service in Singapore)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-y"
                    placeholder="Enter description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hero Image
                  </label>
                  
                  {/* Upload Success Notification */}
                  {uploadSuccess && (
                    <div className="mb-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Gambar hero berhasil diupload! File telah disimpan.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Current Image Info */}
                  {formData.image && (
                    <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Hero Image
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formData.image.split('/').pop()}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition-colors"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Upload a hero image (max 5MB). Recommended size: 1920x1080px
                  </p>
                  {isUploading && (
                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                      Uploading image...
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Set as active (only one hero section can be active at a time)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    {modalMode === 'add' ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

