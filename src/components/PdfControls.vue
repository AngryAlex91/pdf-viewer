<template>
    <div class="pdf-controls" v-if="ollamaStore.connected">
        <input type="file" @change="handleFileChange" accept=".pdf" ref="fileInputRef" />

        <div v-if="pdfStore.numPages > 0" class="navigation">
            <button @click="handlePrevious" :disabled="pdfStore.pageNum <= 1 || pdfStore.loading">
                Previous
            </button>

            <span class="page-info">
                Page {{ pdfStore.pageNum }} of {{ pdfStore.numPages }}
            </span>

            <button @click="handleNext" :disabled="pdfStore.pageNum >= pdfStore.numPages || pdfStore.loading">
                Next
            </button>

            <button @click="handleReset" class="reset-btn">
                Reset
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useOllamaStore } from '@/stores/ollamaStore';
import { usePdfStore } from '@/stores/pdfStore';
import { useSearchStore } from '@/stores/searchStore';

interface Emits {
    (e: 'file-loaded', file: File): void;
    (e: 'page-changed', pageNum: number): void;
    (e: 'test-highlight'): void;
    (e: 'reset'): void;
}

const emit = defineEmits<Emits>();

const ollamaStore = useOllamaStore();
const pdfStore = usePdfStore();
const searchStore = useSearchStore();
const fileInputRef = ref<HTMLInputElement | null>(null);

const handleFileChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        emit('file-loaded', file);
    }
};

const handlePrevious = (): void => {
    pdfStore.previousPage();
    emit('page-changed', pdfStore.pageNum);
};

const handleNext = (): void => {
    pdfStore.nextPage();
    emit('page-changed', pdfStore.pageNum);
};

const handleReset = (): void => {
    pdfStore.reset();
    searchStore.reset();
    if (fileInputRef.value) {
        fileInputRef.value.value = '';
    }
    emit('reset');
};
</script>

<style scoped>
.pdf-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
}

.navigation {
    display: flex;
    align-items: center;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
}

button {
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
}

button:hover:not(:disabled) {
    background-color: #45a049;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    opacity: 0.6;
}

.reset-btn {
    background-color: #f44336;
}

.reset-btn:hover:not(:disabled) {
    background-color: #da190b;
}

.test-btn {
    background-color: #ff9800;
    font-size: 12px;
    padding: 6px 12px;
}

.test-btn:hover:not(:disabled) {
    background-color: #f57c00;
}

.page-info {
    font-weight: bold;
    min-width: 120px;
    text-align: center;
    color: #333;
}

input[type="file"] {
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    background: white;
    transition: border-color 0.3s;
}

input[type="file"]:hover {
    border-color: #4CAF50;
}
</style>