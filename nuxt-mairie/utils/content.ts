/** Convertit un contenu Strapi Blocks ou HTML en texte brut. */
export function extractPlainText(content: unknown): string {
  if (!content) return ''

  if (Array.isArray(content)) {
    let plainText = ''

    const parseBlocks = (blocks: unknown[]) => {
      blocks.forEach((block) => {
        if (!block || typeof block !== 'object') return

        const blockData = block as { text?: unknown; children?: unknown }
        if (typeof blockData.text === 'string') plainText += `${blockData.text} `
        if (Array.isArray(blockData.children)) parseBlocks(blockData.children)
      })
    }

    parseBlocks(content)
    return plainText.trim()
  }

  if (typeof content === 'string') {
    return content.replace(/<[^>]*>?/gm, '').trim()
  }

  return ''
}