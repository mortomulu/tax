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

  const workbook = new ExcelJS.Workbook();

  // === SHEET 1 ===
  const dataSheet: any = workbook.addWorksheet("DATA", {});
  // Set width for A1 and B1
  dataSheet.getColumn("A").width = 20;
  dataSheet.getColumn("B").width = 20;

  // Set A1 and B1 values
  dataSheet.getCell("A1").value = "NIK Pemotong";
  dataSheet.getCell("B1").value = monthlyTaxes[0].npwp_finance;

  // Generate data rows
  const data = monthlyTaxes?.map((item, index) => ({
    "Masa Pajak": item?.month,
    "Tahun Pajak": item?.year,
    "Status Pegawai": "Resident",
    "NPWP/NIK/TIN": item.nik,
    "Nomor Passport": "",
    Status: item.ptkp,
    Posisi: "STAFF",
    "Sertifikat/Fasilitas": "N/A",
    "Kode Objek Pajak": "21-100-01",
    "Penghasilan Kotor": item.bruto_salary,
    Tarif: item.tarif,
    "ID TKU": `${companyProfile.selected_npwp}000000`,
    "Tgl Pemotongan": `1/${String(item.month).padStart(2, "0")}/${item.year}`,
  }));

  // Add header in B4
  const headers = Object.keys(data[0]);
  const startRow = 4;
  const startCol = 2;

  headers.forEach((header, colIndex) => {
    const cell = dataSheet.getCell(startRow, startCol + colIndex);
    cell.value = header;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" },
    };
    cell.font = {
      color: { argb: "FFFFFF" },
      bold: true,
    };
    cell.alignment = { vertical: "middle", horizontal: "start" };
    const column = dataSheet.getColumn(startCol + colIndex);
    column.width = Math.max(header.length + 5);
  });

  // Add data rows starting from B5
  data.forEach((item: any, rowIndex) => {
    const rowNumber = startRow + 1 + rowIndex;
    const row = dataSheet.getRow(rowNumber);

    headers.forEach((key, colIndex) => {
      const colNumber = startCol + colIndex;
      const cell = row.getCell(colNumber);
      cell.value = item[key] ?? "";

      // Latar belakang ganjil genap
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: rowIndex % 2 === 0 ? "D9E1F2" : "FFFFFF", // Genap: biru, Ganjil: putih
        },
      };

      const isTopRow = rowIndex === 0;
      const isBottomRow = rowIndex === data.length - 1;
      const isLeftCol = colIndex === 0;
      const isRightCol = colIndex === headers.length - 1;

      // Style warna border
      const borderBlue = { style: "thin", color: { argb: "FF8EA9DB" } };
      const borderGray = { style: "thin", color: { argb: "FFBFBFBF" } };
      const noBorder = undefined;

      // Tetapkan border per sisi
      cell.border = {
        top: isTopRow ? borderBlue : rowIndex % 2 === 0 ? borderGray : noBorder,
        bottom: isBottomRow
          ? borderBlue
          : rowIndex % 2 === 0
          ? borderGray
          : noBorder,
        left: borderBlue, // semua cell dapat border kiri biru
        right: borderBlue, // semua cell dapat border kanan biru
      };

      // Alignment cell
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  });

  // Add "ter a", "ter b", "ter c" headers in P4, Q4, R4
  const terStartCol = 16; // Column P = 16
  dataSheet.getCell(4, terStartCol).value = "TER A";
  dataSheet.getCell(4, terStartCol + 1).value = "TER B";
  dataSheet.getCell(4, terStartCol + 2).value = "TER C";

  // Fill values 0 to 10 rows below for ter a, b, c
  for (let i = 1; i <= 10; i++) {
    dataSheet.getCell(4 + i, terStartCol).value = 0;
    dataSheet.getCell(4 + i, terStartCol + 1).value = 0;
    dataSheet.getCell(4 + i, terStartCol + 2).value = 0;
  }

  // === SHEET 2 ===
  const bpmpSheet: any = workbook.addWorksheet("BPMP", {});

  const excelColumns = [
    {
      "Kolom pada excel": "NPWP Pemotong",
      "Kolom pada xml": "TIN",
      "Petunjuk pengisian": "Diisi dengan NPWP pemotong",
      "Contoh pengisian": "1234567890123456",
      Validasi: "NPWP Pemotong harus sama dengan NPWP login",
      "Keterangan tambahan": "",
    },
    {
      "Kolom pada excel": "Masa Pajak",
      "Kolom pada xml": "TaxPeriodMonth",
      "Petunjuk pengisian": "Diisi dengan masa pajak pemotongan",
      "Contoh pengisian": "1",
      Validasi: "",
      "Keterangan tambahan": "",
    },
    {
      "Kolom pada excel": "Tahun Pajak",
      "Kolom pada xml": "TaxPeriodYear",
      "Petunjuk pengisian": "Diisi dengan masa pajak pemotongan",
      "Contoh pengisian": "2025",
      Validasi: "",
      "Keterangan tambahan": "",
    },
    {
      "Kolom pada excel": "Status Pegawai",
      "Kolom pada xml": "CounterpartOpt",
      "Petunjuk pengisian":
        "Diisi dengan status kewarganegaraan pegawai (karyawan asing atau tidak)",
      "Contoh pengisian": "Resident",
      Validasi: "",
      "Keterangan tambahan": "",
    },
    {
      "Kolom pada excel": "NPWP/NIK/TIN",
      "Kolom pada xml": "CounterpartTin",
      "Petunjuk pengisian": "Diisi dengan NIK pegawai tetap",
      "Contoh pengisian": "0987654321098765",
      Validasi: "NPWP/NIK wajib valid",
      "Keterangan tambahan": "",
    },
    {
      "Kolom pada excel": "Nomor Passport",
      "Kolom pada xml": "CounterpartPassport",
      "Petunjuk pengisian":
        "Diisi dengan nomor paspor pegawai tetap (jika karyawan asing)",
      "Contoh pengisian": "",
      Validasi: "",
      "Keterangan tambahan": "",
    },
    {
      "Kolom pada excel": "Status",
      "Kolom pada xml": "StatusTaxExemption",
      "Petunjuk pengisian": "Diisi dengan status PTKP penerima penghasilan",
      "Contoh pengisian": "TK/3",
      Validasi: "",
      "Keterangan tambahan": "",
    },
    {
      "Kolom pada excel": "Posisi",
      "Kolom pada xml": "Position",
      "Petunjuk pengisian": "Diisi dengan posisi pegawai tetap",
      "Contoh pengisian": "Staff",
      Validasi: "",
      "Keterangan tambahan": "",
    },
    {
      "Kolom pada excel": "Sertifikat/Fasilitas",
      "Kolom pada xml": "TaxCertificate",
      "Petunjuk pengisian": "Diisi dengan fasilitas perpajakan yang digunakan",
      "Contoh pengisian": "N/A",
      Validasi: "",
      "Keterangan tambahan": "",
    },
    {
      "Kolom pada excel": "Kode Objek Pajak",
      "Kolom pada xml": "TaxObjectCode",
      "Petunjuk pengisian": "Diisi dengan kode objek pajak",
      "Contoh pengisian": "21-100-01",
      Validasi: "",
      "Keterangan tambahan": "",
    },
    {
      "Kolom pada excel": "Penghasilan Kotor",
      "Kolom pada xml": "Gross",
      "Petunjuk pengisian": "Diisi dengan penghasilan bruto",
      "Contoh pengisian": "10000000",
      Validasi: "",
      "Keterangan tambahan": "",
    },
    {
      "Kolom pada excel": "Tarif",
      "Kolom pada xml": "Rate",
      "Petunjuk pengisian":
        "Diisi dengan tarif yang sesuai dengan referensi kode objek pajak",
      "Contoh pengisian": "2",
      Validasi:
        "Jika menggunakan fasilitas perpajakan lainnya, tarif dapat diisi tidak sesuai dengan referensi kode objek pajak",
      "Keterangan tambahan":
        "Jika tarif menggunakan koma, di export ke xml, excel secara otomatis akan merubah menjadi format desimal menggunakan titik",
    },
    {
      "Kolom pada excel": "ID TKU",
      "Kolom pada xml": "IDPlaceOfBusinessActivity",
      "Petunjuk pengisian": "Diisi dengan ID TKU pemotong",
      "Contoh pengisian": "1234567890123456789012",
      Validasi: "",
      "Keterangan tambahan": "",
    },
    {
      "Kolom pada excel": "Tgl Pemotongan",
      "Kolom pada xml": "WithholdingDate",
      "Petunjuk pengisian": "Diisi dengan tanggal pemotongan",
      "Contoh pengisian": "16/01/2025",
      Validasi:
        "Tanggal pemotongan tidak boleh lebih rendah dari masa/tahun pajak bukti potong",
      "Keterangan tambahan":
        "Saat di export ke xml, excel secara otomatis akan merubah menjadi format YYYY-MM-DD",
    },
  ];

  // Set column widths (B to F)
  bpmpSheet.columns = [
    { key: "Kolom pada excel", width: 17 },
    { key: "Kolom pada xml", width: 27 },
    { key: "Petunjuk pengisian", width: 75 },
    { key: "Contoh pengisian", width: 27 },
    { key: "Validasi", width: 90 },
    { key: "Keterangan tambahan", width: 120 },
  ];

  const headersTaxObject = Object.keys(excelColumns[0]);
  const headerRowTaxObject = bpmpSheet.getRow(1);

  headersTaxObject.forEach((header, index) => {
    const cell: any = headerRowTaxObject.getCell(index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "start" };
  });

  // Add data starting at B3
  excelColumns.forEach((data, rowIndex) => {
    const row = bpmpSheet.getRow(rowIndex + 2);
    Object.values(data).forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.value = value;
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  });

  // Freeze header row
  bpmpSheet.views = [{ state: "frozen", ySplit: 1 }];

  // === SHEET 2 ===
  const refSheet: any = workbook.addWorksheet("REF", {});

  const statusOptions = [
    {
      "Status Pegawai": "Resident",
      "Status PTKP": "TK/0",
      Fasilitas: "N/A",
    },
    {
      "Status Pegawai": "Foreign",
      "Status PTKP": "TK/1",
      Fasilitas: "DTP",
    },
    {
      "Status Pegawai": "",
      "Status PTKP": "TK/2",
      Fasilitas: "ETC",
    },
    {
      "Status Pegawai": "",
      "Status PTKP": "TK/3",
      Fasilitas: "",
    },
    {
      "Status Pegawai": "",
      "Status PTKP": "K/0",
      Fasilitas: "",
    },
    {
      "Status Pegawai": "",
      "Status PTKP": "K/1",
      Fasilitas: "",
    },
    {
      "Status Pegawai": "",
      "Status PTKP": "K/2",
      Fasilitas: "",
    },
    {
      "Status Pegawai": "",
      "Status PTKP": "K/3",
      Fasilitas: "",
    },
    {
      "Status Pegawai": "",
      "Status PTKP": "HB/0",
      Fasilitas: "",
    },
    {
      "Status Pegawai": "",
      "Status PTKP": "HB/1",
      Fasilitas: "",
    },
    {
      "Status Pegawai": "",
      "Status PTKP": "HB/2",
      Fasilitas: "",
    },
    {
      "Status Pegawai": "",
      "Status PTKP": "HB/3",
      Fasilitas: "",
    },
  ];

  const taxObjectCodes = [
    {
      "Kode Objek Pajak": "21-100-01",
      "Nama Objek Pajak":
        "Penghasilan yang diterima oleh Pegawai Tetap termasuk Pegawai Negeri Sipil, Anggota Tentara Nasional Indonesia, Anggota Polisi Republik Indonesia atau Pejabat Negara",
    },
    {
      "Kode Objek Pajak": "21-100-02",
      "Nama Objek Pajak":
        "Penghasilan yang diterima oleh Penerima Pensiun secara teratur",
    },
    {
      "Kode Objek Pajak": "21-100-32",
      "Nama Objek Pajak":
        "Penghasilan yang diterima oleh Pegawai tetap yang menerima fasilitas di daerah tertentu",
    },
    {
      "Kode Objek Pajak": "21-100-35",
      "Nama Objek Pajak":
        "Upah Pegawai Tidak Tetap yang Dibayarkan Secara Bulanan",
    },
  ];

  // First table (statusOptions - without header, starting at B2)
  refSheet.columns = [
    { key: "Status Pegawai", width: 20 },
    { key: "Status PTKP", width: 15 },
    { key: "Fasilitas", width: 15 },
  ];

  // Add first table data starting at B2 (without headers)
  statusOptions.forEach((data, rowIndex) => {
    const row = refSheet.getRow(rowIndex + 2); // Start from row 2
    Object.values(data).forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 2); // Start from column B (index 2)
      cell.value = value;
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  });

  // Second table (taxObjectCodes - with header, starting at F1)
  const headersTaxObjectCodes = Object.keys(taxObjectCodes[0]);
  const headerRowTaxObjectCodes = refSheet.getRow(1);

  // Add second table headers starting at F1
  headersTaxObjectCodes.forEach((header, index) => {
    const cell = headerRowTaxObjectCodes.getCell(index + 6);
    cell.value = header;
    // cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "start" };
  });

  // Add second table data starting at F2
  taxObjectCodes.forEach((data, rowIndex) => {
    const row = refSheet.getRow(rowIndex + 2);
    Object.values(data).forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 6); // Start from column F (index 6)
      cell.value = value;
      cell.alignment = { vertical: "middle", horizontal: "left" };

      if (colIndex === 1) {
        cell.alignment.wrapText = true;
      }
    });
  });

  refSheet.views = [{ state: "frozen", ySplit: 1 }];

  refSheet.getColumn(6).width = 20; // Column F (Kode Objek Pajak)
  refSheet.getColumn(7).width = 80; // Column G (Nama Objek Pajak)

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
