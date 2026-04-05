import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { Transaction, UserRole } from '../../models/transaction.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  transactions$: Observable<Transaction[]>;
  role$: Observable<UserRole>;
  currentRole: UserRole = 'viewer';

  filteredTransactions: Transaction[] = [];
  searchTitle = '';
  selectedCategory = '';
  categories: string[] = [];
  sortBy: 'date' | 'amount' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  showAddForm = false;
  newTransaction = {
    title: '',
    category: 'Food',
    amount: 0,
    type: 'expense' as 'income' | 'expense'
  };

  startDate: string = '';
  endDate: string = '';

  constructor(private StateService: StateService) {
    this.transactions$ = this.StateService.getTransactions();
    this.role$ = this.StateService.getRole();
  }

  ngOnInit(): void {
    this.categories = this.StateService.getCategories();
    this.role$.subscribe(role => {
      this.currentRole = role;
    });
    this.transactions$.subscribe(() => {
      this.categories = this.StateService.getCategories();
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.transactions$.subscribe(transactions => {
      let filtered = transactions;

      if (this.searchTitle) {
        filtered = filtered.filter(t =>
          t.title.toLowerCase().includes(this.searchTitle.toLowerCase())
        );
      }

      if (this.selectedCategory) {
        filtered = filtered.filter(t => t.category === this.selectedCategory);
      }

      if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        filtered = filtered.filter(t => {
          const transDate = new Date(t.date);
          return transDate >= start && transDate <= end;
        });
      }

      this.filteredTransactions = this.sortTransactions(filtered);
    });
  }

  private sortTransactions(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((a, b) => {
      let comparison = 0;

      if (this.sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (this.sortBy === 'amount') {
        comparison = a.amount - b.amount;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  addTransaction(): void {
    if (this.newTransaction.title && this.newTransaction.amount > 0) {
      this.StateService.addTransaction({
        title: this.newTransaction.title,
        category: this.newTransaction.category,
        amount: this.newTransaction.amount,
        type: this.newTransaction.type,
        date: new Date()
      });

      this.newTransaction = {
        title: '',
        category: 'Food',
        amount: 0,
        type: 'expense'
      };
      this.showAddForm = false;
      this.applyFilters();
    }
  }

  deleteTransaction(id: string): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.StateService.deleteTransaction(id);
      this.applyFilters();
    }
  }

  exportTransactions(format: 'csv' | 'json'): void {
    this.StateService.exportTransactions(format);
  }

  resetFilters(): void {
    this.searchTitle = '';
    this.selectedCategory = '';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}