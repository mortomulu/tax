import React, { useEffect, useState } from "react";
import { Card, Table, Tabs, Badge, Space, Dropdown, message } from "antd";
import Layout from "@/components/layouts/Layout";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";

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
  {
    title: "Gaji (Rp)",
    dataIndex: "salary",
    key: "salary",
    render: (value: number) => value.toLocaleString("id-ID"),
  },
  {
    title: "Pajak (Rp)",
    dataIndex: "tax",
    key: "tax",
    render: (value: number) => value.toLocaleString("id-ID"),
  },
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
  const { query } = useRouter();
  const { id } = query;

  const [employee, setEmployee] = useState<any>();

  const fetchEmployee = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("employees")
      .select(
        `
          id,
          name,
          nik,
          ptkp:ptkp (id, ptkp),
          positions:idposition (id, position, incentive)
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      message.error("Gagal mengambil data karyawan");
      console.error("Gagal mengambil data karyawan:", error.message);
      return null;
    }

    console.log("data", data);
    setEmployee(data);
    return data;
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  return (
    <Layout>
      <h2>Detail Karyawan</h2>

      {/* Informasi Karyawan */}
      <Card
        title="Informasi Karyawan"
        bordered={false}
        className="mt-5 mb-5 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500"
      >
        <div className="space-y-3">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-gray-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p className="text-gray-700">
              <span className="font-semibold text-gray-800">Nama:</span>{" "}
              {employee?.name || "-"}
            </p>
          </div>

          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-gray-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-700">
              <span className="font-semibold text-gray-800">Jabatan:</span>{" "}
              {employee?.positions?.position || "-"}
            </p>
          </div>

          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-gray-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-gray-700">
              <span className="font-semibold text-gray-800">NIK/NPWP:</span>{" "}
              {employee?.nik || "-"}
            </p>
          </div>

          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-gray-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
              />
            </svg>
            <p className="text-gray-700">
              <span className="font-semibold text-gray-800">Status PTKP:</span>{" "}
              {employee?.ptkp?.ptkp || "-"}
            </p>
          </div>
        </div>
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
