import React, { Component, type ReactNode } from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import { AuthProvider } from "./hooks/useAuth";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React Global Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", fontFamily: "sans-serif", color: "#721c24", backgroundColor: "#f8d7da" }}>
          <h2>Application Rendering Error</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.error?.stack || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

import { useState } from "react";
import VideoIntro from "./components/common/VideoIntro";

function RootApp() {
  const [introFinished, setIntroFinished] = useState(false);

  return (
    <>
      {!introFinished && <VideoIntro onComplete={() => setIntroFinished(true)} />}
      <div style={{ visibility: introFinished ? "visible" : "hidden" }}>
        <App />
      </div>
    </>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <ErrorBoundary>
      <AuthProvider>
        <RootApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}