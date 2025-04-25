import React, { useEffect, useState } from "react";
import { Card, Table, Tabs, Badge, message, Upload, Button, Tag } from "antd";
import Layout from "@/components/layouts/Layout";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";
import { UploadOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

const taxColumns = [
  { title: "Periode", dataIndex: "periode", key: "periode" },
  {
    title: "Gaji (Rp)",
    dataIndex: "thp",
    key: "thp",
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
        <Badge status="success" text="Dibayar" />
      ) : (
        <Badge status="default" text="Belum Dibayar" />
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

    const formatted = data.map((item) => {
      const monthIndex = parseInt(item.month, 10) - 1;
      const monthName = monthNames[monthIndex] || item.month;

      return {
        periode: `${monthName} ${item.year}`,
        thp: item.thp,
        tax_total: item.tax_total,
        year: item.year,
        month: item.month,
        proofPaymentUrl: item.payment_proof_url,
      };
    });

    setTaxArchieve(formatted);

    const currentPeriod = formatted.find(
      (item) => parseInt(item.year) === year && parseInt(item.month) === month
    );

    if (currentPeriod) {
      setTaxArchieveCurrentPeriod(currentPeriod);
    } else {
      setTaxArchieveCurrentPeriod(null);
    }
  };

  useEffect(() => {
    fetchEmployee();
    fetchTaxArchieve();
  }, [id]);

  const handleUpload = async ({ file, onSuccess, onError }: any) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `payment-proofs/${fileName}`;

    try {
      const { data, error: uploadError } = await supabase.storage
        .from("paymentproof")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("paymentproof")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) throw new Error("URL publik tidak ditemukan");

      const { error: updateError } = await supabase
        .from("monthly_tax_archive")
        .update({ payment_proof_url: publicUrl })
        .eq("month", month);

      if (updateError) throw updateError;

      fetchTaxArchieve();
      message.success("Upload dan update berhasil!");
      onSuccess?.("OK");
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Upload gagal!");
      onError?.(error);
    }
  };

  return (
    <Layout>
      <h2>Detail Karyawan</h2>

      {/* Informasi Karyawan */}
      <Card
        title="Informasi Karyawan"
        bordered={false}
        className="mt-5 mb-5 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500"
      >
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="space-y-3 flex-1">
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
                {employee?.name}
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
                {employee?.positions?.position}
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
                {employee?.nik}
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
                <span className="font-semibold text-gray-800">
                  Status PTKP:
                </span>{" "}
                {employee?.ptkp?.ptkp}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-gray-800 font-semibold mb-1">
                Status Pembayaran Periode {month && monthNames[month]}{" "}
                {year && year}:
              </p>
              {taxArchieveCurrentPeriod?.proofPaymentUrl === null ? (
                <Tag color="red">Belum Dibayar</Tag>
              ) : (
                <Tag color="green">Dibayar</Tag>
              )}
            </div>

            <div>
              <p className="text-gray-800 font-semibold mb-1">
                Bukti Pembayaran:
              </p>
              {taxArchieveCurrentPeriod?.proofPaymentUrl ? (
                <a
                  href={taxArchieveCurrentPeriod?.proofPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Lihat Bukti
                </a>
              ) : (
                <>
                  <Upload
                    showUploadList={false}
                    customRequest={(options) => handleUpload(options)}
                    disabled={!taxArchieveCurrentPeriod}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      disabled={!taxArchieveCurrentPeriod}
                    >
                      Upload Bukti
                    </Button>
                  </Upload>

                  {!taxArchieveCurrentPeriod && (
                    <p className="text-sm text-red-500 mt-2">
                      Belum waktunya untuk upload bukti pembayaran
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs untuk Riwayat Pajak */}
      <Tabs defaultActiveKey="1">
        <TabPane tab="Riwayat Pajak" key="1">
          <Table
            dataSource={taxArchieve}
            columns={taxColumns}
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
      </Tabs>
    </Layout>
  );
};

export default EmployeeDetailPage;
