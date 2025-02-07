import React, { useState } from "react";
import { queryBackend } from "../api/queryAPI";

const ChatBox = () => {
  const [userQuery, setUserQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    setLoading(true);
    setResponse(""); // Clear previous response
    try {
      const result = await queryBackend(userQuery);
      setResponse(result);
    } catch (error) {
      setResponse("Failed to fetch response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>AI Agent Chat</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>
      {response && (
        <div>
          <h2>Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
