import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sun,
  Moon,
  Database,
  MessageSquare,
  Shield,
  Zap,
  ArrowRight,
  BarChart,
  Layers,
  AreaChart,
} from "lucide-react";
import { motion } from "framer-motion";
import { SignIn, SignUp, SignUpButton, useAuth, UserButton, useUser } from "@clerk/clerk-react";
import { createAPI } from "./api/queryAPI";

const Homepage = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const databaseSectionRef = useRef(null);
  const { isSignedIn, user } = useUser();
  const api = createAPI(() => getToken());
  const { getToken } = useAuth();

  // Handle user registration after sign up
  useEffect(() => {
    const registerNewUser = async () => {
      if (isSignedIn && user) {
        console.log("I'm enetering here...")
        try {
          const userId = user.id
          const userEmail = user.emailAddresses[0].emailAddress
          // Register user in your backend
          await api.registerUser(userId,userEmail);
          // After successful registration, navigate to postgres page
          navigate('/');
        } catch (error) {
          console.error('Error registering user:', error);
          // Handle registration error (you might want to show an error message)
        }
      }
    };

    registerNewUser();
  }, [isSignedIn, user]);

  useEffect(() => {
    document.title = "AI Database Assistant - Chat with Your Database";
  }, []);

  const scrollToDatabase = () => {
    databaseSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  // console.log("Sigined in:-",isSignedIn)
  // console.log("Sigined in user:-",user.emailAddresses[0].emailAddress)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background -z-10" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            className="flex justify-between items-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-foreground">AI-DA</h1>
            <div className="flex items-center gap-4">
              {isSignedIn && <UserButton afterSignOutUrl="/" />}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="transition-transform hover:scale-110"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Chat with Your Database in Plain English
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Transform complex database queries into simple conversations. No
              SQL knowledge required.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              
              {!isSignedIn ? (
                <SignUpButton />
              ) : (
                <Button
                  size="lg"
                  className="group relative"
                  onClick={scrollToDatabase}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {[
              {
                icon: <MessageSquare className="h-12 w-12 text-primary mb-4" />,
                title: "Natural Language Queries",
                description:
                  "Ask questions in plain English and get instant results from your database.",
              },
              {
                icon: <Shield className="h-12 w-12 text-primary mb-4" />,
                title: "Secure Connection",
                description:
                  "We never store your credentials or data. Direct and secure database connections.",
              },
              {
                icon: <Zap className="h-12 w-12 text-primary mb-4" />,
                title: "Lightning Fast",
                description:
                  "Get instant responses and real-time data analysis from your databases.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    {feature.icon}
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Database Options */}
      <div className="py-24" ref={databaseSectionRef}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl font-bold text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Supported Databases
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* PostgreSQL Card */}
            <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }}>
              <Card>
                {/* PostgreSQL Card content remains the same */}
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
                      onClick={() => {
                          navigate("/postgres");
                        
                        }
                      }
                    >
                      
                        Connect to PostgreSQL
                        
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* MongoDB Card */}
            <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }}>
              <Card className="relative overflow-hidden">
                {/* MongoDB Card content remains the same */}
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
                    <Button className="w-full" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* New Features Section */}
      <div className="py-24 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Advanced tools to help you understand your data better
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, staggerChildren: 0.2 }}
          >
            <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }}>
              <Card className="h-full">
                <CardHeader>
                  <BarChart className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Data Visualization</CardTitle>
                  <CardDescription>
                    Transform your data into intuitive charts and graphs for
                    better insights
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                Coming Soon
              </div>
              <Card className="h-full opacity-75">
                <CardHeader>
                  <Layers className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Data Export</CardTitle>
                  <CardDescription>
                    Effortlessly save your data in CSV format for analysis and
                    sharing.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                Coming Soon
              </div>
              <Card className="h-full opacity-75">
                <CardHeader>
                  <AreaChart className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Trend Analysis</CardTitle>
                  <CardDescription>
                    Identify patterns and trends in your data with AI-powered
                    analytics
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
