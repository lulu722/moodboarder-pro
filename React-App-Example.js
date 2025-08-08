// React App.js Example - Azure OpenAI Integration
import React, { useState, useEffect } from 'react';
import './App.css';

// Configuration using environment variables
const CONFIG = {
  AZURE_OPENAI_API_KEY: process.env.REACT_APP_AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_RESOURCE_NAME: process.env.REACT_APP_AZURE_OPENAI_RESOURCE_NAME,
  AZURE_OPENAI_DEPLOYMENT_NAME: process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT_NAME,
  AZURE_OPENAI_API_VERSION: process.env.REACT_APP_AZURE_OPENAI_API_VERSION || '2023-05-15',
  PEXELS_API_KEY: process.env.REACT_APP_PEXELS_API_KEY,
  GOOGLE_API_KEY: process.env.REACT_APP_GOOGLE_API_KEY,
  GOOGLE_CSE_ID: process.env.REACT_APP_GOOGLE_CSE_ID
};

/**
 * Dedicated function to call Azure OpenAI API for AI analysis
 * @param {string} promptText - The prompt to send to the AI
 * @returns {Promise<string>} - The AI response text
 */
const fetchAIAnalysis = async (promptText) => {
  // Check if Azure OpenAI is configured
  if (!CONFIG.AZURE_OPENAI_API_KEY || 
      !CONFIG.AZURE_OPENAI_RESOURCE_NAME ||
      !CONFIG.AZURE_OPENAI_DEPLOYMENT_NAME) {
    throw new Error('Azure OpenAI API not configured. Please check your environment variables.');
  }
  
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
            content: 'You are a senior UI/UX design consultant with 10+ years of experience in visual design analysis, design systems, and user interface best practices. You excel at identifying design patterns and providing actionable UI/UX recommendations.'
          },
          {
            role: 'user',
            content: promptText
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific Azure OpenAI error codes
      if (response.status === 401) {
        throw new Error('Authentication failed. Please check your Azure OpenAI API key and resource configuration.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 404) {
        throw new Error('Azure OpenAI resource or deployment not found. Please check your resource name and deployment name.');
      } else {
        throw new Error(`Azure OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    throw error;
  }
};

// React Component
function App() {
  const [keywords, setKeywords] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check configuration on component mount
  useEffect(() => {
    const missingVars = [];
    if (!CONFIG.AZURE_OPENAI_API_KEY) missingVars.push('REACT_APP_AZURE_OPENAI_API_KEY');
    if (!CONFIG.AZURE_OPENAI_RESOURCE_NAME) missingVars.push('REACT_APP_AZURE_OPENAI_RESOURCE_NAME');
    if (!CONFIG.AZURE_OPENAI_DEPLOYMENT_NAME) missingVars.push('REACT_APP_AZURE_OPENAI_DEPLOYMENT_NAME');
    
    if (missingVars.length > 0) {
      setError(`Missing environment variables: ${missingVars.join(', ')}`);
    }
  }, []);

  const handleAnalyzeDesign = async () => {
    if (!keywords.trim()) {
      setError('Please enter some keywords first');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const prompt = `
        Analyze a UI/UX design moodboard based on these keywords: "${keywords}"
        
        Please provide:
        1. Visual style analysis
        2. Color palette recommendations  
        3. UI component suggestions
        4. Layout and spacing guidelines
        5. Typography recommendations
        
        Keep recommendations practical and actionable for modern web/mobile interfaces.
      `;
      
      const result = await fetchAIAnalysis(prompt);
      setAnalysis(result);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎨 MoodBoarder Pro - React Version</h1>
        <p>AI-powered design analysis using Azure OpenAI</p>
      </header>
      
      <main className="App-main">
        <div className="input-section">
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Enter design keywords (e.g., 'minimal dark UI', 'modern dashboard')"
            className="keyword-input"
          />
          
          <button 
            onClick={handleAnalyzeDesign}
            disabled={loading || !keywords.trim()}
            className="analyze-button"
          >
            {loading ? '🔄 Analyzing...' : '🤖 Get Design Analysis'}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
        
        {analysis && (
          <div className="analysis-result">
            <h3>🎯 AI Design Analysis</h3>
            <div className="analysis-content">
              {analysis.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}
        
        <div className="config-info">
          <h4>Configuration Status:</h4>
          <ul>
            <li>Azure OpenAI API Key: {CONFIG.AZURE_OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}</li>
            <li>Resource Name: {CONFIG.AZURE_OPENAI_RESOURCE_NAME ? '✅ Configured' : '❌ Missing'}</li>
            <li>Deployment Name: {CONFIG.AZURE_OPENAI_DEPLOYMENT_NAME ? '✅ Configured' : '❌ Missing'}</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;
