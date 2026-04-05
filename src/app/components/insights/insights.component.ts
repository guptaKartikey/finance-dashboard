import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { Transaction } from '../../models/transaction.model';
import { Observable } from 'rxjs';

interface InsightData {
  highestSpendingCategory: { category: string; amount: number } | null;
  monthlyComparison: { current: number; previous: number; change: number } | null;
  savingsRate: number;
  averageTransaction: number;
}

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss']
})
export class InsightsComponent implements OnInit {
  insights: InsightData = {
    highestSpendingCategory: null,
    monthlyComparison: null,
    savingsRate: 0,
    averageTransaction: 0
  };

  constructor(private StateService: StateService) {}

  ngOnInit(): void {
    this.StateService.getTransactions().subscribe(transactions => {
      this.calculateInsights(transactions);
    });
  }

  private calculateInsights(transactions: Transaction[]): void {
    this.insights.highestSpendingCategory = this.getHighestSpendingCategory(transactions);
    this.insights.monthlyComparison = this.getMonthlyComparison(transactions);
    this.insights.savingsRate = this.calculateSavingsRate(transactions);
    this.insights.averageTransaction = this.calculateAverageTransaction(transactions);
  }

  private getHighestSpendingCategory(transactions: Transaction[]): { category: string; amount: number } | null {
    const categorySpending: { [key: string]: number } = {};

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

    const highest = Object.entries(categorySpending).reduce((max, [cat, amount]) =>
      amount > (max[1] || 0) ? [cat, amount] : max,
      ['', 0]
    );

    return highest[0] ? { category: highest[0], amount: highest[1] as number } : null;
  }

  private getMonthlyComparison(transactions: Transaction[]): { current: number; previous: number; change: number } | null {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const previousMonthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && date.getMonth() === previousMonth && date.getFullYear() === previousYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const change = previousMonthExpenses > 0
      ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
      : 0;

    return {
      current: currentMonthExpenses,
      previous: previousMonthExpenses,
      change
    };
  }

  private calculateSavingsRate(transactions: Transaction[]): number {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalIncome === 0) return 0;
    return ((totalIncome - totalExpenses) / totalIncome) * 100;
  }

  private calculateAverageTransaction(transactions: Transaction[]): number {
    if (transactions.length === 0) return 0;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    return totalAmount / transactions.length;
  }
}