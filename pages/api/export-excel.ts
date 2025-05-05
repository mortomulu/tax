import { NextApiRequest, NextApiResponse } from "next";
import ExcelJS from "exceljs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const workbook = new ExcelJS.Workbook();

  // === SHEET 1: REKAP ===
  const rekapSheet: any = workbook.addWorksheet("Rekap", {
    views: [{ showGridLines: false }],
  });

  // Column widths (A-H)
  rekapSheet.columns = [
    { width: 5 }, // A (gray)
    { width: 15 }, // B
    { width: 15 }, // C
    { width: 10 }, // D (2024)
    { width: 15 }, // E
    { width: 15 }, // F
    { width: 10 }, // G (numbers)
    { width: 5 }, // H (gray)
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
  rekapSheet.getCell("D2").value = 2024;
  rekapSheet.getCell("E2").value = "Masa Pajak";
  rekapSheet.getCell("G2").value = 1;

  // Style row 2 with font sizes
  ["B2", "E2"].forEach((cell) => {
    rekapSheet.getCell(cell).fill = grayFill;
    rekapSheet.getCell(cell).font = { size: 16 }; // Font size 16
    rekapSheet.getCell(cell).alignment = centerAlign;
    rekapSheet.getCell(cell).border = borderStyle;
  });

  ["D2", "G2"].forEach((cell) => {
    rekapSheet.getCell(cell).font = { size: 20 }; // Font size 20
    rekapSheet.getCell(cell).alignment = centerAlign;
    rekapSheet.getCell(cell).border = borderStyle;
  });

  // Row 3
  rekapSheet.mergeCells("B3:F3");
  rekapSheet.getCell("B3").value = "Jumlah Bukti Potong PPh Pasal 21";
  rekapSheet.getCell("G3").value = 20;

  // Style row 3 with font sizes
  rekapSheet.getCell("B3").font = { size: 13 }; // Font size 13
  rekapSheet.getCell("B3").fill = grayFill;
  rekapSheet.getCell("B3").alignment = centerAlign;
  rekapSheet.getCell("B3").border = borderStyle;

  rekapSheet.getCell("G3").font = { size: 20 }; // Font size 20
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
  rekapSheet.getCell("B4").font = { size: 13 }; // Font size 13
  rekapSheet.getCell("B4").fill = grayFill;
  rekapSheet.getCell("B4").alignment = centerAlign;
  rekapSheet.getCell("B4").border = borderStyle;

  rekapSheet.getCell("G4").font = { size: 20 }; // Font size 20
  rekapSheet.getCell("G4").alignment = centerAlign;
  rekapSheet.getCell("G4").border = borderStyle;

  // Apply border to merged cells in B4:F4
  for (let col = 2; col <= 6; col++) {
    rekapSheet.getRow(4).getCell(col).border = borderStyle;
  }

  // === SHEET 2: 21 ===
  const sheet21 = workbook.addWorksheet("21");
  const data = [
    {
      No: 1,
      "Tanggal Pemotongan (dd/MM/yyyy)": "31/01/2024",
      "Penerima Penghasilan? (NPWP/NIK)": "NIK",
      "NPWP (tanpa format/tanda baca)": "",
      "NIK (tanpa format/tanda baca)": "3504102303570001",
      "Nama Penerima Penghasilan Sesuai NIK": "SUMARNO",
      "Alamat Penerima Penghasilan Sesuai NIK": "KAB. MALANG",
      "Kode Objek Pajak": "21-100-01",
      "Penandatangan Menggunakan? (NPWP/NIK)": "NPWP",
      "NPWP Penandatangan (tanpa format/tanda baca)": "087237533652000",
      "NIK Penandatangan (tanpa format/tanda baca)": "",
      "Kode PTKP": "K/2",
      "Pegawai Harian? (Ya/Tidak)": "Tidak",
      "Menggunakan Gross Up? (Ya/Tidak)": "Tidak",
      "Penghasilan Bruto": "4100000",
      "Terdapat Akumulasi Penghasilan Bruto Sebelumnya? (Ya/Tidak)": "",
      "Akumulasi Penghasilan Bruto Sebelumnya": "",
      "Mendapatkan Fasilitas ? (N/SKB/DTP)": "N",
      "Nomor SKB/Nomor DTP": "",
    },
  ];

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
    const cell : any = sheet21.getRow(1).getCell(col);
    cell.fill = greenFill;
    cell.value = "";
  }

  // Apply blue color to column S (19th column)
  //   for (let rowNum = 1; rowNum <= sheet21.rowCount; rowNum++) {
  //     const cell = sheet21.getRow(rowNum).getCell(19); // Column S
  //     cell.fill = blueFill;

  //     // Keep header text white if it's the header row
  //     if (rowNum === 2) {
  //       cell.font = { ...cell.font, color: { argb: "FFFFFFFF" } };
  //     }
  //   }

  // Style header row (row 2)
  // Style header row (row 2)
  headerRow.eachCell((cell : any) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = headerAlign;
    cell.border = borderStyle;
  });

  // Set custom column widths
  sheet21.columns = [
    { key: "No", width: 5 }, // Narrow column for No
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

  // Set row height for headers to accommodate wrapped text
  //   headerRow.height = 30;

  // Add borders and alignment to all data cells
  for (let i = 3; i <= sheet21.rowCount; i++) {
    const row = sheet21.getRow(i);
    row.eachCell((cell : any, colNumber) => {
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

  // === OUTPUT FILE ===
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${"rekap"}.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
}
