import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (err) {
  document.body.innerHTML = `
    <div style="background:#111;color:#fff;padding:40px;font-family:monospace">
      <h1>🚨 React failed to start</h1>
      <p>${err.message}</p>
      <pre>${err.stack}</pre>
    </div>
  `;
}
