import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AISettings = () => {
  const [aiServices, setAiServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    apiKey: '',
    serviceType: 'text',
    baseUrl: '',
    model: '',
    temperature: 0.7,
    maxTokens: 2000,
    isActive: true,
    isDefault: false,
    isGlobal: true
  });

  useEffect(() => {
    fetchAIServices();
    fetchAIStats();
  }, []);

  const fetchAIServices = async () => {
    try {
      const response = await axios.get('/api/ai/services');
      setAiServices(response.data);
    } catch (error) {
      console.error('Error fetching AI services:', error);
    }
  };

  const fetchAIStats = async () => {
    try {
      const response = await axios.get('/api/ai/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching AI stats:', error);
    }
  };

  const createService = async () => {
    try {
      setLoading(true);
      await axios.post('/api/ai/services', newService);
      await fetchAIServices();
      setShowAddForm(false);
      setNewService({
        name: '',
        apiKey: '',
        serviceType: 'text',
        baseUrl: '',
        model: '',
        temperature: 0.7,
        maxTokens: 2000,
        isActive: true,
        isDefault: false,
        isGlobal: true
      });
      setTestResult('✅ Service created successfully!');
    } catch (error) {
      console.error('Error creating service:', error);
      setTestResult(`❌ Error creating service: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (serviceId, updates) => {
    try {
      setLoading(true);
      await axios.put(`/api/ai/services/${serviceId}`, updates);
      await fetchAIServices();
      setTestResult('✅ Settings updated successfully!');
    } catch (error) {
      console.error('Error updating service:', error);
      setTestResult(`❌ Error updating settings: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this AI service?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/ai/services/${serviceId}`);
      await fetchAIServices();
      setTestResult('✅ Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      setTestResult('❌ Error deleting service');
    } finally {
      setLoading(false);
    }
  };

  const testService = async (serviceId) => {
    try {
      setLoading(true);
      setTestResult('🔄 Testing connection and discovering available models...');
      
      const response = await axios.post(`/api/ai/services/${serviceId}/test`, {
        prompt: 'Write a short test message about artificial intelligence',
        topic: 'AI Technology'
      });
      
      setTestResult(`✅ Test successful! Response: ${response.data.content.substring(0, 150)}...`);
    } catch (error) {
      console.error('Test error:', error);
      const errorMessage = error.response?.data?.error || error.message;
      setTestResult(`❌ Test failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const servicePresets = {
    'OpenAI ChatGPT': { 
      baseUrl: 'https://api.openai.com/v1', 
      model: 'gpt-3.5-turbo', 
      serviceType: 'both',
      description: 'OpenAI ChatGPT for text and image generation'
    },
    'DeepSeek': { 
      baseUrl: 'https://api.deepseek.com', 
      model: 'deepseek-chat', 
      serviceType: 'text',
      description: 'DeepSeek AI for text generation'
    },
    'Google Gemini': { 
      baseUrl: '', 
      model: 'gemini-1.5-flash-latest', 
      serviceType: 'text',
      description: 'Google Gemini for text generation (auto-discovers best model)'
    }
  };

  const handlePresetSelect = (presetName) => {
    setNewService({
      ...newService,
      name: presetName,
      ...servicePresets[presetName]
    });
  };

  // Function to manually update Gemini model
  const updateGeminiModel = async (serviceId, newModel) => {
    try {
      setLoading(true);
      await axios.put(`/api/ai/services/${serviceId}`, { model: newModel });
      await fetchAIServices();
      setTestResult(`✅ Gemini model updated to: ${newModel}`);
    } catch (error) {
      console.error('Error updating Gemini model:', error);
      setTestResult(`❌ Error updating model: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">AI Settings</h1>
        <p className="text-gray-600">Configure and manage AI services for content generation</p>
      </div>

      {/* Statistics Card */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600">Total Services</div>
            <div className="text-2xl font-bold text-gray-800">{stats.stats.totalServices}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600">Active Services</div>
            <div className="text-2xl font-bold text-green-600">{stats.stats.activeServices}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600">Total Usage</div>
            <div className="text-2xl font-bold text-blue-600">{stats.stats.totalUsage}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600">Most Used</div>
            <div className="text-lg font-semibold text-purple-600">
              {stats.topServices[0]?.usageCount || 0}
            </div>
          </div>
        </div>
      )}

      {testResult && (
        <div className={`p-4 rounded-lg ${
          testResult.includes('✅') ? 'bg-green-100 text-green-800 border border-green-200' : 
          testResult.includes('❌') ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {testResult}
        </div>
      )}

      {/* Add Service Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">AI Services</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Service
        </button>
      </div>

      {/* Add Service Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New AI Service</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {Object.keys(servicePresets).map(preset => (
              <button
                key={preset}
                onClick={() => handlePresetSelect(preset)}
                className={`p-3 border rounded-md text-left transition-colors ${
                  newService.name === preset 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-800">{preset}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Model: {servicePresets[preset].model}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {servicePresets[preset].description}
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="e.g., OpenAI ChatGPT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  value={newService.serviceType}
                  onChange={(e) => setNewService({ ...newService, serviceType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text Only</option>
                  <option value="image">Image Only</option>
                  <option value="both">Text & Image</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key *
              </label>
              <input
                type="password"
                value={newService.apiKey}
                onChange={(e) => setNewService({ ...newService, apiKey: e.target.value })}
                placeholder="Enter API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  value={newService.baseUrl}
                  onChange={(e) => setNewService({ ...newService, baseUrl: e.target.value })}
                  placeholder="e.g., https://api.openai.com/v1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for services that don't need custom base URL
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  value={newService.model}
                  onChange={(e) => setNewService({ ...newService, model: e.target.value })}
                  placeholder="e.g., gemini-1.5-flash-latest"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {newService.name.includes('Gemini') && (
                  <p className="text-xs text-blue-500 mt-1">
                    Recommended: gemini-1.5-flash-latest (will auto-discover best model)
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {newService.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newService.temperature}
                  onChange={(e) => setNewService({ ...newService, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>More Focused</span>
                  <span>More Creative</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={newService.maxTokens}
                  onChange={(e) => setNewService({ ...newService, maxTokens: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="100"
                  max="4000"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newService.isActive}
                  onChange={(e) => setNewService({ ...newService, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newService.isDefault}
                  onChange={(e) => setNewService({ ...newService, isDefault: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Default Service</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newService.isGlobal}
                  onChange={(e) => setNewService({ ...newService, isGlobal: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Global (All Websites)</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={createService}
                disabled={loading || !newService.name || !newService.apiKey || !newService.model}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 gap-6">
        {aiServices.map(service => (
          <div key={service._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{service.name}</h3>
                <p className="text-gray-600 text-sm">
                  Type: {service.serviceType} | Model: {service.model} | 
                  Usage: {service.usageCount || 0} times
                  {service.isGlobal && ' • Global Service'}
                </p>
                {service.lastUsed && (
                  <p className="text-gray-500 text-xs">
                    Last used: {new Date(service.lastUsed).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {service.isDefault && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    Default
                  </span>
                )}
                {service.isGlobal && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                    Global
                  </span>
                )}
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
                    disabled={loading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key {!service.apiKey && <span className="text-red-500">(Required)</span>}
                </label>
                <input
                  type="password"
                  value={service.apiKey || ''}
                  onChange={(e) => updateService(service._id, { apiKey: e.target.value })}
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
                  <input
                    type="text"
                    value={service.baseUrl}
                    onChange={(e) => updateService(service._id, { baseUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={service.model}
                      onChange={(e) => updateService(service._id, { model: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                    {service.name.includes('Gemini') && (
                      <button
                        onClick={() => updateGeminiModel(service._id, 'gemini-1.5-flash-latest')}
                        disabled={loading}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 text-sm"
                      >
                        Use Flash
                      </button>
                    )}
                  </div>
                  {service.name.includes('Gemini') && (
                    <p className="text-xs text-blue-500 mt-1">
                      Try "gemini-1.5-flash-latest" for better compatibility
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature: {service.temperature || 0.7}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={service.temperature || 0.7}
                    onChange={(e) => updateService(service._id, { temperature: parseFloat(e.target.value) })}
                    className="w-full"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
                  <input
                    type="number"
                    value={service.maxTokens || 2000}
                    onChange={(e) => updateService(service._id, { maxTokens: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={service.isDefault}
                      onChange={(e) => updateService(service._id, { isDefault: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm text-gray-700">Set as Default</span>
                  </label>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => testService(service._id)}
                    disabled={loading || !service.apiKey}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    onClick={() => deleteService(service._id)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {aiServices.length === 0 && !showAddForm && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">No AI services configured yet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Your First AI Service
          </button>
        </div>
      )}

      {/* Setup Guide */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">AI Service Setup Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-700 mb-1">OpenAI</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>Visit: platform.openai.com/api-keys</li>
              <li>Create new API key</li>
              <li>Base URL: https://api.openai.com/v1</li>
              <li>Model: gpt-3.5-turbo or gpt-4</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-1">DeepSeek</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>Visit: platform.deepseek.com</li>
              <li>Sign up and get API key</li>
              <li>Base URL: https://api.deepseek.com</li>
              <li>Model: deepseek-chat</li>
              <li><strong>Important:</strong> Add funds to your account</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-1">Google Gemini</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>Visit: aistudio.google.com/app/apikey</li>
              <li>Create API key</li>
              <li>No base URL needed</li>
              <li><strong>Recommended Model:</strong> gemini-1.5-flash-latest</li>
              <li>System will auto-discover available models</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800 mb-1">Gemini Troubleshooting</h4>
          <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
            <li><strong>If you get model errors:</strong> Delete your current Gemini service and create a new one with "gemini-1.5-flash-latest" as the model</li>
            <li><strong>Auto-discovery:</strong> The system will automatically find the best available Gemini model</li>
            <li><strong>API Key:</strong> Make sure your API key has access to Gemini models</li>
            <li><strong>Quotas:</strong> Check if you have available quota in Google AI Studio</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AISettings;