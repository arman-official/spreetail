import React, { useState } from 'react';
import axios from '../api/client';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('aisha@flatmate.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');  // ← THIS LINE WAS MISSING

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');  // Clear previous error
    
    console.log('Attempting login with:', email);
    
    try {
      const res = await axios.post('/auth/login', { email, password });
      console.log('Login response:', res.data);
      
      if (res.data.token) {
        onLogin(res.data.token);
      } else {
        setError('No token received');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        setError(err.response.data?.error || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('Cannot connect to server. Make sure backend is running on port 5001');
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">FlatMate</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50 hover:bg-blue-700"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Demo: aisha@flatmate.com / password123
        </p>
      </div>
    </div>
  );
}