import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Note: Service worker is registered by vite-plugin-pwa (autoUpdate mode)

createRoot(document.getElementById("root")!).render(<App />);
