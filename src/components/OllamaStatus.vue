<template>
    <div class="ollama-status">
        <div v-if="!ollamaStore.connected" class="status-warning">
            <h3>⚠️ Ollama Not Running</h3>
            <p>Please install and run Ollama:</p>
            <ol>
                <li>Download from <a href="https://ollama.ai" target="_blank">ollama.ai</a></li>
                <li>Install on your computer</li>
                <li>Run: <code>ollama run llama3.2</code></li>
                <li>Refresh this page</li>
            </ol>
            <button @click="handleCheckConnection">Check Connection</button>
        </div>
        <div v-else class="status-success">
            ✅ Ollama Connected | Model: {{ ollamaStore.currentModel }}
            <button @click="handleCheckConnection" class="small-btn">Refresh</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useOllamaStore } from '@/stores/ollamaStore';
import { useOllama } from '@/composables/useOllama';

const ollamaStore = useOllamaStore();
const { checkConnection } = useOllama();

const handleCheckConnection = async (): Promise<void> => {
    await checkConnection();
};

onMounted(() => {
    checkConnection();
});
</script>

<style scoped>
.ollama-status {
    margin-bottom: 20px;
    padding: 20px;
    border-radius: 8px;
}

.status-warning {
    background: #fff3cd;
    border: 2px solid #ffc107;
    padding: 20px;
    border-radius: 8px;
}

.status-warning h3 {
    margin-top: 0;
    color: #856404;
}

.status-warning ol {
    text-align: left;
    margin: 15px 0;
}

.status-warning code {
    background: #f8f9fa;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
}

.status-warning a {
    color: #004085;
    font-weight: bold;
}

.status-success {
    background: #d4edda;
    border: 2px solid #28a745;
    padding: 15px;
    border-radius: 8px;
    color: #155724;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.small-btn {
    padding: 4px 12px;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.1);
    color: #155724;
    border: none;
    border-radius: 4px;
    cursor: pointer;
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

button:hover {
    background-color: #45a049;
}
</style>