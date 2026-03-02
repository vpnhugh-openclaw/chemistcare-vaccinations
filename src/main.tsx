import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

function showFatalScreen(title: string, detail: string) {
  const root = document.getElementById("root") || document.body;
  root.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 820px; margin: 40px auto; color: #0f172a;">
      <h1 style="margin: 0 0 12px; font-size: 28px;">ChemistCare failed to start</h1>
      <p style="margin: 0 0 18px; font-size: 16px;">${title}</p>
      <pre style="white-space: pre-wrap; background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px;">${detail}</pre>
      <p style="margin-top: 16px; font-size: 14px; color: #334155;">
        Please restart the app. If this persists, send this screen to support.
      </p>
    </div>
  `;
}

window.addEventListener("error", (event) => {
  showFatalScreen("A runtime error occurred.", String(event.error?.stack || event.message || "Unknown error"));
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason instanceof Error ? event.reason.stack || event.reason.message : JSON.stringify(event.reason);
  showFatalScreen("An unhandled promise rejection occurred.", reason || "Unknown async error");
});

try {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Root container #root was not found.");
  }

  createRoot(container).render(<App />);
} catch (error) {
  showFatalScreen("App bootstrap failed.", String((error as Error)?.stack || error));
}
