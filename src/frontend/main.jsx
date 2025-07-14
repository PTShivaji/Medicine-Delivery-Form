// src/frontend/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // ✅ This matches your App.jsx
import "./index.css";     // Optional if you're using Tailwind or custom styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
