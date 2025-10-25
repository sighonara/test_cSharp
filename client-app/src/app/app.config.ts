import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    {
      // Setting the default date format to include 24-hour time. Civilized.
      // With a more complicated app, I would have to do something more sophisticated.
      // TODO: (#38) Do something more scalable.
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: 'yyyy/M/d, HH:mm' }
    }
  ]
};
