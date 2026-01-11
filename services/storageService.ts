
import { Transaction } from '../types.ts';

const STORAGE_KEY = 'spendwise_expenses_data';

export const storageService = {
  saveExpenses: (expenses: Transaction[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses to localStorage:', error);
    }
  },

  getExpenses: (): Transaction[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading expenses from localStorage:', error);
      return [];
    }
  }
};
