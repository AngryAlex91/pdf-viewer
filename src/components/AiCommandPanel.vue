<template>
    <div class="ai-command-section" v-if="ollamaStore.connected && pdfStore.numPages > 0">
        <h3>🤖 AI Assistant (Local & Private)</h3>

        <div class="command-examples">
            <strong>Try:</strong>
            <button @click="setCommand('find contract')" class="example-btn">
                Find "contract"
            </button>
            <button @click="setCommand('summarize this page')" class="example-btn">
                Summarize page
            </button>
            <button @click="setCommand('what is this about')" class="example-btn">
                What is this about?
            </button>
        </div>

        <div class="command-input-wrapper">
            <textarea v-model="searchStore.userCommand" placeholder="Examples:
• find invoice
• search for total amount  
• summarize this page
• what is this document about?" rows="3" @keydown.ctrl.enter="handleSubmit"
                :disabled="searchStore.aiProcessing"></textarea>
            <button @click="handleSubmit" :disabled="!searchStore.userCommand.trim() || searchStore.aiProcessing"
                class="ai-button">
                {{ searchStore.aiProcessing ? 'Processing...' : 'Ask AI' }}
            </button>
        </div>

        <!-- AI Response -->
        <div v-if="searchStore.aiResponse" class="ai-response">
            <h4>AI Response:</h4>
            <div>{{ searchStore.aiResponse }}</div>
        </div>

        <!-- Search Results -->
        <SearchResults v-if="searchStore.hasResults" @result-clicked="handleResultClick" />
    </div>
</template>

<script setup lang="ts">
import { useOllamaStore } from '@/stores/ollamaStore';
import { usePdfStore } from '@/stores/pdfStore';
import { useSearchStore } from '@/stores/searchStore';
import SearchResults from '@/components/SearchResults.vue';
import type { SearchResult } from '@/types';

interface Emits {
    (e: 'command-submitted', command: string): void;
    (e: 'result-clicked', result: SearchResult): void;
}

const emit = defineEmits<Emits>();

const ollamaStore = useOllamaStore();
const pdfStore = usePdfStore();
const searchStore = useSearchStore();

const setCommand = (cmd: string): void => {
    searchStore.setCommand(cmd);
};

const handleSubmit = (): void => {
    if (!searchStore.userCommand.trim() || searchStore.aiProcessing) return;
    emit('command-submitted', searchStore.userCommand);
};

const handleResultClick = (result: SearchResult): void => {
    emit('result-clicked', result);
};
</script>

<style scoped>
.ai-command-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.ai-command-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: white;
    font-size: 20px;
}

.command-examples {
    margin-bottom: 15px;
    color: white;
}

.example-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 6px 12px;
    font-size: 12px;
    margin: 5px 5px 5px 0;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
}

.example-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

.command-input-wrapper {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

textarea {
    flex: 1;
    padding: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    resize: vertical;
    background: white;
}

textarea:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

textarea:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.ai-button {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    white-space: nowrap;
    align-self: flex-start;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.3s;
}

.ai-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.ai-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.ai-response {
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    white-space: pre-wrap;
    max-height: 400px;
    overflow-y: auto;
}

.ai-response h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #2196F3;
    font-size: 16px;
}
</style>