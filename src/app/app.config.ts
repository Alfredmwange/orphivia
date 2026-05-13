import { ApplicationConfig } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { appRoutes } from './app-routing.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideAnimations()
  ]
};
