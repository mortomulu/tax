import { useEffect, useState } from "react";
import { Button, Card, message, Table, Tabs, Upload } from "antd";
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState([]);

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

  const handleUploadTaxFile = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `payment-proofs/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("paymentproof")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("paymentproof")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error("URL publik tidak ditemukan");

      const { error: updateError } = await supabase
        .from("summary_monthly_tax")
        .update({ payment_proof_url: publicUrl })
        .eq("id", taxSummary?.id);

      if (updateError) throw updateError;

      message.success("Upload bukti pelaporan berhasil!");
      setSelectedFile(null);
      setFileList([]);
      fetchTaxSummary();
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Upload gagal!");
    }
  };

  const handleManualUpload = async () => {
    if (!selectedFile) return message.warning("Pilih file terlebih dahulu");
    await handleUploadTaxFile(selectedFile);
  };

  const handleDeleteProof = async () => {
    try {
      const publicUrl = taxSummary?.payment_proof_url;

      const filePath = publicUrl?.split("/paymentproof/")[1];

      if (!filePath) {
        throw new Error("Path file tidak ditemukan dari URL.");
      }

      const { error: deleteError } = await supabase.storage
        .from("paymentproof")
        .remove([filePath]);

      if (deleteError) {
        console.error("Gagal menghapus file:", deleteError.message);
        return;
      }

      const { error: updateError } = await supabase
        .from("summary_monthly_tax")
        .update({ payment_proof_url: null })
        .eq("id", taxSummary?.id);

      if (updateError) {
        throw updateError;
      }

      message.success("Bukti pelaporan berhasil dihapus.");
      fetchTaxSummary();
    } catch (err: any) {
      console.error("Terjadi kesalahan:", err.message);
      message.error("Terjadi kesalahan saat menghapus bukti pelaporan.");
    }
  };

  const handleChange = (info: any) => {
    const file = info.fileList[0]?.originFileObj;
    if (file) {
      setSelectedFile(file);
      setFileList(info.fileList);
    } else {
      setSelectedFile(null);
      setFileList([]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setFileList([]);
  };

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">
          Detail Laporan Pajak Bulan Maret
        </h1>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Tab Ringkasan */}
          <Tabs.TabPane tab="Ringkasan" key="summary">
            <Card title="Ringkasan Pajak Bulanan" className="mb-4">
              <p className="text-lg font-semibold">
                Total Pajak yang Harus Dibayarkan:{" "}
                <span className="text-red-500">
                  {formatRupiah(taxSummary?.total_monthly_tax)}
                </span>
              </p>
            </Card>

            <Card
              title="File Laporan Pajak"
              className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="space-y-4">
                {taxSummary?.payment_proof_url ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      danger
                      onClick={handleDeleteProof}
                      className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Hapus File
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Upload
                      name="taxReport"
                      multiple={false}
                      showUploadList={false}
                      fileList={fileList}
                      beforeUpload={() => false}
                      onChange={handleChange}
                      className="w-full"
                    >
                      <Button
                        disabled={!!selectedFile}
                        className="flex items-center gap-1 w-full sm:w-auto justify-center border-dashed border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        Pilih File
                      </Button>
                    </Upload>

                    {selectedFile && (
                      <div className="flex items-center gap-2">
                        <Button
                          danger
                          size="small"
                          onClick={handleRemove}
                          className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Batalkan
                        </Button>
                      </div>
                    )}

                    <Button
                      type="primary"
                      disabled={!selectedFile}
                      onClick={handleManualUpload}
                      className={`flex items-center gap-1 ${
                        !selectedFile ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Upload File
                    </Button>
                  </div>
                )}

                {/* Selected file preview */}
                {selectedFile && !taxSummary?.payment_proof_url && (
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  </div>
                )}

                {/* Uploaded file link */}
                {taxSummary?.payment_proof_url && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      File Laporan:
                    </p>
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <a
                        href={taxSummary.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline truncate text-sm font-medium"
                      >
                        {taxSummary.payment_proof_url.split("/").pop()}
                      </a>
                      <span className="ml-auto text-xs text-gray-500">
                        Download
                      </span>
                    </div>
                  </div>
                )}
              </div>
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
