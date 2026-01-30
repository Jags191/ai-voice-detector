import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for audio processing
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add loading states or auth tokens here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const audioAPI = {
  // Classify uploaded audio file
  classifyAudio: (formData) => api.post('/classify-audio', formData),
  
  // Classify base64 audio
  classifyBase64: (audioData) => api.post('/classify-base64', audioData),
  
  // Get supported languages
  getLanguages: () => api.get('/languages'),
  
  // WebSocket endpoint for real-time
  getWebSocketUrl: () => `ws://localhost:5000/api/ws`,
};

export default api;