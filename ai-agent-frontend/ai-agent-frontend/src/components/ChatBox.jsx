import React, { useState } from "react";
import { queryBackend } from "../api/queryAPI";
import { Button } from "./ui/button";

const ChatBox = () => {
  const [userQuery, setUserQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    
    setLoading(true);
    setError("");
    setResponse(null);
    
    try {
      const result = await queryBackend(userQuery);
      setResponse(result);
    } catch (error) {
      setError("Failed to fetch response.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (data) => {
    if (!data || !data.rows || data.rows.length === 0) {
      return <p>No data found</p>;
    }

    const columns = Object.keys(data.rows[0]);

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className="border p-2 text-left bg-gray-100">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((column) => (
                  <td key={column} className="border p-2">
                    {row[column]?.toString() || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">AI Agent Chat</h1>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question about your data..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="flex-1 p-2 border rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {response && (
        <div className="space-y-4">
          {response.explanation && (
            <div className="bg-gray-50 p-4 rounded">
              <h2 className="font-bold mb-2">Explanation:</h2>
              <p>{response.explanation}</p>
            </div>
          )}
          
          {response.sqlQuery && (
            <div className="bg-gray-50 p-4 rounded">
              <h2 className="font-bold mb-2">SQL Query:</h2>
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                {response.sqlQuery}
              </pre>
            </div>
          )}

          {response.result && (
            <div>
              <h2 className="font-bold mb-2">Results:</h2>
              {renderTable(response.result)}
              <p className="mt-2 text-gray-600">
                Total rows: {response.result.rowCount || 0}
              </p>
            </div>
          )}
        </div>
      )}
      <Button>Click me</Button>
    </div>
  );
};

export default ChatBox;