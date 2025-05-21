import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            margin: "20px",
            border: "1px solid #ff4d4f",
            borderRadius: "4px",
            backgroundColor: "#fff2f0",
          }}
        >
          <h2 style={{ color: "#ff4d4f" }}>오류가 발생했습니다</h2>
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
              에러 메시지:
            </p>
            <pre
              style={{
                backgroundColor: "#fff",
                padding: "12px",
                borderRadius: "4px",
                overflow: "auto",
                fontSize: "14px",
                color: "#ff4d4f",
              }}
            >
              {this.state.error?.toString()}
            </pre>
          </div>
          {this.state.errorInfo && (
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
                컴포넌트 스택:
              </p>
              <pre
                style={{
                  backgroundColor: "#fff",
                  padding: "12px",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          <button
            onClick={() =>
              this.setState({ hasError: false, error: null, errorInfo: null })
            }
            style={{
              padding: "8px 16px",
              backgroundColor: "#ff4d4f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
