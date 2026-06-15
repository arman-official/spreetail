import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-3">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">FlatMate</Link>
        <div className="flex gap-4">
          <Link to="/" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
          <Link to="/import" className="text-gray-700 hover:text-blue-600">Import CSV</Link>
          <button onClick={handleLogout} className="text-red-600 hover:text-red-800">Logout</button>
        </div>
      </div>
    </nav>
  );
}