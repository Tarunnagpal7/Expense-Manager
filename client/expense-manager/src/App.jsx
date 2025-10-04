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
import ExpenseDetails from './Pages/ExpenseDetails';
import ManageUsers from './Pages/ManageUsers';
import ApprovalSettings from './Pages/ApprovalSettings';
import CompanySettings from './Pages/CompanySettings';
import ManagerDashboard from './Pages/ManagerDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Component to redirect users to their appropriate dashboard based on role
function RoleBasedRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase();
  if (userRole === 'manager') {
    return <Navigate to="/manager-dashboard" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
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
          <Route path="/" element={<RoleBasedRedirect />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["admin", "employee"]}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/manager-dashboard" element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Layout>
                <ManagerDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/submit-expense" element={
            <ProtectedRoute allowedRoles={["admin", "employee", "manager"]}>
              <Layout>
                <SubmitExpense />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/expense/:id" element={
            <ProtectedRoute allowedRoles={["admin", "employee", "manager"]}>
              <Layout>
                <ExpenseDetails />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/manage-users" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <ManageUsers />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/approval-settings" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <ApprovalSettings />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/company-settings" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <CompanySettings />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="*" element={<RoleBasedRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;