import Groq from "groq-sdk";
import dotenv from "dotenv";
import pkg from 'pg';
// import { Parser } from 'json2csv';
// import ExcelJS from 'exceljs';
// import fs from 'fs/promises';
const { Pool } = pkg;

dotenv.config();

const groq = new Groq({
  api_key: process.env.GROQ_API_KEY,
});

// Initialize pool as exported variable instead of let
export let pool = new Pool(); // Initially empty pool that will be configured


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
      ssl: {
        rejectUnauthorized: true,
        sslmode: 'require'
      }
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
STRICT VISUALIZATION RULES:
1. The chartType field should ONLY be included when the user EXPLICITLY requests visualization using phrases like:
   - "show as chart"
   - "display as graph"
   - "create a visualization"
   - "make a pie chart"
   - "plot this data"
   - "show line graph"
   
2. DO NOT include chartType field if the user query does not contain an explicit visualization request
3. DO NOT assume visualization is needed just because data could be visualized
4. DO NOT add chartType for queries that only ask for data without mentioning charts/graphs/visualization

Example queries that should NOT include chartType:
- "show me employee counts by department"
- "get total sales by region"
- "count customers by country"
- "give me the number of orders per month"

When chartType IS explicitly requested:
- Valid types: 'pie', 'bar', 'line'
- For PIE CHARTS: 
  1. Must have exactly two columns
  2. First column MUST be categorical (labels)
  3. Second column MUST be numerical (values)
  4. Ensure data is aggregated (use COUNT, SUM, etc.)
  5. Include 'count' or 'total' in column name for pie charts

Example Good Pie Chart Query:
- SELECT department, COUNT(employee_id) as employee_count FROM employees GROUP BY department
- SELECT product_category, SUM(sales) as total_sales FROM sales GROUP BY product_category

If pie chart conditions are not met, do NOT include chartType.

IMPORTANT: Use ONLY the exact table and column names provided in the schema below. Do not use generic names or aliases unless specifically requested.

When creating queries:
1. Use the exact column names from the schema
2. Use proper table names in JOIN conditions
3. Handle NULL values appropriately
4. Include LIMIT for large result sets (default 1000)
5. Use explicit column names instead of *
6. Add appropriate WHERE clauses for filtering

`;

// export const exportToCSV = async (data, filename) => {
//   try {
//     if (!data || !data.rows || data.rows.length === 0) {
//       throw new Error("No data to export");
//     }

//     const parser = new Parser({
//       fields: Object.keys(data.rows[0])
//     });
    
//     const csv = parser.parse(data.rows);
//     const filepath = `./exports/${filename}.csv`;
    
//     // Ensure exports directory exists
//     await fs.mkdir('./exports', { recursive: true });
//     await fs.writeFile(filepath, csv);
    
//     return {
//       success: true,
//       filepath,
//       message: `CSV exported successfully to ${filepath}`
//     };
//   } catch (error) {
//     console.error("CSV Export Error:", error);
//     return {
//       success: false,
//       message: error.message
//     };
//   }
// };

// export const exportToExcel = async (data, filename) => {
//   try {
//     if (!data || !data.rows || data.rows.length === 0) {
//       throw new Error("No data to export");
//     }

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Data');
    
//     // Add headers
//     const headers = Object.keys(data.rows[0]);
//     worksheet.addRow(headers);
    
//     // Add data rows
//     data.rows.forEach(row => {
//       worksheet.addRow(Object.values(row));
//     });
    
//     // Auto-fit columns
//     worksheet.columns.forEach(column => {
//       column.width = Math.max(
//         headers.reduce((w, h) => Math.max(w, h.length), 10),
//         ...data.rows.map(row => 
//           String(row[column.header] || '').length
//         )
//       );
//     });

//     const filepath = `./exports/${filename}.xlsx`;
    
//     // Ensure exports directory exists
//     await fs.mkdir('./exports', { recursive: true });
//     await workbook.xlsx.writeFile(filepath);
    
//     return {
//       success: true,
//       filepath,
//       message: `Excel file exported successfully to ${filepath}`
//     };
//   } catch (error) {
//     console.error("Excel Export Error:", error);
//     return {
//       success: false,
//       message: error.message
//     };
//   }
// };

export const queryGroq = async (userQuery) => {
  // console.log("\n--- Starting new query ---");
  // console.log("Received user query:", userQuery);

  try {
    // Get the current database schema
    // console.log("Fetching database schema...");
    const schema = await getDatabaseSchema();
    const schemaPrompt = generateSchemaPrompt(schema);

//     const chartSupportPrompt = `
//     CHART GENERATION INSTRUCTIONS:
//     - If query suggests visualization, include 'chartType'
//     - Supported chart types: 'pie', 'bar', 'line'
//     - For pie charts: Select categorical column for labels, numerical for values
//     - For bar/line charts: Choose appropriate X and Y axes
//     - If unclear how to chart, the don't include 'chartType'
    
//     Examples of chart-triggering phrases:
//     - "show as pie chart"
//     - "graph of..."
//     - "visualize..."
//     - "breakdown by..."
// `;
    
    // Combine base prompt with schema information
    //const fullSystemPrompt = baseSystemPrompt + "\n" + schemaPrompt + "\n" + chartSupportPrompt;
    const fullSystemPrompt = baseSystemPrompt + "\n" + schemaPrompt + "\n";
    
    // console.log("Preparing to call Groq API with schema-aware prompt");
    
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
    // console.log("Raw API response content:", responseContent);

    // Clean up the response content
    if (responseContent) {
      responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    let response;
    try {
      response = JSON.parse(responseContent);
      // console.log("Successfully parsed JSON:", JSON.stringify(response, null, 2));
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("Failed to parse AI response into valid JSON");
    }

    if (!response.sqlQuery) {
      throw new Error("No SQL query generated");
    }

    // console.log("\nPreparing to execute SQL query:", response.sqlQuery);

    const result = await executeQuery(response.sqlQuery);
    // console.log("Query execution completed. Row count:", result.rowCount);

    return {
      explanation: response.explanation,
      sqlQuery: response.sqlQuery,
      queryType: response.queryType,
      ...(response.chartType && { chartType: response.chartType }),
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