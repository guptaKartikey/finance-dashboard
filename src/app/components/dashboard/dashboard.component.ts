import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { DashboardSummary } from '../../models/transaction.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  summary$: Observable<DashboardSummary>;

  constructor(private StateService: StateService) {
    this.summary$ = this.StateService.getDashboardSummary();
  }

  ngOnInit(): void {
    // Component initialization
  }
}