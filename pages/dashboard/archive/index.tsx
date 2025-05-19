import React, { useEffect, useState } from "react";
import { Badge, Button, Dropdown, message, Space, Table, Tabs } from "antd";
import Layout from "@/components/layouts/Layout";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/utils/supabase";

interface SummaryType {
  id: string;
  year: string;
  month: string;
  total_tax: number;
  total_thp: number;
  created_at: string;
}

const { TabPane } = Tabs;

const items = [
  { key: "1", label: "Export PDF" },
  { key: "2", label: "Export Excel" },
  { key: "3", label: "Detail" },
];

const exportToExcel = (data: any[], fileName: string) => {
  const workbook = XLSX.utils.book_new();

  // === SHEET 1: REKAP ===
  const rekapData = [
    Array(8).fill(null), // Row 1 (A1:H1) - gray
    [null, "Tahun Pajak", null, 2024, "Masa Pajak", null, 1, null], // Row 2 (A2:H2)
    [
      null,
      "Jumlah Bukti Potong PPh Pasal 21",
      null,
      null,
      null,
      null,
      20,
      null,
    ], // Row 3
    [null, "Jumlah Bukti Potong PPh Pasal 26", null, null, null, null, 0, null], // Row 4
    Array(8).fill(null), // Row 5 (A5:H5) - gray
  ];

  const rekapSheet = XLSX.utils.aoa_to_sheet(rekapData);

  // Merge cells (8 columns total, A-H)
  rekapSheet["!merges"] = [
    // Row 2 merges
    { s: { r: 1, c: 1 }, e: { r: 1, c: 2 } }, // "Tahun Pajak" (B2:C2)
    { s: { r: 1, c: 4 }, e: { r: 1, c: 5 } }, // "Masa Pajak" (E2:F2)

    // Row 3 merges
    { s: { r: 2, c: 1 }, e: { r: 2, c: 5 } }, // "Jumlah..." (B3:F3)

    // Row 4 merges
    { s: { r: 3, c: 1 }, e: { r: 3, c: 5 } }, // "Jumlah..." (B4:F4)
  ];

  // Column widths (A-H)
  rekapSheet["!cols"] = [
    { wch: 5 }, // A (gray)
    { wch: 15 }, // B
    { wch: 15 }, // C
    { wch: 10 }, // D (2024)
    { wch: 15 }, // E
    { wch: 15 }, // F
    { wch: 10 }, // G (numbers)
    { wch: 5 }, // H (gray)
  ];

  // Style definitions
  const grayStyle = {
    fill: { fgColor: { rgb: "D9D9D9" } },
  };

  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4472C4" } },
    alignment: { horizontal: "center", vertical: "center" },
  };

  const dataLabelStyle = {
    font: { bold: true },
    alignment: { horizontal: "center", vertical: "center" },
  };

  const numberStyle = {
    alignment: { horizontal: "center", vertical: "center" },
  };

  // Apply styles to all cells (A1:H5)
  const range = XLSX.utils.decode_range("A1:H5");

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });

      if (!rekapSheet[cellRef]) {
        rekapSheet[cellRef] = { t: "s", v: "", s: {} };
      }

      // Gray areas (columns A and H, rows 1 and 5)
      if (C === 0 || C === 7 || R === 0 || R === 4) {
        rekapSheet[cellRef].s = { ...rekapSheet[cellRef].s, ...grayStyle };
      }

      // Content styling with center alignment
      if (R === 1) {
        // Row 2
        if (C === 1 || C === 4) {
          // Header labels
          rekapSheet[cellRef].s = { ...rekapSheet[cellRef].s, ...headerStyle };
        } else if (C === 3 || C === 6) {
          // Numbers
          rekapSheet[cellRef].s = { ...rekapSheet[cellRef].s, ...numberStyle };
        }
      } else if (R === 2 || R === 3) {
        // Rows 3-4
        if (C === 1) {
          // Data labels
          rekapSheet[cellRef].s = {
            ...rekapSheet[cellRef].s,
            ...dataLabelStyle,
          };
        } else if (C === 6) {
          // Numbers
          rekapSheet[cellRef].s = { ...rekapSheet[cellRef].s, ...numberStyle };
        }
      }

      // Center alignment for all content cells in the range (improved centering for all cells)
      if (R >= 1 && R <= 3 && C >= 1 && C <= 6) {
        if (!rekapSheet[cellRef].s) rekapSheet[cellRef].s = {};
        rekapSheet[cellRef].s.alignment = {
          horizontal: "center",
          vertical: "center",
        };
      }
    }
  }

  // Set the exact sheet range to only include A1:H5
  rekapSheet["!ref"] = "A1:H5";

  XLSX.utils.book_append_sheet(workbook, rekapSheet, "Rekap");

  // === SHEET 2: 21 ===
  const sheet21 = XLSX.utils.json_to_sheet(data);

  if (data.length > 0) {
    const header = Object.keys(data[0]);
    sheet21["!cols"] = header.map(() => ({ wch: 20 }));

    const range = XLSX.utils.decode_range(sheet21["!ref"] || "A1:Z1");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = XLSX.utils.encode_cell({ r: range.s.r, c: C });
      if (!sheet21[cell]) continue;
      sheet21[cell].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }

  XLSX.utils.book_append_sheet(workbook, sheet21, "21");

  // Download
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const excelFile = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(excelFile, `${fileName}.xlsx`);
};

