import { usePdfStore } from '@/stores/pdfStore';
import { useSearchStore } from '@/stores/searchStore';
import { usePdfOperations } from './usePdfOperations';
import type { SearchResult, Highlight, TextItem } from '@/types';

interface ItemMap {
  itemIndex: number;
  charIndex: number;
  item: TextItem;
}

interface UsePdfSearch {
  searchInPDF: (searchTerm: string) => Promise<SearchResult[]>;
  highlightTextOnPage: (searchTerm: string, scale?: number) => Promise<void>;
}

export function usePdfSearch(): UsePdfSearch {
  const pdfStore = usePdfStore();
  const searchStore = useSearchStore();
  const { extractAllText } = usePdfOperations();

  /**
   * Search for text in the PDF
   */
  const searchInPDF = async (searchTerm: string): Promise<SearchResult[]> => {
    searchStore.clearResults();
    searchStore.clearHighlights();

    if (!searchTerm.trim()) {
      return [];
    }

    await extractAllText();

    const results: SearchResult[] = [];
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();


    for (let pageNumber = 1; pageNumber <= pdfStore.numPages; pageNumber++) {
      const pageText = pdfStore.pdfTextContent[pageNumber] || '';

      if (pageText.length === 0) {
        continue;
      }

      const lowerPageText = pageText.toLowerCase();

      // Try exact match first
      if (lowerPageText.includes(normalizedSearchTerm)) {

        const index = lowerPageText.indexOf(normalizedSearchTerm);
        const start = Math.max(0, index - 50);
        const end = Math.min(pageText.length, index + searchTerm.length + 50);
        const context = '...' + pageText.substring(start, end) + '...';

        results.push({
          pageNum: pageNumber,
          context: context,
          text: pageText,
        });
      }
      // Also try without spaces (for Japanese compounds)
      else {
        const searchNoSpaces = normalizedSearchTerm.replace(/\s+/g, '');
        const pageNoSpaces = lowerPageText.replace(/\s+/g, '');

        if (pageNoSpaces.includes(searchNoSpaces)) {
          const index = pageNoSpaces.indexOf(searchNoSpaces);

          // Find approximate position in original text
          let charCount = 0;
          let originalIndex = 0;
          for (let i = 0; i < pageText.length && charCount < index; i++) {
            if (!/\s/.test(pageText[i])) charCount++;
            originalIndex = i;
          }

          const start = Math.max(0, originalIndex - 50);
          const end = Math.min(pageText.length, originalIndex + searchTerm.length + 50);
          const context = '...' + pageText.substring(start, end) + '...';

          results.push({
            pageNum: pageNumber,
            context: context,
            text: pageText,
          });
        }
      }
    }

    searchStore.setResults(results);
    searchStore.setSearchTerm(searchTerm);
    return results;
  };

  /**
   * Highlight text on the current page
   */
  const highlightTextOnPage = async (
  searchTerm: string,
  scale: number = 1.5
): Promise<void> => {
  if (!pdfStore.pdfDocument || !searchTerm) return;

  try {
    const page = await pdfStore.pdfDocument.getPage(pdfStore.pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale });

    const vt = (viewport as any).transform as number[]; // [xx, xy, yx, yy, x0, y0]
    const apply = (x: number, y: number) => ({
      x: vt[0] * x + vt[2] * y + vt[4],
      y: vt[1] * x + vt[3] * y + vt[5],
    });

    const newHighlights: Highlight[] = [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Build full text with item tracking
    let fullText = '';
    const itemMap: { itemIndex: number; charIndex: number; item?: any }[] = [];

    textContent.items.forEach((item: any, itemIndex: number) => {
      const str = item?.str ?? '';
      fullText += str;
      for (let i = 0; i < str.length; i++) {
        itemMap.push({ itemIndex, charIndex: i, item });
      }
    });

    // Find all occurrences in the full text
    const lowerFullText = fullText.toLowerCase();
    let searchIndex = 0;

    while ((searchIndex = lowerFullText.indexOf(lowerSearchTerm, searchIndex)) !== -1) {
      const matchStart = searchIndex;
      const matchEnd = searchIndex + searchTerm.length;

      // Per-item accumulation in canvas space
      const perItem = new Map<number, { minX: number; minY: number; maxX: number; maxY: number }>();

      for (let pos = matchStart; pos < matchEnd && pos < itemMap.length; pos++) {
        const mapEntry = itemMap[pos];
        if (!mapEntry) continue;

        const idx = mapEntry.itemIndex;
        const item = textContent.items[idx];
        if (!item?.transform || item.transform.length < 6) continue;

        const [a, b, c, d, e, f] = item.transform as [number, number, number, number, number, number];

        // Advance width in page units (baseline direction)
        const w = typeof item.width === 'number' ? item.width : 0;

        // Run height in page units (vertical direction): prefer |(c,d)|, fallback to |d|
        const hVec = Math.hypot(c, d);
        const h = hVec > 0 ? hVec : Math.abs(d);

        // Unit directions along baseline (ex) and vertical (ey)
        const exLen = Math.hypot(a, b) || 1;
        const eyLen = Math.hypot(c, d) || 1;
        const exX = a / exLen, exY = b / exLen;
        const eyX = c / eyLen, eyY = d / eyLen;
    
        // Page-space quad for the whole run:
        // TL = origin - h*ey
        // TR = origin + w*ex - h*ey
        // BR = origin + w*ex
        // BL = origin
        const tlX = e - h * eyX, tlY = f - h * eyY;
        const trX = e + w * exX - h * eyX, trY = f + w * exY - h * eyY;
        const brX = e + w * exX, brY = f + w * exY;
        const blX = e, blY = f;

        // Transform all corners to canvas space
        const tl = apply(tlX, tlY);
        const tr = apply(trX, trY);
        const br = apply(brX, brY);
        const bl = apply(blX, blY);

        const r = perItem.get(idx) || {
          minX: Number.POSITIVE_INFINITY,
          minY: Number.POSITIVE_INFINITY,
          maxX: Number.NEGATIVE_INFINITY,
          maxY: Number.NEGATIVE_INFINITY,
        };
       

        r.minX = Math.min(r.minX, tl.x, tr.x, br.x, bl.x);
        r.minY = Math.min(r.minY, tl.y, tr.y, br.y, bl.y);
        r.maxX = Math.max(r.maxX, tl.x, tr.x, br.x, bl.x);
        r.maxY = Math.max(r.maxY, tl.y, tr.y, br.y, bl.y);
        perItem.set(idx, r);
      }
      
      // Convert per-item bounds into canvas-space rects (no manual Y flip)
      perItem.forEach((r) => {
        if (!isFinite(r.minX) || !isFinite(r.minY)) return;
        newHighlights.push({
          x: r.minX,
          y: r.minY,
          width: Math.max(0, r.maxX - r.minX),
          height: Math.max(0, r.maxY - r.minY),
        });
      });

      searchIndex++; // continue searching
    }

    // Store for your renderer (expects canvas-space coordinates)
    searchStore.setHighlights(newHighlights);
  } catch (error) {
    console.error('Error highlighting text:', error);
  }
};



  return {
    searchInPDF,
    highlightTextOnPage,
  };
}