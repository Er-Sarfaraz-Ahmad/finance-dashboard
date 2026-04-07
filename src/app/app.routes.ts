import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Transactions } from './components/transactions/transactions';
import { Insights } from './components/insights/insights';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'transactions', component: Transactions },
  { path: 'insights', component: Insights }
];