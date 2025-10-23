import { Routes } from '@angular/router';
import { PlantManagerComponent} from './pages/plant-manager/plant-manager';

export const routes: Routes = [
  { path: '', redirectTo: '/plants', pathMatch: 'full' },
  { path: 'plants', component: PlantManagerComponent },
  { path: '**', redirectTo: '/plants' }
];
