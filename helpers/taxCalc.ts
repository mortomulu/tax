// export const calculateBrutoSalary = (gajiNeto: number): number => {
//   return gajiNeto / 0.95;
// };

const ptkpValues: Record<string, number> = {
  "TK/0": 54000000,
  "K/0": 58500000,
  "K/1": 63000000,
  "K/2": 67500000,
  "K/3": 72000000,
};

// type TER = {
//   id: string;
//   typeTer: number;
//   startRange: number;
//   endRange: number | null;
//   ter: number;
// };

export const getTypeTer = (ptkp: string): string | null => {
  if (ptkp === "TK/0" || ptkp === "TK/1" || ptkp === "K/0") {
    return "TER A";
  } else if (
    ptkp === "TK/2" ||
    ptkp === "TK/3" ||
    ptkp === "K/1" ||
    ptkp === "K/2"
  ) {
    return "TER B";
  } else if (ptkp === "K/3") {
    return "TER C";
  } else {
    return null;
  }
};

export const calculateBrutoSalary = (
  thp: number,
  positionAllowance: number,
  incentive: number,
  overtimeAllowance: number,
  jkk: number,
  jkm: number,
  bpjs: number,
  bonus: number,
  thr: number
): number => {
  return (
    thp +
    positionAllowance +
    incentive +
    overtimeAllowance +
    jkk +
    jkm +
    bpjs +
    bonus +
    thr
  );
};

export const getTerArt21 = (
  brutoSalary: number,
  typeTer: string | null,
  terData: {
    startRange: number;
    endRange: number | null;
    ter: number;
    typeTer: string;
    id: number;
    created_at: string;
  }[]
) => {
  if (typeof brutoSalary !== "number" || !typeTer || !terData?.length)
    return null;

  const normalizedTypeTer = typeTer.trim().toLowerCase();

  const found = terData.find((item) => {
    const isTypeMatch = item.typeTer.trim().toLowerCase() === normalizedTypeTer;
    const isInRange =
      brutoSalary >= item.startRange &&
      (item.endRange === null || brutoSalary <= item.endRange);
    return isTypeMatch && isInRange;
  });

  return found?.ter ?? null;
};

export const calcMonthlyTax = (brutoSalary: number, terArt: number) => {
  return Math.round(brutoSalary * terArt / 100);
};