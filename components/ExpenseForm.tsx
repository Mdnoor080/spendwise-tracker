
import React, { useState, useEffect } from 'react';
import { Category, Transaction, TransactionType } from '../types.ts';

interface ExpenseFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdate: (transaction: Transaction) => void;
  editingTransaction: Transaction | null;
  onCancelEdit: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd, onUpdate, editingTransaction, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: Category.Food,
    description: '',
    amount: '',
    type: 'debit' as TransactionType
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        date: editingTransaction.date,
        category: editingTransaction.category,
        description: editingTransaction.description,
        amount: editingTransaction.amount.toString(),
        type: editingTransaction.type
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: formData.type === 'credit' ? Category.Income : Category.Food,
        description: '',
        amount: '',
        type: formData.type
      });
    }
  }, [editingTransaction]);

  const handleTypeToggle = (type: TransactionType) => {
    setFormData(prev => ({
      ...prev,
      type,
      // Automatically switch category to a sensible default if it's not in edit mode
      category: type === 'credit' ? Category.Income : Category.Food
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || parseFloat(formData.amount) <= 0) return;

    if (editingTransaction) {
      onUpdate({
        ...editingTransaction,
        date: formData.date,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type
      });
    } else {
      onAdd({
        date: formData.date,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type
      });
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: Category.Food,
      description: '',
      amount: '',
      type: 'debit'
    });
  };

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editingTransaction ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-100'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <i className={`fa-solid ${editingTransaction ? 'fa-pen-to-square' : 'fa-plus-circle'} ${editingTransaction ? 'text-amber-500' : 'text-teal-600'}`}></i>
          {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
        </h2>
        {editingTransaction && (
          <button 
            onClick={onCancelEdit}
            className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
          >
            Cancel Edit
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Type</label>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeToggle('debit')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${formData.type === 'debit' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Debit
            </button>
            <button
              type="button"
              onClick={() => handleTypeToggle('credit')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${formData.type === 'credit' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Credit
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none bg-white text-sm"
          >
            {Object.values(Category).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
          <input
            type="text"
            placeholder="e.g. Salary, Rent, Grocery"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
            required
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-slate-600 mb-1">Amount (₹)</label>
          <div className="relative flex gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
              required
            />
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg transition-all flex items-center justify-center font-bold text-sm shadow-lg shadow-teal-500/20 ${editingTransaction ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-teal-600 hover:bg-teal-700'}`}
              title={editingTransaction ? "Save Changes" : "Add Transaction"}
            >
              {editingTransaction ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
