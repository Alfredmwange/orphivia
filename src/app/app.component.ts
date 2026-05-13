import { Component } from '@angular/core';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<app-main-layout></app-main-layout>',
  styles: [':host { display: block; min-height: 100vh; }'],
  imports: [MainLayoutComponent]
})
export class AppComponent {}
