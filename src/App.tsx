import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout, AdminLayout } from './components/layout';
import { PageLoading, ErrorBoundary } from './components/ui';
import {
  HomePage,
  PackagesPage,
  PackageDetailPage,
  LoginPage,
  RegisterPage,
  AIPlannerPage,
  ProfilePage,
  MyBookingsPage,
  BookingPage,
  SavedItinerariesPage,
  EditItineraryPage,


} from './pages/public';
import {
  AdminDashboard,
  AdminPackages,
  AdminBookings,
  AdminUsers,
  AdminSettings,
} from './pages/admin';


const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};


const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/packages/:slug" element={<PackageDetailPage />} />
        <Route path="/packages/:slug/booking" element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        } />
        <Route path="/ai-planner" element={<AIPlannerPage />} />


        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        } />
        <Route path="/itineraries" element={
          <ProtectedRoute>
            <SavedItinerariesPage />
          </ProtectedRoute>
        } />
        <Route path="/itinerary/edit/:id" element={
          <ProtectedRoute>
            <EditItineraryPage />
          </ProtectedRoute>
        } />
        <Route path="/itinerary/:id" element={<SavedItinerariesPage />} />
      </Route>


      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />

      {/* Admin  */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

{/*404-Page*/}
const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Az oldal nem található</p>
        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
        >
          Vissza a főoldalra
        </a>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
