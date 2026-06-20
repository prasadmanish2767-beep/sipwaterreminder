import React from "react";
import { createRoot } from "react-dom/client";

import "./styles.css";
import { SipApp } from "./routes/index";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element #root was not found.");
}

createRoot(root).render(
  <React.StrictMode>
    <SipApp />
  </React.StrictMode>,
);