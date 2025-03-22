// Configuration settings
const config = {
  // Feature flags
  useLocalStorage: process.env.NODE_ENV !== 'production' || process.env.USE_LOCAL_STORAGE === 'true',
  
  // API endpoints
  uploadEndpoint: (process.env.NODE_ENV !== 'production' || process.env.USE_LOCAL_STORAGE === 'true')
    ? '/api/upload/local'
    : '/api/upload',
    
  // File upload limits
  maxImageSize: 5 * 1024 * 1024, // 5MB
};

export default config; 