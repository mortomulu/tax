import { NextApiRequest, NextApiResponse } from "next";
import ExcelJS from "exceljs";
import { supabase } from "@/utils/supabase";

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res
      .status(400)
      .json({ error: "ID is required and must be a string." });
  }

  const { data: monthlyTaxes, error: fetchMonthlyTaxesError } = await supabase
    .from("monthly_tax_archive")
    .select("*")
    .eq("id_summary", id);

  if (fetchMonthlyTaxesError) {
    return res.status(500).json({
      message: "Gagal ambil data monthly tax",
      error: fetchMonthlyTaxesError,
    });
  }

  const { data: employees, error: fetchEmployeesError } = await supabase
    .from("employees")
    .select("*");

  if (fetchEmployeesError) {
    return res.status(500).json({
      message: "Gagal ambil data employees",
      error: fetchEmployeesError,
    });
  }

  const { data: companyProfile, error: companyError } = await supabase
    .from("company_profile")
    .select("company_name, company_npwp, selected_npwp, selected_name")
    .eq("id", 1)
    .single();

  if (companyError) {
    return res.status(500).json({
      message: "Gagal ambil data profil perusahaan",
      error: companyError,
    });
  }

  // const activeAdmin = employees.find((emp) => emp.is_finance_admin);

  const workbook = new ExcelJS.Workbook();

  // === SHEET 1 ===
  const rekapSheet: any = workbook.addWorksheet("Rekap", {
    views: [{ showGridLines: false }],
  });

  // Column widths (A-H)
  rekapSheet.columns = [
    { width: 5 },
    { width: 15 },
    { width: 15 },
    { width: 10 },
    { width: 15 },
    { width: 15 },
    { width: 10 },
    { width: 5 },
  ];

  // Style definitions
  const grayFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9D9D9" },
  };
  const grayDarkFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "808080" },
  };
  const blueFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  const whiteFont = { bold: true, color: { argb: "FFFFFFFF" } };
  const centerAlign = { vertical: "middle", horizontal: "center" };
  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FF000000" } },
    left: { style: "thin", color: { argb: "FF000000" } },
    bottom: { style: "thin", color: { argb: "FF000000" } },
    right: { style: "thin", color: { argb: "FF000000" } },
  };

  // Apply gray to columns A and H for all rows
  for (let row = 1; row <= 5; row++) {
    rekapSheet.getCell(`A${row}`).fill = grayDarkFill;
    rekapSheet.getCell(`H${row}`).fill = grayDarkFill;
  }

  // Apply gray to rows 1 and 5 for all columns
  for (let col = 1; col <= 8; col++) {
    rekapSheet.getRow(1).getCell(col).fill = grayDarkFill;
    rekapSheet.getRow(5).getCell(col).fill = grayDarkFill;
  }

  // Row 2 (Tahun Pajak & Masa Pajak)
  rekapSheet.mergeCells("B2:C2");
  rekapSheet.mergeCells("E2:F2");
  rekapSheet.getCell("B2").value = "Tahun Pajak";
  rekapSheet.getCell("D2").value = monthlyTaxes[0].year;
  rekapSheet.getCell("E2").value = "Masa Pajak";
  rekapSheet.getCell("G2").value = monthlyTaxes[0].month;

  // Style row 2 with font sizes
  ["B2", "E2"].forEach((cell) => {
    rekapSheet.getCell(cell).fill = grayFill;
    rekapSheet.getCell(cell).font = { size: 16 };
    rekapSheet.getCell(cell).alignment = centerAlign;
    rekapSheet.getCell(cell).border = borderStyle;
  });

  ["D2", "G2"].forEach((cell) => {
    rekapSheet.getCell(cell).font = { size: 20 };
    rekapSheet.getCell(cell).alignment = centerAlign;
    rekapSheet.getCell(cell).border = borderStyle;
  });

  // Row 3
  rekapSheet.mergeCells("B3:F3");
  rekapSheet.getCell("B3").value = "Jumlah Bukti Potong PPh Pasal 21";
  rekapSheet.getCell("G3").value = monthlyTaxes?.length;

  // Style row 3 with font sizes
  rekapSheet.getCell("B3").font = { size: 13 };
  rekapSheet.getCell("B3").fill = grayFill;
  rekapSheet.getCell("B3").alignment = centerAlign;
  rekapSheet.getCell("B3").border = borderStyle;

  rekapSheet.getCell("G3").font = { size: 20 };
  rekapSheet.getCell("G3").alignment = centerAlign;
  rekapSheet.getCell("G3").border = borderStyle;

  // Apply border to merged cells in B3:F3
  for (let col = 2; col <= 6; col++) {
    rekapSheet.getRow(3).getCell(col).border = borderStyle;
  }

  // Row 4
  rekapSheet.mergeCells("B4:F4");
  rekapSheet.getCell("B4").value = "Jumlah Bukti Potong PPh Pasal 26";
  rekapSheet.getCell("G4").value = 0;

  // Style row 4 with font sizes
  rekapSheet.getCell("B4").font = { size: 13 };
  rekapSheet.getCell("B4").fill = grayFill;
  rekapSheet.getCell("B4").alignment = centerAlign;
  rekapSheet.getCell("B4").border = borderStyle;

  rekapSheet.getCell("G4").font = { size: 20 };
  rekapSheet.getCell("G4").alignment = centerAlign;
  rekapSheet.getCell("G4").border = borderStyle;

  // Apply border to merged cells in B4:F4
  for (let col = 2; col <= 6; col++) {
    rekapSheet.getRow(4).getCell(col).border = borderStyle;
  }

  // === SHEET 2 ===
  const sheet21 = workbook.addWorksheet("21");
  const data = monthlyTaxes.map((item, index) => ({
    No: index + 1,
    "Tanggal Pemotongan (dd/MM/yyyy)": `1/${String(item.month).padStart(
      2,
      "0"
    )}/${item.year}`,
    "Penerima Penghasilan? (NPWP/NIK)": item.type_id || "NIK",
    "NPWP (tanpa format/tanda baca)": (item.npwp || "").replace(/\D/g, ""),
    "NIK (tanpa format/tanda baca)": (item.nik || "").replace(/\D/g, ""),
    "Nama Penerima Penghasilan Sesuai NIK": item.employee_name || "",
    "Alamat Penerima Penghasilan Sesuai NIK": item.address || "",
    "Kode Objek Pajak": "21-100-01",
    "Penandatangan Menggunakan? (NPWP/NIK)": "NPWP",
    "NPWP Penandatangan (tanpa format/tanda baca)":
      companyProfile.selected_npwp || "",
    "NIK Penandatangan (tanpa format/tanda baca)": "".replace(/\D/g, ""),
    "Kode PTKP": item.ptkp || "",
    "Pegawai Harian? (Ya/Tidak)": "Tidak",
    "Menggunakan Gross Up? (Ya/Tidak)": "Tidak",
    "Penghasilan Bruto": item.bruto_salary || 0,
    "Terdapat Akumulasi Penghasilan Bruto Sebelumnya? (Ya/Tidak)": "",
    "Akumulasi Penghasilan Bruto Sebelumnya": "",
    "Mendapatkan Fasilitas ? (N/SKB/DTP)": "N",
    "Nomor SKB/Nomor DTP": "",
  }));

  // Add empty row 1 (will be styled green)
  sheet21.addRow([]);

  // Header row (row 2)
  const headers = Object.keys(data[0]);
  const headerRow = sheet21.addRow(headers);

  // Data rows (starting from row 3)
  data.forEach((row) => {
    sheet21.addRow(Object.values(row));
  });

  // New blue color definition
  const blueFill21 = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F81BD" }, // #4F81BD
  };

  // Style definitions for sheet 21
  const greenFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF00B050" },
  };
  const headerFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEEECE1" },
  };
  const headerFont = { bold: true, size: 11, color: { argb: "FF000000" } };

  // Header alignment (top-center with wrap)
  const headerAlign = {
    vertical: "top",
    horizontal: "center",
    wrapText: true,
  };

  // Data alignment (left, no wrap)
  const dataAlign = {
    vertical: "top",
    horizontal: "left",
    wrapText: false,
  };

  // No column alignment (center, no wrap)
  const noColumnAlign = {
    vertical: "middle",
    horizontal: "center",
    wrapText: false,
  };

  // Style row 1 (green background until column S)
  for (let col = 1; col <= 19; col++) {
    const cell: any = sheet21.getRow(1).getCell(col);
    cell.fill = greenFill;
    cell.value = "";
  }

  // Style header row (row 2)
  headerRow.eachCell((cell: any, colNumber: number) => {
    cell.fill = colNumber === 19 ? blueFill21 : headerFill;
    cell.font = headerFont;
    cell.alignment = headerAlign;
    cell.border = borderStyle;
  });

  // Set custom column widths
  sheet21.columns = [
    { key: "No", width: 5 },
    { key: "Tanggal Pemotongan (dd/MM/yyyy)", width: 20 },
    { key: "Penerima Penghasilan? (NPWP/NIK)", width: 14 },
    { key: "NPWP (tanpa format/tanda baca)", width: 20 },
    { key: "NIK (tanpa format/tanda baca)", width: 20 },
    { key: "Nama Penerima Penghasilan Sesuai NIK", width: 22 },
    { key: "Alamat Penerima Penghasilan Sesuai NIK", width: 22 },
    { key: "Kode Objek Pajak", width: 17 },
    { key: "Penandatangan Menggunakan? (NPWP/NIK)", width: 22 },
    { key: "NPWP Penandatangan (tanpa format/tanda baca)", width: 22 },
    { key: "NIK Penandatangan (tanpa format/tanda baca)", width: 18 },
    { key: "Kode PTKP", width: 15 },
    { key: "Pegawai Harian? (Ya/Tidak)", width: 15 },
    { key: "Menggunakan Gross Up? (Ya/Tidak)", width: 17 },
    { key: "Penghasilan Bruto", width: 16 },
    {
      key: "Terdapat Akumulasi Penghasilan Bruto Sebelumnya? (Ya/Tidak)",
      width: 20,
    },
    { key: "Akumulasi Penghasilan Bruto Sebelumnya", width: 22 },
    { key: "Mendapatkan Fasilitas ? (N/SKB/DTP)", width: 22 },
    { key: "Nomor SKB/Nomor DTP", width: 22 },
  ];

  // Add borders and alignment to all data cells
  for (let i = 3; i <= sheet21.rowCount; i++) {
    const row = sheet21.getRow(i);
    row.eachCell((cell: any, colNumber) => {
      cell.border = borderStyle;

      // Apply different alignment based on column
      if (colNumber === 1) {
        // No column
        cell.alignment = noColumnAlign;
      } else {
        // All other columns
        cell.alignment = dataAlign;
      }
    });
  }

  // === 26 SHEET ===
  const sheet26 = workbook.addWorksheet("26");
  const data26 = [
    {
      No: null,
      "Tanggal Pemotongan (dd/MM/yyyy)": null,
      "TIN (dengan format/tanda baca)": null,
      "Nama Penerima Penghasilan": null,
      "Alamat Penerima Penghasilan": null,
      "No Paspor Penerima Penghasilan": null,
      "Kode Negara": null,
      "Penandatangan Menggunakan? (NPWP/NIK)": null,
      "NPWP Penandatangan (tanpa format/tanda baca)": null,
      "NIK Penandatangan (tanpa format/tanda baca)": null,
      "Penghasilan Bruto": null,
      "Mendapatkan Fasilitas ? (N/SKD)": null,
      "Nomor Tanda Terima SKD": null,
      "Tarif SKD": null,
    },
  ];

  // Add empty row 1 (will be styled green)
  sheet26.addRow([]);

  // Header row (row 2)
  const headers26 = Object.keys(data26[0]);
  const headerRow26 = sheet26.addRow(headers26);

  // Style row 1 (green background until column S)
  for (let col = 1; col <= 14; col++) {
    const cell: any = sheet26.getRow(1).getCell(col);
    cell.fill = greenFill;
    cell.value = "";
  }

  headerRow26.eachCell((cell: any, colNumber) => {
    cell.fill = colNumber === 13 || colNumber === 14 ? blueFill21 : headerFill;
    cell.font = headerFont;
    cell.alignment = headerAlign;
    cell.border = borderStyle;
  });

  // Set custom column widths
  sheet26.columns = [
    { key: "No", width: 5 },
    { key: "Tanggal Pemotongan (dd/MM/yyyy)", width: 20 },
    { key: "TIN (dengan format/tanda baca)", width: 14 },
    { key: "Nama Penerima Penghasilan", width: 20 },
    { key: "Alamat Penerima Penghasilan", width: 20 },
    { key: "No Paspor Penerima Penghasilan", width: 22 },
    { key: "Kode Negara", width: 22 },
    { key: "Penandatangan Menggunakan? (NPWP/NIK)", width: 22 },
    { key: "NPWP Penandatangan (tanpa format/tanda baca)", width: 22 },
    { key: "NIK Penandatangan (tanpa format/tanda baca)", width: 18 },
    { key: "Penghasilan Bruto", width: 16 },
    { key: "Mendapatkan Fasilitas ? (N/SKD)", width: 22 },
    { key: "Nomor Tanda Terima SKD", width: 17 },
    { key: "Tarif SKD", width: 20 },
  ];

  // === ref daftar objek pajak tab ===
  const taxObjectSheet = workbook.addWorksheet("Ref Daftar Objek Pajak", {
    properties: { tabColor: { argb: "FF00B050" } },
  });

  // Sample data
  const taxObjectData = [
    {
      "Kode Objek Pajak": "21-100-01",
      "Nama Objek Pajak": "Pegawai Tetap",
      KAP: "411121",
      KJS: "100",
      Keterangan: "TIDAK FINAL",
    },
    {
      "Kode Objek Pajak": "21-100-02",
      "Nama Objek Pajak": "Penerima Pensiun Berkala",
      KAP: "411121",
      KJS: "100",
      Keterangan: "TIDAK FINAL",
    },
    {
      "Kode Objek Pajak": "21-100-03",
      "Nama Objek Pajak": "Pegawai Tidak Tetap",
      KAP: "411121",
      KJS: "100",
      Keterangan: "TIDAK FINAL",
    },
    {
      "Kode Objek Pajak": "21-100-04",
      "Nama Objek Pajak": "Distributor Pemasaran Berjenjang",
      KAP: "411121",
      KJS: "100",
      Keterangan: "TIDAK FINAL",
    },
    {
      "Kode Objek Pajak": "21-100-05",
      "Nama Objek Pajak": "Agen Asuransi",
      KAP: "411121",
      KJS: "100",
      Keterangan: "TIDAK FINAL",
    },
    {
      "Kode Objek Pajak": "21-100-06",
      "Nama Objek Pajak": "Penjaja Barang Dagangan",
      KAP: "411121",
      KJS: "100",
      Keterangan: "TIDAK FINAL",
    },
    {
      "Kode Objek Pajak": "21-100-07",
      "Nama Objek Pajak": "Tenaga Ahli",
      KAP: "411121",
      KJS: "100",
      Keterangan: "TIDAK FINAL",
    },
    {
      "Kode Objek Pajak": "21-100-09",
      "Nama Objek Pajak": "Bukan Pegawai Lainnya",
      KAP: "411121",
      KJS: "100",
      Keterangan: "TIDAK FINAL",
    },
    {
      "Kode Objek Pajak": "21-100-10",
      "Nama Objek Pajak":
        "Anggota Dewan Komisaris atau Dewan Pengawas yang Menerima Imbalan Secara Tidak Teratur",
      KAP: "411121",
      KJS: "100",
      Keterangan: "TIDAK FINAL",
    },
    {
      "Kode Objek Pajak": "21-100-11",
      "Nama Objek Pajak":
        "Mantan Pegawai yang Menerima Jasa Produksi, Tantiem, Bonus atau Imbalan Kepada Mantan Pegawai",
      KAP: "411121",
      KJS: "100",
      Keterangan: "TIDAK FINAL",
    },
    {
      "Kode Objek Pajak": "21-100-12",
      "Nama Objek Pajak": "Pegawai yang Melakukan Penarikan Uang Pensiun",
      KAP: "411121",
      KJS: "100",
      Keterangan: "TIDAK FINAL",
    },
    {
      "Kode Objek Pajak": "21-100-13",
      "Nama Objek Pajak": "Peserta Kegiatan",
      KAP: "411121",
      KJS: "100",
      Keterangan: "TIDAK FINAL",
    },
    {
      "Kode Objek Pajak": "21-401-01",
      "Nama Objek Pajak": "Uang Pesangon yang Dibayarkan Sekaligus",
      KAP: "411121",
      KJS: "401",
      Keterangan: "FINAL",
    },
    {
      "Kode Objek Pajak": "21-401-02",
      "Nama Objek Pajak":
        "Penerima Uang Manfaat Pensiun, Tunjangan Hari Tua, atau Jaminan Hari Tua yang Dibayarkan Sekaligus",
      KAP: "411121",
      KJS: "401",
      Keterangan: "FINAL",
    },
  ];

  // Style definitions
  const headerFillTaxObject = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9D9D9" },
  };

  // Set column widths (B to F)
  taxObjectSheet.columns = [
    { key: "A", width: 5 },
    { key: "Kode Objek Pajak", width: 20 },
    { key: "Nama Objek Pajak", width: 120 },
    { key: "KAP", width: 15 },
    { key: "KJS", width: 15 },
    { key: "Keterangan", width: 20 },
  ];

  // Add headers starting at B2
  const headersTaxObject = Object.keys(taxObjectData[0]);
  const headerRowTaxObject = taxObjectSheet.getRow(2);

  headersTaxObject.forEach((header, index) => {
    const cell: any = headerRowTaxObject.getCell(index + 2);
    cell.value = header;
    cell.fill = headerFillTaxObject;
    cell.font = { bold: true };
    cell.border = borderStyle;
    cell.alignment = { vertical: "middle", horizontal: "start" };
  });

  // Add data starting at B3
  taxObjectData.forEach((data, rowIndex) => {
    const row = taxObjectSheet.getRow(rowIndex + 3);
    Object.values(data).forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 2);
      cell.value = value;
      cell.border = borderStyle;
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  });

  // Freeze header row
  taxObjectSheet.views = [{ state: "frozen", ySplit: 1 }];

  // === ref daftar objek kode negara ===
  const countryCodeSheet = workbook.addWorksheet("Ref Daftar Kode Negara", {
    properties: { tabColor: { argb: "FF00B050" } },
  });

  // Sample data
  const countryCodeData = [
    { KODE: "AFG", "Nama Negara": "Afghanistan" },
    { KODE: "AGO", "Nama Negara": "Angola" },
    { KODE: "ALB", "Nama Negara": "Albania" },
    { KODE: "AND", "Nama Negara": "Andorra" },
    { KODE: "ARE", "Nama Negara": "United Arab Emirates" },
    { KODE: "ARG", "Nama Negara": "Argentina" },
    { KODE: "ARM", "Nama Negara": "Armenia" },
    { KODE: "ATG", "Nama Negara": "Antigua dan Barbuda" },
    { KODE: "AUS", "Nama Negara": "Australia" },
    { KODE: "AUT", "Nama Negara": "Austria" },
    { KODE: "AZE", "Nama Negara": "Azerbaijan" },
    { KODE: "BDI", "Nama Negara": "Burundi" },
    { KODE: "BEL", "Nama Negara": "Belgium" },
    { KODE: "BEN", "Nama Negara": "Benin" },
    { KODE: "BFA", "Nama Negara": "Burkina Faso" },
    { KODE: "BGD", "Nama Negara": "Bangladesh" },
    { KODE: "BGR", "Nama Negara": "Bulgaria" },
    { KODE: "BHR", "Nama Negara": "Bahrain" },
    { KODE: "BHS", "Nama Negara": "Bahamas" },
    { KODE: "BIH", "Nama Negara": "Bosnia dan Herzegovina" },
    { KODE: "BLR", "Nama Negara": "Belarus" },
    { KODE: "BLZ", "Nama Negara": "Belize" },
    { KODE: "BOL", "Nama Negara": "Bolivia" },
    { KODE: "BRA", "Nama Negara": "Brazil" },
    { KODE: "BRB", "Nama Negara": "Barbados" },
    { KODE: "BRN", "Nama Negara": "Brunei Darussalam" },
    { KODE: "BTN", "Nama Negara": "Bhutan" },
    { KODE: "BWA", "Nama Negara": "Bostwana" },
    { KODE: "CAF", "Nama Negara": "Central African Republic" },
    { KODE: "CAN", "Nama Negara": "Canada" },
    { KODE: "CHE", "Nama Negara": "Switzerland" },
    { KODE: "CHL", "Nama Negara": "Chile" },
    { KODE: "CHN", "Nama Negara": "China" },
    { KODE: "CIV", "Nama Negara": "Pantai Gading" },
    { KODE: "CMR", "Nama Negara": "Cameroon" },
    { KODE: "COD", "Nama Negara": "Congo - the Democratic Republic of the" },
    { KODE: "COG", "Nama Negara": "Congo" },
    { KODE: "COL", "Nama Negara": "Colombia" },
    { KODE: "COM", "Nama Negara": "Comoros" },
    { KODE: "CPV", "Nama Negara": "Cabo Verde" },
    { KODE: "CRI", "Nama Negara": "Costa Rica" },
    { KODE: "CUB", "Nama Negara": "Cuba" },
    { KODE: "CYP", "Nama Negara": "Cyprus" },
    { KODE: "CZE", "Nama Negara": "Republik Ceko" },
    { KODE: "DEU", "Nama Negara": "Germany" },
    { KODE: "DJI", "Nama Negara": "Djibouti" },
    { KODE: "DMA", "Nama Negara": "Dominica" },
    { KODE: "DNK", "Nama Negara": "Denmark" },
    { KODE: "DOM", "Nama Negara": "Dominican Republic" },
    { KODE: "DSA", "Nama Negara": "Aljazair" },
    { KODE: "ECU", "Nama Negara": "Ekuador" },
    { KODE: "EGY", "Nama Negara": "Egypt" },
    { KODE: "ERI", "Nama Negara": "Eritrea" },
    { KODE: "ESP", "Nama Negara": "Spain" },
    { KODE: "EST", "Nama Negara": "Estonia" },
    { KODE: "ETH", "Nama Negara": "Ethiopia" },
    { KODE: "FIN", "Nama Negara": "Finlandia" },
    { KODE: "FJI", "Nama Negara": "Fiji" },
    { KODE: "FRA", "Nama Negara": "France" },
    { KODE: "FSM", "Nama Negara": "Micronesia" },
    { KODE: "GAB", "Nama Negara": "Gabon" },
    { KODE: "GBR", "Nama Negara": "United Kingdom" },
    { KODE: "GEO", "Nama Negara": "Georgia" },
    { KODE: "GHA", "Nama Negara": "Ghana" },
    { KODE: "GIN", "Nama Negara": "Guinea" },
    { KODE: "GMB", "Nama Negara": "Gambia" },
    { KODE: "GNB", "Nama Negara": "Guinea-Bissau" },
    { KODE: "GNQ", "Nama Negara": "Equatorial Guinea" },
    { KODE: "GRC", "Nama Negara": "Greece" },
    { KODE: "GRD", "Nama Negara": "Grenada" },
    { KODE: "GTM", "Nama Negara": "Guatemala" },
    { KODE: "GUY", "Nama Negara": "Guyana" },
    { KODE: "HKG", "Nama Negara": "Hong Kong" },
    { KODE: "HND", "Nama Negara": "Honduras" },
    { KODE: "HRV", "Nama Negara": "Croatia" },
    { KODE: "HTI", "Nama Negara": "Haiti" },
    { KODE: "HUN", "Nama Negara": "Hungary" },
    { KODE: "IND", "Nama Negara": "India" },
    { KODE: "IRL", "Nama Negara": "Irlandia" },
    { KODE: "IRN", "Nama Negara": "Iran" },
    { KODE: "IRQ", "Nama Negara": "Iraq" },
    { KODE: "ISL", "Nama Negara": "Iceland" },
    { KODE: "ISR", "Nama Negara": "Israel" },
    { KODE: "ITA", "Nama Negara": "Italy" },
    { KODE: "JAM", "Nama Negara": "Jamaica" },
    { KODE: "JOR", "Nama Negara": "Jordan" },
    { KODE: "JPN", "Nama Negara": "Japan" },
    { KODE: "KAZ", "Nama Negara": "Kazakhstan" },
    { KODE: "KEN", "Nama Negara": "Kenya" },
    { KODE: "KGZ", "Nama Negara": "Kyrgyzstan" },
    { KODE: "KHM", "Nama Negara": "Cambodia" },
    { KODE: "KIR", "Nama Negara": "Kiribati" },
    { KODE: "KNA", "Nama Negara": "Saint Kitts dan Nevis" },
    { KODE: "KOR", "Nama Negara": "Korea, Republic of" },
    { KODE: "KWT", "Nama Negara": "Kuwait" },
    { KODE: "LAO", "Nama Negara": "Laos" },
    { KODE: "LBN", "Nama Negara": "Lebanon" },
    { KODE: "LBR", "Nama Negara": "Liberia" },
    { KODE: "LBY", "Nama Negara": "Libya" },
    { KODE: "LCA", "Nama Negara": "Saint Lucia" },
    { KODE: "LIE", "Nama Negara": "Liechtenstein" },
    { KODE: "LKA", "Nama Negara": "Sri Lanka" },
    { KODE: "LSO", "Nama Negara": "Lesotho" },
    { KODE: "LTU", "Nama Negara": "Lituania" },
    { KODE: "LUX", "Nama Negara": "Luxembourg" },
    { KODE: "LVA", "Nama Negara": "Latvia" },
    { KODE: "MAR", "Nama Negara": "Morocco" },
    { KODE: "MCO", "Nama Negara": "Monaco" },
    { KODE: "MDA", "Nama Negara": "Moldova, Republic of" },
    { KODE: "MDG", "Nama Negara": "Madagascar" },
    { KODE: "MDV", "Nama Negara": "Maldives" },
    { KODE: "MEX", "Nama Negara": "Mexico" },
    { KODE: "MHL", "Nama Negara": "Marshall Islands" },
    { KODE: "MKD", "Nama Negara": "Macedonia" },
    { KODE: "MLI", "Nama Negara": "Mali" },
    { KODE: "MLT", "Nama Negara": "Malta" },
    { KODE: "MMR", "Nama Negara": "Myanmar" },
    { KODE: "MNE", "Nama Negara": "Montenegro" },
    { KODE: "MNG", "Nama Negara": "Mongolia" },
    { KODE: "MOZ", "Nama Negara": "Mozambique" },
    { KODE: "MRT", "Nama Negara": "Mauritania" },
    { KODE: "MUS", "Nama Negara": "Mauritius" },
    { KODE: "MWI", "Nama Negara": "Malawi" },
    { KODE: "MYS", "Nama Negara": "Malaysia" },
    { KODE: "NAM", "Nama Negara": "Namibia" },
    { KODE: "NER", "Nama Negara": "Niger" },
    { KODE: "NGA", "Nama Negara": "Nigeria" },
    { KODE: "NIC", "Nama Negara": "Nicaragua" },
    { KODE: "NLD", "Nama Negara": "Netherlands" },
    { KODE: "NOR", "Nama Negara": "Norway" },
    { KODE: "NPL", "Nama Negara": "Nepal" },
    { KODE: "NRU", "Nama Negara": "Nauru" },
    { KODE: "NZL", "Nama Negara": "New Zealand" },
    { KODE: "OMN", "Nama Negara": "Oman" },
    { KODE: "PAK", "Nama Negara": "Pakistan" },
    { KODE: "PAN", "Nama Negara": "Panama" },
    { KODE: "PER", "Nama Negara": "Peru" },
    { KODE: "PHL", "Nama Negara": "Philippines" },
    { KODE: "PLW", "Nama Negara": "Palau" },
    { KODE: "PNG", "Nama Negara": "Papua New Guinea" },
    { KODE: "POL", "Nama Negara": "Poland" },
    { KODE: "PRK", "Nama Negara": "North Korea" },
    { KODE: "PRT", "Nama Negara": "Portugal" },
    { KODE: "PRY", "Nama Negara": "Paraguay" },
    { KODE: "QAT", "Nama Negara": "Qatar" },
    { KODE: "ROU", "Nama Negara": "Romania" },
    { KODE: "RUS", "Nama Negara": "Russian Federation" },
    { KODE: "RWA", "Nama Negara": "Rwanda" },
    { KODE: "SAU", "Nama Negara": "Saudi Arabia" },
    { KODE: "SDN", "Nama Negara": "Sudan" },
    { KODE: "SEN", "Nama Negara": "Senegal" },
    { KODE: "SGP", "Nama Negara": "Singapore" },
    { KODE: "SLB", "Nama Negara": "Solomon Islands" },
    { KODE: "SLE", "Nama Negara": "Sierra Leone" },
    { KODE: "SLV", "Nama Negara": "El Salvador" },
    { KODE: "SMR", "Nama Negara": "San Marino" },
    { KODE: "SOM", "Nama Negara": "Somalia" },
    { KODE: "SRB", "Nama Negara": "Serbia" },
    { KODE: "STP", "Nama Negara": "Sao Tome dan Principe" },
    { KODE: "SUR", "Nama Negara": "Suriname" },
    { KODE: "SVK", "Nama Negara": "Slovakia" },
    { KODE: "SVN", "Nama Negara": "Slovenia" },
    { KODE: "SWE", "Nama Negara": "Sweden" },
    { KODE: "SWZ", "Nama Negara": "Swaziland" },
    { KODE: "SYC", "Nama Negara": "Seychelles" },
    { KODE: "SYR", "Nama Negara": "Syria" },
    { KODE: "TCD", "Nama Negara": "Chad" },
    { KODE: "TGO", "Nama Negara": "Togo" },
    { KODE: "THA", "Nama Negara": "Thailand" },
    { KODE: "TJK", "Nama Negara": "Tajikistan" },
    { KODE: "TKM", "Nama Negara": "Turkmenistan" },
    { KODE: "TLS", "Nama Negara": "Timor Leste" },
    { KODE: "TON", "Nama Negara": "Tonga" },
    { KODE: "TTO", "Nama Negara": "Trinidad dan Tobago" },
    { KODE: "TUN", "Nama Negara": "Tunisia" },
    { KODE: "TUR", "Nama Negara": "Turkey" },
    { KODE: "TUV", "Nama Negara": "Tuvalu" },
    { KODE: "TWN", "Nama Negara": "Taiwan" },
    { KODE: "TZA", "Nama Negara": "Tanzania" },
    { KODE: "UGA", "Nama Negara": "Uganda" },
    { KODE: "UKR", "Nama Negara": "Ukraine" },
    { KODE: "URY", "Nama Negara": "Uruguay" },
    { KODE: "USA", "Nama Negara": "United States" },
    { KODE: "UZB", "Nama Negara": "Uzbekistan" },
    { KODE: "VAT", "Nama Negara": "Vatican" },
    { KODE: "VCT", "Nama Negara": "Saint Vincent dan Grenadines" },
    { KODE: "VEN", "Nama Negara": "Venezuela" },
    { KODE: "VNM", "Nama Negara": "Viet Nam" },
    { KODE: "VUT", "Nama Negara": "Vanuatu" },
    { KODE: "WSM", "Nama Negara": "Samoa" },
    { KODE: "YEM", "Nama Negara": "Yemen" },
    { KODE: "ZAF", "Nama Negara": "South Africa" },
    { KODE: "ZMB", "Nama Negara": "Zambia" },
    { KODE: "ZWE", "Nama Negara": "Zimbabwe" },
    { KODE: "VGB", "Nama Negara": "Virgin Islands, British" },
    { KODE: "VIR", "Nama Negara": "Virgin Islands, US" },
    { KODE: "UMI", "Nama Negara": "United States Minor Outlying Islands" },
    { KODE: "TKL", "Nama Negara": "Tokelau" },
    { KODE: "SPM", "Nama Negara": "Saint Pierre and Miquelon" },
    { KODE: "SJM", "Nama Negara": "Svalbard and Jan Mayen" },
    {
      KODE: "SHN",
      "Nama Negara": "Saint Helena, Ascension and Tristan da Cunha",
    },
    {
      KODE: "SGS",
      "Nama Negara": "South Georgia and the South Sandwich Islands",
    },
    { KODE: "REU", "Nama Negara": "Réunion" },
    { KODE: "PYF", "Nama Negara": "French Polynesia" },
    { KODE: "PSE", "Nama Negara": "Palestine, State of" },
    { KODE: "ABW", "Nama Negara": "Aruba" },
    { KODE: "AIA", "Nama Negara": "Anguilla" },
    { KODE: "ALA", "Nama Negara": "Åland Islands" },
    { KODE: "ASM", "Nama Negara": "American Samoa" },
    { KODE: "ATA", "Nama Negara": "Antarctica" },
    { KODE: "ATF", "Nama Negara": "French Southern Territories" },
    { KODE: "BES", "Nama Negara": "Bonaire, Sint Eustatius and Saba" },
    { KODE: "BLM", "Nama Negara": "Saint Barthélemy" },
    { KODE: "BMU", "Nama Negara": "Bermuda" },
    { KODE: "BVT", "Nama Negara": "Bouvet Island" },
    { KODE: "CCK", "Nama Negara": "Cocos (Keeling) Islands" },
    { KODE: "COK", "Nama Negara": "Cook Islands" },
    { KODE: "CUW", "Nama Negara": "Curaçao" },
    { KODE: "CXR", "Nama Negara": "Christmas Island" },
    { KODE: "CYM", "Nama Negara": "Cayman Islands" },
    { KODE: "DZA", "Nama Negara": "Algeria" },
    { KODE: "ESH", "Nama Negara": "Western Sahara" },
    { KODE: "FLK", "Nama Negara": "Falkland Islands (Malvinas)" },
    { KODE: "FRO", "Nama Negara": "Faroe Islands" },
    { KODE: "GGY", "Nama Negara": "Guernsey" },
    { KODE: "GIB", "Nama Negara": "Gibraltar" },
    { KODE: "GRL", "Nama Negara": "Greenland" },
    { KODE: "GUF", "Nama Negara": "French Guiana" },
    { KODE: "GUM", "Nama Negara": "Guam" },
    { KODE: "HMD", "Nama Negara": "Heard Island and McDonald Islands" },
    { KODE: "IMN", "Nama Negara": "Isle of Man" },
    { KODE: "IOT", "Nama Negara": "British Indian Ocean Territory" },
    { KODE: "JEY", "Nama Negara": "Jersey" },
    { KODE: "MAC", "Nama Negara": "Macao" },
    { KODE: "MAF", "Nama Negara": "Saint Martin" },
    { KODE: "MNP", "Nama Negara": "Northern Mariana Islands" },
    { KODE: "MSR", "Nama Negara": "Montserrat" },
    { KODE: "MTQ", "Nama Negara": "Martinique" },
    { KODE: "MYT", "Nama Negara": "Mayotte" },
    { KODE: "NCL", "Nama Negara": "New Caledonia" },
    { KODE: "NFK", "Nama Negara": "Norfolk Island" },
    { KODE: "NIU", "Nama Negara": "Niue" },
    { KODE: "PCN", "Nama Negara": "Pitcairn" },
    { KODE: "PRI", "Nama Negara": "Puerto Rico" },
    { KODE: "SSD", "Nama Negara": "South Sudan" },
    { KODE: "SXM", "Nama Negara": "Sint Maarten (Dutch part)" },
    { KODE: "TCA", "Nama Negara": "Turks and Caicos Islands" },
    { KODE: "WLF", "Nama Negara": "Wallis and Futuna" },
  ];

  // Set column widths (B to F)
  countryCodeSheet.columns = [
    { key: "A", width: 5 },
    { key: "KODE", width: 10 },
    { key: "Nama Negara", width: 25 },
  ];

  // Add headers starting at B2
  const headersCountryCode = Object.keys(countryCodeData[0]);
  const headerRowCountryCode = countryCodeSheet.getRow(2);

  headersCountryCode.forEach((header, index) => {
    const cell: any = headerRowCountryCode.getCell(index + 2);
    cell.value = header;
    cell.fill = headerFillTaxObject;
    cell.font = { bold: true };
    cell.border = borderStyle;
    cell.alignment = { vertical: "middle", horizontal: "start" };
  });

  // Add data starting at B3
  countryCodeData.forEach((data, rowIndex) => {
    const row = countryCodeSheet.getRow(rowIndex + 3);
    Object.values(data).forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 2);
      cell.value = value;
      cell.border = borderStyle;
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  });

  // Freeze header row
  countryCodeSheet.views = [{ state: "frozen", ySplit: 1 }];

  // === Ref Daftar PTKP
  const ptkpSheet = workbook.addWorksheet("Ref Daftar PTKP", {
    properties: { tabColor: { argb: "FF00B050" } },
  });

  // Sample data
  const ptkpData = [
    {
      PTKP: "TK/0",
      Nominal: 54000000,
    },
    {
      PTKP: "TK/1",
      Nominal: 58500000,
    },
    {
      PTKP: "TK/2",
      Nominal: 63000000,
    },
    {
      PTKP: "TK/3",
      Nominal: 67500000,
    },
    {
      PTKP: "K/0",
      Nominal: 58500000,
    },
    {
      PTKP: "K/1",
      Nominal: 63000000,
    },
    {
      PTKP: "K/2",
      Nominal: 67500000,
    },
    {
      PTKP: "K/3",
      Nominal: 72000000,
    },
  ];

  // Set column widths (B to F)
  ptkpSheet.columns = [
    { key: "A", width: 5 },
    { key: "PTKP", width: 25 },
    { key: "Nominal", width: 25 },
  ];

  // Add headers starting at B2
  const headersPtkp = Object.keys(ptkpData[0]);
  const headerRowPtkp = ptkpSheet.getRow(2);

  headersPtkp.forEach((header, index) => {
    const cell: any = headerRowPtkp.getCell(index + 2);
    cell.value = header;
    cell.fill = headerFillTaxObject;
    cell.font = { bold: true };
    cell.border = borderStyle;
    cell.alignment = { vertical: "middle", horizontal: "start" };
  });

  // Add data starting at B3
  ptkpData.forEach((data, rowIndex) => {
    const row = ptkpSheet.getRow(rowIndex + 3);
    Object.values(data).forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 2);
      cell.value = value;
      cell.border = borderStyle;
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  });

  // Freeze header row
  countryCodeSheet.views = [{ state: "frozen", ySplit: 1 }];

  // === OUTPUT FILE ===
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Arsip Bulanan ${monthlyTaxes[0].month}.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
}
