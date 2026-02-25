import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { ClientDashboard } from './pages/client/Dashboard';
import { CardDetail } from './pages/client/CardDetail';
import { Explore } from './pages/client/Explore';
import { Rewards } from './pages/client/Rewards';
import { ClientLogin } from './pages/client/Login';
import { ChangePassword } from './pages/client/ChangePassword';
import { Terms } from './pages/legal/Terms';
import { Privacy } from './pages/legal/Privacy';
import { Support } from './pages/Support';
import { Toaster } from 'react-hot-toast';
import { ShopDashboard } from './pages/shop/Dashboard';
import { Counter } from './pages/shop/Counter';
import { Campaign } from './pages/shop/Campaign';
import { Customers } from './pages/shop/Customers';
import { Resources } from './pages/shop/Resources';
import { Subscription } from './pages/shop/Subscription';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminLogin } from './pages/admin/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/suporte" element={<Support />} />

          {/* Admin and Client Login/Password Change */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/cliente/login" element={<ClientLogin />} />
          <Route path="/cliente/alterar-senha" element={<ChangePassword />} />

          <Route element={<Layout><ProtectedRoute allowedRoles={['CLIENT']} /></Layout>}>
            <Route path="/cliente" element={<ClientDashboard />} />
            <Route path="/cliente/dashboard" element={<Navigate to="/cliente" replace />} />
            <Route path="/cliente/explore" element={<Explore />} />
            <Route path="/cliente/rewards" element={<Rewards />} />
          </Route>

          {/* Publicly accessible card/invite link */}
          <Route element={<Layout children={<Outlet />} />}>
            <Route path="/cliente/card/:slug" element={<CardDetail />} />
          </Route>

          <Route element={<Layout><ProtectedRoute allowedRoles={['SHOPKEEPER']} /></Layout>}>
            <Route path="/shop/:slug/dashboard" element={<ShopDashboard />} />
            <Route path="/shop/:slug/counter" element={<Counter />} />
            <Route path="/shop/:slug/campaign" element={<Campaign />} />
            <Route path="/shop/:slug/customers" element={<Customers />} />
            <Route path="/shop/:slug/resources" element={<Resources />} />
            <Route path="/shop/:slug/subscription" element={<Subscription />} />
            {/* Redirect /shop to the user's specific slug dashboard if they hit it directly */}
            <Route path="/shop" element={<Navigate to={`/shop/${JSON.parse(localStorage.getItem('user') || '{}')?.store?.slug || 'dashboard'}/dashboard`} replace />} />
          </Route>

          <Route element={<Layout><ProtectedRoute allowedRoles={['ADMIN']} /></Layout>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
