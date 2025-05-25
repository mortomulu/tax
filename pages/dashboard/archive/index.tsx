import React, { useEffect, useState } from "react";
import { Button, Dropdown, message, Space, Table, Tabs } from "antd";
import Layout from "@/components/layouts/Layout";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";
import { useRouter } from "next/router";
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

const activeAdmin = {
  idtype: "NPWP",
  npwp: "09.876.543.2-109.876",
  nik: "3210987654321098",
};

const headers = [
  "No",
  "Tanggal Pemotongan (dd/MM/yyyy)",
  "Penerima Penghasilan? (NPWP/NIK)",
  "NPWP (tanpa format)",
  "NIK (tanpa format)",
  "Nama Penerima Penghasilan",
  "Alamat Penerima Penghasilan",
  "Kode Objek Pajak",
  "Penandatangan Menggunakan? (NPWP/NIK)",
  "NPWP Penandatangan",
  "NIK Penandatangan",
  "Kode PTKP",
  "Pegawai Harian? (Ya/Tidak)",
  "Menggunakan Gross Up? (Ya/Tidak)",
  "Penghasilan Bruto",
  "Terdapat Akumulasi Bruto Sebelumnya?",
  "Akumulasi Penghasilan Bruto Sebelumnya",
  "Fasilitas (N/SKB/DTP)",
  "Nomor SKB/Nomor DTP",
];

const exportToPDF = (data: any[], fileName: string) => {
  const doc: any = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [420, 297],
  });

  doc.setFontSize(14);

  const tableData = data.map((item, index) => [
    index + 1,
    `1/${String(item.month).padStart(2, "0")}/${item.year}`,
    item.type_id || "NIK",
    (item.npwp || "").replace(/\D/g, ""),
    (item.nik || "").replace(/\D/g, ""),
    item.employee_name || "",
    item.address || "",
    "21-100-01",
    activeAdmin.idtype || "NPWP",
    (activeAdmin.npwp || "").replace(/\D/g, ""),
    (activeAdmin.nik || "").replace(/\D/g, ""),
    item.ptkp || "",
    "Tidak",
    "Tidak",
    item.bruto_salary || 0,
    "",
    "",
    "N",
    "",
  ]);

  const columnWidths = [
    10, 15, 20, 25, 25, 25, 30, 20, 25, 25, 25, 20, 15, 15, 20, 20, 20, 15, 20,
  ];
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

  doc.setFillColor(0, 176, 80);
  doc.rect(14.2, 25, totalWidth, 8, "F");

  autoTable(doc, {
    startY: 28,
    head: [headers],
    body: tableData,
    columnStyles: {
      0: {
        cellWidth: 10,
        halign: "center",
        valign: "middle",
      },
      1: { cellWidth: 15 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 30 },
      7: { cellWidth: 20 },
      8: { cellWidth: 25 },
      9: { cellWidth: 25 },
      10: { cellWidth: 25 },
      11: { cellWidth: 20 },
      12: { cellWidth: 15 },
      13: { cellWidth: 15 },
      14: { cellWidth: 20 },
      15: { cellWidth: 20 },
      16: { cellWidth: 20 },
      17: { cellWidth: 15 },
      18: {
        cellWidth: 20,
      },
    },
    //
    styles: {
      fontSize: 6.5,
      cellPadding: 2,
      valign: "top",
    },
    headStyles: {
      fillColor: [238, 236, 225],
      fontSize: 7,
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      valign: "top",
    },
    didParseCell: function (data) {
      if (data.row.section === "head" && data.column.index === 18) {
        data.cell.styles.fillColor = [79, 129, 189];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: function (data: any) {
      const headerRowY = data.table.headerRow
        ? data.table.headerRow.y
        : data.settings.startY;

      const greenRowHeight = 8;
      const greenRowY = headerRowY - greenRowHeight;

      data.table.columns.forEach((col: any) => {
        const cellX = col.x;
        const cellWidth = col.width;

        if (typeof cellX === "number" && typeof cellWidth === "number") {
          doc.setFillColor(0, 176, 80);
          doc.rect(cellX, greenRowY, cellWidth, greenRowHeight, "F");
        }
      });
    },
  });

  const finalY = doc.lastAutoTable.finalY || 300;
  const signatureY = finalY + 20;

  doc.setFontSize(10);
  doc.text("Malang, 25 Mei 2025", 340, signatureY + 10);
  doc.text("Kepala Staff Keuangan", 340, signatureY + 45);

  doc.save(`${fileName}.pdf`);
};

const ReportPage: React.FC = () => {
  const router = useRouter();

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const [summaryMonthlyTaxes, setSummaryMonthlyTaxes] = useState<SummaryType[]>(
    []
  );
  const [summaryYearlyTaxes, setSummaryYearlyTaxes] = useState<any>();

  const [monthlyTaxes, setMonthlyTaxes] = useState<any>();
  console.log("monthlyTaxes", monthlyTaxes);

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

  const fetchMonthlyTaxes = async () => {
    const { data: monthlyTaxes, error: fetchMonthlyTaxesError } = await supabase
      .from("monthly_tax_archive")
      .select("*");

    if (fetchMonthlyTaxesError) {
      message.error("Gagal mengambil data pajak bulanan.");
      return;
    }

    setMonthlyTaxes(monthlyTaxes);
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
    fetchMonthlyTaxes();
    fetchSummary();
  }, []);

  const handleMenuClick = ({ key }: { key: string }, record: any) => {
    if (key === "1") {
      const filteredData = monthlyTaxes.filter(
        (item: any) => item.id_summary === record.id
      );

      exportToPDF(filteredData, "Laporan_Pajak");
    } else if (key === "2") {
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
