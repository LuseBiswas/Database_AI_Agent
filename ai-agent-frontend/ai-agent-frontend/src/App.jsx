import React from "react";
import ChatBox from "./components/ChatBox";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "./components/ThemeProvider";
import Homepage from "./Homepage";
import PostgresDatabaseApp from "./components/databaseUI/PostgresDatabaseApp";
import MongodbDatabaseApp from "./components/databaseUI/MongodbDatabaseApp";
import { ClerkProvider } from "@clerk/clerk-react";
import ProtectedRoute from "./components/ProtectedRoute";
import { SignIn, SignUp } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ThemeProvider>
      <Router>
        <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
          <Route path="/postgres" element={ <PostgresDatabaseApp />} />
          {/* <Route path="/postgres" element={ <ProtectedRoute><PostgresDatabaseApp /></ProtectedRoute>} /> */}
          <Route path="/mongodb" element={<MongodbDatabaseApp />} />
          <Route path="/chatPostgres" element={<ChatBox />} />
        </Routes>
      </Router>
    </ThemeProvider>

    </ClerkProvider>
    
  );
};

export default App;
