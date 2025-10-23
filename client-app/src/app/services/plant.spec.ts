import { TestBed } from '@angular/core/testing';

import { PlantService } from './plant.service';

// TODO: This needs to be fleshed out
describe('Plant', () => {
  let service: PlantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
