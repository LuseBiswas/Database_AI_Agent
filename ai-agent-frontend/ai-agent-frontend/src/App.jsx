import React from "react";
import ChatBox from "./components/ChatBox";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "./components/ThemeProvider";
import Homepage from "./Homepage";
import PostgresDatabaseApp from "./components/databaseUI/PostgresDatabaseApp";
import MongodbDatabaseApp from "./components/databaseUI/MongodbDatabaseApp";

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
        <Route path="/" element={<Homepage />} />
          <Route path="/postgres" element={<PostgresDatabaseApp />} />
          <Route path="/mongodb" element={<MongodbDatabaseApp />} />
          <Route path="/chatPostgres" element={<ChatBox />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
