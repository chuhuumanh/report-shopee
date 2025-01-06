const axios = require('axios');

async function get(url) {
  try {
    const response = await axios.get(url);
    console.log('Request successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Request failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error; // Rethrow error for caller to handle if needed
  }
}

async function post(url, data) {
  try {
    const response = await axios.post(url, data);
    console.log('Request successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Request failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error; // Rethrow error for caller to handle if needed
  }
}

module.exports = { post, get };
