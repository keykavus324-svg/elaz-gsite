import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { CartProvider } from "./cart";
import "./styles.css";
import "./cinematic.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);
