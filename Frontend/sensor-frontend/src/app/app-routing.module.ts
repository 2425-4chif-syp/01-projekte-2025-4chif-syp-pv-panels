import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SensorDetailsComponent } from './components/sensor-details/sensor-details.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'details', component: SensorDetailsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 