export const calculateGajiBruto = (gajiNeto: number): number => {
  return gajiNeto / 0.95;
};

const ptkpValues: Record<string, number> = {
  "TK/0": 54000000,
  "K/0": 58500000,
  "K/1": 63000000,
  "K/2": 67500000,
  "K/3": 72000000,
};

export const calculateTax = (
  yearlyBrutoSalary: number,
  ptkp: string
): number => {
  const yearlyPTKP = ptkpValues[ptkp] || 0;
  let yearlyPKP = yearlyBrutoSalary - yearlyPTKP;

  if (yearlyPKP <= 0) return 0;

  let tax = 0;

  if (yearlyPKP > 500000000) {
    tax += (yearlyPKP - 500000000) * 0.3;
    yearlyPKP = 500000000;
  }
  if (yearlyPKP > 250000000) {
    tax += (yearlyPKP - 250000000) * 0.25;
    yearlyPKP = 250000000;
  }
  if (yearlyPKP > 60000000) {
    tax += (yearlyPKP - 60000000) * 0.15;
    yearlyPKP = 60000000;
  }
  if (yearlyPKP > 0) {
    tax += yearlyPKP * 0.05;
  }

  return tax / 12;
};
