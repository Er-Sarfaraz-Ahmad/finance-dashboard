import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TransactionService, UserRole } from '../../services/transaction';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.css']
})
export class Transactions implements OnInit, OnDestroy {

  transactions: any[] = [];
  transactionSubscription: Subscription | null = null;
  roleSubscription: Subscription | null = null;
  role: UserRole = 'admin';

  // live totals
  balance = 0;
  income = 0;
  expense = 0;

  // form fields
  amount: number = 0;
  category: string = '';
  type: 'income' | 'expense' = 'income';

  // filters
  filterType = 'all';
  searchText = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.transactionSubscription = this.transactionService.transactions$.subscribe(data => {
      this.transactions = data;
      this.updateTotals();
    });

    this.roleSubscription = this.transactionService.role$.subscribe(role => {
      this.role = role;
    });
  }

  ngOnDestroy() {
    this.transactionSubscription?.unsubscribe();
    this.roleSubscription?.unsubscribe();
  }

  private updateTotals() {
    const totals = this.transactionService.getTotals();
    this.income = totals.income;
    this.expense = totals.expense;
    this.balance = totals.balance;
  }

  // ✅ ADD TRANSACTION (FIXED)
  addTransaction() {

    console.log("Button Clicked");
    console.log(this.amount, this.category, this.type);

    // ✅ FIXED VALIDATION
    if (this.amount <= 0 || this.category.trim() === '') {
      console.log("Validation failed ❌");
      return;
    }

    this.transactionService.addTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: this.amount,
      category: this.category,
      type: this.type
    });

    console.log("Added successfully ✅");

    // reset form
    this.amount = 0;
    this.category = '';
    this.type = 'income';
  }

  // ✅ DELETE
  deleteTransaction(index: number) {
    if (this.role !== 'admin') {
      return;
    }
    this.transactionService.deleteTransaction(index);
  }

  get isAdmin() {
    return this.role === 'admin';
  }

  // ✅ FILTER
  get filteredTransactions() {
    if (this.filterType === 'all') return this.transactions;
    return this.transactions.filter(t => t.type === this.filterType);
  }

  // ✅ SEARCH
  get searchedTransactions() {
    return this.filteredTransactions.filter(t =>
      t.category.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}