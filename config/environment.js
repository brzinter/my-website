/**
 * Environment configuration
 * Use this file to manage different configurations for development and production
 */

const environments = {
  development: {
    API_TIMEOUT: 8000,
    REFRESH_INTERVALS: {
      stock: 5 * 60 * 1000,  // 5 minutes
      news: 15 * 60 * 1000,   // 15 minutes
    },
    DEBUG: true
  },
  production: {
    API_TIMEOUT: 8000,
    REFRESH_INTERVALS: {
      stock: 5 * 60 * 1000,  // 5 minutes
      news: 15 * 60 * 1000,   // 15 minutes
    },
    DEBUG: false
  }
};

// Export based on NODE_ENV or default to development
const ENV = process.env.NODE_ENV || 'development';
module.exports = environments[ENV];
