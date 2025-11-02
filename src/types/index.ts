// Core Types
export interface PdfDocument {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfPage>;
  destroy(): void;
}

export interface PdfPage {
  getViewport(params: { scale: number }): PdfViewport;
  render(context: RenderContext): RenderTask;
  getTextContent(): Promise<TextContent>;
}

export interface PdfViewport {
  width: number;
  height: number;
  scale: number;
  rotation: number;
}

export interface RenderContext {
  canvasContext: CanvasRenderingContext2D;
  viewport: PdfViewport;
}

export interface RenderTask {
  promise: Promise<void>;
  cancel(): void;
}

export interface TextContent {
  items: TextItem[];
}

export interface TextItem {
  str: string;
  transform: number[];
  width?: number;
  height?: number;
  hasEOL?: boolean;
}

// Search Types
export interface SearchResult {
  pageNum: number;
  context: string;
  text: string;
}

export interface Highlight {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Ollama Types
export interface OllamaModel {
  name: string;
  size?: number;
  modified?: string;
}

export interface OllamaTagsResponse {
  models: OllamaModel[];
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
    top_k?: number;
    top_p?: number;
  };
}

export interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
}

// Component Props Types
export interface PdfCanvasProps {
  scale?: number;
}

export interface SearchResultsProps {
  results?: SearchResult[];
}

// Event Types
export interface FileLoadedEvent {
  file: File;
}

export interface PageChangedEvent {
  pageNumber: number;
}

export interface CommandSubmittedEvent {
  command: string;
}

export interface ResultClickedEvent {
  result: SearchResult;
}

// Store State Types
export interface PdfStoreState {
  pdfDocument: PdfDocument | null;
  pageNum: number;
  numPages: number;
  loading: boolean;
  loadingMessage: string;
  errorMessage: string;
  pdfTextContent: Record<number, string>;
  renderTask: RenderTask | null;
}

export interface OllamaStoreState {
  connected: boolean;
  currentModel: string;
  baseUrl: string;
}

export interface SearchStoreState {
  userCommand: string;
  aiResponse: string;
  aiProcessing: boolean;
  searchResults: SearchResult[];
  highlights: Highlight[];
  currentSearchTerm: string;
}

// Utility Types
export type PageNumber = number;
export type Scale = number;

export interface TextExtractionOptions {
  preserveSpacing?: boolean;
  handleCJK?: boolean;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  ignoreSpaces?: boolean;
}

export interface CommandType {
  type: 'search' | 'navigate' | 'summarize' | 'extract' | 'general';
  payload: string;
}