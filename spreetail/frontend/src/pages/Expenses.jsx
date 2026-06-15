import React, { useState } from 'react';
import { Search, Filter, ChevronDown, Eye } from 'lucide-react';

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const expenses = [
    { id: 1, date: "2026-02-01", description: "February rent", paidBy: "Aisha", amount: 48000, splitType: "equal" },
    { id: 2, date: "2026-02-03", description: "Groceries BigBasket", paidBy: "Priya", amount: 2340, splitType: "equal" },
    { id: 3, date: "2026-02-05", description: "Wifi bill Feb", paidBy: "Rohan", amount: 1199, splitType: "equal" },
  ];
  
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">All Expenses</h1>
          <button className="btn-primary">+ Add Expense</button>
        </div>
        
        {/* Search and Filter */}
        <div className="card p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <button className="btn-secondary flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Expenses Table */}
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">Paid By</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-t border-gray-100 hover:bg-gray-50 transition-all">
                  <td className="p-4">{expense.date}</td>
                  <td className="p-4 font-medium">{expense.description}</td>
                  <td className="p-4">{expense.paidBy}</td>
                  <td className="p-4 text-right font-semibold">₹{expense.amount.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <button className="text-indigo-600 hover:text-indigo-800">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}