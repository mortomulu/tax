import React, { useState } from "react";
import { Dropdown, Space, Table, Tabs } from "antd";
import Layout from "@/components/layouts/Layout";
import { BsThreeDotsVertical } from "react-icons/bs";

const { TabPane } = Tabs;

const items = [
  { key: "1", label: "Detail" },
  { key: "2", label: "Edit" },
  { key: "3", label: "Delete" },
];

const ReportPage: React.FC = () => {
  const monthlyTaxData = [
    {
      key: "1",
      priodePajak: "Januari 2025",
      tahunPajak: "2025",
      totalKaryawan: 20,
      totalMonthlyTax: 5000000,
    },
    {
      key: "2",
      priodePajak: "Februari 2025",
      tahunPajak: "2025",
      totalKaryawan: 20,
      totalMonthlyTax: 5000000,
    },
  ];

  const yearlyTaxData = [
    {
      key: "1",
      tahunPajak: "2025",
      totalMonthlyTax: 60000000,
    },
    {
      key: "2",
      tahunPajak: "2025",
      totalMonthlyTax: 60000000,
    },
  ];

  const monthlyColumns = [
    {
      title: "Priode Pajak",
      dataIndex: "priodePajak",
      key: "priodePajak",
    },
    {
      title: "Tahun Pajak",
      dataIndex: "tahunPajak",
      key: "tahunPajak",
    },
    {
      title: "Total Karyawan",
      dataIndex: "totalKaryawan",
      key: "totalKaryawan",
    },
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
    {
      title: "Tahun Pajak",
      dataIndex: "tahunPajak",
      key: "tahunPajak",
    },
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

  return (

    <Layout>
      <h2>Laporan Pajak</h2>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Pajak Bulanan" key="1">
          <Table dataSource={monthlyTaxData} columns={monthlyColumns} />
        </TabPane>
        <TabPane tab="Pajak Tahunan" key="2">
          <Table dataSource={yearlyTaxData} columns={yearlyColumns} />
        </TabPane>
      </Tabs>
    </Layout>
  );
};

export default ReportPage;
