import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "./assets/scss/styles.scss";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import ToastHost from "./components/ToastHost.jsx";
import "./chartSetup";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastHost>
      <App />
    </ToastHost>
  </StrictMode>
);
