import React, { useState } from 'react';
import { Users, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

export default function Balances() {
  const [selectedMember, setSelectedMember] = useState(null);
  
  const balances = [
    { name: "Aisha", owes: 0, isOwed: 12500, net: 12500 },
    { name: "Rohan", owes: 4300, isOwed: 1200, net: -3100 },
    { name: "Priya", owes: 2800, isOwed: 2340, net: -460 },
    { name: "Meera", owes: 3500, isOwed: 3000, net: -500 },
    { name: "Dev", owes: 1200, isOwed: 0, net: -1200 },
    { name: "Sam", owes: 0, isOwed: 0, net: 0 },
  ];
  
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Balance Summary</h1>
        
        {/* Overall Settlement */}
        <div className="card p-6 mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <h2 className="text-xl font-bold mb-2">Settlement Summary</h2>
          <p className="text-white/80 mb-4">Minimum transactions needed: 3</p>
          <div className="space-y-2">
            <div className="bg-white/20 rounded-lg p-3">
              <p>Rohan pays Aisha: ₹3,100</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p>Priya pays Aisha: ₹460</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p>Dev pays Aisha: ₹1,200</p>
            </div>
          </div>
        </div>
        
        {/* Balance Table */}
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Member</th>
                <th className="p-4 text-right">Owes</th>
                <th className="p-4 text-right">Is Owed</th>
                <th className="p-4 text-right">Net Balance</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((member) => (
                <tr 
                  key={member.name} 
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-all"
                  onClick={() => setSelectedMember(member)}
                >
                  <td className="p-4 font-medium">{member.name}</td>
                  <td className="p-4 text-right text-red-600">
                    {member.owes > 0 ? `₹${member.owes.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-4 text-right text-green-600">
                    {member.isOwed > 0 ? `₹${member.isOwed.toLocaleString()}` : '-'}
                  </td>
                  <td className={`p-4 text-right font-bold ${member.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {member.net >= 0 ? `+₹${member.net.toLocaleString()}` : `-₹${Math.abs(member.net).toLocaleString()}`}
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