import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule
  ],
  templateUrl: './plant-manager.html',
  styleUrl: './plant-manager.scss'
})
export class PlantManagerComponent implements OnInit {
  plants = signal<Plant[]>([]);
  filteredPlants = signal<Plant[]>([]);
  searchTerm = signal('');
  searchField = signal('name');

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

  // Comparison state
  comparisonMode = signal(false);
  selectedForComparison = signal<Plant[]>([]);
  isComparing = computed(() => this.selectedForComparison().length === 2);

  // Validation - reactive to name changes
  nameExists = computed(() => {
    const currentName = this.currentPlant().name.trim().toLowerCase();
    if (!currentName) return false;

    const editingName = this.editingPlant?.name.toLowerCase();

    console.info('Checking for name exists: ' + this.plants().some(plant =>
      plant.name.toLowerCase() === currentName &&
      plant.name.toLowerCase() !== editingName
    ));
    return this.plants().some(plant =>
      plant.name.toLowerCase() === currentName &&
      plant.name.toLowerCase() !== editingName
    );
  });

  canSave = computed(() => {
    const plant = this.currentPlant();
    return plant.name.trim() !== '' &&
           plant.scientificName.trim() !== '' &&
           plant.habitat.trim() !== '' &&
           plant.somethingInteresting.trim() !== '' &&
           !this.nameExists();
  });

  displayedColumns = computed(() =>
      this.comparisonMode()
      ? ['select', 'name', 'scientificName', 'habitat', 'somethingInteresting', 'updated', 'actions']
      : ['name', 'scientificName', 'habitat', 'somethingInteresting', 'updated', 'actions']
  );

  // This appears to be required to get the necessary functionality of checking if the name already exists.
  // FUTURE: figure out a more elegant solution.
  updatePlantName(newName: string) {
    console.info('Updating plant name: ' + newName);
    this.currentPlant.set({
      ...this.currentPlant(),
      name: newName
    });
  }

  readonly dateFormat = 'yyyy/M/d, HH:mm';

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

    const field = this.searchField();
    const filtered = this.plants().filter(p => {
      if (field === 'updated') {
        // Format the date the same way it's displayed, then search
        const formattedDate = new Date(p.updated).toLocaleString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).toLowerCase();
        return formattedDate.includes(term);
      }
      return (p[field as keyof Plant] as string).toLowerCase().includes(term);
    });
    this.filteredPlants.set(filtered);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.filteredPlants.set(this.plants());
  }

  toggleComparisonMode() {
    this.comparisonMode.set(!this.comparisonMode());
    if (!this.comparisonMode()) {
      this.clearComparison();
    }
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
    if (!this.canSave()) return;

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

  // Comparison methods
  toggleComparison(plant: Plant, checked: boolean) {
    const selected = this.selectedForComparison();

    if (checked) {
      if (selected.length < 2) {
        this.selectedForComparison.set([...selected, plant]);
      }
    } else {
      this.selectedForComparison.set(selected.filter(p => p.name !== plant.name));
    }
  }

  isSelected(plant: Plant): boolean {
    return this.selectedForComparison().some(p => p.name === plant.name);
  }

  clearComparison() {
    this.selectedForComparison.set([]);
  }

  getComparisonClass(plant: Plant, field: keyof Plant): string {
    if (!this.isComparing() || field === 'name' || field === 'updated') {
      return '';
    }

    const selected = this.selectedForComparison();
    if (!this.isSelected(plant)) return '';

    const otherPlant = selected.find(p => p.name !== plant.name);
    if (!otherPlant) return '';

    if (plant[field] === otherPlant[field]) {
      return 'comparison-same';
    } else {
      return 'comparison-different';
    }
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
}
