import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaction, UserRole, DashboardSummary } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>(this.loadTransactions());
  private roleSubject = new BehaviorSubject<UserRole>('viewer');
  private filterCategorySubject = new BehaviorSubject<string>('');
  private filterDateRangeSubject = new BehaviorSubject<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  transactions$ = this.transactionsSubject.asObservable();
  role$ = this.roleSubject.asObservable();
  filterCategory$ = this.filterCategorySubject.asObservable();
  filterDateRange$ = this.filterDateRangeSubject.asObservable();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData(): void {
    if (this.transactionsSubject.value.length === 0) {
      const defaultTransactions: Transaction[] = [
        { id: '1', title: 'Salary', category: 'Income', amount: 5000, type: 'income', date: new Date('2024-03-01') },
        { id: '2', title: 'Groceries', category: 'Food', amount: 150, type: 'expense', date: new Date('2024-03-02') },
        { id: '3', title: 'Gas', category: 'Travel', amount: 50, type: 'expense', date: new Date('2024-03-03') },
        { id: '4', title: 'Restaurant', category: 'Food', amount: 75, type: 'expense', date: new Date('2024-03-04') },
        { id: '5', title: 'Freelance Project', category: 'Income', amount: 1200, type: 'income', date: new Date('2024-03-05') },
        { id: '6', title: 'Shopping', category: 'Shopping', amount: 200, type: 'expense', date: new Date('2024-03-06') },
        { id: '7', title: 'Flight Ticket', category: 'Travel', amount: 400, type: 'expense', date: new Date('2024-03-07') },
        { id: '8', title: 'Bonus', category: 'Income', amount: 800, type: 'income', date: new Date('2024-03-08') },
        { id: '9', title: 'Utilities', category: 'Bills', amount: 120, type: 'expense', date: new Date('2024-03-09') },
        { id: '10', title: 'Movie Tickets', category: 'Entertainment', amount: 30, type: 'expense', date: new Date('2024-03-10') },
      ];
      this.transactionsSubject.next(defaultTransactions);
      this.saveTransactions(defaultTransactions);
    }
  }

  private loadTransactions(): Transaction[] {
    const stored = localStorage.getItem('transactions');
    if (stored) {
      return JSON.parse(stored).map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }));
    }
    return [];
  }

  private saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }

  getTransactions(): Observable<Transaction[]> {
    return this.transactions$;
  }

  setRole(role: UserRole): void {
    this.roleSubject.next(role);
  }

  getRole(): Observable<UserRole> {
    return this.role$;
  }

  getCurrentRole(): UserRole {
    return this.roleSubject.value;
  }

  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    const transactions = this.transactionsSubject.value;
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    };
    const updated = [...transactions, newTransaction];
    this.transactionsSubject.next(updated);
    this.saveTransactions(updated);
  }

  updateTransaction(id: string, updates: Partial<Transaction>): void {
    const transactions = this.transactionsSubject.value;
    const updated = transactions.map(t => t.id === id ? { ...t, ...updates } : t);
    this.transactionsSubject.next(updated);
    this.saveTransactions(updated);
  }

  deleteTransaction(id: string): void {
    const transactions = this.transactionsSubject.value;
    const updated = transactions.filter(t => t.id !== id);
    this.transactionsSubject.next(updated);
    this.saveTransactions(updated);
  }

  setFilterCategory(category: string): void {
    this.filterCategorySubject.next(category);
  }

  setFilterDateRange(start: Date | null, end: Date | null): void {
    this.filterDateRangeSubject.next({ start, end });
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    return new Observable(observer => {
      this.transactions$.subscribe(transactions => {
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        observer.next({
          totalBalance: totalIncome - totalExpenses,
          totalIncome,
          totalExpenses,
          transactionCount: transactions.length
        });
      });
    });
  }

  getFilteredTransactions(): Observable<Transaction[]> {
    return new Observable(observer => {
      this.transactions$.subscribe(transactions => {
        this.filterCategory$.subscribe(category => {
          this.filterDateRange$.subscribe(dateRange => {
            let filtered = transactions;

            if (category) {
              filtered = filtered.filter(t => t.category === category);
            }

            if (dateRange.start && dateRange.end) {
              filtered = filtered.filter(t => {
                const transDate = new Date(t.date);
                return transDate >= dateRange.start! && transDate <= dateRange.end!;
              });
            }

            observer.next(filtered);
          });
        });
      });
    });
  }

  getCategories(): string[] {
    const transactions = this.transactionsSubject.value;
    const categories = new Set(transactions.map(t => t.category));
    return Array.from(categories).sort();
  }

  exportTransactions(format: 'csv' | 'json'): void {
    const transactions = this.transactionsSubject.value;
    let content: string;
    let filename: string;

    if (format === 'csv') {
      const headers = ['ID', 'Title', 'Category', 'Amount', 'Type', 'Date'];
      const rows = transactions.map(t => [
        t.id,
        t.title,
        t.category,
        t.amount,
        t.type,
        new Date(t.date).toLocaleDateString()
      ]);
      content = [headers, ...rows].map(row => row.join(',')).join('\n');
      filename = 'transactions.csv';
    } else {
      content = JSON.stringify(transactions, null, 2);
      filename = 'transactions.json';
    }

    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}