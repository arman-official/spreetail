import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Import from './pages/Import';
import Navbar from './components/Navbar';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };
  
  return (
    <BrowserRouter>
      {token && <Navbar onLogout={handleLogout} />}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;