
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from './types.ts';
import { storageService } from './services/storageService.ts';
import ExpenseForm from './components/ExpenseForm.tsx';
import ExpenseList from './components/ExpenseList.tsx';
import Visuals from './components/Visuals.tsx';
import AIInsights from './components/AIInsights.tsx';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    const stored = storageService.getExpenses();
    setTransactions(stored as Transaction[]);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      storageService.saveExpenses(transactions);
    }
  }, [transactions, isInitialized]);

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
  const transaction: Transaction = { ...newTx, id: Date.now().toString() };

    setTransactions(prev => [transaction, ...prev]);
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx));
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  const stats = useMemo(() => {
    const income = transactions.filter(tx => tx.type === 'credit').reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = transactions.filter(tx => tx.type === 'debit').reduce((sum, tx) => sum + tx.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-building-columns"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-800">SpendWise Pro</h1>
          </div>
          <button 
            onClick={() => setShowSetupModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <i className="fa-solid fa-download"></i>
            Project Setup
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-teal-600 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <i className="fa-solid fa-piggy-bank absolute -right-4 -bottom-4 text-7xl opacity-10"></i>
            <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Total Balance</p>
            <h3 className="text-3xl font-bold mt-1">₹{stats.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i className="fa-solid fa-arrow-down-long text-xl"></i>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Income</p>
              <h3 className="text-xl font-bold text-slate-800">₹{stats.income.toLocaleString('en-IN')}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <i className="fa-solid fa-arrow-up-long text-xl"></i>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Expenses</p>
              <h3 className="text-xl font-bold text-slate-800">₹{stats.expenses.toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </div>

        <AIInsights expenses={transactions} />
        
        <div className="mb-8">
          <ExpenseForm 
            onAdd={addTransaction} 
            onUpdate={updateTransaction} 
            editingTransaction={editingTransaction} 
            onCancelEdit={() => setEditingTransaction(null)} 
          />
        </div>

        <Visuals expenses={transactions} />

        <div className="mb-12">
          <ExpenseList 
            transactions={transactions} 
            onDelete={deleteTransaction} 
            onEdit={setEditingTransaction} 
          />
        </div>
      </main>

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-laptop-code text-teal-600"></i>
                Local Setup Guide
              </h3>
              <button onClick={() => setShowSetupModal(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-6">
                <section>
                  <h4 className="font-bold text-slate-800 mb-2">Step 1: Download All Code</h4>
                  <p className="text-sm text-slate-600 mb-4">
                    Recreating files one-by-one can be slow. Use our setup guide to quickly copy all logic.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Code Bundle Helper</p>
                      <p className="text-xs text-slate-500">Copy this list to track your file creation.</p>
                    </div>
                    <button 
                      onClick={() => alert("Check your browser console (F12) for a complete copy-pasteable guide to all files!")}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                    >
                      <i className="fa-solid fa-copy mr-2"></i>
                      View File List
                    </button>
                  </div>
                </section>

                <section>
                  <h4 className="font-bold text-slate-800 mb-2">Step 2: File Structure</h4>
                  <ul className="text-sm space-y-1 font-mono text-teal-700 bg-teal-50/50 p-4 rounded-lg border border-teal-100">
                    <li>📁 project-root/</li>
                    <li>├── index.html</li>
                    <li>├── index.tsx</li>
                    <li>├── App.tsx</li>
                    <li>├── types.ts</li>
                    <li>├── 📁 services/</li>
                    <li>│   └── storageService.ts</li>
                    <li>└── 📁 components/</li>
                    <li>    ├── ExpenseForm.tsx</li>
                    <li>    ├── ExpenseList.tsx</li>
                    <li>    ├── Visuals.tsx</li>
                    <li>    └── AIInsights.tsx</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-slate-800 mb-2">Step 3: Launch</h4>
                  <p className="text-sm text-slate-600">
                    Use the <strong>Live Server</strong> extension in VS Code or run <code className="bg-slate-100 px-1 rounded">npx serve</code> in your folder.
                  </p>
                </section>
                
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <i className="fa-solid fa-circle-info mr-1"></i>
                    <strong>Important:</strong> Browser security (CORS) blocks ES modules if you open <code className="bg-amber-100 px-1 rounded">index.html</code> directly. You <strong>must</strong> use a local web server.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setShowSetupModal(false)}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-600/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
