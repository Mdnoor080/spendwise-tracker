
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Transaction } from '../types.ts';

interface VisualsProps {
  expenses: Transaction[];
}

const COLORS = ['#10b981', '#f43f5e', '#0ea5e9', '#f59e0b', '#8b5cf6', '#6366f1'];

export default function Visuals({ expenses }: VisualsProps) {
  const flowData = useMemo(() => {
    const income = expenses.filter(tx => tx.type === 'credit').reduce((s, tx) => s + tx.amount, 0);
    const cost = expenses.filter(tx => tx.type === 'debit').reduce((s, tx) => s + tx.amount, 0);
    return [
      { name: 'Income', value: income, color: '#10b981' },
      { name: 'Expenses', value: cost, color: '#f43f5e' }
    ].filter(d => d.value > 0);
  }, [expenses]);

  const dailyData = useMemo(() => {
    const days: Record<string, { income: number, expense: number }> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(day => days[day] = { income: 0, expense: 0 });
    expenses.forEach(e => {
      if (days[e.date]) {
        if (e.type === 'credit') days[e.date].income += e.amount;
        else days[e.date].expense += e.amount;
      }
    });

    return last7Days.map(day => ({
      date: day.split('-').slice(1).join('/'),
      Income: days[day].income,
      Expense: days[day].expense
    }));
  }, [expenses]);

  if (expenses.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Cash Flow</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={flowData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                {flowData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Daily Activity</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Legend />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
