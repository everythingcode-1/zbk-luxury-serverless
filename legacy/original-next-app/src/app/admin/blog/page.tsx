'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Edit, Trash, Eye, Search, Filter, CheckCircle, XCircle, X } from '@/components/admin/Icons'
import BlogModal from '@/components/admin/BlogModal'
import { markdownToHtml } from '@/utils/markdown'
import { getImagePath } from '@/utils/imagePath'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  images: string[] // Changed to array for multiple images
  author: string
  isPublished: boolean
  tags: string[]
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')

  // Fetch blog posts from API
  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog')
      const data = await response.json()
      if (data.success) {
        setPosts(data.data)
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPost = () => {
    setSelectedPost(null)
    setModalMode('add')
    setIsModalOpen(true)
  }

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleViewPost = (post: BlogPost) => {
    setPreviewPost(post)
    setIsPreviewModalOpen(true)
  }

  const handleDeletePost = async (postId: string) => {
    if (deleteConfirm === postId) {
      try {
        const response = await fetch(`/api/blog/${postId}`, {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          setPosts(posts.filter(p => p.id !== postId))
          setDeleteConfirm(null)
        } else {
          alert('Failed to delete blog post')
        }
      } catch (error) {
        console.error('Error deleting blog post:', error)
        alert('Error deleting blog post')
      }
    } else {
      setDeleteConfirm(postId)
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const handleSavePost = async (postData: any) => {
    try {
      const url = modalMode === 'add' ? '/api/blog' : `/api/blog/${selectedPost?.id}`
      const method = modalMode === 'add' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })
      
      const data = await response.json()
      if (data.success) {
        if (modalMode === 'add') {
          setPosts([data.data, ...posts])
        } else {
          setPosts(posts.map(p => p.id === selectedPost?.id ? data.data : p))
        }
        setIsModalOpen(false)
        setSelectedPost(null)
      } else {
        alert('Failed to save blog post')
      }
    } catch (error) {
      console.error('Error saving blog post:', error)
      alert('Error saving blog post')
    }
  }

  const togglePublishStatus = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...post,
          isPublished: !post.isPublished,
          publishedAt: !post.isPublished ? new Date().toISOString() : null
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setPosts(posts.map(p => p.id === post.id ? data.data : p))
      }
    } catch (error) {
      console.error('Error updating publish status:', error)
    }
  }

  // Filter posts based on search and status
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && post.isPublished) ||
                         (statusFilter === 'draft' && !post.isPublished)
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (isPublished: boolean) => {
    return isPublished 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blog Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage blog posts for your website
          </p>
        </div>
        <button 
          onClick={handleAddPost}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Post</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{posts.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {posts.filter(p => p.isPublished).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {posts.filter(p => !p.isPublished).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {posts.filter(p => {
                  const postDate = new Date(p.createdAt)
                  const now = new Date()
                  return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blog Posts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Blog Posts ({filteredPosts.length})
          </h2>
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[300px]">
                  Post
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[120px]">
                  Author
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[100px]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[120px]">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[120px] sticky right-0 bg-gray-50 dark:bg-gray-700 z-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                      <span className="ml-2 text-gray-500 dark:text-gray-400">Loading posts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No blog posts found</p>
                      <button 
                        onClick={handleAddPost}
                        className="mt-2 text-yellow-600 hover:text-yellow-500"
                      >
                        Create your first post
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {post.images && post.images.length > 0 && post.images[0] ? (
                            <img
                              src={getImagePath(post.images[0])}
                              alt={post.title}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.includes('/api/uploads/') && post.images?.[0]) {
                                  target.src = post.images[0];
                                }
                              }}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={post.title}>
                            {post.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {post.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 dark:text-white truncate max-w-[100px]" title={post.author}>
                        {post.author}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => togglePublishStatus(post)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${getStatusColor(post.isPublished)}`}
                      >
                        {post.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium sticky right-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 z-10 transition-colors">
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleViewPost(post)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="View Post"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditPost(post)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="Edit Post"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className={`p-1.5 rounded transition-colors ${
                            deleteConfirm === post.id 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                              : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                          title={deleteConfirm === post.id ? "Click again to confirm delete" : "Delete Post"}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blog Modal */}
      <BlogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePost}
        blog={selectedPost}
        mode={modalMode}
      />

      {/* Preview Modal */}
      {isPreviewModalOpen && previewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Blog Post Preview
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Preview how your blog post will appear
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Cover Image (First image) */}
              {previewPost.images && previewPost.images.length > 0 && (
                <div className="mb-6">
                  <img
                    src={getImagePath(previewPost.images[0])}
                    alt={previewPost.title}
                    className="w-full h-96 object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('/api/uploads/')) {
                        target.src = previewPost.images[0];
                      }
                    }}
                  />
                </div>
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {previewPost.title}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                <span>By {previewPost.author}</span>
                <span>•</span>
                <span>{formatDate(previewPost.createdAt)}</span>
                {previewPost.tags && previewPost.tags.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex flex-wrap gap-2">
                      {previewPost.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {previewPost.excerpt && (
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 italic">
                  {previewPost.excerpt}
                </p>
              )}

              <div
                className="prose prose-lg dark:prose-invert max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(previewPost.content) }}
              />

              {/* Additional Images Gallery */}
              {previewPost.images && previewPost.images.length > 1 && (
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previewPost.images.slice(1).map((image, index) => (
                      <div key={index} className="rounded-lg overflow-hidden shadow-md">
                        <img
                          src={getImagePath(image)}
                          alt={`Gallery image ${index + 2}`}
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('/api/uploads/')) {
                              target.src = image;
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
