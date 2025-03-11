import { useState } from "react";
import { Card, Table, Tabs } from "antd";
import Layout from "@/components/layouts/Layout";

interface EmployeeData {
  key: string;
  name: string;
  ptkp: string;
  gajiBruto: number;
  monthlyTax: number;
}

const employees: EmployeeData[] = [
  {
    key: "1",
    name: "Sumarmo",
    ptkp: "K/2",
    gajiBruto: 4100000,
    monthlyTax: 200000,
  },
  {
    key: "2",
    name: "Edi Wahyono",
    ptkp: "K/2",
    gajiBruto: 3600000,
    monthlyTax: 150000,
  },
  {
    key: "3",
    name: "Dimas Maulana",
    ptkp: "TK/0",
    gajiBruto: 1700000,
    monthlyTax: 50000,
  },
];

const getTotalMonthlyTax = (data: EmployeeData[]) => {
  return data.reduce((total, item) => total + item.monthlyTax, 0);
};

export default function MonthlyReportDetail() {
  const [activeTab, setActiveTab] = useState("summary");

  const columns = [
    {
      title: "Nama Karyawan",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "PTKP",
      dataIndex: "ptkp",
      key: "ptkp",
    },
    {
      title: "Gaji Bruto",
      dataIndex: "gajiBruto",
      key: "gajiBruto",
      render: (text: number) => `Rp ${text.toLocaleString()}`,
    },
    {
      title: "Pajak Bulanan",
      dataIndex: "monthlyTax",
      key: "monthlyTax",
      render: (text: number) => `Rp ${text.toLocaleString()}`,
    },
  ];

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Detail Laporan Pajak Bulan Maret</h1>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Tab Ringkasan */}
          <Tabs.TabPane tab="Ringkasan" key="summary">
            <Card title="Ringkasan Pajak Bulanan">
              <p className="text-lg font-semibold">
                Total Pajak yang Harus Dibayarkan:{" "}
                <span className="text-red-500">
                  Rp {getTotalMonthlyTax(employees).toLocaleString()}
                </span>
              </p>
            </Card>
          </Tabs.TabPane>

          {/* Tab List Karyawan */}
          <Tabs.TabPane tab="List Karyawan" key="employees">
            <Table columns={columns} dataSource={employees} pagination={{ pageSize: 5 }} />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Layout>
  );
}
