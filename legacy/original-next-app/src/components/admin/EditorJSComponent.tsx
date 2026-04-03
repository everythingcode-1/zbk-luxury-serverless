'use client'

import { useEffect, useRef, memo } from 'react'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import Quote from '@editorjs/quote'
import Code from '@editorjs/code'
import InlineCode from '@editorjs/inline-code'
import Marker from '@editorjs/marker'
import Checklist from '@editorjs/checklist'
import Embed from '@editorjs/embed'
import Table from '@editorjs/table'
import Warning from '@editorjs/warning'
import LinkTool from '@editorjs/link'
import RawTool from '@editorjs/raw'
import ImageTool from '@editorjs/image'

interface EditorJSComponentProps {
  data?: OutputData
  onChange: (data: OutputData) => void
  placeholder?: string
  readOnly?: boolean
}

const EditorJSComponent = ({ 
  data, 
  onChange, 
  placeholder = "Let's write an awesome story!",
  readOnly = false 
}: EditorJSComponentProps) => {
  const editorRef = useRef<EditorJS | null>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (!holderRef.current) return
    
    // Prevent double initialization (React Strict Mode fix)
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    // Initialize Editor.js
    const editor = new EditorJS({
      holder: holderRef.current,
      placeholder,
      readOnly,
      
      /**
       * Prevent duplicate paste content
       */
      defaultBlock: 'paragraph',
      
      /**
       * Available Tools list
       */
      tools: {
        header: {
          class: Header as any,
          inlineToolbar: ['marker', 'link'],
          config: {
            placeholder: 'Enter a header',
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2
          },
          shortcut: 'CMD+SHIFT+H'
        },
        
        paragraph: {
          class: Paragraph as any,
          inlineToolbar: true,
        },
        
        list: {
          class: List as any,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          },
          shortcut: 'CMD+SHIFT+L'
        },
        
        quote: {
          class: Quote as any,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote\'s author',
          },
          shortcut: 'CMD+SHIFT+Q'
        },
        
        code: {
          class: Code as any,
          shortcut: 'CMD+SHIFT+C'
        },
        
        inlineCode: {
          class: InlineCode as any,
          shortcut: 'CMD+SHIFT+M'
        },
        
        marker: {
          class: Marker as any,
          shortcut: 'CMD+SHIFT+M'
        },
        
        checklist: {
          class: Checklist as any,
          inlineToolbar: true,
        },
        
        embed: {
          class: Embed as any,
          config: {
            services: {
              youtube: true,
              coub: true,
              codepen: true,
              instagram: true,
              twitter: true,
              facebook: true,
              vimeo: true
            }
          }
        },
        
        table: {
          class: Table as any,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3,
          },
        },
        
        warning: {
          class: Warning as any,
          inlineToolbar: true,
          config: {
            titlePlaceholder: 'Title',
            messagePlaceholder: 'Message',
          },
        },
        
        linkTool: {
          class: LinkTool as any,
          config: {
            endpoint: '/api/fetch-url', // Optional: for fetching link metadata
          }
        },
        
        raw: RawTool as any,
        
        image: {
          class: ImageTool as any,
          config: {
            uploader: {
              async uploadByFile(file: File) {
                const formData = new FormData()
                formData.append('files', file)
                formData.append('type', 'blog')
                
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData
                })
                
                const data = await response.json()
                
                if (data.success && data.files && data.files.length > 0) {
                  return {
                    success: 1,
                    file: {
                      url: data.files[0]
                    }
                  }
                }
                
                throw new Error(data.error || 'Upload failed')
              },
              
              async uploadByUrl(url: string) {
                // For URL uploads, just return the URL directly
                return {
                  success: 1,
                  file: {
                    url: url
                  }
                }
              }
            }
          }
        }
      },
      
      /**
       * Initial data
       */
      data: data || undefined,
      
      /**
       * onChange callback
       */
      onChange: async (api) => {
        try {
          const outputData = await api.saver.save()
          onChange(outputData)
        } catch (error) {
          console.error('Saving failed:', error)
        }
      },
      
      /**
       * onReady callback
       */
      onReady: () => {
        console.log('Editor.js is ready to work!')
      },
      
      /**
       * Internationalization
       */
      i18n: {
        messages: {
          ui: {
            "blockTunes": {
              "toggler": {
                "Click to tune": "Click to tune",
                "or drag to move": "or drag to move"
              },
            },
            "inlineToolbar": {
              "converter": {
                "Convert to": "Convert to"
              }
            },
            "toolbar": {
              "toolbox": {
                "Add": "Add"
              }
            }
          },
          toolNames: {
            "Text": "Text",
            "Heading": "Heading",
            "List": "List",
            "Warning": "Warning",
            "Checklist": "Checklist",
            "Quote": "Quote",
            "Code": "Code",
            "Delimiter": "Delimiter",
            "Raw HTML": "Raw HTML",
            "Table": "Table",
            "Link": "Link",
            "Marker": "Marker",
            "Bold": "Bold",
            "Italic": "Italic",
            "InlineCode": "Inline Code",
            "Image": "Image"
          },
          tools: {
            "warning": {
              "Title": "Title",
              "Message": "Message",
            },
            "link": {
              "Add a link": "Add a link"
            },
            "stub": {
              'The block can not be displayed correctly.': 'The block can not be displayed correctly.'
            }
          },
          blockTunes: {
            "delete": {
              "Delete": "Delete",
              "Click to delete": "Click to delete"
            },
            "moveUp": {
              "Move up": "Move up"
            },
            "moveDown": {
              "Move down": "Move down"
            }
          },
        }
      },
      
      /**
       * Auto focus
       */
      autofocus: false,
      
      /**
       * Log level
       */
      logLevel: 'ERROR' as any,
    })

    editorRef.current = editor

    // Cleanup
    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, []) // Only run once on mount

  // Update data when prop changes (only on initial load)
  useEffect(() => {
    if (editorRef.current && data && data.blocks && data.blocks.length > 0) {
      editorRef.current.isReady.then(() => {
        // Only render if editor is empty
        editorRef.current?.save().then((savedData) => {
          if (!savedData.blocks || savedData.blocks.length === 0) {
            editorRef.current?.render(data)
          }
        })
      }).catch((error) => {
        console.error('Editor render failed:', error)
      })
    }
  }, []) // Only run once on mount

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700">
      <div 
        ref={holderRef} 
        id="editorjs" 
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none p-4 min-h-[400px] dark:prose-invert"
      />
    </div>
  )
}

export default memo(EditorJSComponent)
