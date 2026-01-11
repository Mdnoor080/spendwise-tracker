
import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '../types.ts';

interface ExpenseListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

type SortConfig = {
  key: keyof Transaction;
  direction: 'asc' | 'desc';
} | null;

const ExpenseList: React.FC<ExpenseListProps> = ({ transactions, onDelete, onEdit }) => {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Income': return 'fa-wallet text-emerald-500';
      case 'Food': return 'fa-utensils text-orange-500';
      case 'Travel': return 'fa-car text-blue-500';
      case 'Shopping': return 'fa-bag-shopping text-pink-500';
      case 'Entertainment': return 'fa-film text-purple-500';
      case 'Health': return 'fa-heart-pulse text-rose-500';
      case 'Bills': return 'fa-receipt text-cyan-500';
      default: return 'fa-tags text-slate-500';
    }
  };

  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const requestSort = (key: keyof Transaction) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(e => selectedCategories.includes(e.category));
    }
    if (startDate) {
      filtered = filtered.filter(e => e.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(e => e.date <= endDate);
    }
    return filtered;
  }, [transactions, selectedCategories, startDate, endDate]);

  const processedTransactions = useMemo(() => {
    let result = [...filteredTransactions];
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [filteredTransactions, sortConfig]);

  const categorySummary = useMemo(() => {
    const expensesOnly = filteredTransactions.filter(tx => tx.type === 'debit');
    const totalExpenses = expensesOnly.reduce((sum, tx) => sum + tx.amount, 0);
    
    const summary: Record<string, { total: number, percent: number }> = {};
    expensesOnly.forEach(tx => {
      if (!summary[tx.category]) {
        summary[tx.category] = { total: 0, percent: 0 };
      }
      summary[tx.category].total += tx.amount;
    });

    Object.keys(summary).forEach(cat => {
      summary[cat].percent = totalExpenses > 0 ? (summary[cat].total / totalExpenses) * 100 : 0;
    });

    return Object.entries(summary).sort((a, b) => b[1].total - a[1].total);
  }, [filteredTransactions]);

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        tx.date,
        tx.type,
        tx.category,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `spendwise_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSortIcon = (key: keyof Transaction) => {
    if (!sortConfig || sortConfig.key !== key) return 'fa-sort opacity-20';
    return sortConfig.direction === 'asc' ? 'fa-sort-up text-teal-600' : 'fa-sort-down text-teal-600';
  };

  return (
    <div className="space-y-8">
      {/* Category Summary Section */}
      {categorySummary.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-teal-600"></i>
            Expense Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categorySummary.map(([cat, data]) => (
              <div key={cat} className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <i className={`fa-solid ${getCategoryIcon(cat)}`}></i>
                    {cat}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{data.percent.toFixed(1)}%</span>
                </div>
                <div className="text-lg font-bold text-slate-800">₹{data.total.toLocaleString('en-IN')}</div>
                <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full bg-teal-500 transition-all duration-500`} 
                    style={{ width: `${data.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-slate-800">Transaction History</h2>
              <button 
                onClick={exportToCSV}
                className="text-xs font-bold text-slate-500 hover:text-teal-600 flex items-center gap-1 transition-colors"
                title="Export Data as CSV"
              >
                <i className="fa-solid fa-file-export"></i>
                Export CSV
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm bg-white"
                />
              </div>
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); setSelectedCategories([]); }}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 underline"
              >
                Clear Filters
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.values(Category).map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-2 ${selectedCategories.includes(cat) ? 'bg-teal-600 border-teal-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'}`}
              >
                <i className={`fa-solid ${getCategoryIcon(cat)}`}></i>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('date')}>
                  Date <i className={`fa-solid ${getSortIcon('date')} ml-1`}></i>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('category')}>
                  Category <i className={`fa-solid ${getSortIcon('category')} ml-1`}></i>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('description')}>
                  Description <i className={`fa-solid ${getSortIcon('description')} ml-1`}></i>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('amount')}>
                  Amount <i className={`fa-solid ${getSortIcon('amount')} ml-1`}></i>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedTransactions.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No records found matching filters.</td></tr>
              ) : (
                processedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 group transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">{tx.date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        <i className={`fa-solid ${getCategoryIcon(tx.category)} mr-1.5`}></i> {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{tx.description}</td>
                    <td className={`px-6 py-4 text-sm font-bold text-right ${tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEdit(tx)} 
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Transaction"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button 
                          onClick={() => onDelete(tx.id)} 
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Transaction"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;
