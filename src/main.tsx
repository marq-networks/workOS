
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { installGlobalErrorCapture } from "./operations/browserErrorCapture";

  installGlobalErrorCapture();
  createRoot(document.getElementById("root")!).render(<App />);
