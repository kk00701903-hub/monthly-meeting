import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 460, width: '100%', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '40px 36px' }}>
            <div style={{ fontSize: 44, textAlign: 'center', marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: '#1e293b', marginBottom: 8, textAlign: 'center', fontSize: 20, fontWeight: 700 }}>오류가 발생했습니다</h2>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 28, textAlign: 'center' }}>
              저장된 데이터 형식에 문제가 생겼습니다.<br />
              아래 버튼을 클릭하면 초기값으로 복원됩니다.
            </p>
            <button
              onClick={() => { localStorage.clear(); location.reload(); }}
              style={{ display: 'block', width: '100%', padding: '13px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}
            >
              초기화 후 새로고침
            </button>
            <details style={{ marginTop: 20 }}>
              <summary style={{ color: '#94a3b8', fontSize: 12, cursor: 'pointer', userSelect: 'none' }}>기술적 오류 상세보기</summary>
              <pre style={{ background: '#f1f5f9', padding: 12, borderRadius: 8, whiteSpace: 'pre-wrap', color: '#475569', fontSize: 11, marginTop: 8, overflowX: 'auto' }}>
                {this.state.error.message}{'\n\n'}{this.state.error.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
