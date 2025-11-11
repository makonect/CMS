import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AISettings = () => {
  const [aiServices, setAiServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    fetchAIServices();
  }, []);

  const fetchAIServices = async () => {
    try {
      const response = await axios.get('/api/ai/services');
      setAiServices(response.data);
    } catch (error) {
      console.error('Error fetching AI services:', error);
    }
  };

  const updateService = async (serviceId, updates) => {
    try {
      setLoading(true);
      await axios.put(`/api/ai/services/${serviceId}`, updates);
      await fetchAIServices();
      setTestResult('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating service:', error);
      setTestResult('Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const testService = async (serviceId) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/ai/services/${serviceId}/test`, {
        prompt: 'Write a short test message',
        topic: 'Test'
      });
      setTestResult(`✅ Test successful: ${response.data.content.substring(0, 100)}...`);
    } catch (error) {
      setTestResult(`❌ Test failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">AI Settings</h1>
        <p className="text-gray-600">Configure and manage AI services for content generation</p>
      </div>

      {testResult && (
        <div className={`p-4 rounded-lg ${
          testResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {testResult}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {aiServices.map(service => (
          <div key={service._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{service.name}</h3>
                <p className="text-gray-600 text-sm">
                  Type: {service.serviceType} | Model: {service.model}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={service.isActive}
                    onChange={(e) => updateService(service._id, { isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={service.apiKey || ''}
                  onChange={(e) => updateService(service._id, { apiKey: e.target.value })}
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={service.baseUrl}
                    onChange={(e) => updateService(service._id, { baseUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={service.model}
                    onChange={(e) => updateService(service._id, { model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => testService(service._id)}
                  disabled={loading || !service.apiKey}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test Connection
                </button>
                <button
                  onClick={() => updateService(service._id, service)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">AI Service Setup Guide</h3>
        <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
          <li>Get OpenAI API key from: https://platform.openai.com/api-keys</li>
          <li>Get DeepSeek API key from: https://platform.deepseek.com/api_keys</li>
          <li>Get Gemini API key from: https://aistudio.google.com/app/apikey</li>
          <li>Test each service after adding API keys to ensure proper configuration</li>
        </ul>
      </div>
    </div>
  );
};

export default AISettings;