import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { UserRole } from '../../models/transaction.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-switcher.component.html',
  styleUrls: ['./role-switcher.component.scss']
})
export class RoleSwitcherComponent implements OnInit {
  role$: Observable<UserRole>;
  currentRole: UserRole = 'viewer';

  constructor(private StateService: StateService) {
    this.role$ = this.StateService.getRole();
  }

  ngOnInit(): void {
    this.role$.subscribe(role => {
      this.currentRole = role;
    });
  }

  switchRole(role: UserRole): void {
    this.StateService.setRole(role);
  }
}