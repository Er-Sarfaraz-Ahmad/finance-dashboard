import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { TransactionService, UserRole } from './services/transaction';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {

  protected readonly title = signal('finance-dashboard');
  private transactionService = inject(TransactionService);
  role: UserRole = 'admin';

  constructor() {
    this.transactionService.role$.subscribe(role => this.role = role);
  }

  toggleDark() {
    document.body.classList.toggle('dark');
  }

  setRole(role: UserRole) {
    this.transactionService.setRole(role);
  }
}