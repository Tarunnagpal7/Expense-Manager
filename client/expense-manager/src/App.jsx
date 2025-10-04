// App.js or your main routing component
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './Pages/Dashboard';
import SubmitExpense from './Pages/SubmitExpense';
import ManageUsers from './Pages/ManageUsers';
import ApprovalSettings from './Pages/ApprovalSettings';
import CompanySettings from './Pages/CompanySettings';
import ManagerDashboard from './Pages/ManagerDashboard';

function App() {
  // You might want to add authentication check here
  const isAuthenticated = true; // Replace with actual auth check

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes with Layout */}
        <Route path="/" element={
          isAuthenticated ? (
            <Layout>
              <Dashboard />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <Layout>
              <Dashboard />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/submit-expense" element={
          isAuthenticated ? (
            <Layout>
              <SubmitExpense />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/manage-users" element={
          isAuthenticated ? (
            <Layout>
              <ManageUsers />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/approval-settings" element={
          isAuthenticated ? (
            <Layout>
              <ApprovalSettings />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />

<Route path="/manager-dashboard" element={
  isAuthenticated ? (
    <Layout>
      <ManagerDashboard />
    </Layout>
  ) : (
    <Navigate to="/login" replace />
  )
} />
        
        <Route path="/company-settings" element={
          isAuthenticated ? (
            <Layout>
              <CompanySettings />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;