import { Routes } from '@angular/router';
import { PlantManagerComponent } from './pages/plant-manager/plant-manager';
import { StatusDashboard } from './pages/status-dashboard/status-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '/status-dashboard', pathMatch: 'full' },
  { path: 'status-dashboard', component: StatusDashboard },
  { path: 'plants', component: PlantManagerComponent },
  { path: '**', redirectTo: '/status-dashboard' }
];
