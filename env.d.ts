/// <reference types="vite/client" />

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_OLLAMA_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// PDF.js types augmentation
declare module 'pdfjs-dist' {
  export const version: string

  export const GlobalWorkerOptions: {
    workerSrc: string
  }
  
  export function getDocument(params: any): any
}