/**
 * Sanitizes HTML content by removing empty elements and unnecessary formatting
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  let cleaned = html

  // Remove empty list items (<li></li>, <li>&nbsp;</li>, <li> </li>)
  cleaned = cleaned.replace(/<li>\s*(?:&nbsp;|\s)*<\/li>/gi, '')
  
  // Remove empty unordered lists (<ul></ul>)
  cleaned = cleaned.replace(/<ul>\s*<\/ul>/gi, '')
  
  // Remove empty ordered lists (<ol></ol>)
  cleaned = cleaned.replace(/<ol>\s*<\/ol>/gi, '')
  
  // Remove consecutive <br> tags (more than 2)
  cleaned = cleaned.replace(/(<br\s*\/?>){3,}/gi, '<br><br>')
  
  // Remove <br> tags at the very end of the content
  cleaned = cleaned.replace(/(<br\s*\/?>\s*)+$/gi, '')
  
  // Remove empty paragraphs (<p></p>, <p>&nbsp;</p>)
  cleaned = cleaned.replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, '')
  
  // Remove empty lines at the beginning (empty paragraphs, br tags, or whitespace)
  cleaned = cleaned.replace(/^(<p>\s*(?:&nbsp;|\s)*<\/p>\s*)+/gi, '')
  cleaned = cleaned.replace(/^(<br\s*\/?>\s*)+/gi, '')
  cleaned = cleaned.replace(/^(\s|&nbsp;)+/gi, '')
  
  // Remove whitespace-only content
  cleaned = cleaned.replace(/^\s*(?:&nbsp;|\s)*$/gi, '')
  
  // Remove trailing whitespace and line breaks
  cleaned = cleaned.trim()
  
  // If the content is empty after cleaning, return empty string
  if (!cleaned || cleaned === '<br>' || cleaned === '<br/>') {
    return ''
  }
  
  return cleaned
}

// Test function to verify sanitization works correctly
export function testSanitization() {
  const testHtml = '<b>hsfhfh</b>⭐gsdgsg🔥<br><ul><li></li></ul>✅gadg<br><ul><li>&nbsp;</li></ul>&nbsp;<br><br><br>'
  const cleaned = sanitizeHtmlContent(testHtml)
  console.log('Original:', testHtml)
  console.log('Cleaned:', cleaned)
  return cleaned
} 