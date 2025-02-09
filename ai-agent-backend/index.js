import express from "express";
import cors from "cors";
import { queryGroq, initializeDatabase } from "./groqService.js";

const app = express();
app.use(cors());
app.use(express.json());

// Database connection state
let isConnected = false;

// New endpoint for database connection
app.post("/api/connect", async (req, res) => {
  const { host, port, database, user, password } = req.body;

  // Validate required fields
  if (!host || !port || !database || !user || !password) {
    return res.status(400).json({
      success: false,
      message: "All connection parameters are required"
    });
  }

  try {
    const result = await initializeDatabase({
      host,
      port,
      database,
      user,
      password
    });

    if (result.success) {
      isConnected = true;
      res.json({
        success: true,
        message: "Database connected successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || "Failed to connect to database"
      });
    }
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while connecting to database",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Modified query endpoint to check for connection
app.post("/api/query", async (req, res) => {
  // Check if database is connected
  if (!isConnected) {
    return res.status(400).json({
      status: "error",
      error: "Database not connected. Please connect to a database first."
    });
  }

  const { userQuery } = req.body;

  if (!userQuery) {
    return res.status(400).json({ 
      error: "User query is required",
      status: "error"
    });
  }

  try {
    const result = await queryGroq(userQuery);
    res.json({
      status: "success",
      data: result
    });
  } catch (error) {
    console.error("Error processing query:", error);
    res.status(500).json({
      status: "error",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Modified health check endpoint to include connection status
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    databaseConnected: isConnected
  });
});

// Add disconnect endpoint (optional but recommended)
app.post("/api/disconnect", async (req, res) => {
  try {
    // Assuming you add a disconnectDatabase function to groqService.js
    await disconnectDatabase();
    isConnected = false;
    res.json({
      success: true,
      message: "Database disconnected successfully"
    });
  } catch (error) {
    console.error("Error disconnecting from database:", error);
    res.status(500).json({
      success: false,
      message: "Error disconnecting from database"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});