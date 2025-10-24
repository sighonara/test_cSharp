import { Routes } from '@angular/router';
import { PlantManagerComponent } from './pages/plant-manager/plant-manager';
import { StatusDashboard } from './pages/status-dashboard/status-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '/plants', pathMatch: 'full' },
  { path: 'plants', component: PlantManagerComponent },
  { path: 'status-dashboard', component: StatusDashboard },
  { path: '**', redirectTo: '/status-dashboard' }
];
