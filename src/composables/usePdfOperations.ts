import { usePdfStore } from '@/stores/pdfStore';
import * as pdfjsLib from 'pdfjs-dist';
import type { PdfDocument, PdfPage, PdfViewport } from '@/types';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface RenderResult {
  page: PdfPage;
  viewport: PdfViewport;
}

interface UsePdfOperations {
  loadPdf: (file: File) => Promise<PdfDocument>;
  renderPage: (canvas: HTMLCanvasElement, pageNumber: number, scale?: number) => Promise<RenderResult>;
  extractTextFromPage: (pageNumber: number) => Promise<string>;
  extractAllText: () => Promise<void>;
}

export function usePdfOperations(): UsePdfOperations {
  const pdfStore = usePdfStore();

  /**
   * Load PDF from file
   */
  const loadPdf = async (file: File): Promise<PdfDocument> => {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!file.type.includes('pdf')) {
      pdfStore.setError('Please select a PDF file');
      throw new Error('Invalid file type');
    }

    pdfStore.reset();
    pdfStore.setLoading(true, 'Loading PDF...');
    pdfStore.clearError();

    return new Promise<PdfDocument>((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          pdfStore.setLoading(true, 'Processing PDF...');

          const loadingTask = pdfjsLib.getDocument({
            data: typedArray,
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
            cMapPacked: true,
          });

          const doc = await loadingTask.promise as unknown as PdfDocument;
          pdfStore.setDocument(doc);
          pdfStore.setNumPages(doc.numPages);
          pdfStore.setPageNum(1);

          resolve(doc);
        } catch (error) {
          console.error('Error loading PDF:', error);
          pdfStore.setError(`Failed to load PDF: ${(error as Error).message}`);
          pdfStore.setLoading(false);
          reject(error);
        }
      };

      fileReader.onerror = () => {
        console.error('Error reading file');
        pdfStore.setError('Failed to read file');
        pdfStore.setLoading(false);
        reject(new Error('Failed to read file'));
      };

      fileReader.readAsArrayBuffer(file);
    });
  };

  /**
   * Render a specific page
   */
  const renderPage = async (
    canvas: HTMLCanvasElement,
    pageNumber: number,
    scale: number = 1.5
  ): Promise<RenderResult> => {
    if (!pdfStore.pdfDocument) {
      throw new Error('No PDF document loaded');
    }
    
    if (pageNumber < 1 || pageNumber > pdfStore.numPages) {
      throw new Error('Invalid page number');
    }

    pdfStore.cancelRenderTask();
    pdfStore.setLoading(true, `Rendering page ${pageNumber}...`);
    pdfStore.clearError();

    try {
      if (!pdfStore.pdfDocument) {
        throw new Error('PDF document was destroyed');
      }
      const page = await pdfStore.pdfDocument.getPage(pageNumber);
      
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not get canvas context');
      }

      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const task = page.render(renderContext);
      pdfStore.setRenderTask(task);

      await task.promise;

      pdfStore.setRenderTask(null);
      pdfStore.setLoading(false);

      return { page, viewport };
    } catch (error) {
      pdfStore.setRenderTask(null);

      if ((error as Error).name === 'RenderingCancelledException') {
        console.error('Rendering was cancelled');
      } else {
        console.error('Error rendering page:', error);
        pdfStore.setError(`Failed to render page ${pageNumber}`);
      }
      pdfStore.setLoading(false);
      throw error;
    }
  };

  /**
   * Extract text from a specific page
   */
  const extractTextFromPage = async (pageNumber: number): Promise<string> => {
    if (!pdfStore.pdfDocument) return '';

    try {
      const page = await pdfStore.pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();

      
      // Better text joining for Japanese/CJK characters
      let text = '';
      textContent.items.forEach((item, index) => {
        const str = item.str || '';

        // Check if current or next item contains CJK characters
        const hasCJK = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/.test(str);
        const nextItem = textContent.items[index + 1];
        const nextHasCJK = nextItem && /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/.test(nextItem.str || '');

        text += str;

        // Add space only between non-CJK text or if there's a line break
        if (nextItem && !hasCJK && !nextHasCJK && item.hasEOL !== true) {
          text += ' ';
        }
      });

      pdfStore.setPageText(pageNumber, text);

      return text;
    } catch (error) {
      console.error('Error extracting text:', error);
      return '';
    }
  };

  /**
   * Extract text from all pages
   */
  const extractAllText = async (): Promise<void> => {
    if (!pdfStore.pdfDocument) return;

    pdfStore.setLoading(true, 'Extracting text from PDF...');

    try {
      for (let i = 1; i <= pdfStore.numPages; i++) {
        if (!pdfStore.pdfTextContent[i]) {
          await extractTextFromPage(i);
        }
      }
    } catch (error) {
      console.error('Error extracting all text:', error);
    } finally {
      pdfStore.setLoading(false);
    }
  };

  return {
    loadPdf,
    renderPage,
    extractTextFromPage,
    extractAllText,
  };
}