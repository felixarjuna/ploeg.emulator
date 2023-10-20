import React from "react";
import defaultSettings from "../config/default-settings";

const SettingsContext = React.createContext({
  settingsState: defaultSettings,
  setSettingsState: (settings: typeof defaultSettings) => {},
});

export default SettingsContext;
