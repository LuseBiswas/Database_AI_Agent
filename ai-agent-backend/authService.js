import pkg from 'pg';
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// Access environment variables
const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_PORT = process.env.DB_PORT || 5432; 

// Create a separate pool for user data
const userPool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,// default PostgreSQL port
    ssl: {
        rejectUnauthorized: true,
        sslmode: 'require',
    },
});

// Initialize user tables
export const initializeUserTables = async () => {
    const client = await userPool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        user_query TEXT NOT NULL,
        ai_response JSONB NOT NULL,
        connection_config JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
        return { success: true };
    } catch (error) {
        console.error("Error initializing user tables:", error);
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
};

// Save chat history
export const saveChatHistory = async (userId, userQuery, aiResponse, connectionConfig) => {
    const client = await userPool.connect();
    try {
        await client.query(
            `INSERT INTO chat_history (user_id, user_query, ai_response, connection_config) 
       VALUES ($1, $2, $3, $4)`,
            [userId, userQuery, aiResponse, connectionConfig]
        );
        return { success: true };
    } catch (error) {
        console.error("Error saving chat history:", error);
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
};

// Get user's chat history
export const getChatHistory = async (userId) => {
    const client = await userPool.connect();
    try {
        const result = await client.query(
            `SELECT * FROM chat_history 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
            [userId]
        );
        return { success: true, data: result.rows };
    } catch (error) {
        console.error("Error getting chat history:", error);
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
};

// Create or get user
export const createUser = async (userId, email) => {
    const client = await userPool.connect();
    try {
        await client.query(
            `INSERT INTO users (id, email) 
       VALUES ($1, $2) 
       ON CONFLICT (id) DO NOTHING`,
            [userId, email]
        );
        return { success: true };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
};