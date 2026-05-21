// PulseSense — Unit Conversion Utilities
// All vitals stored in base units: °C, kg, mg/dL

export const tempCtoF = (c: number): number => parseFloat(((c * 9) / 5 + 32).toFixed(1));
export const tempFtoC = (f: number): number => parseFloat(((f - 32) * 5 / 9).toFixed(1));

export const kgToLbs = (kg: number): number => parseFloat((kg * 2.20462).toFixed(1));
export const lbsToKg = (lbs: number): number => parseFloat((lbs / 2.20462).toFixed(1));

export const mgdlToMmol = (mg: number): number => parseFloat((mg / 18.0182).toFixed(2));
export const mmolToMgdl = (mm: number): number => parseFloat((mm * 18.0182).toFixed(0));

export const cmToFeetInches = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

export const feetInchesToCm = (feet: number, inches: number): number => {
  return parseFloat(((feet * 12 + inches) * 2.54).toFixed(1));
};

export function formatTemp(value: number, unit: 'C' | 'F', displayUnit: 'C' | 'F'): string {
  const display = unit === displayUnit ? value : displayUnit === 'F' ? tempCtoF(value) : tempFtoC(value);
  return `${display}°${displayUnit}`;
}

export function formatWeight(value: number, unit: 'kg' | 'lbs', displayUnit: 'kg' | 'lbs'): string {
  const display = unit === displayUnit ? value : displayUnit === 'lbs' ? kgToLbs(value) : lbsToKg(value);
  return `${display} ${displayUnit}`;
}

export function formatGlucose(value: number, unit: 'mg/dL' | 'mmol/L', displayUnit: 'mg/dL' | 'mmol/L'): string {
  const display = unit === displayUnit ? value : displayUnit === 'mmol/L' ? mgdlToMmol(value) : mmolToMgdl(value);
  return `${display} ${displayUnit}`;
}
