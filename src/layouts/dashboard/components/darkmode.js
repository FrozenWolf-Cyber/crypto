// components/DarkModeToggle.js
import React from "react";
import { Switch, Box, Typography } from "@mui/material";
import { useMaterialUIController, setDarkMode } from "context";

export default function DarkModeToggle() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  const handleToggle = () => setDarkMode(dispatch, !darkMode);

  return (
    <Box display="flex" alignItems="center" gap={1} p={1}>
      <Typography variant="body1">{darkMode ? "🌙" : "☀️"}</Typography>
      <Switch checked={darkMode} onChange={handleToggle} />
    </Box>
  );
}
