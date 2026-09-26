import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/presentation/shell';
import { ServicesProvider, useServices } from './ServicesContext';
import { ErrorBoundary } from './ErrorBoundary';

const ArchipelagoHome = lazy(() =>
  import('@/presentation/features/archipelago').then((m) => ({ default: m.ArchipelagoHome })),
);
const HomePage = lazy(() => import('@/presentation/features/home').then((m) => ({ default: m.HomePage })));
const AnomalyPage = lazy(() => import('@/presentation/features/anomaly').then((m) => ({ default: m.AnomalyPage })));
const TrailOverview = lazy(() =>
  import('@/presentation/features/trail').then((m) => ({ default: m.TrailOverview })),
);
const TrailShell = lazy(() => import('@/presentation/features/trail').then((m) => ({ default: m.TrailShell })));
const ModulePage = lazy(() => import('@/presentation/features/trail').then((m) => ({ default: m.ModulePage })));
const LabPage = lazy(() => import('@/presentation/features/lab').then((m) => ({ default: m.LabPage })));
const BossFightPage = lazy(() =>
  import('@/presentation/features/bossfight').then((m) => ({ default: m.BossFightPage })),
);
const SettingsPage = lazy(() =>
  import('@/presentation/features/settings').then((m) => ({ default: m.SettingsPage })),
);
const PrologueScreen = lazy(() =>
  import('@/presentation/features/prologue').then((m) => ({ default: m.PrologueScreen })),
);
const PrivacyPage = lazy(() =>
  import('@/presentation/features/settings').then((m) => ({ default: m.PrivacyPage })),
);
const HallPage = lazy(() => import('@/presentation/features/hall').then((m) => ({ default: m.HallPage })));
const LoginPage = lazy(() => import('@/presentation/features/account').then((m) => ({ default: m.LoginPage })));
const SignUpPage = lazy(() => import('@/presentation/features/account').then((m) => ({ default: m.SignUpPage })));
const ForgotPasswordPage = lazy(() =>
  import('@/presentation/features/account').then((m) => ({ default: m.ForgotPasswordPage })),
);
const AccountChoicePage = lazy(() =>
  import('@/presentation/features/account').then((m) => ({ default: m.AccountChoicePage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/presentation/features/reset-password').then((m) => ({ default: m.ResetPasswordPage })),
);

function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Carregando...</div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="mapa" element={<ArchipelagoHome />} />
          <Route path="anomalia" element={<AnomalyPage />} />
          <Route path="trilhas/:trailId" element={<TrailShell />}>
            <Route index element={<TrailOverview />} />
            <Route path="modulos/:moduleId" element={<ModulePage />} />
            <Route path="laboratorio" element={<LabPage />} />
            <Route path="chefe" element={<BossFightPage />} />
          </Route>
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="privacidade" element={<PrivacyPage />} />
          <Route path="hall" element={<HallPage />} />
          <Route path="redefinir-senha" element={<ResetPasswordPage />} />
          <Route path="prologo" element={<PrologueScreen />} />
          <Route path="entrar" element={<LoginPage />} />
          <Route path="cadastro" element={<SignUpPage />} />
          <Route path="esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="conta" element={<AccountChoicePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function AppWithErrorBoundary() {
  const { analytics } = useServices();
  return (
    <ErrorBoundary analytics={analytics}>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export function App() {
  return (
    <ServicesProvider>
      <BrowserRouter>
        <AppWithErrorBoundary />
      </BrowserRouter>
    </ServicesProvider>
  );
}
