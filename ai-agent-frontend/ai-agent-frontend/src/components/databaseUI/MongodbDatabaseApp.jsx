import React from 'react';
import { useTheme } from '../ThemeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MongodbDatabaseApp = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">MongoDB Connection</h1>
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

        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Database className="h-6 w-6" />
              MongoDB Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center text-2xl font-semibold">
              This Feature is coming soon
              <span className="inline-flex ml-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
              </span>
            </div>
            <p className="text-muted-foreground">
              We're working hard to bring MongoDB support to our platform.
              Check back soon for updates!
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="mt-4"
            >
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MongodbDatabaseApp;