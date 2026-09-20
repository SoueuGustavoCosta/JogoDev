import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '@/presentation/shell';
import { ServicesProvider, useServices } from './ServicesContext';
import { ErrorBoundary } from './ErrorBoundary';

const ArchipelagoHome = lazy(() =>
  import('@/presentation/features/archipelago').then((m) => ({ default: m.ArchipelagoHome })),
);
const TrailOverview = lazy(() =>
  import('@/presentation/features/trail').then((m) => ({ default: m.TrailOverview })),
);
const ModulePage = lazy(() => import('@/presentation/features/trail').then((m) => ({ default: m.ModulePage })));
const LabPage = lazy(() => import('@/presentation/features/lab').then((m) => ({ default: m.LabPage })));
const SettingsPage = lazy(() =>
  import('@/presentation/features/settings').then((m) => ({ default: m.SettingsPage })),
);
const PrivacyPage = lazy(() =>
  import('@/presentation/features/settings').then((m) => ({ default: m.PrivacyPage })),
);

function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Carregando...</div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ArchipelagoHome />} />
          <Route path="trilhas/:trailId" element={<TrailOverview />} />
          <Route path="trilhas/:trailId/modulos/:moduleId" element={<ModulePage />} />
          <Route path="trilhas/:trailId/laboratorio" element={<LabPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="privacidade" element={<PrivacyPage />} />
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
