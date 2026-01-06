import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "../src/app/store.js";
import { CartProvider } from "./features/cartContext.jsx";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <CartProvider>
          <App />
        </CartProvider>
      </Provider>
    </HelmetProvider>
  </StrictMode>
);