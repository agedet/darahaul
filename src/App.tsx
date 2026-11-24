import { BrowserRouter as Router, Routes, Route } from 'react-router';
import './App.css'
import { Providers } from './components/providers';
import { ProtectedRoute } from './components/auth';
import Onboarding from './modules/Onboarding';
import AuthIndex from './modules/authentication/AuthIndex';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from './Index';
import MechanicIndex from './modules/mechanic/MechanicIndex';
import DriverIndex from './modules/driver/DriverIndex';
import AdminIndex from './modules/admin/AdminIndex';
import CompanyIndex from './modules/company/CompanyIndex';
import AcceptInvitation from './modules/authentication/pages/AcceptInvitation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Providers>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Auth Routes */}
            <Route
              path="/auth/*"
              element={<AuthIndex />}
            />

            {/* Public invitation acceptance */}
            <Route
              path="/invite/accept"
              element={<AcceptInvitation />}
            />

            {/* Onboarding Route */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute allowedRoles={['Mechanic', 'Driver']}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route 
              path='/company/*'
              element={
                <ProtectedRoute allowedRoles={['Admin_L1', 'Admin_L2']}>
                  <CompanyIndex />
                </ProtectedRoute>
              }
            />

            {/* SuperAdmin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['Super_Admin']}>
                  <AdminIndex />
                </ProtectedRoute>
              }
            />

            {/* Mechanic Routes */}
            <Route
              path="/mechanic/*"
              element={
                <ProtectedRoute allowedRoles={['Mechanic']}>
                  <MechanicIndex />
                </ProtectedRoute>
              }
            />

            {/* Driver Routes */}
            <Route
              path="/driver/*"
              element={
                <ProtectedRoute allowedRoles={['Driver']}>
                  <DriverIndex />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Providers>
      </Router>
    </QueryClientProvider>
  )
}

export default App
