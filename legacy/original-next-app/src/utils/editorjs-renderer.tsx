import { OutputData } from '@editorjs/editorjs'

/**
 * Render Editor.js blocks to HTML
 */
export function renderEditorJSBlocks(data: OutputData): string {
  if (!data || !data.blocks) return ''

  return data.blocks.map(block => {
    switch (block.type) {
      case 'header':
        const level = block.data.level || 2
        return `<h${level} class="text-${4 - level}xl font-bold mb-4">${block.data.text}</h${level}>`

      case 'paragraph':
        return `<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">${block.data.text}</p>`

      case 'list':
        const listTag = block.data.style === 'ordered' ? 'ol' : 'ul'
        const listClass = block.data.style === 'ordered' ? 'list-decimal' : 'list-disc'
        const items = block.data.items.map((item: string) => `<li>${item}</li>`).join('')
        return `<${listTag} class="${listClass} ml-6 mb-4 space-y-2">${items}</${listTag}>`

      case 'quote':
        return `
          <blockquote class="border-l-4 border-luxury-gold pl-4 py-2 mb-4 italic bg-gray-50 dark:bg-gray-800">
            <p class="text-gray-700 dark:text-gray-300">${block.data.text}</p>
            ${block.data.caption ? `<cite class="text-sm text-gray-500 dark:text-gray-400 mt-2 block">— ${block.data.caption}</cite>` : ''}
          </blockquote>
        `

      case 'code':
        return `
          <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
            <code>${escapeHtml(block.data.code)}</code>
          </pre>
        `

      case 'warning':
        return `
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-4">
            ${block.data.title ? `<p class="font-bold text-yellow-800 dark:text-yellow-200 mb-2">${block.data.title}</p>` : ''}
            <p class="text-yellow-700 dark:text-yellow-300">${block.data.message}</p>
          </div>
        `

      case 'checklist':
        const checkItems = block.data.items.map((item: any) => `
          <li class="flex items-start space-x-2 mb-2">
            <input type="checkbox" ${item.checked ? 'checked' : ''} disabled class="mt-1" />
            <span class="${item.checked ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}">${item.text}</span>
          </li>
        `).join('')
        return `<ul class="mb-4">${checkItems}</ul>`

      case 'table':
        const rows = block.data.content.map((row: string[]) => {
          const cells = row.map(cell => `<td class="border border-gray-300 dark:border-gray-600 px-4 py-2">${cell}</td>`).join('')
          return `<tr>${cells}</tr>`
        }).join('')
        return `
          <div class="overflow-x-auto mb-4">
            <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
              <tbody>${rows}</tbody>
            </table>
          </div>
        `

      case 'image':
        // Get image URL, skip base64 data URLs
        const imageUrl = block.data.url || block.data.file?.url || ''
        
        // Skip rendering if it's a base64 data URL (too large)
        if (imageUrl.startsWith('data:image')) {
          return `<div class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300">
            <p><strong>Note:</strong> Image not displayed (base64 data). Please re-upload images to server.</p>
          </div>`
        }
        
        return `
          <figure class="mb-4">
            <img src="${imageUrl}" alt="${block.data.caption || ''}" class="w-full rounded-lg" />
            ${block.data.caption ? `<figcaption class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">${block.data.caption}</figcaption>` : ''}
          </figure>
        `

      case 'embed':
        return `
          <div class="mb-4 aspect-video">
            <iframe src="${block.data.embed}" class="w-full h-full rounded-lg" frameborder="0" allowfullscreen></iframe>
          </div>
        `

      case 'linkTool':
        return `
          <a href="${block.data.link}" target="_blank" rel="noopener noreferrer" class="block mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div class="flex items-start space-x-4">
              ${block.data.meta?.image?.url ? `<img src="${block.data.meta.image.url}" alt="" class="w-24 h-24 object-cover rounded" />` : ''}
              <div class="flex-1">
                <h4 class="font-semibold text-luxury-gold mb-1">${block.data.meta?.title || block.data.link}</h4>
                ${block.data.meta?.description ? `<p class="text-sm text-gray-600 dark:text-gray-400">${block.data.meta.description}</p>` : ''}
              </div>
            </div>
          </a>
        `

      case 'raw':
        return block.data.html

      default:
        console.warn(`Unknown block type: ${block.type}`)
        return ''
    }
  }).join('\n')
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

/**
 * Convert Editor.js data to plain text (for excerpt)
 */
export function editorJSToPlainText(data: OutputData): string {
  if (!data || !data.blocks) return ''

  return data.blocks
    .map(block => {
      switch (block.type) {
        case 'header':
        case 'paragraph':
          return block.data.text
        case 'list':
          return block.data.items.join(' ')
        case 'quote':
          return block.data.text
        case 'code':
          return block.data.code
        case 'warning':
          return `${block.data.title || ''} ${block.data.message || ''}`
        case 'checklist':
          return block.data.items.map((item: any) => item.text).join(' ')
        default:
          return ''
      }
    })
    .filter(text => text.length > 0)
    .join(' ')
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 200) // Limit to 200 characters
}
