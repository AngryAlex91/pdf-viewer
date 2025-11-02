<template>
    <div class="canvas-container" v-if="ollamaStore.connected">
        <div class="pdf-viewer-wrapper">
            <canvas ref="canvasRef"></canvas>

            <!-- Highlight overlay -->
            <div v-if="searchStore.hasHighlights" class="highlight-layer">
                <div v-for="(highlight, index) in searchStore.highlights" :key="index" class="highlight-box" :style="{
                    left: highlight.x + 'px',
                    top: highlight.y + 'px',
                    width: highlight.width + 'px',
                    height: highlight.height + 'px'
                }"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useOllamaStore } from '@/stores/ollamaStore';
import { useSearchStore } from '@/stores/searchStore';

interface Props {
    scale?: number;
}

withDefaults(defineProps<Props>(), {
    scale: 1.5
});

const ollamaStore = useOllamaStore();
const searchStore = useSearchStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);

// Expose canvas ref for parent component
defineExpose({
    canvas: canvasRef
});
</script>

<style scoped>
.canvas-container {
    position: relative;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: auto;
    background-color: #f5f5f5;
    display: flex;
    justify-content: center;
    padding: 20px;
    min-height: 400px;
}

.pdf-viewer-wrapper {
    position: relative;
    display: inline-block;
}

canvas {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-color: white;
    max-width: 100%;
    height: auto;
    display: block;
}

.highlight-layer {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    width: 100%;
    height: 100%;
    z-index: 10;
}

.highlight-box {
    position: absolute;
    background-color: rgba(255, 255, 0, 0.5);
    border: 2px solid rgba(255, 200, 0, 0.9);
    pointer-events: none;
    animation: highlight-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
}

@keyframes highlight-pulse {

    0%,
    100% {
        background-color: rgba(255, 255, 0, 0.5);
        border-color: rgba(255, 200, 0, 0.9);
    }

    50% {
        background-color: rgba(255, 255, 0, 0.7);
        border-color: rgba(255, 200, 0, 1);
    }
}
</style>