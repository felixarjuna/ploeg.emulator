import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./Components/Main/Main";
import MenuBar from "./Components/MenuBar/MenuBar";
import Settings from "./Components/Settings/Settings";
import defaultSettings from "./Config/default-settings";
import SettingsContext from "./Context/SettingsContext";

function App() {
  const [settingsState, setSettingsState] = useState(
    JSON.parse(localStorage.getItem("OCPPSettings") ?? "") || defaultSettings
  );

  return (
    <SettingsContext.Provider value={{ settingsState, setSettingsState }}>
      <BrowserRouter>
        <MenuBar />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </SettingsContext.Provider>
  );
}

export default App;
