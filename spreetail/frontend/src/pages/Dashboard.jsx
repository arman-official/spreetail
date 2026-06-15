import React, { useState, useEffect } from 'react';
import axios from '../api/client';

export default function Dashboard() {
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo dashboard - you'll expand this
    setLoading(false);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Welcome to FlatMate!</p>
        <p className="text-sm text-gray-500 mt-2">
          Go to the Import page to upload your expenses CSV.
        </p>
      </div>
    </div>
  );
}