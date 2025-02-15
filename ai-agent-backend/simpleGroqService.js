import Groq from "groq-sdk";
import dotenv from "dotenv";
import { pool } from './groqService.js';  // Import pool from groqService

dotenv.config();

const groq = new Groq({
  api_key: process.env.GROQ_API_KEY,
});

// Schema reading functions using the imported pool
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
//   console.log("The Schema is:-",schema)
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

const baseSystemPrompt = `You are an advanced SQL assistant that helps users understand and generate SQL queries.

Return ONLY a JSON object in this format:
{
  "explanation": "Detailed explanation of what the query would do",
  "sqlQuery": "The SQL query that would be executed",
  "queryType": "SELECT|INSERT|UPDATE|DELETE",
  "alert": {
    "type": "INFO|UPGRADE",
    "message": "Alert message when special features are requested",
    "feature": "Name of the requested feature"
  }
}

IMPORTANT RULES:
1. Use ONLY the exact table and column names provided in the schema
2. Analyze queries without executing them
3. Provide detailed explanations
4. Include proper JOIN conditions and table relationships
5. Add helpful tips about SQL best practices

SPECIAL FEATURE HANDLING:
When users request visualizations or charts:
1. Generate the appropriate SQL query that would get the data
2. Set alert.type to "UPGRADE"
3. Set alert.message to "Upgrade to access our interactive visualization tools! Sign up now to create beautiful charts and graphs."
4. Set alert.feature to "Data Visualization"

When users request query execution:
1. Set alert.type to "UPGRADE"
2. Set alert.message to "Sign up to execute queries and see real results!"
3. Set alert.feature to "Query Execution"`;

export const simpleQueryGroq = async (userQuery) => {
  try {
    const schema = await getDatabaseSchema();
    const schemaPrompt = generateSchemaPrompt(schema);
    
    const fullSystemPrompt = baseSystemPrompt + "\n" + schemaPrompt;
    
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
      max_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false,
    });

    let responseContent = chatCompletion.choices[0]?.message?.content;
    
    if (responseContent) {
      responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    let response;
    try {
      response = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("Failed to parse AI response into valid JSON");
    }

    if (!response.sqlQuery) {
        throw new Error("No SQL query generated");
      }
  
    //  console.log("\nPreparing to execute SQL query for Simple Version:", response.sqlQuery);
  
      const result = await executeQuery(response.sqlQuery);
    //   console.log("Query execution completed. Row count:", result.rowCount);

    return {
      explanation: response.explanation,
      sqlQuery: response.sqlQuery,
      queryType: response.queryType,
      alert: response.alert,
      isSimpleVersion: true,
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