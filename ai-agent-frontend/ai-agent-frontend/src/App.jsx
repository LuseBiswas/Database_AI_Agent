import React from "react";
import ChatBox from "./components/ChatBox";
import { ThemeProvider } from "./components/ThemeProvider";
import DatabaseApp from "./DatabaseApp";

const App = () => {
  return (
    <div>
      <ThemeProvider>
        <DatabaseApp/>

      </ThemeProvider>
      
    </div>
  );
};

export default App;
