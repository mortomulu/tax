import { useEffect, useState } from "react";
import { Card, message, Table, Tabs } from "antd";
import Layout from "@/components/layouts/Layout";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";
import { formatRupiah } from "@/utils/currency";

interface EmployeeData {
  key: string;
  name: string;
  ptkp: string;
  gajiBruto: number;
  monthlyTax: number;
}

export default function MonthlyReportDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [taxSummary, setTaxSummary] = useState<any>();
  const [employeesTax, setEmployeesTax] = useState<any>();

  const fetchTaxSummary = async () => {
    const { data, error } = await supabase
      .from("summary_monthly_tax")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      message.error("Gagal mengambil data ringkasan pajak");
      console.error("fetchTaxSummary error:", error);
      return;
    }

    setTaxSummary(data);
  };

  const fetchEmployeesTax = async () => {
    const { data, error } = await supabase
      .from("monthly_tax_archive")
      .select(
        `
        *,
        employees (
          name,
          nik
        )
      `
      )
      .eq("id_summary", id);

    if (error) {
      message.error("Gagal mengambil data pajak karyawan");
      console.error("fetchEmployeesTax error:", error);
      return;
    }

    setEmployeesTax(data);
  };

  useEffect(() => {
    if (id) {
      fetchTaxSummary();
      fetchEmployeesTax();
    }
  }, [id]);

  const [activeTab, setActiveTab] = useState("summary");

  const columns = [
    {
      title: "Nama Karyawan",
      dataIndex: "employee_name",
      key: "employee_name",
    },
    {
      title: "PTKP",
      dataIndex: "ptkp",
      key: "ptkp",
    },
    {
      title: "Gaji Bruto",
      dataIndex: "bruto_salary",
      key: "bruto_salary",
      render: (text: number) => `Rp ${text?.toLocaleString()}`,
    },
    {
      title: "Pajak Bulanan",
      dataIndex: "tax_total",
      key: "tax_total",
      render: (text: number) => `Rp ${text?.toLocaleString()}`,
    },
  ];

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">
          Detail Laporan Pajak Bulan Maret
        </h1>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Tab Ringkasan */}
          <Tabs.TabPane tab="Ringkasan" key="summary">
            <Card title="Ringkasan Pajak Bulanan">
              <p className="text-lg font-semibold">
                Total Pajak yang Harus Dibayarkan:{" "}
                <span className="text-red-500">
                  {formatRupiah(taxSummary?.total_monthly_tax)}
                </span>
              </p>
            </Card>
          </Tabs.TabPane>

          {/* Tab List Karyawan */}
          <Tabs.TabPane tab="List Karyawan" key="employees">
            <Table
              columns={columns}
              dataSource={employeesTax}
              pagination={{ pageSize: 5 }}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Layout>
  );
}
