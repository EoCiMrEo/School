import React, { useEffect, useState } from "react";
import { useDjangoAuth } from "../contexts/DjangoAuthContext";
import { api } from "../utils/api";
import secureStorage from "../utils/secureStorage";

const DiagnosticPanel = () => {
  const [minimized, setMinimized] = useState(false);
  const [diagnostics, setDiagnostics] = useState({
    authContext: false,
    apiConfig: false,
    localStorage: false,
    backendConnection: "checking",
    corsStatus: "checking",
  });

  const auth = useDjangoAuth();

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results = { ...diagnostics };

    // Check auth context
    results.authContext = !!auth;

    // Check API configuration
    results.apiConfig = !!api;

    // Check localStorage
    results.localStorage = {
      legacyAccessToken: !!localStorage.getItem("access_token"),
      legacyRefreshToken: !!localStorage.getItem("refresh_token"),
      legacyUserProfile: !!localStorage.getItem("user_profile"),
      sessionProfile: !!secureStorage.getUserProfile(),
    };

    // Check backend connection
    try {
      const response = await fetch("http://localhost:8000/api/", {
        method: "GET",
        headers: {
          Origin: window.location.origin,
        },
      });
      results.backendConnection = response.ok
        ? "connected"
        : `error: ${response.status}`;
    } catch (error) {
      results.backendConnection = "disconnected";
    }

    // Check CORS
    try {
      const response = await fetch(
        "http://localhost:8000/api/users/auth/login/",
        {
          method: "OPTIONS",
          headers: {
            Origin: window.location.origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
          },
        }
      );

      const allowOrigin = response.headers.get("access-control-allow-origin");
      results.corsStatus = allowOrigin ? "enabled" : "disabled";
    } catch (error) {
      results.corsStatus = "error";
    }

    setDiagnostics(results);
  };

  const testLogin = async () => {
    try {
      const response = await api.post("/users/auth/login/", {
        email: "customer@poolcrest.com",
        password: "mypassMypass!23",
      });

      alert("Login successful! Check console for details.");
      console.log("Login response:", response.data);
    } catch (error) {
      alert("Login failed! Check console for details.");
      console.error("Login error:", error.response || error);
    }
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          background: "#111827",
          color: "white",
          border: "none",
          borderRadius: 9999,
          padding: "10px 14px",
          zIndex: 9999,
          fontSize: 12,
          fontFamily: "monospace",
          display: "flex",
          alignItems: "center",
          gap: 6,
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
        aria-label="Expand diagnostics"
        title="Expand diagnostics"
      >
        <span style={{ fontSize: 14 }}>🔧</span>
        <span>Diagnostics</span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: "white",
        border: "2px solid #333",
        borderRadius: 8,
        padding: 16,
        maxWidth: 400,
        zIndex: 9999,
        fontSize: 12,
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <h3 style={{ margin: 0 }}>🔧 Django Integration Diagnostics</h3>
        <button
          onClick={() => setMinimized(true)}
          style={{
            background: "transparent",
            border: "none",
            fontSize: 16,
            cursor: "pointer",
            lineHeight: 1,
          }}
          aria-label="Minimize diagnostics"
          title="Minimize"
        >
          —
        </button>
      </div>

      <div style={{ marginBottom: 8 }}>
        <strong>Auth Context:</strong>{" "}
        {diagnostics.authContext ? "✅ Loaded" : "❌ Not Found"}
      </div>

      <div style={{ marginBottom: 8 }}>
        <strong>API Config:</strong>{" "}
        {diagnostics.apiConfig ? "✅ Configured" : "❌ Not Configured"}
      </div>

      <div style={{ marginBottom: 8 }}>
        <strong>Backend:</strong>{" "}
        {diagnostics.backendConnection === "checking"
          ? "⏳ Checking..."
          : diagnostics.backendConnection === "connected"
          ? "✅ Connected"
          : diagnostics.backendConnection === "disconnected"
          ? "❌ Disconnected"
          : `⚠️ ${diagnostics.backendConnection}`}
      </div>

      <div style={{ marginBottom: 8 }}>
        <strong>CORS:</strong>{" "}
        {diagnostics.corsStatus === "checking"
          ? "⏳ Checking..."
          : diagnostics.corsStatus === "enabled"
          ? "✅ Enabled"
          : diagnostics.corsStatus === "disabled"
          ? "❌ Disabled"
          : "⚠️ Error"}
      </div>

      <div style={{ marginBottom: 8 }}>
        <strong>Storage:</strong>
        {diagnostics.localStorage && (
          <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
            <li>
              Session Profile:{" "}
              {diagnostics.localStorage.sessionProfile ? "✅" : "❌"}
            </li>
            <li>
              Legacy Access Token:{" "}
              {diagnostics.localStorage.legacyAccessToken ? "✅" : "❌"}
            </li>
            <li>
              Legacy Refresh Token:{" "}
              {diagnostics.localStorage.legacyRefreshToken ? "✅" : "❌"}
            </li>
            <li>
              Legacy User Profile:{" "}
              {diagnostics.localStorage.legacyUserProfile ? "✅" : "❌"}
            </li>
          </ul>
        )}
      </div>

      <div style={{ marginBottom: 8 }}>
        <strong>Auth State:</strong>
        <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
          <li>User: {auth?.user ? "✅" : "❌"}</li>
          <li>Profile: {auth?.userProfile ? "✅" : "❌"}</li>
          <li>Loading: {auth?.loading ? "⏳" : "✅"}</li>
        </ul>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          onClick={runDiagnostics}
          style={{
            padding: "4px 8px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Refresh
        </button>

        <button
          onClick={testLogin}
          style={{
            padding: "4px 8px",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Test Login
        </button>

        <button
          onClick={() => {
            secureStorage.clearAll();
            sessionStorage.clear();
            window.location.reload();
          }}
          style={{
            padding: "4px 8px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Clear & Reload
        </button>
      </div>

      <div style={{ marginTop: 8, fontSize: 10, color: "#666" }}>
        Click — to minimize • Press ESC to close (dev only)
      </div>
    </div>
  );
};

export default DiagnosticPanel;
