import Groq from "groq-sdk";
import dotenv from "dotenv";
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();
console.log("Environment loaded"); // Log 1

const groq = new Groq({
  api_key: process.env.GROQ_API_KEY,
});
console.log("Groq initialized with API key:", process.env.GROQ_API_KEY ? "Present" : "Missing"); // Log 2

// PostgreSQL connection pool
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "persondb",
  password: "Ritesh@Biswas69.",
  port: 5433,
});
console.log("PostgreSQL pool created"); // Log 3

// System prompt for SQL generation
const systemPrompt = `You are a PostgreSQL query generator. Your task is to convert natural language queries into SQL queries.
ALWAYS respond with a JSON object in exactly this format:
{
  "explanation": "Brief explanation of the SQL query",
  "sqlQuery": "The SQL query to execute",
  "queryType": "SELECT"
}

Rules for SQL generation:
1. Always use SELECT queries unless explicitly asked for modification
2. Always include LIMIT 1000 for SELECT queries
3. Use proper table names as provided in the query
4. Use * only when all columns are explicitly requested
5. Always use proper SQL syntax with semicolons at the end

For example, if asked "Show all employees", respond with:
{
  "explanation": "Retrieving all records from the employees table",
  "sqlQuery": "SELECT * FROM employees LIMIT 1000;",
  "queryType": "SELECT"
}`;

export const queryGroq = async (userQuery) => {
  console.log("\n--- Starting new query ---"); // Log 4
  console.log("Received user query:", userQuery); // Log 5

  try {
    console.log("Preparing to call Groq API..."); // Log 6
    
    // Generate the SQL query using Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userQuery,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false,
    });

    console.log("Groq API response received"); // Log 7
    console.log("Raw API response content:", chatCompletion.choices[0]?.message?.content); // Log 8

    let response;
    try {
      const responseContent = chatCompletion.choices[0]?.message?.content;
      console.log("\nAttempting to parse response into JSON:"); // Log 9
      response = JSON.parse(responseContent);
      console.log("Successfully parsed JSON:", JSON.stringify(response, null, 2)); // Log 10
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError); // Log 11
      console.error("Failed content:", chatCompletion.choices[0]?.message?.content); // Log 12
      throw new Error("Failed to parse AI response into valid JSON");
    }

    // Validate the response structure
    if (!response.sqlQuery) {
      console.error("Invalid response structure - missing sqlQuery"); // Log 13
      throw new Error("No SQL query generated");
    }

    console.log("\nPreparing to execute SQL query:", response.sqlQuery); // Log 14

    // Execute the SQL query
    const result = await executeQuery(response.sqlQuery);
    console.log("Query execution completed. Row count:", result.rowCount); // Log 15

    return {
      explanation: response.explanation,
      sqlQuery: response.sqlQuery,
      queryType: response.queryType,
      result: result
    };

  } catch (error) {
    console.error("\n=== Error Details ==="); // Log 16
    console.error("Error type:", error.constructor.name); // Log 17
    console.error("Error message:", error.message); // Log 18
    console.error("Error stack:", error.stack); // Log 19
    console.error("=================="); // Log 20
    throw new Error(`Failed to process query: ${error.message}`);
  }
};

// Function to execute SQL queries safely
async function executeQuery(sqlQuery) {
  console.log("\n--- Executing SQL Query ---"); // Log 21
  const client = await pool.connect();
  console.log("Database connection established"); // Log 22
  
  try {
    console.log("Executing query:", sqlQuery); // Log 23
    const result = await client.query(sqlQuery);
    console.log("Query executed successfully"); // Log 24
    return {
      rowCount: result.rowCount,
      rows: result.rows
    };
  } catch (dbError) {
    console.error("Database Error:", dbError); // Log 25
    throw dbError;
  } finally {
    console.log("Releasing database connection"); // Log 26
    client.release();
  }
}