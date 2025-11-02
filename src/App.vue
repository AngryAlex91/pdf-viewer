<template>
  <div class="pdf-ai-viewer">
    <h2>PDF Viewer with Local AI (Ollama)</h2>

    <!-- Status Component -->
    <OllamaStatus />

    <!-- Controls Component -->
    <PdfControls @file-loaded="handleFileLoaded" @page-changed="handlePageChanged" @reset="handleReset" />

    <!-- AI Command Panel -->
    <AiCommandPanel @command-submitted="handleCommand" @result-clicked="handleResultClick" />

    <!-- PDF Canvas -->
    <PdfCanvas ref="pdfCanvasRef" :scale="1.5" />

    <!-- Loading Indicator -->
    <div v-if="pdfStore.loading" class="loading">
      {{ pdfStore.loadingMessage }}
    </div>

    <!-- Error Display -->
    <div v-if="pdfStore.errorMessage" class="error">
      {{ pdfStore.errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePdfStore } from './stores/pdfStore';
import { useSearchStore } from './stores/searchStore';
import { usePdfOperations } from './composables/usePdfOperations';
import { usePdfSearch } from './composables/usePdfSearch';
import { useAiCommands } from './composables/useAiCommands';

import OllamaStatus from './components/OllamaStatus.vue';
import PdfControls from './components/PdfControls.vue';
import AiCommandPanel from './components/AiCommandPanel.vue';
import PdfCanvas from './components/PdfCanvas.vue';

const pdfStore = usePdfStore();
const searchStore = useSearchStore();
const pdfCanvasRef = ref(null);

const { loadPdf, renderPage } = usePdfOperations();
const { highlightTextOnPage } = usePdfSearch();
const { handleCommand: processCommand } = useAiCommands();

/**
 * Handle file loaded
 */
const handleFileLoaded = async (file) => {
  try {
    await loadPdf(file);

    // Render first page
    if (pdfCanvasRef.value?.canvas) {
      await renderPage(pdfCanvasRef.value.canvas, 1);
    }
  } catch (error) {
    console.error('Error loading PDF:', error);
  }
};

/**
 * Handle page changed
 */
const handlePageChanged = async (pageNumber) => {
  if (pdfCanvasRef.value?.canvas) {
    await renderPage(pdfCanvasRef.value.canvas, pageNumber);

    // Re-highlight if there's a current search
    if (searchStore.currentSearchTerm) {
      await highlightTextOnPage(searchStore.currentSearchTerm);
    }
  }
};

/**
 * Handle reset
 */
const handleReset = () => {
  // Stores are already reset by PdfControls component
  // Just clear the canvas
  if (pdfCanvasRef.value?.canvas) {
    const ctx = pdfCanvasRef.value.canvas.getContext('2d');
    ctx.clearRect(0, 0, pdfCanvasRef.value.canvas.width, pdfCanvasRef.value.canvas.height);
  }
};

/**
 * Handle AI command
 */
const handleCommand = async (command) => {
  const result = await processCommand(command);

  // If command returned a result (e.g., search result), navigate to it
  if (result && result.pageNum) {
    await handleResultClick(result);
  }
};

/**
 * Handle search result click
 */
const handleResultClick = async (result) => {
  pdfStore.setPageNum(result.pageNum);

  if (pdfCanvasRef.value?.canvas) {
    await renderPage(pdfCanvasRef.value.canvas, result.pageNum);

    // Highlight the search term on the page
    if (searchStore.currentSearchTerm) {
      await highlightTextOnPage(searchStore.currentSearchTerm);
    }
  }
};
</script>

<style scoped>
.pdf-ai-viewer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 8px;
  margin-top: 10px;
}

.error {
  text-align: center;
  padding: 15px;
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 8px;
  margin-top: 10px;
  border: 1px solid #ef9a9a;
}
</style>