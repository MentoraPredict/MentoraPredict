import React from "react";
import { createRoot } from "react-dom/client";
import { HomePage } from "../../apps/web/src/pages/HomePage";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<HomePage />);
}
