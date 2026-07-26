import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { HistoryPageComponent } from './features/history/history-page.component';
import { VoicesPageComponent } from './features/voices/voices-page.component';
import { SettingsPageComponent } from './features/settings/settings-page.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, title: 'orphivia — Text to Speech Studio' },
  { path: 'history', component: HistoryPageComponent, title: 'orphivia — History' },
  { path: 'voices', component: VoicesPageComponent, title: 'orphivia — Voice Marketplace' },
  { path: 'settings', component: SettingsPageComponent, title: 'orphivia — Settings' },
  { path: '**', redirectTo: '' }
];
