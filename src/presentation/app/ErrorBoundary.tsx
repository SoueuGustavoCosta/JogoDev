import { Component, type ReactNode } from 'react';
import type { AnalyticsPort } from '@/application/ports';
import { Button } from '@/presentation/design-system';

type Props = { children: ReactNode; analytics: AnalyticsPort };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.analytics.track('page_view', { crashed: true, message: error.message.slice(0, 120) });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <h1>Algo deu errado</h1>
        <p>Essa tela travou, mas o resto do app continua funcionando. Volte ao início e tente de novo.</p>
        <Button onClick={() => (window.location.href = '/')}>Voltar ao início</Button>
      </div>
    );
  }
}
