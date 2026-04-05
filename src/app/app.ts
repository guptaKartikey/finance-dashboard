import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ChartsComponent } from './components/charts/charts.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { RoleSwitcherComponent } from './components/role-switcher/role-switcher.component';
import { InsightsComponent } from './components/insights/insights.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    DashboardComponent,
    ChartsComponent,
    TransactionsComponent,
    RoleSwitcherComponent,
    InsightsComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  title = 'Personal Finance Dashboard';
}