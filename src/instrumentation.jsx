import { AlertTriangle, ChevronDown, ExternalLink } from "lucide-react";
import React, { useEffect, useState } from "react";

// Lightweight JSX instrumentation: global error boundary + error dialog.

function normalizeError(value) {
  if (value instanceof Error) {
    return { error: value.message || "Unknown runtime error", stack: value.stack || "" };
  }
  if (typeof value === "string") return { error: value || "Unknown runtime error", stack: "" };
  if (value && typeof value === "object") {
    const c = value;
    const message =
      typeof c.message === "string" ? c.message : typeof c.error === "string" ? c.error : "";
    return { error: message || "Unknown runtime error", stack: typeof c.stack === "string" ? c.stack : "" };
  }
  return { error: value == null ? "Unknown runtime error" : String(value), stack: "" };
}

async function reportErrorToVly(errorData) {
  const appId = import.meta.env.VITE_VLY_APP_ID;
  const monitoringUrl = import.meta.env.VITE_VLY_MONITORING_URL;
  if (!appId || !monitoringUrl) return;
  try {
    await fetch(monitoringUrl, {
      method: "POST",
      body: JSON.stringify({ ...errorData, url: window.location.href, projectSemanticIdentifier: appId }),
    });
  } catch (e) {
    console.error("Failed to report error to Vly:", e);
  }
}

function ErrorDialog({ error, onClose }) {
  const [showDetails, setShowDetails] = useState(false);
  const technicalDetails = [
    error.filename && `Source: ${error.filename}${error.lineno ? `:${error.lineno}` : ""}${error.colno ? `:${error.colno}` : ""}`,
    error.stack && `Stack trace:\n${error.stack}`,
    error.componentStack && `Component stack:\n${error.componentStack}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="cyp-modal-backdrop" role="dialog" aria-modal="true">
      <div className="cyp-modal cyp-modal-error">
        <div className="cyp-modal-error-head">
          <span className="cyp-error-icon"><AlertTriangle size={18} /></span>
          <div>
            <h3 className="cyp-modal-title">Runtime error</h3>
            <p className="cyp-modal-sub">The preview stopped while rendering.</p>
          </div>
        </div>
        <div className="cyp-error-box">
          <div className="cyp-error-label">Error message</div>
          <p className="cyp-error-text">{error.error}</p>
        </div>
        {technicalDetails && (
          <>
            <button type="button" className="cyp-error-toggle" onClick={() => setShowDetails((s) => !s)}>
              <ChevronDown size={14} style={{ transform: showDetails ? "rotate(180deg)" : "none" }} />
              Show technical details
            </button>
            {showDetails && <pre className="cyp-error-stack">{technicalDetails}</pre>}
          </>
        )}
        <div className="cyp-modal-error-foot">
          <span className="cyp-error-note">Your error details are also available in chat.</span>
          <a
            className="cyp-btn cyp-btn-dark"
            href={`https://freebuff.com/project/${import.meta.env.VITE_VLY_APP_ID}`}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={14} /> Open editor
          </a>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error: normalizeError(error) };
  }
  componentDidCatch(error, info) {
    const normalized = normalizeError(error);
    const componentStack = info?.componentStack?.trim();
    reportErrorToVly({
      error: normalized.error,
      stackTrace: [normalized.stack, componentStack].filter(Boolean).join("\n\n"),
    });
    this.setState({ hasError: true, error: { ...normalized, componentStack } });
  }
  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorDialog error={this.state.error} onClose={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

export function InstrumentationProvider({ children }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = async (event) => {
      try {
        event.preventDefault();
        const normalized = normalizeError(event.error ?? event.message);
        setError({ ...normalized, filename: event.filename, lineno: event.lineno, colno: event.colno });
        await reportErrorToVly({ error: normalized.error, stackTrace: normalized.stack, filename: event.filename, lineno: event.lineno, colno: event.colno });
      } catch (e) {
        console.error("Error in handleError:", e);
      }
    };
    const handleRejection = async (event) => {
      try {
        const normalized = normalizeError(event.reason);
        console.error("[Freebuff runtime error]", normalized.error);
        setError(normalized);
        await reportErrorToVly({ error: normalized.error, stackTrace: normalized.stack });
      } catch (e) {
        console.error("Error in handleRejection:", e);
      }
    };
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <>
      <ErrorBoundary>{children}</ErrorBoundary>
      {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
    </>
  );
}
