import express from "express";
import cors from "cors";
import { queryGroq, initializeDatabase, disconnectDatabase } from "./groqService.js";
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { 
  initializeUserTables, 
  saveChatHistory, 
  getChatHistory, 
  createUser 
} from './authService.js';
import 'dotenv/config';
import { parseAuthToken } from "./authMiddleware.js";
import { simpleQueryGroq } from "./simpleGroqService.js";
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());
app.use(parseAuthToken);

// Create exports directory for file downloads
// const exportDir = path.join(__dirname, 'exports');
// app.use('/exports', express.static(exportDir));

// Database connection state
let isConnected = false;

initializeUserTables();

// Add auth middleware
const requireAuth = ClerkExpressRequireAuth({
  clockSkewInSeconds: 300,
});



// User registration endpoint
app.post("/api/auth/user", requireAuth, async (req, res) => {
  const userId = req.body.userId; // Get userId from Clerk's authentication
  const userEmail = req.body.userEmail; // Get userEmail from Clerk

  console.log("User ID for SIGN IN:-", userId);
  console.log("User Email for SIGN IN:-", userEmail);

  const result = await createUser(userId, userEmail);
  if (result.success) {
    res.json({ success: true, userId });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// New endpoint for database connection
app.post("/api/connect", async (req, res) => {

  const { credentials } = req.body;
  const { host, port, database, user, password } = credentials;

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
  console.log("User Original Query:-",userQuery)
  const userId = req.auth?.userId; // Optional: only save if user is authenticated
  // console.log("User ID is:-",userId)

  if (!userQuery) {
    return res.status(400).json({ 
      error: "User query is required",
      status: "error"
    });
  }

  try {
    let result;
    
    if (userId) {
      // Authenticated user - full features with database connection check
      if (!isConnected) {
        return res.status(400).json({
          status: "error",
          error: "Database not connected. Please connect to a database first."
        });
      }
      // console.log("Login Query is Initiated:-")
      result = await queryGroq(userQuery);
      // If export was successful, modify the response to include download URL
      // if (result.exportResult && result.exportResult.success) {
      //   const filename = path.basename(result.exportResult.filepath);
      //   result.exportResult.downloadUrl = `/exports/${filename}`;
      // }
      console.log(result)
      await saveChatHistory(
        userId, 
        userQuery, 
        result,
        req.body.connectionConfig || {}
      );
    } else {
      // Unauthenticated user - simple version without database features
      // console.log("Simple Query is Initiated:-")
      result = await simpleQueryGroq(userQuery);
      // console.log(result)
    }

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

// // New endpoint to download exported files
// app.get("/api/download/:filename", async (req, res) => {
//   const { filename } = req.params;
//   const filepath = path.join(__dirname, 'exports', filename);
  
//   try {
//     res.download(filepath, filename, (err) => {
//       if (err) {
//         console.error("Download error:", err);
//         res.status(500).json({
//           status: "error",
//           error: "Error downloading file"
//         });
//       }
//     });
//   } catch (error) {
//     console.error("Download error:", error);
//     res.status(500).json({
//       status: "error",
//       error: "Error accessing file"
//     });
//   }
// });

// // New endpoint to list available exports
// app.get("/api/exports", requireAuth, async (req, res) => {
//   try {
//     const files = await fs.readdir(exportDir);
//     res.json({
//       status: "success",
//       data: files.map(filename => ({
//         filename,
//         downloadUrl: `/exports/${filename}`
//       }))
//     });
//   } catch (error) {
//     console.error("Error listing exports:", error);
//     res.status(500).json({
//       status: "error",
//       error: "Error listing export files"
//     });
//   }
// });


// Get chat history endpoint
app.get("/api/chat-history", requireAuth, async (req, res) => {
  const userId = req.auth.userId;
  
  const result = await getChatHistory(userId);
  if (result.success) {
    res.json({
      status: "success",
      data: result.data
    });
  } else {
    res.status(500).json({
      status: "error",
      error: result.error
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