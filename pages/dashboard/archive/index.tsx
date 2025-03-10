import React from "react";
import { Badge, Dropdown, Space, Table, Tabs } from "antd";
import Layout from "@/components/layouts/Layout";
import { BsThreeDotsVertical } from "react-icons/bs";

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
  { key: "1", label: "Detail" },
  { key: "2", label: "Edit" },
  { key: "3", label: "Delete" },
];

const monthlyColumns = [
  { title: "Priode Pajak", dataIndex: "priodePajak", key: "priodePajak" },
  { title: "Tahun Pajak", dataIndex: "tahunPajak", key: "tahunPajak" },
  { title: "Total Karyawan", dataIndex: "totalKaryawan", key: "totalKaryawan" },
  {
    title: "Total Pajak Dibayar",
    dataIndex: "totalMonthlyTax",
    key: "totalMonthlyTax",
    render: (value: number) => `Rp ${value.toLocaleString("id-ID")}`,
  },
  {
    title: "Action",
    key: "operation",
    width: "15%",
    render: () => (
      <Space size="middle">
        <Dropdown menu={{ items }}>
          <a>
            <BsThreeDotsVertical />
          </a>
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
  const filteredMonthlyData = monthlyTaxData.filter(
    (item) => item.tahunPajak === record.tahunPajak
  );
  return (
    <Table
      columns={monthlyColumns}
      dataSource={filteredMonthlyData}
      pagination={false}
    />
  );
};

const ReportPage: React.FC = () => {
  return (
    <Layout>
      <h2>Laporan Pajak</h2>

      <Tabs defaultActiveKey="1">
        {/* Pajak Bulanan */}
        <TabPane tab="Pajak Bulanan" key="1">
          <Table
            dataSource={monthlyTaxData}
            columns={monthlyColumns}
            pagination={{ pageSize: 5 }}
          />
        </TabPane>

        {/* Pajak Tahunan */}
        <TabPane tab="Pajak Tahunan" key="2">
          <Table
            dataSource={yearlyTaxData}
            columns={yearlyColumns}
            expandable={{ expandedRowRender }}
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
      </Tabs>
    </Layout>
  );
};

export default ReportPage;
