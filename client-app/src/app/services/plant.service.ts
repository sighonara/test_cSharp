import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plant } from '../models/plant';
import { environment } from '../../environments/environment';

// FUTURE: Add WebSocket support for real-time synchronization of plant changes across multiple clients
// FUTURE: Implement optimistic updates with rollback on conflict
// FUTURE: Add request caching/memoization for frequently accessed data
@Injectable({
  providedIn: 'root'
})
export class PlantService {
  private apiUrl = `${environment.apiBaseUrl}/plants`;

  constructor(private http: HttpClient) { }

  getPlants(): Observable<Plant[]> {
    return this.http.get<Plant[]>(this.apiUrl);
  }

  getPlant(name: string): Observable<Plant> {
    return this.http.get<Plant>(`${this.apiUrl}/${encodeURIComponent(name)}`);
  }

  createPlant(plant: Plant): Observable<Plant> {
    return this.http.post<Plant>(this.apiUrl, plant);
  }

  updatePlant(originalName: string, plant: Plant): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${encodeURIComponent(originalName)}`, plant);
  }

  deletePlant(name: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(name)}`);
  }
}
