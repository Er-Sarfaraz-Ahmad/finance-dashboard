import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'admin' | 'viewer';

export interface Transaction {
  date: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private readonly transactionStorageKey = 'finance-dashboard-transactions';
  private readonly roleStorageKey = 'finance-dashboard-role';

  private transactionsSubject = new BehaviorSubject<Transaction[]>(this.loadTransactions());
  private roleSubject = new BehaviorSubject<UserRole>(this.loadRole());

  transactions$ = this.transactionsSubject.asObservable();
  role$ = this.roleSubject.asObservable();

  getTransactions(): Transaction[] {
    return this.transactionsSubject.value;
  }

  setRole(role: UserRole) {
    this.roleSubject.next(role);
    this.saveRole(role);
  }

  addTransaction(transaction: Transaction) {
    const updated = [...this.transactionsSubject.value, transaction];
    this.transactionsSubject.next(updated);
    this.saveTransactions(updated);
  }

  deleteTransaction(index: number) {
    const updated = [...this.transactionsSubject.value];
    updated.splice(index, 1);
    this.transactionsSubject.next(updated);
    this.saveTransactions(updated);
  }

  private loadTransactions(): Transaction[] {
    const stored = localStorage.getItem(this.transactionStorageKey);
    if (!stored) {
      return this.getDefaultTransactions();
    }

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every(this.isTransaction)) {
        return parsed;
      }
    } catch {
      // ignore parse errors and fall back to defaults
    }

    return this.getDefaultTransactions();
  }

  private saveTransactions(transactions: Transaction[]) {
    localStorage.setItem(this.transactionStorageKey, JSON.stringify(transactions));
  }

  private loadRole(): UserRole {
    const stored = localStorage.getItem(this.roleStorageKey);
    return stored === 'viewer' ? 'viewer' : 'admin';
  }

  private saveRole(role: UserRole) {
    localStorage.setItem(this.roleStorageKey, role);
  }

  private getDefaultTransactions(): Transaction[] {
    return [
      { date: new Date().toISOString().split('T')[0], amount: 2400, category: 'Salary', type: 'income' },
      { date: new Date().toISOString().split('T')[0], amount: 1400, category: 'Bills', type: 'expense' }
    ];
  }

  private isTransaction(value: any): value is Transaction {
    return value && typeof value.date === 'string' && typeof value.amount === 'number' && typeof value.category === 'string' && (value.type === 'income' || value.type === 'expense');
  }

  getTotals() {
    const transactions = this.transactionsSubject.value;
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense
    };
  }
}