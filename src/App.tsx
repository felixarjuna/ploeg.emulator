import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./components/main/main";
import MenuBar from "./components/menubar/menu-bar";
import Settings from "./components/settings/settings";

import defaultSettings from "./config/default-settings";
import SettingsContext from "./context/setting-context";

function App() {
  const [settingsState, setSettingsState] = useState(
    JSON.parse(localStorage.getItem("OCPPSettings") as string) || defaultSettings
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
