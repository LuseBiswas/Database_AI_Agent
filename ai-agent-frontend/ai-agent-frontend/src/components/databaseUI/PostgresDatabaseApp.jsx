import React, { useEffect, useState } from "react";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
// import { Label } from "./ui/label";
import { useTheme } from "../ThemeProvider";
import { Sun, Moon, Database, ArrowLeft } from "lucide-react";
import ChatBox from "../ChatBox";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
// import { checkHealth, connectToDatabase } from "../../api/queryAPI";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { createAPI } from "../../api/queryAPI";
import { useAuth } from "@clerk/clerk-react";

const PostgresDatabaseApp = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [formData, setFormData] = useState({
    host: "",
    port: "",
    database: "",
    user: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const api = createAPI(getToken);

  useEffect(() => {
    document.title = "Connection";
  }, []);

  // // Add this function
  // const initializeUser = async () => {
  //   try {
  //     const response = await fetch('http://localhost:3000/api/auth/user', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${await user.getToken()}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to initialize user');
  //     }

  //     const data = await response.json();
  //     console.log('User initialized:', data);
  //   } catch (error) {
  //     console.error('Error initializing user:', error);
  //   }
  // };

  // // Call initializeUser when component mounts
  // useEffect(() => {
  //   if (user) {
  //     initializeUser();
  //   }
  // }, [user]);


  // Check initial connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const health = await api.checkHealth();
        setIsConnected(health.databaseConnected);
      } catch (err) {
        console.error("Health check failed:", err);
      }
    };

    checkConnection();
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await api.connectToDatabase(formData);

      if (result.success) {
        setIsConnected(true);
        navigate("/chatPostgres");
      } else {
        setError(result.message || "Failed to connect to database");
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to connect to database. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isConnected) {
    return <ChatBox />;
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
              Database Connection
            </h1>
          </div>
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Connect to PostgreSQL
            </CardTitle>
            <CardDescription>
              Enter your database credentials to establish a connection
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleConnect}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    name="host"
                    placeholder="localhost"
                    value={formData.host}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    name="port"
                    placeholder="5432"
                    value={formData.port}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="database">Database Name</Label>
                <Input
                  id="database"
                  name="database"
                  placeholder="Enter database name"
                  value={formData.database}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user">Username</Label>
                <Input
                  id="user"
                  name="user"
                  placeholder="Enter username"
                  value={formData.user}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Connecting...
                  </span>
                ) : (
                  "Connect"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PostgresDatabaseApp;
