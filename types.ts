
export enum Category {
  Income = 'Income',
  Food = 'Food',
  Travel = 'Travel',
  Shopping = 'Shopping',
  Entertainment = 'Entertainment',
  Health = 'Health',
  Bills = 'Bills',
  Other = 'Other'
}

export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  date: string;
  category: Category;
  description: string;
  amount: number;
  type: TransactionType;
}

export interface AIInsight {
  tip: string;
  categoryAlert?: string;
}
