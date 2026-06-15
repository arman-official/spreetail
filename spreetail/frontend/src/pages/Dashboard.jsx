import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  Receipt, 
  TrendingUp, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Upload,
  Activity
} from 'lucide-react';
import axios from '../api/client';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    youOwe: 0,
    youAreOwed: 0,
    netBalance: 0,
    recentExpenses: [],
    members: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In production, fetch from real API
      setSummary({
        totalExpenses: 45280,
        youOwe: 12500,
        youAreOwed: 8300,
        netBalance: -4200,
        recentExpenses: [
          { id: 1, description: "Groceries", amount: 2340, paidBy: "Priya", date: "2026-02-03" },
          { id: 2, description: "Wifi Bill", amount: 1199, paidBy: "Rohan", date: "2026-02-05" },
          { id: 3, description: "Electricity", amount: 1200, paidBy: "Aisha", date: "2026-02-10" },
        ],
        members: ["Aisha", "Rohan", "Priya", "Meera", "Dev", "Sam"]
      });
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      title: "Total Expenses", 
      value: `₹${summary.totalExpenses.toLocaleString()}`, 
      icon: DollarSign, 
      color: "from-blue-500 to-blue-600",
      change: "+12%",
      changeType: "up"
    },
    { 
      title: "You Owe", 
      value: `₹${summary.youOwe.toLocaleString()}`, 
      icon: ArrowUpRight, 
      color: "from-red-500 to-red-600",
      change: "+5%",
      changeType: "up"
    },
    { 
      title: "You Are Owed", 
      value: `₹${summary.youAreOwed.toLocaleString()}`, 
      icon: ArrowDownRight, 
      color: "from-green-500 to-green-600",
      change: "-3%",
      changeType: "down"
    },
    { 
      title: "Net Balance", 
      value: `₹${Math.abs(summary.netBalance).toLocaleString()}`, 
      icon: Wallet, 
      color: summary.netBalance >= 0 ? "from-green-500 to-green-600" : "from-red-500 to-red-600",
      subtitle: summary.netBalance >= 0 ? "You are owed" : "You owe",
      changeType: "neutral"
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, Aisha! 👋</h1>
          <p className="text-white/80">Here's what's happening with your flat expenses</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card p-6 hover:scale-[1.02] transition-all duration-200 animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                {stat.change && (
                  <span className={`text-sm font-medium ${stat.changeType === 'up' ? 'text-green-600' : stat.changeType === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              {stat.subtitle && <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-indigo-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/import" className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl text-center hover:shadow-md transition-all">
                <Upload className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Import CSV</p>
                <p className="text-xs text-gray-500">Upload expenses</p>
              </Link>
              <button className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl text-center hover:shadow-md transition-all">
                <PlusCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Add Expense</p>
                <p className="text-xs text-gray-500">Manual entry</p>
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Flat Members
            </h2>
            <div className="flex flex-wrap gap-2">
              {summary.members.map((member, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                  {member}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-600" />
              Recent Expenses
            </h2>
            <Link to="/expenses" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {summary.recentExpenses.map((expense, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div>
                  <p className="font-medium text-gray-800">{expense.description}</p>
                  <p className="text-sm text-gray-500">Paid by {expense.paidBy} • {expense.date}</p>
                </div>
                <p className="text-lg font-semibold text-gray-800">₹{expense.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}