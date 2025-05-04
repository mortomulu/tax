interface TaxBracket {
  id: number;
  startRange: number;
  endRange: number | null;
  percentag: number;
}

const tarifProgressif = (): TaxBracket[] => [
  { id: 1, startRange: 0, endRange: 60000000, percentag: 5 },
  { id: 2, startRange: 60000000, endRange: 250000000, percentag: 15 },
  { id: 3, startRange: 250000000, endRange: 500000000, percentag: 25 },
  { id: 4, startRange: 500000000, endRange: 5000000000, percentag: 30 },
  { id: 5, startRange: 5000000000, endRange: null, percentag: 35 },
];

export const calcDecTax = (totalBrutoSalary: number, amount: number) => {
  return totalBrutoSalary - amount;
};

export const calcDecTaxFinal = (pkp: number): number => {
  let totalTax = 0;
  const brackets = tarifProgressif();

  for (const bracket of brackets) {
    const { startRange, endRange, percentag } = bracket;

    if (pkp > startRange) {
      const taxableAmount = endRange
        ? Math.min(pkp, endRange) - startRange
        : pkp - startRange;

      totalTax += (taxableAmount * percentag) / 100;
    }
  }

  return Math.round(totalTax);
};
