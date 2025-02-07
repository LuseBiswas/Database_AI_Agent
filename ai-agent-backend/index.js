import express from "express";
import cors from "cors";
import { queryGroq } from "./groqService.js";

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to process user queries
app.post("/api/query", async (req, res) => {
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});