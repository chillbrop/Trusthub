import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ProjectsList } from './components/projects/ProjectsList';
import { ScannersList } from './components/scanners/ScannersList';
import { VulnerabilitiesList } from './components/vulnerabilities/VulnerabilitiesList';
import { ScansList } from './components/scans/ScansList';
import { SettingsPage } from './components/settings/SettingsPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginForm onToggleMode={() => setAuthMode('signup')} />
    ) : (
      <SignupForm onToggleMode={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {currentView === 'dashboard' && <DashboardOverview />}
          {currentView === 'projects' && <ProjectsList />}
          {currentView === 'scanners' && <ScannersList />}
          {currentView === 'vulnerabilities' && <VulnerabilitiesList />}
          {currentView === 'scans' && <ScansList />}
          {currentView === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
