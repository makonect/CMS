import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIGenerator = ({ onContentGenerated }) => {
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [aiService, setAiService] = useState('openai');
  const [generateImage, setGenerateImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);

  useEffect(() => {
    fetchAIServices();
  }, []);

  const fetchAIServices = async () => {
    try {
      const response = await axios.get('/api/ai/services');
      setAvailableServices(response.data.filter(service => service.isActive));
    } catch (error) {
      console.error('Error fetching AI services:', error);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/ai/generate', {
        aiService,
        topic,
        prompt,
        generateImage
      });

      if (response.data.type === 'image') {
        // Handle image generation
        onContentGenerated(`![Generated Image](${response.data.content})\n\n`);
      } else {
        // Handle text generation
        onContentGenerated(response.data.content);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert(`Error generating content: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium text-gray-700 mb-3">AI Content Generator</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Catfish Breeding Techniques"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Instructions (Optional)</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Focus on best practices and common mistakes to avoid. Include step-by-step instructions."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">AI Service</label>
            <select
              value={aiService}
              onChange={(e) => setAiService(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableServices.map(service => (
                <option key={service.name} value={service.name.toLowerCase()}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="generateImage"
              checked={generateImage}
              onChange={(e) => setGenerateImage(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="generateImage" className="ml-2 text-sm text-gray-700">
              Generate Image
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || availableServices.length === 0}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            `Generate ${generateImage ? 'Image' : 'Content'} with AI`
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          {availableServices.length === 0 
            ? 'No AI services configured. Please set up AI services in the settings.'
            : 'The AI will generate content based on your topic and instructions'
          }
        </p>
      </div>
    </div>
  );
};

export default AIGenerator;