const exportToPDF = (data: any[], fileName: string) => {
  const doc = new jsPDF();

  doc.text("Data Karyawan", 14, 10);

  autoTable(doc, {
    head: [["Nama", "NIK", "Status Pernikahan"]],
    body: data.map((item) => [item.name, item.nik, item.maritalStatus]),
    startY: 20,
  });

  doc.save(`${fileName}.pdf`);
};

const ReportPage: React.FC = () => {
  const router = useRouter();

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const [summaryMonthlyTaxes, setSummaryMonthlyTaxes] = useState<SummaryType[]>(
    []
  );
  const [summaryYearlyTaxes, setSummaryYearlyTaxes] = useState<any>();

  const processYearlySummary = (monthlyData: any[]) => {
    const yearlyMap: Record<string, number> = {};

    monthlyData.forEach((item) => {
      const year = item.year;
      const tax = item.total_monthly_tax || 0;

      if (yearlyMap[year]) {
        yearlyMap[year] += tax;
      } else {
        yearlyMap[year] = tax;
      }
    });

    const yearlySummary = Object.entries(yearlyMap).map(([year, total]) => ({
      tahunPajak: year,
      totalMonthlyTax: total,
    }));

    setSummaryYearlyTaxes(yearlySummary);
  };

  const fetchSummary = async () => {
    const { data, error } = await supabase
      .from("summary_monthly_tax")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      message.error("Gagal mengambil data ringkasan pajak bulanan");
      console.error(error);
    } else {
      const formattedData = data
        .map((item) => {
          const monthInt = parseInt(item.month);
          const monthName = new Date(2000, monthInt - 1).toLocaleString(
            "id-ID",
            {
              month: "long",
            }
          );

          return {
            ...item,
            month: monthInt,
            periode: `${monthName} ${item.year}`,
            tahunPajak: item.year,
          };
        })
        .sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return b.month - a.month;
        });

      setSummaryMonthlyTaxes(formattedData);
      processYearlySummary(formattedData);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleMenuClick = ({ key }: { key: string }, record: any) => {
    if (key === "1") {
      exportToPDF([record], "Data_Karyawan");
    } else if (key === "2") {
      // exportToExcel([record], "Data_Karyawan");
      window.open(`/api/export-excel?id=${record.id}`);
    } else if (key === "3") {
      router.push(`/dashboard/archive/${record.id}`);
    }
  };

  const monthlyColumns = [
    { title: "Priode Pajak", dataIndex: "periode", key: "periode" },
    { title: "Tahun Pajak", dataIndex: "year", key: "year" },
    {
      title: "Total Karyawan",
      dataIndex: "total_employees",
      key: "total_employees",
    },
    {
      title: "Total Pajak Dibayar",
      dataIndex: "total_monthly_tax",
      key: "total_monthly_tax",
      render: (value: number) => `Rp ${value.toLocaleString("id-ID")}`,
    },
    {
      title: "Aksi",
      key: "operation",
      width: "15%",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Dropdown
            menu={{
              items: items.map((item) => ({
                ...item,
                onClick: (e) => handleMenuClick(e, record),
              })),
            }}
          >
            <span style={{ cursor: "pointer" }}>
              <BsThreeDotsVertical />
            </span>
          </Dropdown>
        </Space>
      ),
    },
  ];

  const yearlyColumns = [
    { title: "Tahun Pajak", dataIndex: "tahunPajak", key: "tahunPajak" },
    {
      title: "Total Pajak Dibayar",
      dataIndex: "totalMonthlyTax",
      key: "totalMonthlyTax",
      render: (value: number) => `Rp ${value.toLocaleString("id-ID")}`,
    },
  ];

  const expandedRowRender = (record: { tahunPajak: string }) => {
    const filteredMonthlyData = summaryMonthlyTaxes.filter(
      (item) => item.year === record.tahunPajak
    );
    return (
      <Table
        columns={monthlyColumns}
        dataSource={filteredMonthlyData}
        pagination={false}
      />
    );
  };

  return (
    <Layout>
      <div className="flex justify-between items-center">
        <h2>Laporan Pajak</h2>
        <Button
          type="primary"
          className="font-semibold flex items-center"
          onClick={() => {
            router.push("/dashboard/archive/add");
          }}
        >
          <FaPlus />
          Tambah Arsip Pajak Manual
        </Button>
      </div>

      <Tabs defaultActiveKey="1">
        {/* Pajak Bulanan */}
        <TabPane tab="Pajak Bulanan" key="1">
          <Table
            dataSource={summaryMonthlyTaxes}
            columns={monthlyColumns}
            pagination={{ pageSize: 5 }}
          />
        </TabPane>

        {/* Pajak Tahunan */}
        <TabPane tab="Pajak Tahunan" key="2">
          <Table
            dataSource={summaryYearlyTaxes}
            columns={yearlyColumns}
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              onExpand: (expanded, record) => {
                setExpandedRowKeys(expanded ? [record.tahunPajak] : []);
              },
              rowExpandable: () => true,
            }}
            rowKey="tahunPajak"
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
      </Tabs>
    </Layout>
  );
};

export default ReportPage;
