import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

// const API_BASE_URL = "http://localhost:3000/api"; 
// This is for local development 

const API_BASE_URL = "https://database-ai-agent-backend.onrender.com/api";

// Create a function that returns the API functions with the token
export const createAPI = (getToken) => {

  const registerUser = async (userId,userEmail) => {
    try {
      const token = await getToken();
      const response = await axios.post(
        `${API_BASE_URL}/auth/user`,
        {userId,userEmail}, // Empty body since user info comes from the token
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("User registration error:", error);
      throw error.response?.data || error;
    }
  };

  // Function to connect to database
  const connectToDatabase = async (credentials) => {
    try {
      const token = await getToken();
      const response = await axios.post(`${API_BASE_URL}/connect`, {
        credentials
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Database connection error:", error);
      throw error.response?.data || error;
    }
  };

  const queryBackend = async (userQuery) => {
    try {
      const token = await getToken();
      const response = await axios.post(`${API_BASE_URL}/query`, {
        userQuery
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.data && response.data.data) {
         // Handle both simple and full-featured responses
         const result = response.data.data;
        
        //  // If it's a simple response (from simpleGroqService)
        //  if (result.isSimpleVersion) {
        //    return {
        //      explanation: result.explanation,
        //      sqlExample: result.sqlExample,
        //      type: result.type,
        //      isSimpleVersion: true
        //    };
        //  }
         
         // If it's a full-featured response (from original groqService)
         return {
           ...result,
         };
      }
      
      throw new Error("Invalid response format from server");
    } catch (error) {
      console.error("Error querying backend:", error);
      throw error;
    }
  };

  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch (error) {
      console.error("Health check error:", error);
      throw error.response?.data || error;
    }
  };

  const disconnectDatabase = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/disconnect`);
      return response.data;
    } catch (error) {
      console.error("Database disconnect error:", error);
      throw error.response?.data || error;
    }
  };

  return {
    registerUser,
    connectToDatabase,
    queryBackend,
    checkHealth,
    disconnectDatabase
  };
};