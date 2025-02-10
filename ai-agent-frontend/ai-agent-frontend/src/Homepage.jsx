import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon, Database } from 'lucide-react';

const Homepage = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Chat with Database</h1>
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

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6" />
                PostgreSQL
              </CardTitle>
              <CardDescription>
                Connect to your PostgreSQL database with full SQL support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Perfect for relational databases with:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Complex queries and joins</li>
                  <li>• ACID compliance</li>
                  <li>• Structured data</li>
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => navigate('/postgres')}
                >
                  Connect to PostgreSQL
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6" />
                MongoDB
              </CardTitle>
              <CardDescription>
                Connect to your MongoDB database for NoSQL operations and Support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ideal for document-based databases with:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Flexible schema</li>
                  <li>• Horizontal scaling</li>
                  <li>• JSON-like documents</li>
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => navigate('/mongodb')}
                >
                  Connect to MongoDB
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Homepage;