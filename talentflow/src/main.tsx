// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { worker } from "./mocks/browser";
import { seedDatabase } from "./mocks/seed";

async function prepare() {
  await worker.start({ onUnhandledRequest: "bypass" });
  await seedDatabase();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

prepare();
