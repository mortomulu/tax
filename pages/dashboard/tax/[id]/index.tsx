import React from "react";
import { Card, Table, Tabs, Badge, Space, Dropdown } from "antd";
import Layout from "@/components/layouts/Layout";
import { BsThreeDotsVertical } from "react-icons/bs";

const { TabPane } = Tabs;

const employeeData = {
  id: "K001",
  name: "Ahmad Fajri",
  position: "Software Engineer",
  nik: "1234567890123456",
  npwp: "09.123.456.7-891.000",
  ptkpStatus: "K/0",
};

const taxHistoryData = [
  {
    key: "1",
    period: "Januari 2024",
    salary: 10000000,
    tax: 500000,
    deductions: 250000,
    allowances: 500000,
  },
  {
    key: "2",
    period: "Februari 2024",
    salary: 10000000,
    tax: 500000,
    deductions: 250000,
    allowances: 500000,
  },
  {
    key: "3",
    period: "Maret 2024",
    salary: 10000000,
    tax: 500000,
    deductions: 250000,
    allowances: 500000,
  },
];

const items = [
  { key: "1", label: "Edit" },
  { key: "2", label: "Hapus" },
];

const taxColumns = [
  { title: "Periode", dataIndex: "period", key: "period" },
  { title: "Gaji (Rp)", dataIndex: "salary", key: "salary", render: (value: number) => value.toLocaleString("id-ID") },
  { title: "Pajak (Rp)", dataIndex: "tax", key: "tax", render: (value: number) => value.toLocaleString("id-ID") },
  {
    title: "Status",
    key: "status",
    render: () => <Badge status="success" text="Dibayar" />,
  },
//   {
//     title: "Aksi",
//     key: "operation",
//     width: "10%",
//     render: () => (
//       <Space size="middle">
//         <Dropdown menu={{ items }}>
//           <a>
//             <BsThreeDotsVertical />
//           </a>
//         </Dropdown>
//       </Space>
//     ),
//   },
];

// const expandedRowRender = (record: any) => {
//   return (
//     <Table
//       columns={[
//         { title: "Potongan Pajak (Rp)", dataIndex: "deductions", key: "deductions", render: (value: number) => value.toLocaleString("id-ID") },
//         { title: "Tunjangan (Rp)", dataIndex: "allowances", key: "allowances", render: (value: number) => value.toLocaleString("id-ID") },
//       ]}
//       dataSource={[record]}
//       pagination={false}
//     />
//   );
// };

const EmployeeDetailPage: React.FC = () => {
  return (
    <Layout>
      <h2>Detail Karyawan</h2>

      {/* Informasi Karyawan */}
      <Card title="Informasi Karyawan" bordered={false} style={{ marginBottom: 20 }}>
        <p><strong>Nama:</strong> {employeeData.name}</p>
        <p><strong>Jabatan:</strong> {employeeData.position}</p>
        <p><strong>NIK:</strong> {employeeData.nik}</p>
        <p><strong>NPWP:</strong> {employeeData.npwp}</p>
        <p><strong>Status PTKP:</strong> {employeeData.ptkpStatus}</p>
      </Card>

      {/* Tabs untuk Riwayat Pajak */}
      <Tabs defaultActiveKey="1">
        <TabPane tab="Riwayat Pajak" key="1">
          <Table
            dataSource={taxHistoryData}
            columns={taxColumns}
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
      </Tabs>
    </Layout>
  );
};

export default EmployeeDetailPage;
