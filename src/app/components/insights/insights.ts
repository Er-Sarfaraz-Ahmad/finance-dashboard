import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TransactionService, Transaction } from '../../services/transaction';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insights.html',
  styleUrls: ['./insights.css']
})
export class Insights implements OnInit, OnDestroy {

  transactions: Transaction[] = [];
  highestExpenseCategory = 'N/A';
  monthlySummary: { month: string; income: number; expense: number; }[] = [];
  spendRatio = 'N/A';
  observation = 'Add more transactions to see insights.';
  transactionSubscription: Subscription | null = null;

  constructor(private txService: TransactionService) {}

  ngOnInit() {
    this.transactionSubscription = this.txService.transactions$.subscribe(transactions => {
      this.transactions = transactions;
      this.calculateInsights();
    });
  }

  ngOnDestroy() {
    this.transactionSubscription?.unsubscribe();
  }

  private calculateInsights() {
    if (!this.transactions.length) {
      return;
    }

    this.highestExpenseCategory = this.getHighestExpenseCategory();
    this.monthlySummary = this.getMonthlySummary();
    this.spendRatio = this.getSpendRatio();
    this.observation = this.getObservation();
  }

  private getHighestExpenseCategory() {
    const expenseMap: Record<string, number> = {};

    this.transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        expenseMap[transaction.category] = (expenseMap[transaction.category] || 0) + transaction.amount;
      }
    });

    const entries = Object.entries(expenseMap);
    if (!entries.length) {
      return 'No expense categories yet';
    }

    return entries.reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev))[0];
  }

  private getMonthlySummary() {
    const months: Record<string, { month: string; income: number; expense: number; }> = {};

    this.transactions.forEach(transaction => {
      const monthKey = transaction.date.slice(0, 7);
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }
      if (transaction.type === 'income') {
        months[monthKey].income += transaction.amount;
      } else {
        months[monthKey].expense += transaction.amount;
      }
    });

    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }

  private getSpendRatio() {
    const totalExpense = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalIncome === 0) {
      return totalExpense === 0 ? 'N/A' : 'No income available';
    }

    return `${((totalExpense / totalIncome) * 100).toFixed(1)}% expense of income`;
  }

  private getObservation() {
    if (this.monthlySummary.length < 2) {
      return 'Track more months to compare spending patterns.';
    }

    const latest = this.monthlySummary[this.monthlySummary.length - 1];
    const previous = this.monthlySummary[this.monthlySummary.length - 2];

    if (latest.expense > previous.expense) {
      return `Expense increased by ₹${(latest.expense - previous.expense).toFixed(0)} compared to the previous month.`;
    }

    if (latest.expense < previous.expense) {
      return `Expense decreased by ₹${(previous.expense - latest.expense).toFixed(0)} compared to the previous month.`;
    }

    return 'Expense stayed roughly the same compared to the previous month.';
  }
}