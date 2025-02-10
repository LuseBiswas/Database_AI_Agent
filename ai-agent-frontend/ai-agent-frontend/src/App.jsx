import React from "react";
import ChatBox from "./components/ChatBox";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "./components/ThemeProvider";
import DatabaseApp from "./DatabaseApp";
import Homepage from "./Homepage";

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
        <Route path="/" element={<Homepage />} />
          <Route path="/postgres" element={<DatabaseApp />} />
          <Route path="/chat" element={<ChatBox />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
