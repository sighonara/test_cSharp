import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PlantService } from '../../services/plant.service';
import { Plant } from '../../models/plant';

@Component({
  selector: 'app-plant-manager',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './plant-manager.html',
  styleUrl: './plant-manager.scss'
})
export class PlantManagerComponent implements OnInit {
  plants = signal<Plant[]>([]);
  filteredPlants = signal<Plant[]>([]);
  searchTerm = signal('');

  // Form state
  isEditing = signal(false);
  editingPlant: Plant | null = null;
  currentPlant = signal<Plant>({
    name: '',
    scientificName: '',
    habitat: '',
    somethingInteresting: '',
    updated: new Date()
  });

  displayedColumns = ['name', 'scientificName', 'habitat', 'somethingInteresting', 'updated', 'actions'];

  constructor(
    private plantService: PlantService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPlants();
  }

  loadPlants() {
    this.plantService.getPlants().subscribe({
      next: (data) => {
        this.plants.set(data);
        this.filteredPlants.set(data);
      },
      error: (err) => this.showError('Failed to load plants')
    });
  }

  onSearch() {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredPlants.set(this.plants());
      return;
    }

    const filtered = this.plants().filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.scientificName.toLowerCase().includes(term) ||
      p.habitat.toLowerCase().includes(term) ||
      p.somethingInteresting.toLowerCase().includes(term)
    );
    this.filteredPlants.set(filtered);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.filteredPlants.set(this.plants());
  }

  startCreate() {
    this.isEditing.set(true);
    this.editingPlant = null;
    this.currentPlant.set({
      name: '',
      scientificName: '',
      habitat: '',
      somethingInteresting: '',
      updated: new Date()
    });
  }

  startEdit(plant: Plant) {
    this.isEditing.set(true);
    this.editingPlant = plant;
    this.currentPlant.set({ ...plant });
  }

  startCopy(plant: Plant) {
    this.isEditing.set(true);
    this.editingPlant = null;
    this.currentPlant.set({
      ...plant,
      name: `${plant.name} (Copy)`,
      updated: new Date()
    });
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editingPlant = null;
  }

  save() {
    const plant = this.currentPlant();

    if (this.editingPlant) {
      // Update existing
      this.plantService.updatePlant(this.editingPlant.name, plant).subscribe({
        next: () => {
          this.showSuccess('Plant updated successfully');
          this.loadPlants();
          this.cancelEdit();
        },
        error: (err) => this.showError(err.error || 'Failed to update plant')
      });
    } else {
      // Create new
      this.plantService.createPlant(plant).subscribe({
        next: () => {
          this.showSuccess('Plant created successfully');
          this.loadPlants();
          this.cancelEdit();
        },
        error: (err) => this.showError(err.error || 'Failed to create plant')
      });
    }
  }

  delete(plant: Plant) {
    if (!confirm(`Delete plant "${plant.name}"?`)) return;

    this.plantService.deletePlant(plant.name).subscribe({
      next: () => {
        this.showSuccess('Plant deleted successfully');
        this.loadPlants();
      },
      error: (err) => this.showError('Failed to delete plant')
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
}
