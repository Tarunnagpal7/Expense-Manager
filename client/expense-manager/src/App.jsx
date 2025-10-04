// App.js or your main routing component
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './lib/contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './Pages/Dashboard';
import SubmitExpense from './Pages/SubmitExpense';
import ManageUsers from './Pages/ManageUsers';
import ApprovalSettings from './Pages/ApprovalSettings';
import CompanySettings from './Pages/CompanySettings';
import ManagerDashboard from './Pages/ManagerDashboard';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes with Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/submit-expense" element={
            <ProtectedRoute>
              <Layout>
                <SubmitExpense />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/manage-users" element={
            <ProtectedRoute>
              <Layout>
                <ManageUsers />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/approval-settings" element={
            <ProtectedRoute>
              <Layout>
                <ApprovalSettings />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/manager-dashboard" element={
            <ProtectedRoute>
              <Layout>
                <ManagerDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/company-settings" element={
            <ProtectedRoute>
              <Layout>
                <CompanySettings />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;