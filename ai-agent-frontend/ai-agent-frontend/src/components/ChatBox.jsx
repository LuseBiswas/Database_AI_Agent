import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { queryBackend, disconnectDatabase } from "../api/queryAPI";
import { createAPI } from "../api/queryAPI";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, LogOut, Send, Database,BarChart, ListOrdered, Calculator, TrendingUp,Boxes } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Alert, AlertDescription } from "./ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import ChartRenderer from "./ChartRenderer";
import { useAuth } from "@clerk/clerk-react";

const QUICK_QUERY_TAGS = [
  { label: "Create Bar Graph", query: "Create a bar graph showing",icon: <BarChart className="h-4 w-4 text-blue-500" /> },
  { label: "Top 10 Records", query: "Show top 10 records from",icon: <ListOrdered className="h-4 w-4 text-green-500" /> },
  { label: "Average Calculation", query: "Calculate average of", icon: <Calculator className="h-4 w-4 text-purple-500" /> },
  { label: "Group By Analysis", query: "Group by and count",icon: <Boxes className="h-4 w-4 text-orange-500" /> },
  { label: "Recent Trends", query: "Show recent trends in", icon: <TrendingUp className="h-4 w-4 text-red-500" /> }
];

const TableSkeleton = () => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          {[1, 2, 3, 4].map((i) => (
            <TableCell key={i}>
              <Skeleton className="h-4 w-24" />
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4].map((row) => (
          <TableRow key={row}>
            {[1, 2, 3, 4].map((cell) => (
              <TableCell key={cell}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const LoadingContent = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-24" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full rounded-lg" />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-20" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TableSkeleton />
      </CardContent>
    </Card>
  </div>
);

const ChatBox = () => {
  const [userQuery, setUserQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const api = createAPI(getToken);

  useEffect(() => {
    document.title = "Chat";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await api.queryBackend(userQuery);
      setResponse(result);
    } catch (error) {
      setError(error.message || "Failed to fetch response.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleQuickQueryTag = (query) => {
    setUserQuery(query);
  };

  const handleDisconnect = async () => {
    try {
      await api.disconnectDatabase();
      navigate("/");
    } catch (error) {
      setError("Failed to disconnect from database.");
      console.error("Disconnect error:", error);
    }
  };

  const renderTable = (data) => {
    if (!data || !data.rows || data.rows.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert>
            <AlertDescription>No data found</AlertDescription>
          </Alert>
        </motion.div>
      );
    }

    const columns = Object.keys(data.rows[0]);

    return (
      <motion.div
        className="rounded-md border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <motion.td
                  key={column}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="py-2 px-4 font-medium"
                >
                  {column}
                </motion.td>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: rowIndex * 0.03 }}
              >
                {columns.map((column) => (
                  <TableCell key={column}>
                    {row[column]?.toString() || ""}
                  </TableCell>
                ))}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            <h1 className="text-2xl font-bold text-foreground">
              AI-DA
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Query Your Database</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
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
                    </span>
                  )}
                </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUERY_TAGS.map((tag) => (
                    <Button
                      key={tag.label}
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => handleQuickQueryTag(tag.query)}
                      className="text-xs"
                    >
                      {tag.icon}
                      {tag.label}
                    </Button>
                  ))}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {loading ? (
            <LoadingContent />
          ) : (
            response && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {response.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Explanation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground">
                          {response.explanation}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {response.sqlQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
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
                  </motion.div>
                )}

                {response.result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderTable(response.result)}
                        <motion.p
                          className="mt-4 text-sm text-muted-foreground"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                        >
                          Total rows: {response.result.rowCount || 0}
                        </motion.p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
                {response.chartType && response.result && (
                  <ChartRenderer
                    data={response.result}
                    chartType={response.chartType}
                  />
                )}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatBox;
