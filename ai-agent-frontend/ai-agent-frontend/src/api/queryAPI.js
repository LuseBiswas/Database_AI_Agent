import axios from "axios";

// const API_BASE_URL = "http://localhost:3000/api"; This is for local development 

const API_BASE_URL = "https://database-ai-agent-backend.onrender.com/api";

// Function to connect to database
export const connectToDatabase = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/connect`, credentials);
    return response.data;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error.response?.data || error;
  }
};

export const queryBackend = async (userQuery) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/query`, { userQuery });
    
    // Check if we have a successful response with data
    if (response.data && response.data.data) {
      return response.data.data;  // Return the complete response data
    }
    
    throw new Error("Invalid response format from server");
  } catch (error) {
    console.error("Error querying backend:", error);
    throw error;  // Propagate error to be handled by the component
  }
};


// Function to check connection status
export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error("Health check error:", error);
    throw error.response?.data || error;
  }
};

// Function to disconnect from database
export const disconnectDatabase = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/disconnect`);
    return response.data;
  } catch (error) {
    console.error("Database disconnect error:", error);
    throw error.response?.data || error;
  }
};