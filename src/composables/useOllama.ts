import { useOllamaStore } from '@/stores/ollamaStore';
import type { OllamaModel, OllamaTagsResponse, OllamaGenerateResponse } from '@/types';

interface GenerateOptions {
  temperature?: number;
  num_predict?: number;
  top_k?: number;
  top_p?: number;
}

interface UseOllama {
  checkConnection: () => Promise<boolean>;
  generate: (prompt: string, options?: GenerateOptions) => Promise<string>;
  listModels: () => Promise<OllamaModel[]>;
}

export function useOllama(): UseOllama {
  const ollamaStore = useOllamaStore();

  /**
   * Check if Ollama is running and connected
   */
  const checkConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${ollamaStore.baseUrl}/api/tags`);
      if (response.ok) {
        const data: OllamaTagsResponse = await response.json();
        ollamaStore.setConnected(true);

        // Check if the preferred model is available
        const hasPreferredModel = data.models?.some(m =>
          m.name.includes(ollamaStore.currentModel)
        );

        if (!hasPreferredModel && data.models?.length > 0) {
          ollamaStore.setModel(data.models[0].name);
        }


        return true;
      } else {
        ollamaStore.setConnected(false);
        return false;
      }
    } catch (error) {
      console.error('Ollama not running:', error);
      ollamaStore.setConnected(false);
      return false;
    }
  };

  /**
   * Call Ollama API to generate text
   */
  const generate = async (
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<string> => {
    try {
      const response = await fetch(`${ollamaStore.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: ollamaStore.currentModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.num_predict || 500,
            top_k: options.top_k,
            top_p: options.top_p,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Ollama request failed');
      }

      const data: OllamaGenerateResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama Error:', error);
      throw new Error('Failed to get response from Ollama. Make sure it is running.');
    }
  };

  /**
   * List available models
   */
  const listModels = async (): Promise<OllamaModel[]> => {
    try {
      const response = await fetch(`${ollamaStore.baseUrl}/api/tags`);
      if (response.ok) {
        const data: OllamaTagsResponse = await response.json();
        return data.models || [];
      }
      return [];
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  };

  return {
    checkConnection,
    generate,
    listModels,
  };
}