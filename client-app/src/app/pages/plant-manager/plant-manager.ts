import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
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
import { uniqueNameValidator } from '../../customValidators/uniqueNameValidator';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-plant-manager',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
  // ---- Constants ---- //
  readonly dateFormat = 'yyyy/M/d, HH:mm';

  // ---- Public Properties ---- //
  editingPlant: Plant | null = null;

  // ---- Lifecycle ---- //
  constructor(
    private plantService: PlantService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPlants();
  }

  // ---- Signals/Watches ---- //

  plants = signal<Plant[]>([]);
  searchTerm = signal('');
  searchField = signal('name');
  isEditing = signal(false);
  comparisonMode = signal(false);
  selectedForComparison = signal<Plant[]>([]);

  // Form control validators. Needed for better UI of validation errors.
  nameControl = new FormControl('', [
    Validators.required,
    uniqueNameValidator(
      () => this.plants(),
      () => this.editingPlant?.name
    )
  ]);
  scienceNameControl = new FormControl('', [Validators.required]);
  habitatControl = new FormControl('', [Validators.required]);
  somethingInterestingControl = new FormControl('', [Validators.required]);

  // Convert FormControl status to signals using toSignal
  nameStatus = toSignal(this.nameControl.statusChanges, { initialValue: 'INVALID' });
  scienceNameStatus = toSignal(this.scienceNameControl.statusChanges, { initialValue: 'INVALID' });
  habitatStatus = toSignal(this.habitatControl.statusChanges, { initialValue: 'INVALID' });
  somethingInterestingStatus = toSignal(this.somethingInterestingControl.statusChanges, { initialValue: 'INVALID' });

  // ---- Computed Signals/Watches ---- //
  filteredPlants = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const field = this.searchField();

    let filtered = this.plants();

    if (term) {
      filtered = filtered.filter(p => {
        if (field === 'updated') {
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
    }

    // Sort alphabetically by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  });

  isComparing = computed(() => this.selectedForComparison().length === 2);

  canSave = computed(() => {
    return this.nameStatus() === 'VALID' &&
      this.scienceNameStatus() === 'VALID' &&
      this.habitatStatus() === 'VALID' &&
      this.somethingInterestingStatus() === 'VALID';
  });

  displayedColumns = computed(() =>
    this.comparisonMode()
      ? ['select', 'name', 'scientificName', 'habitat', 'somethingInteresting', 'updated', 'actions']
      : ['name', 'scientificName', 'habitat', 'somethingInteresting', 'updated', 'actions']
  );

  // ---- Public Methods ---- //

  loadPlants() {
    this.plantService.getPlants().subscribe({
      next: (data) => {
        this.plants.set(data);
        this.revalidateName();
      },
      error: (err) => this.showError('Failed to load plants')
    });
  }

  clearSearch() {
    this.searchTerm.set('');
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
    this.nameControl.reset('');
    this.scienceNameControl.reset('');
    this.habitatControl.reset('');
    this.somethingInterestingControl.reset('');
  }

  startEdit(plant: Plant) {
    this.isEditing.set(true);
    this.editingPlant = plant;
    this.nameControl.reset(plant.name);
    this.scienceNameControl.reset(plant.scientificName);
    this.habitatControl.reset(plant.habitat);
    this.somethingInterestingControl.reset(plant.somethingInteresting);
  }

  startCopy(plant: Plant) {
    this.isEditing.set(true);
    this.editingPlant = null;
    this.nameControl.setValue(`${plant.name} (Copy)`);
    this.scienceNameControl.setValue(plant.scientificName);
    this.habitatControl.setValue(plant.habitat);
    this.somethingInterestingControl.setValue(plant.somethingInteresting);
    this.nameControl.markAsTouched();
    this.scienceNameControl.markAsTouched();
    this.habitatControl.markAsTouched();
    this.somethingInterestingControl.markAsTouched();
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editingPlant = null;
  }

  save() {
    if (!this.canSave()) return;

    const plant = {
      name: this.nameControl.value!,
      scientificName: this.scienceNameControl.value!,
      habitat: this.habitatControl.value!,
      somethingInteresting: this.somethingInterestingControl.value!,
      updated: new Date()
    };

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

  // ---- Private Methods ---- //

  private revalidateName() {
    this.nameControl.updateValueAndValidity();
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
}
