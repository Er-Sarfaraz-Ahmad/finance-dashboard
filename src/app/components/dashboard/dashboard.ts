import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { TransactionService, Transaction } from '../../services/transaction';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements AfterViewInit, OnDestroy {

  balance = 0;
  income = 0;
  expense = 0;

  @ViewChild('lineChart', { static: false }) lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart', { static: false }) pieChartRef!: ElementRef<HTMLCanvasElement>;

  lineChart: Chart | null = null;
  pieChart: Chart | null = null;
  transactionSubscription: Subscription | null = null;

  constructor(private transactionService: TransactionService) {}

  ngAfterViewInit() {
    this.createCharts();
    const initialTransactions = this.transactionService.getTransactions();
    this.updateChartData(initialTransactions);

    this.transactionSubscription = this.transactionService.transactions$.subscribe(transactions => {
      this.updateChartData(transactions);
    });
  }

  ngOnDestroy() {
    this.transactionSubscription?.unsubscribe();
  }

  private createCharts() {
    if (this.lineChartRef?.nativeElement) {
      this.lineChart = new Chart(this.lineChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          datasets: [{
            label: 'Balance Trend',
            data: [1000, 1200, 900, 1400, 1300],
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            fill: true,
            tension: 0.25,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: false }
          }
        }
      });
    }

    if (this.pieChartRef?.nativeElement) {
      this.pieChart = new Chart(this.pieChartRef.nativeElement, {
        type: 'pie',
        data: {
          labels: ['Income', 'Expense'],
          datasets: [{
            data: [0, 0],
            backgroundColor: ['green', 'red']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  private updateChartData(transactions: Transaction[]) {
    const totals = this.transactionService.getTotals();
    this.income = totals.income;
    this.expense = totals.expense;
    this.balance = totals.balance;

    const recentTransactions = transactions.slice(-5);
    const labels = recentTransactions.length ? recentTransactions.map(t => t.date || 'Unknown') : ['No data'];
    const balanceData: number[] = [];
    let runningBalance = 0;

    recentTransactions.forEach(transaction => {
      runningBalance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
      balanceData.push(runningBalance);
    });

    if (this.pieChart) {
      this.pieChart.data.datasets[0].data = [this.income, this.expense];
      this.pieChart.update();
    }

    if (this.lineChart) {
      this.lineChart.data.labels = labels;
      this.lineChart.data.datasets[0].data = balanceData.length ? balanceData : [0];
      this.lineChart.update();
    }
  }

  updateCharts() {
    this.updateChartData(this.transactionService.getTransactions());
  }
}
