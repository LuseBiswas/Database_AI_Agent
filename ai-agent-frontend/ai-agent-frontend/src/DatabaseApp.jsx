import React, { useEffect, useState } from 'react';
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
// import { Label } from "./ui/label";
import { useTheme } from './components/ThemeProvider';
import { Sun, Moon, Database } from 'lucide-react';
import ChatBox from './components/ChatBox';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { checkHealth, connectToDatabase } from './api/queryAPI';
import { useNavigate } from 'react-router-dom';


const DatabaseApp = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [formData, setFormData] = useState({
    host: '',
    port: '',
    database: '',
    user: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Check initial connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const health = await checkHealth();
        setIsConnected(health.databaseConnected);
      } catch (err) {
        console.error('Health check failed:', err);
      }
    };
    
    checkConnection();
  }, []);


  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await connectToDatabase(formData);
      
      if (result.success) {
        setIsConnected(true);
        navigate('/chat');
      } else {
        setError(result.message || 'Failed to connect to database');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to database. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isConnected) {
    return <ChatBox />;
  }

  return (
    <div className="min-h-screen p-8 bg-background">
        
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Database Connection</h1>
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
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Connecting...
                  </span>
                ) : (
                  'Connect'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseApp;