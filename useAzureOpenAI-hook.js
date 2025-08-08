// React Hook for Azure OpenAI Integration
import { useState, useCallback } from 'react';

// Custom hook for Azure OpenAI API calls
export const useAzureOpenAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const CONFIG = {
    AZURE_OPENAI_API_KEY: process.env.REACT_APP_AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_RESOURCE_NAME: process.env.REACT_APP_AZURE_OPENAI_RESOURCE_NAME,
    AZURE_OPENAI_DEPLOYMENT_NAME: process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT_NAME,
    AZURE_OPENAI_API_VERSION: process.env.REACT_APP_AZURE_OPENAI_API_VERSION || '2023-05-15'
  };

  /**
   * Call Azure OpenAI API with a prompt
   * @param {string} promptText - The prompt to send to the AI
   * @param {Object} options - Additional options (temperature, max_tokens, etc.)
   * @returns {Promise<string>} - The AI response text
   */
  const fetchAIAnalysis = useCallback(async (promptText, options = {}) => {
    // Validate configuration
    if (!CONFIG.AZURE_OPENAI_API_KEY || 
        !CONFIG.AZURE_OPENAI_RESOURCE_NAME ||
        !CONFIG.AZURE_OPENAI_DEPLOYMENT_NAME) {
      throw new Error('Azure OpenAI API not configured. Please check your environment variables.');
    }

    setLoading(true);
    setError(null);

    try {
      // Build Azure OpenAI API endpoint
      const azureEndpoint = `https://${CONFIG.AZURE_OPENAI_RESOURCE_NAME}.openai.azure.com/openai/deployments/${CONFIG.AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${CONFIG.AZURE_OPENAI_API_VERSION}`;
      
      const response = await fetch(azureEndpoint, {
        method: 'POST',
        headers: {
          'api-key': CONFIG.AZURE_OPENAI_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: options.systemPrompt || 'You are a helpful AI assistant specialized in UI/UX design analysis and recommendations.'
            },
            {
              role: 'user',
              content: promptText
            }
          ],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific Azure OpenAI error codes
        if (response.status === 401) {
          throw new Error('Authentication failed. Please check your Azure OpenAI API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 404) {
          throw new Error('Azure OpenAI resource or deployment not found.');
        } else {
          throw new Error(`Azure OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [CONFIG.AZURE_OPENAI_API_KEY, CONFIG.AZURE_OPENAI_RESOURCE_NAME, CONFIG.AZURE_OPENAI_DEPLOYMENT_NAME, CONFIG.AZURE_OPENAI_API_VERSION]);

  /**
   * Generate design analysis for a moodboard
   * @param {string} keywords - Design keywords
   * @param {Array} images - Array of image descriptions
   * @returns {Promise<string>} - Design analysis
   */
  const generateDesignAnalysis = useCallback(async (keywords, images = []) => {
    const imageDescriptions = images.length > 0 
      ? images.map((img, index) => `Image ${index + 1}: ${img.title || img.alt || 'Design inspiration'} (Source: ${img.source})`).join('\n')
      : '';

    const prompt = `
      I'm creating a UI/UX moodboard and need your expert analysis and design recommendations.

      **Project Context:**
      - Search Keywords: "${keywords}"
      - Number of Images: ${images.length}
      ${imageDescriptions ? `\n**Image Descriptions:**\n${imageDescriptions}` : ''}

      Based on these keywords${images.length > 0 ? ' and images' : ''}, please provide a comprehensive analysis following this structure:

      ## 🎨 Visual Theme Summary
      Analyze the visual style that would match "${keywords}". Consider:
      - Color palettes (warm/cool, monochromatic/vibrant)
      - Visual style (minimal, modern, retro, etc.)
      - Layout patterns (grid-based, asymmetrical, etc.)
      - Typography approach (clean, decorative, etc.)

      ## 💡 UI Design Recommendations
      Provide 3-5 specific UI design best practices and actionable tips:

      **Color & Visual Hierarchy:**
      - Specific color implementation advice
      - Contrast and accessibility considerations

      **Layout & Spacing:**
      - Grid system recommendations
      - White space usage guidelines

      **Component Design:**
      - Button and interaction element styling
      - Card and container design patterns

      **Typography & Content:**
      - Font selection and hierarchy tips
      - Content organization best practices

      ## 🚀 Implementation Tips
      Provide 2-3 immediate next steps a designer could take to implement this style.

      Keep all recommendations practical, specific, and actionable for modern UI/UX design projects.
    `;

    return fetchAIAnalysis(prompt, {
      systemPrompt: 'You are a senior UI/UX design consultant with 10+ years of experience in visual design analysis, design systems, and user interface best practices. You excel at identifying design patterns and providing actionable UI/UX recommendations.',
      maxTokens: 1200,
      temperature: 0.7
    });
  }, [fetchAIAnalysis]);

  return {
    fetchAIAnalysis,
    generateDesignAnalysis,
    loading,
    error,
    isConfigured: Boolean(CONFIG.AZURE_OPENAI_API_KEY && CONFIG.AZURE_OPENAI_RESOURCE_NAME && CONFIG.AZURE_OPENAI_DEPLOYMENT_NAME)
  };
};

// Usage example:
/*
import { useAzureOpenAI } from './hooks/useAzureOpenAI';

function MyComponent() {
  const { generateDesignAnalysis, loading, error, isConfigured } = useAzureOpenAI();
  const [analysis, setAnalysis] = useState('');

  const handleAnalyze = async () => {
    try {
      const result = await generateDesignAnalysis('minimal dark UI');
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  return (
    <div>
      {!isConfigured && <p>⚠️ Azure OpenAI not configured</p>}
      <button onClick={handleAnalyze} disabled={loading || !isConfigured}>
        {loading ? 'Analyzing...' : 'Generate Analysis'}
      </button>
      {error && <p>Error: {error}</p>}
      {analysis && <div>{analysis}</div>}
    </div>
  );
}
*/
