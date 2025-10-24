import { Component, OnInit, signal, computed, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';

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
export class PlantManagerComponent implements OnInit, OnDestroy {
  // ---- Constants ---- //
  readonly dateFormat = 'yyyy/M/d, HH:mm';

  // ---- Public Properties ---- //
  editingPlant: Plant | null = null;

  // ---- Private Properties ---- //
  private nameSubscription?: Subscription;
  private scienceNameSubscription?: Subscription;
  private habitatSubscription?: Subscription;
  private somethingInterestingSubscription?: Subscription;

  // ---- Lifecycle ---- //
  constructor(
    private plantService: PlantService,
    private snackBar: MatSnackBar
  ) {
    this.nameSubscription = this.nameControl.valueChanges.subscribe(newName => {
      if (newName !== null) {
        this.currentPlant.set({
          ...this.currentPlant(),
          name: newName
        });
      }
      this.nameValid.set(this.nameControl.valid);
    });
    this.scienceNameSubscription = this.scienceNameControl.valueChanges.subscribe(newName => {
      if (newName !== null) {
        this.currentPlant.set({
          ...this.currentPlant(),
          scientificName: newName
        });
      }
      this.scienceNameValid.set(this.scienceNameControl.valid);
    });
    this.habitatSubscription = this.habitatControl.valueChanges.subscribe(newHabitat => {
      if (newHabitat !== null) {
        this.currentPlant.set({
          ...this.currentPlant(),
          habitat: newHabitat
        });
      }
      this.habitatValid.set(this.habitatControl.valid);
    });
    this.somethingInterestingSubscription = this.somethingInterestingControl.valueChanges.subscribe(newSomethingInteresting => {
      if (newSomethingInteresting !== null) {
        this.currentPlant.set({
          ...this.currentPlant(),
          somethingInteresting: newSomethingInteresting
        })
      }
      this.somethingInterestingValid.set(this.somethingInterestingControl.valid);
    })
  }

  ngOnInit() {
    this.loadPlants();
  }

  ngOnDestroy() {
    this.nameSubscription?.unsubscribe();
    this.scienceNameSubscription?.unsubscribe();
    this.habitatSubscription?.unsubscribe();
    this.somethingInterestingSubscription?.unsubscribe();
  }

  // ---- Signals/Watches ---- //

  plants = signal<Plant[]>([]);
  searchTerm = signal('');
  searchField = signal('name');
  isEditing = signal(false);
  comparisonMode = signal(false);
  selectedForComparison = signal<Plant[]>([]);

  currentPlant = signal<Plant>({
    name: '',
    scientificName: '',
    habitat: '',
    somethingInteresting: '',
    updated: new Date()
  });

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

  // Signals to track form validity (needed for computed canSave signal)
  nameValid = signal(false);
  scienceNameValid = signal(false);
  habitatValid = signal(false);
  somethingInterestingValid = signal(false);

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
    return this.nameValid() &&
      this.scienceNameValid() &&
      this.habitatValid() &&
      this.somethingInterestingValid();
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
    const newPlant = {
      name: '',
      scientificName: '',
      habitat: '',
      somethingInteresting: '',
      updated: new Date()
    };
    this.currentPlant.set(newPlant);
    this.nameControl.setValue('');
    this.scienceNameControl.setValue('');
    this.habitatControl.setValue('');
    this.somethingInterestingControl.setValue('');
    this.nameControl.markAsUntouched();
    this.scienceNameControl.markAsUntouched();
    this.habitatControl.markAsUntouched();
    this.somethingInterestingControl.markAsUntouched();
    this.updateValiditySignals();
  }

  startEdit(plant: Plant) {
    this.isEditing.set(true);
    this.editingPlant = plant;
    this.currentPlant.set({ ...plant });
    this.nameControl.setValue(plant.name);
    this.scienceNameControl.setValue(plant.scientificName);
    this.habitatControl.setValue(plant.habitat);
    this.somethingInterestingControl.setValue(plant.somethingInteresting);
    this.nameControl.markAsUntouched();
    this.scienceNameControl.markAsUntouched();
    this.habitatControl.markAsUntouched();
    this.somethingInterestingControl.markAsUntouched();
    this.revalidateName();
    this.updateValiditySignals();
  }

  startCopy(plant: Plant) {
    this.isEditing.set(true);
    this.editingPlant = null;
    const copiedPlant = {
      ...plant,
      name: `${plant.name} (Copy)`,
      updated: new Date()
    };
    this.currentPlant.set(copiedPlant);
    this.nameControl.setValue(copiedPlant.name);
    this.scienceNameControl.setValue(copiedPlant.scientificName);
    this.habitatControl.setValue(copiedPlant.habitat);
    this.somethingInterestingControl.setValue(copiedPlant.somethingInteresting);
    // Mark as touched so any errors show immediately
    this.nameControl.markAsTouched();
    this.scienceNameControl.markAsTouched();
    this.habitatControl.markAsTouched();
    this.somethingInterestingControl.markAsTouched();
    // Force validation update on all controls
    this.nameControl.updateValueAndValidity();
    this.scienceNameControl.updateValueAndValidity();
    this.habitatControl.updateValueAndValidity();
    this.somethingInterestingControl.updateValueAndValidity();
    this.updateValiditySignals();
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editingPlant = null;
    this.nameControl.setValue('');
    this.scienceNameControl.setValue('');
    this.habitatControl.setValue('');
    this.somethingInterestingControl.setValue('');
    this.nameControl.markAsUntouched();
    this.scienceNameControl.markAsUntouched();
    this.habitatControl.markAsUntouched();
    this.somethingInterestingControl.markAsUntouched();
    this.updateValiditySignals();
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

  // ---- Private Methods ---- //

  private revalidateName() {
    this.nameControl.updateValueAndValidity();
  }

  private updateValiditySignals() {
    this.nameValid.set(this.nameControl.valid);
    this.scienceNameValid.set(this.scienceNameControl.valid);
    this.habitatValid.set(this.habitatControl.valid);
    this.somethingInterestingValid.set(this.somethingInterestingControl.valid);
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
}
