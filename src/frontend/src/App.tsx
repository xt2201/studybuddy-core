import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/lib/theme';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { Suspense, lazy } from 'react';
import './globals.css';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage.tsx'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.tsx'));
const CalendarPage = lazy(() => import('./pages/CalendarPage.tsx'));
const TasksNewPage = lazy(() => import('./pages/TasksNewPage.tsx'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default function App() {
  return (
    <Router>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Header />
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/tasks/new" element={<TasksNewPage />} />
              </Routes>
            </Suspense>
          </main>
        </div>
        <Toaster />
      </ThemeProvider>
    </Router>
  );
}