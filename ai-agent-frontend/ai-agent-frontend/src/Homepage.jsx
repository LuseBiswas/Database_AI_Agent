import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon, Database, MessageSquare, Shield, Zap, ArrowRight } from 'lucide-react';

const Homepage = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AI Database Assistant - Chat with Your Database";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">AI Database Assistant</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="animate-in fade-in duration-500"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          <div className="mt-16 text-center animate-in slide-in-from-bottom duration-700">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Chat with Your Database in Plain English
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Transform complex database queries into simple conversations. No SQL knowledge required.
            </p>
            <Button 
              size="lg" 
              className="group"
              onClick={() => navigate('/get-started')}
            >
              Get Started 
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 animate-in slide-in-from-bottom duration-700">
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Natural Language Queries</CardTitle>
                <CardDescription>
                  Ask questions in plain English and get instant results from your database.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure Connection</CardTitle>
                <CardDescription>
                  We never store your credentials or data. Direct and secure database connections.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Get instant responses and real-time data analysis from your databases.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Database Options */}
      <div className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Supported Databases</h2>
          
          <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-bottom duration-700">
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-primary" />
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
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Complex queries and joins
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      ACID compliance
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Structured data
                    </li>
                  </ul>
                  <Button 
                    className="w-full group"
                    onClick={() => navigate('/postgres')}
                  >
                    Connect to PostgreSQL
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                Coming Soon
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-muted-foreground" />
                  MongoDB
                </CardTitle>
                <CardDescription>
                  Connect to your MongoDB database for NoSQL operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Ideal for document-based databases with:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      Flexible schema
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      Horizontal scaling
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      JSON-like documents
                    </li>
                  </ul>
                  <Button 
                    className="w-full"
                    disabled
                  >
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;