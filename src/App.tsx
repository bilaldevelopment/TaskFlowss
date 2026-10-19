import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './client/context/AuthContext.js';
import { ThemeProvider } from './client/context/ThemeContext.js';
import { ToastProvider } from './client/context/ToastContext.js';
import { AppLayout } from './client/components/layout/AppLayout.js';

// Pages
import { LandingPage } from './client/pages/LandingPage.js';
import { LoginPage } from './client/pages/LoginPage.js';
import { RegisterPage } from './client/pages/RegisterPage.js';
import { DashboardPage } from './client/pages/DashboardPage.js';
import { KanbanPage } from './client/pages/KanbanPage.js';
import { TasksPage } from './client/pages/TasksPage.js';
import { ProjectsPage } from './client/pages/ProjectsPage.js';
import { ProjectDetailPage } from './client/pages/ProjectDetailPage.js';
import { CalendarPage } from './client/pages/CalendarPage.js';
import { TeamPage } from './client/pages/TeamPage.js';
import { SettingsPage } from './client/pages/SettingsPage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium mt-4 tracking-wider uppercase">
          Verifying session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function PublicAuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Marketing Landing */}
                <Route path="/" element={<LandingPage />} />

                {/* Authentication Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicAuthRoute>
                      <LoginPage />
                    </PublicAuthRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicAuthRoute>
                      <RegisterPage />
                    </PublicAuthRoute>
                  }
                />

                {/* Protected Application Workspace */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="kanban" element={<KanbanPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="projects/:projectId" element={<ProjectDetailPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="team" element={<TeamPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
