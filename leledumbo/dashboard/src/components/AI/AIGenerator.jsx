import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIGenerator = ({ onContentGenerated }) => {
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [aiService, setAiService] = useState('');
  const [generateImage, setGenerateImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [aiSettings, setAiSettings] = useState({
    temperature: 0.7,
    maxTokens: 2000
  });
  const [error, setError] = useState('');
  const [useFallback, setUseFallback] = useState(true); // Enable fallback by default

  useEffect(() => {
    fetchAIServices();
  }, []);

  const fetchAIServices = async () => {
    try {
      const response = await axios.get('/api/ai/services');
      const activeServices = response.data.filter(service => service.isActive);
      setAvailableServices(activeServices);
      
      // Set default service
      const defaultService = activeServices.find(service => service.isDefault);
      if (defaultService) {
        setAiService(defaultService.name);
        setAiSettings({
          temperature: defaultService.temperature || 0.7,
          maxTokens: defaultService.maxTokens || 2000
        });
      } else if (activeServices.length > 0) {
        setAiService(activeServices[0].name);
      }
    } catch (error) {
      console.error('Error fetching AI services:', error);
      setError('Failed to load AI services. Please check your connection.');
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    if (!useFallback && !aiService) {
      setError('Please select an AI service when fallback is disabled');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/ai/generate', {
        aiService: useFallback ? aiService : aiService, // Send service even with fallback for preference
        topic,
        prompt,
        generateImage,
        useFallback, // Enable the new fallback system
        ...aiSettings
      }, {
        timeout: 90000 // 90 second timeout for fallback attempts
      });

      let successMessage = `Content generated successfully using ${response.data.serviceUsed}`;
      if (response.data.fallbackUsed) {
        successMessage += ' (fallback service)';
      }

      if (response.data.type === 'image') {
        onContentGenerated(`![Generated Image](${response.data.content})\n\n`);
      } else {
        onContentGenerated(response.data.content);
      }
      
      // Show success message
      setError(`✅ ${successMessage}`);
      
      // Clear form after successful generation (keep topic for potential edits)
      setPrompt('');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
      
    } catch (error) {
      console.error('Error generating content:', error);
      
      let errorMessage = `Error generating content: ${error.response?.data?.error || error.message}`;
      
      // Provide more user-friendly error messages
      if (errorMessage.includes('All AI services are currently unavailable')) {
        errorMessage = 'All AI services are currently unavailable. This could be due to:\n• Service overload or maintenance\n• API quota limits reached\n• Network connectivity issues\n\nPlease try again in a few minutes or check your AI service configurations.';
      } else if (errorMessage.includes('No healthy AI services available')) {
        errorMessage = 'No AI services are currently available. Please check your AI service configurations in the settings.';
      } else if (errorMessage.includes('Service temporarily unavailable')) {
        errorMessage = 'The AI service is temporarily unavailable. The system will try other services automatically when fallback is enabled.';
      } else if (errorMessage.includes('Rate limit exceeded')) {
        errorMessage = 'Rate limit exceeded. The system will try other services automatically when fallback is enabled.';
      } else if (errorMessage.includes('quota exceeded')) {
        errorMessage = 'API quota exceeded. The system will try other services automatically when fallback is enabled.';
      } else if (errorMessage.includes('API key')) {
        errorMessage = 'API key issue detected. Please check the AI Settings page.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'The request took too long to complete. Please try again with a shorter topic or different settings.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedService = () => {
    return availableServices.find(service => service.name === aiService);
  };

  const selectedService = getSelectedService();
  const canGenerateImage = selectedService?.serviceType === 'image' || selectedService?.serviceType === 'both';

  const healthyServicesCount = availableServices.filter(service => 
    service.health?.isHealthy !== false
  ).length;

  return (
    <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium text-gray-700 mb-3">AI Content Generator</h3>
      
      {error && (
        <div className={`mb-4 p-3 rounded-md ${
          error.startsWith('✅') 
            ? 'bg-green-100 border border-green-300 text-green-700' 
            : 'bg-red-100 border border-red-300 text-red-700'
        }`}>
          <div className="flex items-center">
            {error.startsWith('✅') ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <div className="whitespace-pre-line">{error}</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic *
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Catfish Breeding Techniques"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Instructions (Optional)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Focus on best practices and common mistakes to avoid. Include step-by-step instructions."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred AI Service {useFallback && '(Optional)'}
            </label>
            <select
              value={aiService}
              onChange={(e) => {
                setAiService(e.target.value);
                const service = availableServices.find(s => s.name === e.target.value);
                if (service) {
                  setAiSettings({
                    temperature: service.temperature || 0.7,
                    maxTokens: service.maxTokens || 2000
                  });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">{useFallback ? 'Auto-select (any service)' : 'Select AI Service *'}</option>
              {availableServices.map(service => (
                <option key={service._id} value={service.name}>
                  {service.name} 
                  {service.isDefault && ' (Default)'}
                  {service.health?.isHealthy === false && ' (Unhealthy)'}
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
              disabled={!canGenerateImage || loading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <label htmlFor="generateImage" className={`ml-2 text-sm ${!canGenerateImage ? 'text-gray-400' : 'text-gray-700'}`}>
              Generate Image {!canGenerateImage && '(Not supported)'}
            </label>
          </div>
        </div>

        {/* Fallback Toggle */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useFallback"
              checked={useFallback}
              onChange={(e) => setUseFallback(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="useFallback" className="ml-2 text-sm font-medium text-blue-700">
              Automatic Service Fallback
            </label>
          </div>
          <span className="text-xs text-blue-600">
            {healthyServicesCount}/{availableServices.length} services healthy
          </span>
        </div>

        {selectedService && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white rounded-md border">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature: {aiSettings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={aiSettings.temperature}
                onChange={(e) => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) })}
                className="w-full"
                disabled={loading}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>More Focused</span>
                <span>More Creative</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
              <input
                type="number"
                value={aiSettings.maxTokens}
                onChange={(e) => setAiSettings({ ...aiSettings, maxTokens: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="100"
                max="4000"
                disabled={loading}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || availableServices.length === 0 || (!useFallback && !aiService) || !topic.trim()}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {useFallback ? 'Trying services...' : 'Generating...'}
            </>
          ) : (
            `Generate ${generateImage ? 'Image' : 'Content'} with AI`
          )}
        </button>
        
        <div className="text-xs text-gray-500 text-center space-y-1">
          {useFallback ? (
            <>
              <p>✅ Automatic fallback enabled - will try other services if one fails</p>
              <p>Selected service will be tried first, then other healthy services</p>
            </>
          ) : (
            <p>⚠️ Fallback disabled - only the selected service will be used</p>
          )}
          
          {availableServices.length === 0 ? (
            <p className="text-red-600">No AI services configured. Please set up AI services in the settings.</p>
          ) : healthyServicesCount === 0 ? (
            <p className="text-orange-600">No healthy AI services detected. Some services may be temporarily unavailable.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;