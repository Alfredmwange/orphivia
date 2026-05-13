import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, title: 'Voicera — Text to Speech Studio' },
  { path: '**', redirectTo: '' }
];
