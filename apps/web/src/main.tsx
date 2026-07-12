import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { registerGlobalErrorHandlers } from "@/utils/register-global-error-handlers";

import "./styles/globals.css";

import "@fontsource/inter/index.css";

registerGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
