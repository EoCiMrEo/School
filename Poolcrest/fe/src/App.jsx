import React from "react";
import { Provider } from "react-redux";
import store from "./store";
import { DjangoAuthProvider } from "./contexts/DjangoAuthContext";
import Routes from "./Routes";
import DiagnosticPanel from "./components/DiagnosticPanel";

function App() {
  return (
    <Provider store={store}>
      <DjangoAuthProvider>
        <Routes />
        {/* Diagnostic Panel - Remove in production */}
        {process.env.NODE_ENV === "development" && <DiagnosticPanel />}
      </DjangoAuthProvider>
    </Provider>
  );
}

export default App;
