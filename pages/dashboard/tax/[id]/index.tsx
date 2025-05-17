import React, { useEffect, useState } from "react";
import { Card, Table, Tabs, Badge, message } from "antd";
import Layout from "@/components/layouts/Layout";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";
import {
  DollarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  HistoryOutlined,
  IdcardOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;

const InfoItem = ({ icon, label, value, fullWidth = false }: any) => (
  <div className={`flex items-start ${fullWidth ? "w-full" : ""}`}>
    <span className="text-gray-500 mr-3 mt-1">
      {React.cloneElement(icon, { className: "text-lg" })}
    </span>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p
        className={`text-gray-800 ${
          value === "Tidak tersedia" ? "italic text-gray-400" : ""
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

const taxColumns = [
  { title: "Masa", dataIndex: "periode", key: "periode" },
  {
    title: "Gaji Bruto",
    dataIndex: "bruto_salary",
    key: "bruto_salary",
    render: (value: number) => value.toLocaleString("id-ID"),
  },
  {
    title: "Pajak (Rp)",
    dataIndex: "tax_total",
    key: "tax_total",
    render: (value: number) => value.toLocaleString("id-ID"),
  },
  {
    title: "Status",
    key: "proofPaymentUrl",
    dataIndex: "proofPaymentUrl",
    render: (proofPaymentUrl: string) =>
      proofPaymentUrl ? (
        <Badge status="success" text="Dilapor" />
      ) : (
        <Badge status="default" text="Belum Dilapor" />
      ),
  },
];

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const EmployeeDetailPage: React.FC = () => {
  const { query } = useRouter();
  const { id } = query;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const [employee, setEmployee] = useState<any>();
  const [taxArchieve, setTaxArchieve] = useState<any>();
  const [taxArchieveCurrentPeriod, setTaxArchieveCurrentPeriod] =
    useState<any>();
  const [taxEmployee, setTaxEmployee] = useState<any>();

  const fetchEmployee = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("employees")
      .select(
        `
          id,
          name,
          nik,
          address,
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

    setEmployee(data);
    return data;
  };

  const fetchTaxArchieve = async () => {
    if (!id) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const { data, error } = await supabase
      .from("monthly_tax_archive")
      .select(
        `
        year,
        month,
        thp,
        bruto_salary,
        tax_total,
        payment_proof_url
      `
      )
      .eq("idemployee", id);

    if (error) {
      message.error("Gagal mengambil archive tax karyawan");
      console.error("Gagal mengambil archive tax karyawan:", error.message);
      return null;
    }

    const { data: summaryTax, error: errorSummaryTax } = await supabase
      .from("summary_monthly_tax")
      .select(
        "year, month, total_netto_salary, total_monthly_tax, payment_proof_url"
      );

    if (errorSummaryTax) {
      console.error("Error fetching tax summary:", error);
      message.error("Gagal mengambil taxes summary");
      return;
    }

    const formatted = data.map((item) => {
      const monthIndex = parseInt(item.month, 10) - 1;
      const monthName = monthNames[monthIndex] || item.month;

      const summary: any = summaryTax.find(
        (s) =>
          Number(s.month) === Number(item.month) &&
          Number(s.year) === Number(item.year)
      );

      return {
        periode: `${monthIndex}/${item.year}`,
        thp: item.thp,
        bruto_salary: item.bruto_salary,
        tax_total: item.tax_total,
        year: item.year,
        month: item.month,
        proofPaymentUrl: summary?.payment_proof_url || null,
      };
    });

    setTaxArchieve(formatted);

    const currentPeriod = formatted.find(
      (item) => parseInt(item.year) === year && parseInt(item.month) === month
    );

    console.log("currentPeriod", currentPeriod);

    if (currentPeriod) {
      setTaxArchieveCurrentPeriod(currentPeriod);
    } else {
      setTaxArchieveCurrentPeriod(null);
    }
  };

  const fetchTaxEmployee = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("tax")
      .select(
        `
          id,
          thp,
          incentive,
          overtime_allowance,
          jkk,
          jkm,
          bonus,
          thr,
          brutosalary,
          monthlytax,
          dectax
        `
      )
      .eq("idemployee", id)
      .single();

    if (error) {
      message.error("Gagal mengambil data pajak karyawan");
      console.error("Gagal mengambil data pajak karyawan:", error.message);
      return null;
    }

    setTaxEmployee(data);
    return data;
  };

  useEffect(() => {
    fetchEmployee();
    fetchTaxArchieve();
    fetchTaxEmployee();
  }, [id]);

  return (
    <Layout>
      <h2>Detail Karyawan</h2>

      {/* Informasi Karyawan */}
      <Card
        title={
          <div className="flex items-center">
            <UserOutlined className="text-blue-500 text-lg mr-2" />
            <span className="text-lg font-semibold">Informasi Karyawan</span>
          </div>
        }
        bordered={false}
        className="mt-5 mb-5 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500"
        headStyle={{ borderBottom: "none", padding: 0 }}
      >
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4 flex-1">
            {/* Information Item Component */}
            <InfoItem
              icon={<UserOutlined />}
              label="Nama"
              value={employee?.name || "Tidak tersedia"}
            />

            <InfoItem
              icon={<SolutionOutlined />}
              label="Jabatan"
              value={employee?.positions?.position || "Tidak tersedia"}
            />

            <InfoItem
              icon={<IdcardOutlined />}
              label="NIK/NPWP"
              value={employee?.nik || "Tidak tersedia"}
            />

            <InfoItem
              icon={<FileTextOutlined />}
              label="Status PTKP"
              value={employee?.ptkp?.ptkp || "Tidak tersedia"}
            />
          </div>

          {/* Additional Information Column (optional) */}
          <div className="space-y-4 flex-1">
            {/* <InfoItem
              icon={<MailOutlined />}
              label="Email"
              value={employee?.email || "Tidak tersedia"}
            />

            <InfoItem
              icon={<PhoneOutlined />}
              label="Nomor Telepon"
              value={employee?.phone || "Tidak tersedia"}
            /> */}

            <InfoItem
              icon={<EnvironmentOutlined />}
              label="Alamat"
              value={employee?.address || "Tidak tersedia"}
              fullWidth
            />
          </div>
        </div>

        {/* Edit Button (optional) */}
        {/* <div className="flex justify-end mt-6">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditEmployee(employee)}
            className="flex items-center"
          >
            Edit Informasi
          </Button>
        </div> */}
      </Card>

      {/* Tabs untuk Riwayat Pajak */}
      <Tabs
        defaultActiveKey="1"
        tabPosition="left"
        className="bg-white rounded-lg shadow-sm"
        tabBarStyle={{ padding: 0 }}
        tabBarGutter={0}
      >
        <TabPane
          tab={
            <span className="font-medium text-gray-700 px-4 py-2">
              <FileTextOutlined className="mr-2" />
              Rincian Pajak
            </span>
          }
          key="1"
        >
          <div className="p-4">
            {taxEmployee && (
              <Card
                bordered={false}
                className="mb-6 bg-white rounded-lg shadow-sm"
                bodyStyle={{ padding: 0 }}
              >
                <div className="p-5 border-b">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <DollarOutlined className="mr-2 text-green-600" />
                    Rincian Pajak Bulanan
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded transition-colors">
                      <span className="text-gray-600 font-medium">
                        Take Home Pay (THP)
                      </span>
                      <span className="text-gray-900 font-semibold">
                        Rp{taxEmployee.thp?.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded transition-colors">
                      <span className="text-gray-600 font-medium">
                        Tunjangan
                      </span>
                      <span className="text-gray-900 font-semibold">
                        Rp{taxEmployee.incentive?.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded transition-colors">
                      <span className="text-gray-600 font-medium">Lembur</span>
                      <span className="text-gray-900 font-semibold">
                        Rp
                        {taxEmployee.overtime_allowance?.toLocaleString(
                          "id-ID"
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded transition-colors">
                      <span className="text-gray-600 font-medium">JKK</span>
                      <span className="text-gray-900 font-semibold">
                        Rp{taxEmployee.jkk?.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded transition-colors">
                      <span className="text-gray-600 font-medium">JKM</span>
                      <span className="text-gray-900 font-semibold">
                        Rp{taxEmployee.jkm?.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded transition-colors">
                      <span className="text-gray-600 font-medium">Bonus</span>
                      <span className="text-gray-900 font-semibold">
                        Rp{taxEmployee.bonus?.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded transition-colors">
                      <span className="text-gray-600 font-medium">THR</span>
                      <span className="text-gray-900 font-semibold">
                        Rp{taxEmployee.thr?.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                      <span className="text-blue-600 font-medium">
                        Gaji Bruto
                      </span>
                      <span className="text-blue-900 font-bold">
                        Rp{taxEmployee.brutosalary?.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-red-50 rounded border-l-4 border-red-500">
                      <span className="text-red-600 font-medium">
                        Pajak Bulanan
                      </span>
                      <span className="text-red-900 font-bold">
                        Rp{taxEmployee.monthlytax?.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {taxEmployee.dectax !== null && (
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                        <span className="text-purple-600 font-medium">
                          Pajak Akhir Tahun (Desember)
                        </span>
                        <span className="text-purple-900 font-bold">
                          Rp{taxEmployee.dectax?.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </TabPane>

        <TabPane
          tab={
            <span className="font-medium text-gray-700 px-4 py-2">
              <HistoryOutlined className="mr-2" />
              Riwayat Pajak
            </span>
          }
          key="2"
        >
          <div className="p-4">
            <Table
              dataSource={taxArchieve}
              columns={taxColumns}
              pagination={{ pageSize: 5 }}
              className="rounded-lg shadow-sm"
              rowClassName="hover:bg-gray-50 transition-colors"
            />
          </div>
        </TabPane>
      </Tabs>
    </Layout>
  );
};

export default EmployeeDetailPage;
