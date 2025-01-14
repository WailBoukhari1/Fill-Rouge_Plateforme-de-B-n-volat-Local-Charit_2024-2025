import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Suppress React Router warnings from browser extensions
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('React Router')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
