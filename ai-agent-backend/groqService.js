import Groq from "groq-sdk";
import dotenv from "dotenv";
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();
console.log("Environment loaded");

const groq = new Groq({
  api_key: process.env.GROQ_API_KEY,
});
console.log("Groq initialized with API key:", process.env.GROQ_API_KEY ? "Present" : "Missing");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "persondb",
  password: "Ritesh@Biswas69.",
  port: 5433,
});
console.log("PostgreSQL pool created");

const systemPrompt = `You are an advanced PostgreSQL query generator that creates sophisticated SQL queries from natural language. 

ALWAYS respond with a JSON object in this format:
{
  "explanation": "Detailed explanation of what the query does",
  "sqlQuery": "The SQL query to execute",
  "queryType": "SELECT|INSERT|UPDATE|DELETE"
}

Your capabilities include:

1. JOINS and RELATIONSHIPS:
   - Handle INNER, LEFT, RIGHT, FULL OUTER JOINs
   - Use proper join conditions with ON clauses
   - Support multiple table joins
   Example: "Show employees and their departments" →
   SELECT e.*, d.department_name 
   FROM employees e 
   JOIN departments d ON e.department_id = d.id;

2. AGGREGATIONS:
   - Support COUNT, SUM, AVG, MAX, MIN
   - Use GROUP BY with proper HAVING clauses
   - Handle multiple aggregations
   Example: "Show total employees per department with average salary" →
   SELECT d.department_name, COUNT(e.id) as employee_count, AVG(e.salary) as avg_salary 
   FROM employees e 
   JOIN departments d ON e.department_id = d.id 
   GROUP BY d.department_name;

3. SUBQUERIES:
   - Use subqueries in WHERE, FROM, and SELECT clauses
   - Handle correlated subqueries
   Example: "Show employees who earn more than their department average" →
   SELECT e.* FROM employees e 
   WHERE salary > (
     SELECT AVG(salary) FROM employees 
     WHERE department_id = e.department_id
   );

4. CONDITIONAL LOGIC:
   - Use CASE statements for complex conditions
   - Handle NULLS properly with COALESCE/NULLIF
   - Support complex WHERE conditions
   Example: "Show employee status based on salary" →
   SELECT name, salary,
     CASE 
       WHEN salary > 100000 THEN 'High'
       WHEN salary > 50000 THEN 'Medium'
       ELSE 'Low'
     END as salary_category
   FROM employees;

5. ADVANCED FEATURES:
   - Window functions (ROW_NUMBER, RANK, etc.)
   - Common Table Expressions (WITH clauses)
   - String operations and pattern matching
   - Date/time functions
   Example: "Rank employees by salary within each department" →
   SELECT *, 
     RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as salary_rank
   FROM employees;

Rules:
1. Always use aliases for table names in joins
2. Include LIMIT for large result sets (default 1000)
3. Use parameters ($1, $2) for values when appropriate
4. Handle NULL values gracefully
5. Add appropriate indexes hints when relevant
6. Use explicit column names instead of * when possible
7. Include ORDER BY for better result presentation
8. Add appropriate WHERE clauses for filtering

For complex queries, use CTEs for better readability:
Example: "Show departments with above-average employee count" →
WITH dept_counts AS (
  SELECT department_id, COUNT(*) as emp_count
  FROM employees
  GROUP BY department_id
)
SELECT d.department_name, dc.emp_count
FROM dept_counts dc
JOIN departments d ON d.id = dc.department_id
WHERE dc.emp_count > (SELECT AVG(emp_count) FROM dept_counts);`;

export const queryGroq = async (userQuery) => {
  console.log("\n--- Starting new query ---");
  console.log("Received user query:", userQuery);

  try {
    console.log("Preparing to call Groq API...");
    
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

    console.log("Groq API response received");
    console.log("Raw API response content:", chatCompletion.choices[0]?.message?.content);

    let response;
    try {
      const responseContent = chatCompletion.choices[0]?.message?.content;
      console.log("\nAttempting to parse response into JSON:");
      response = JSON.parse(responseContent);
      console.log("Successfully parsed JSON:", JSON.stringify(response, null, 2));
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Failed content:", chatCompletion.choices[0]?.message?.content);
      throw new Error("Failed to parse AI response into valid JSON");
    }

    if (!response.sqlQuery) {
      console.error("Invalid response structure - missing sqlQuery");
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
    console.error("==================");
    throw new Error(`Failed to process query: ${error.message}`);
  }
};

async function executeQuery(sqlQuery) {
  console.log("\n--- Executing SQL Query ---");
  const client = await pool.connect();
  console.log("Database connection established");
  
  try {
    console.log("Executing query:", sqlQuery);
    const result = await client.query(sqlQuery);
    console.log("Query executed successfully");
    return {
      rowCount: result.rowCount,
      rows: result.rows
    };
  } catch (dbError) {
    console.error("Database Error:", dbError);
    throw dbError;
  } finally {
    console.log("Releasing database connection");
    client.release();
  }
}