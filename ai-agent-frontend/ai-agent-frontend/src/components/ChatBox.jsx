import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { queryBackend, disconnectDatabase } from "../api/queryAPI";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, LogOut, Send, Database } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Alert, AlertDescription } from "./ui/alert";

const ChatBox = () => {
  const [userQuery, setUserQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(()=>{
      document.title = "Chat"
  
    },[])

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
      setError(error.message || "Failed to fetch response.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectDatabase();
      navigate("/"); // Navigate back to connection page
    } catch (error) {
      setError("Failed to disconnect from database.");
      console.error("Disconnect error:", error);
    }
  };

  const renderTable = (data) => {
    if (!data || !data.rows || data.rows.length === 0) {
      return (
        <Alert>
          <AlertDescription>No data found</AlertDescription>
        </Alert>
      );
    }

    const columns = Object.keys(data.rows[0]);

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column}>
                    {row[column]?.toString() || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            <h1 className="text-2xl font-bold text-foreground">AI Database Assistant</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Query Your Database</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask a question about your data..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Submit
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {response && (
          <div className="space-y-6">
            {response.explanation && (
              <Card>
                <CardHeader>
                  <CardTitle>Explanation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{response.explanation}</p>
                </CardContent>
              </Card>
            )}
            
            {response.sqlQuery && (
              <Card>
                <CardHeader>
                  <CardTitle>SQL Query</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    {response.sqlQuery}
                  </pre>
                </CardContent>
              </Card>
            )}

            {response.result && (
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderTable(response.result)}
                  <p className="mt-4 text-sm text-muted-foreground">
                    Total rows: {response.result.rowCount || 0}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;