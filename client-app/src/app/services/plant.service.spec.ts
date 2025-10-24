import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PlantService } from './plant.service';
import { Plant } from '../models/plant';
import { environment } from '../../environments/environment';

describe('PlantService', () => {
  let service: PlantService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiBaseUrl}/plants`;

  const mockPlant: Plant = {
    name: 'Rose',
    scientificName: 'Rosa',
    habitat: 'Garden',
    somethingInteresting: 'Symbol of love',
    updated: new Date('2024-01-01')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlantService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PlantService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPlants', () => {
    it('should return an array of plants', () => {
      const mockPlants: Plant[] = [mockPlant];

      service.getPlants().subscribe(plants => {
        expect(plants).toEqual(mockPlants);
        expect(plants.length).toBe(1);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPlants);
    });

    it('should handle empty plant list', () => {
      service.getPlants().subscribe(plants => {
        expect(plants).toEqual([]);
        expect(plants.length).toBe(0);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });
  });

  describe('getPlant', () => {
    it('should return a single plant by name', () => {
      service.getPlant('Rose').subscribe(plant => {
        expect(plant).toEqual(mockPlant);
        expect(plant.name).toBe('Rose');
      });

      const req = httpMock.expectOne(`${apiUrl}/Rose`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPlant);
    });

    it('should URL encode plant names with special characters', () => {
      service.getPlant('Rose & Thorn').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/Rose%20%26%20Thorn`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPlant);
    });
  });

  describe('createPlant', () => {
    it('should create a new plant', () => {
      service.createPlant(mockPlant).subscribe(plant => {
        expect(plant).toEqual(mockPlant);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPlant);
      req.flush(mockPlant);
    });
  });

  describe('updatePlant', () => {
    it('should update an existing plant', () => {
      const updatedPlant: Plant = { ...mockPlant, habitat: 'Wild' };

      service.updatePlant('Rose', updatedPlant).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/Rose`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedPlant);
      req.flush(null);
    });

    it('should URL encode original name in update', () => {
      service.updatePlant('Rose & Thorn', mockPlant).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/Rose%20%26%20Thorn`);
      expect(req.request.method).toBe('PUT');
      req.flush(null);
    });
  });

  describe('deletePlant', () => {
    it('should delete a plant by name', () => {
      service.deletePlant('Rose').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/Rose`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should URL encode plant name in delete', () => {
      service.deletePlant('Rose & Thorn').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/Rose%20%26%20Thorn`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
