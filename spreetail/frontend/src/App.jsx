import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Import from './pages/Import';
import Expenses from './pages/Expenses';
import Balances from './pages/Balances';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const location = useLocation();
  
  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    toast.success('Welcome back! 🎉');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    toast.success('Logged out successfully');
  };
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  return (
    <div className="min-h-screen">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#22c55e',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      {token && !isAuthPage && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={
          token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/" element={
          token ? <Dashboard /> : <Navigate to="/login" />
        } />
        <Route path="/import" element={
          token ? <Import /> : <Navigate to="/login" />
        } />
        <Route path="/expenses" element={
          token ? <Expenses /> : <Navigate to="/login" />
        } />
        <Route path="/balances" element={
          token ? <Balances /> : <Navigate to="/login" />
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;