import ReactDOM from "react-dom/client";

import { Provider } from "react-redux";
import store from "./store/store";

import App from "./App";
import { AuthProvider } from "react-oauth2-code-pkce";
import { authConfig } from "./authConfig";

// As of React 18
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container with id 'root' not found");
}

const root = ReactDOM.createRoot(container);
root.render(
  <AuthProvider authConfig={authConfig}>
    <Provider store={store}>
      <App />
    </Provider>
  </AuthProvider>,
);
