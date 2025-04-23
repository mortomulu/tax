import React, { useEffect, useState } from "react";
import { Badge, Dropdown, message, Space, Table, Tabs } from "antd";
import Layout from "@/components/layouts/Layout";
import { BsThreeDotsVertical } from "react-icons/bs";
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

const monthlyTaxData = [
  {
    key: "1",
    priodePajak: "Januari 2024",
    tahunPajak: "2024",
    totalKaryawan: 20,
    totalMonthlyTax: 5000000,
  },
  {
    key: "2",
    priodePajak: "Februari 2024",
    tahunPajak: "2024",
    totalKaryawan: 20,
    totalMonthlyTax: 5000000,
  },
  {
    key: "3",
    priodePajak: "Maret 2024",
    tahunPajak: "2024",
    totalKaryawan: 20,
    totalMonthlyTax: 5000000,
  },
  {
    key: "4",
    priodePajak: "Januari 2025",
    tahunPajak: "2025",
    totalKaryawan: 20,
    totalMonthlyTax: 5000000,
  },
  {
    key: "5",
    priodePajak: "Februari 2025",
    tahunPajak: "2025",
    totalKaryawan: 20,
    totalMonthlyTax: 5000000,
  },
];

const yearlyTaxData = [
  { key: "2024", tahunPajak: "2024", totalMonthlyTax: 60000000 },
  { key: "2025", tahunPajak: "2025", totalMonthlyTax: 60000000 },
];

const items = [
  { key: "1", label: "Export PDF" },
  { key: "2", label: "Export Excel" },
  { key: "3", label: "Detail" },
  { key: "4", label: "Edit" },
  { key: "5", label: "Delete" },
];

const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const excelFile = new Blob([excelBuffer], {
    type: "application/octet-stream",
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
      const formattedData = data.map((item) => {
        const monthName = new Date(
          2000,
          parseInt(item.month) - 1
        ).toLocaleString("id-ID", {
          month: "long",
        });
        return {
          ...item,
          periode: `${monthName} ${item.year}`,
          tahunPajak: item.year,
        };
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
      exportToExcel([record], "Data_Karyawan");
    } else if (key === "3") {
      router.push(`/dashboard/archive/${record.key}`);
    } else if (key === "4") {
      router.push(`/dashboard/employee/${record.key}`);
    } else if (key === "5") {
      console.log("Delete:", record.key);
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
      title: "Action",
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
      <h2>Laporan Pajak</h2>

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
