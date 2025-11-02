import { defineStore } from 'pinia';
import { ref, computed, type Ref, type ComputedRef } from 'vue';

export const useOllamaStore = defineStore('ollama', () => {
  // State
  const connected = ref<boolean>(false);
  const currentModel = ref<string>('llama3.2');
  const baseUrl = ref<string>('http://localhost:11434');

  // Computed
  const apiUrl = computed<string>(() => `${baseUrl.value}/api`);
  const isReady = computed<boolean>(() => connected.value);

  // Actions
  const setConnected = (status: boolean): void => {
    connected.value = status;
  };

  const setModel = (model: string): void => {
    currentModel.value = model;
  };

  const setBaseUrl = (url: string): void => {
    baseUrl.value = url;
  };

  return {
    // State
    connected,
    currentModel,
    baseUrl,

    // Computed
    apiUrl,
    isReady,

    // Actions
    setConnected,
    setModel,
    setBaseUrl,
  };
});

export type OllamaStore = ReturnType<typeof useOllamaStore>;