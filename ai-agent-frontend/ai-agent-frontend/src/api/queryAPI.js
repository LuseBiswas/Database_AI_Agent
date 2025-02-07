import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

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