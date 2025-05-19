export const anotherFormatRupiah = (value: string | number | undefined): string => {
  if (value === undefined || value === null || value === "") return "";

  const numberString = value.toString().replace(/\D/g, "");
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
