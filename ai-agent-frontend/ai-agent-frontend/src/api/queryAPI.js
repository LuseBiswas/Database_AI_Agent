import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export const queryBackend = async (userQuery) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/query`, { userQuery });
    return response.data.result;
  } catch (error) {
    console.error("Error querying backend:", error);
    return "An error occurred while processing your query.";
  }
};
