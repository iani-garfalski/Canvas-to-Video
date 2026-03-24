/**
 * Scans the DOM for human-readable text, filtering out hidden or technical elements.
 * @returns string - Concatenated string of all visible text nodes.
 */
export function extractVisibleText(): string {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const el = node.parentElement;
        if (!el) return NodeFilter.FILTER_REJECT;

        const style = window.getComputedStyle(el);
        
        // Skip elements that aren't actually visible to the user
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          parseFloat(style.opacity) === 0
        ) return NodeFilter.FILTER_REJECT;

        // Ignore metadata and script tags
        if (/^(SCRIPT|STYLE|NOSCRIPT|VIDEO|AUDIO)$/.test(el.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        return node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    }
  );

  let content = "";
  let n: Node | null;
  while ((n = walker.nextNode())) content += n.textContent + " ";

  return content.trim();
}