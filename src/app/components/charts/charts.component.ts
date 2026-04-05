import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { StateService } from '../../services/state.service';
import { Transaction } from '../../models/transaction.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {
  lineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  barChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  pieChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: true, position: 'bottom' }
    }
  };

  constructor(private StateService: StateService) {}

  ngOnInit(): void {
    this.StateService.getTransactions().subscribe(transactions => {
      this.updateCharts(transactions);
    });
  }

  private updateCharts(transactions: Transaction[]): void {
    this.updateLineChart(transactions);
    this.updateBarChart(transactions);
    this.updatePieChart(transactions);
  }

  private updateLineChart(transactions: Transaction[]): void {
    const monthlyData = this.getMonthlyData(transactions);
    const months = Object.keys(monthlyData).sort();
    const balances = months.map(month => monthlyData[month].balance);

    this.lineChartData = {
      labels: months,
      datasets: [
        {
          label: 'Monthly Balance Trend',
          data: balances,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#3498db',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };
  }

  private updateBarChart(transactions: Transaction[]): void {
    const monthlyData = this.getMonthlyData(transactions);
    const months = Object.keys(monthlyData).sort();
    const income = months.map(month => monthlyData[month].income);
    const expenses = months.map(month => monthlyData[month].expenses);

    this.barChartData = {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: income,
          backgroundColor: '#27ae60',
          borderColor: '#229954',
          borderWidth: 1
        },
        {
          label: 'Expenses',
          data: expenses,
          backgroundColor: '#e74c3c',
          borderColor: '#c0392b',
          borderWidth: 1
        }
      ]
    };
  }

  private updatePieChart(transactions: Transaction[]): void {
    const categoryData = this.getCategoryData(transactions);
    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);

    const colors = [
      '#3498db', '#e74c3c', '#27ae60', '#f39c12',
      '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
    ];

    this.pieChartData = {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors.slice(0, categories.length),
          borderColor: '#fff',
          borderWidth: 2
        }
      ]
    };
  }

  private getMonthlyData(transactions: Transaction[]): { [key: string]: { income: number; expenses: number; balance: number } } {
    const monthlyData: { [key: string]: { income: number; expenses: number; balance: number } } = {};

    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, balance: 0 };
      }

      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expenses += t.amount;
      }

      monthlyData[monthKey].balance = monthlyData[monthKey].income - monthlyData[monthKey].expenses;
    });

    return monthlyData;
  }

  private getCategoryData(transactions: Transaction[]): { [key: string]: number } {
    const categoryData: { [key: string]: number } = {};

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
      });

    return categoryData;
  }
}