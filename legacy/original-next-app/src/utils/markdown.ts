import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true // GitHub Flavored Markdown
});

/**
 * Convert markdown string to HTML
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  try {
    return marked(markdown) as string;
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return markdown; // Return original if conversion fails
  }
}

/**
 * Strip HTML tags from string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Calculate reading time based on content
 */
export function calculateReadingTime(content: string): number {
  const text = stripHtml(content);
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 200); // Average 200 words per minute
}















