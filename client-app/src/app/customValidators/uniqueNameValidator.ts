import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Plant } from '../models/plant';

/**
 * Validator factory that checks if a plant name is unique
 * @param existingPlants Function that returns the list of existing plants
 * @param editingPlantName Function that returns the name of the plant being edited (if any)
 * @returns ValidatorFn
 */
export function uniqueNameValidator(
  existingPlants: () => Plant[],
  editingPlantName: () => string | undefined
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const currentName = control.value?.trim().toLowerCase() || '';
    if (!currentName) return null;

    const editingName = editingPlantName()?.toLowerCase();

    const exists = existingPlants().some(plant =>
      plant.name.toLowerCase() === currentName &&
      plant.name.toLowerCase() !== editingName
    );

    return exists ? { nameExists: true } : null;
  };
}
