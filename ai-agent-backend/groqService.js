import Groq from "groq-sdk";
import dotenv from "dotenv";
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const groq = new Groq({
  api_key: process.env.GROQ_API_KEY,
});

let pool = null;

// New function to initialize database connection
export const initializeDatabase = async (connectionConfig) => {
  try {
    // Close existing pool if it exists
    if (pool) {
      await pool.end();
    }

    // Create new pool with provided config
    pool = new Pool({
      user: connectionConfig.user,
      host: connectionConfig.host,
      database: connectionConfig.database,
      password: connectionConfig.password,
      port: parseInt(connectionConfig.port),
    });

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    return { success: true };
  } catch (error) {
    console.error("Database connection error:", error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "persondb",
//   password: process.env.DB_PASSWORD,
//   port: 5433,
// });

async function getTableSchema(tableName) {
  if (!pool) {
    throw new Error("Database not connected");
  }
  const query = `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position;
  `;
  
  const result = await pool.query(query, [tableName]);
  return result.rows;
}

async function getAllTableNames() {
  if (!pool) {
    throw new Error("Database not connected");
  }
  const query = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
  `;
  
  const result = await pool.query(query);
  return result.rows.map(row => row.table_name);
}

async function getDatabaseSchema() {
  const tables = await getAllTableNames();
  const schema = {};
  
  for (const tableName of tables) {
    const columns = await getTableSchema(tableName);
    schema[tableName] = columns;
  }
  
  return schema;
}

function generateSchemaPrompt(schema) {
  let prompt = `Database Schema:\n\n`;
  
  for (const [tableName, columns] of Object.entries(schema)) {
    prompt += `Table: ${tableName}\n`;
    prompt += `Columns:\n`;
    columns.forEach(col => {
      prompt += `- ${col.column_name} (${col.data_type}${col.is_nullable === 'YES' ? ', nullable' : ''})\n`;
    });
    prompt += `\n`;
  }
  
  return prompt;
}

const baseSystemPrompt = `You are an advanced PostgreSQL query generator that creates sophisticated SQL queries from natural language.

Return ONLY a JSON object in this format, with no markdown formatting or code blocks:
{
  "explanation": "Detailed explanation of what the query does",
  "sqlQuery": "The SQL query to execute",
  "queryType": "SELECT|INSERT|UPDATE|DELETE"
}

IMPORTANT: Use ONLY the exact table and column names provided in the schema below. Do not use generic names or aliases unless specifically requested.

When creating queries:
1. Use the exact column names from the schema
2. Use proper table names in JOIN conditions
3. Handle NULL values appropriately
4. Include LIMIT for large result sets (default 1000)
5. Use explicit column names instead of *
6. Add appropriate WHERE clauses for filtering

`;

export const queryGroq = async (userQuery) => {
  console.log("\n--- Starting new query ---");
  console.log("Received user query:", userQuery);

  try {
    // Get the current database schema
    console.log("Fetching database schema...");
    const schema = await getDatabaseSchema();
    const schemaPrompt = generateSchemaPrompt(schema);
    
    // Combine base prompt with schema information
    const fullSystemPrompt = baseSystemPrompt + "\n" + schemaPrompt;
    
    console.log("Preparing to call Groq API with schema-aware prompt");
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: fullSystemPrompt,
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

    let responseContent = chatCompletion.choices[0]?.message?.content;
    console.log("Raw API response content:", responseContent);

    // Clean up the response content
    if (responseContent) {
      responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    let response;
    try {
      response = JSON.parse(responseContent);
      console.log("Successfully parsed JSON:", JSON.stringify(response, null, 2));
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("Failed to parse AI response into valid JSON");
    }

    if (!response.sqlQuery) {
      throw new Error("No SQL query generated");
    }

    console.log("\nPreparing to execute SQL query:", response.sqlQuery);

    const result = await executeQuery(response.sqlQuery);
    console.log("Query execution completed. Row count:", result.rowCount);

    return {
      explanation: response.explanation,
      sqlQuery: response.sqlQuery,
      queryType: response.queryType,
      result: result
    };

  } catch (error) {
    console.error("\n=== Error Details ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    throw new Error(`Failed to process query: ${error.message}`);
  }
};

async function executeQuery(sqlQuery) {
  if (!pool) {
    throw new Error("Database not connected");
  }
  const client = await pool.connect();
  try {
    const result = await client.query(sqlQuery);
    return {
      rowCount: result.rowCount,
      rows: result.rows
    };
  } catch (dbError) {
    console.error("Database Error:", dbError);
    throw dbError;
  } finally {
    client.release();
  }
}

export const disconnectDatabase = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    return { success: true };
  }
  return { success: false, message: "No active connection" };
};