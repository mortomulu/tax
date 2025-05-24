import Layout from "@/components/layouts/Layout";
import Header from "@/components/dashboard/Header";
import Cardmanual from "@/components/dashboard/Card";
import LineChart from "@/components/dashboard/Chart";
import {
  FaUsers,
  FaDollarSign,
  FaFileInvoiceDollar,
  FaEye,
  FaInfoCircle,
} from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import { TbTax } from "react-icons/tb";
import { Button, Card, DatePicker, Spin, Switch, Tag, Upload } from "antd";
import { useEffect, useState } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { supabase } from "@/utils/supabase";
import { formatRupiah } from "@/utils/currency";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { FiAlertCircle, FiInfo, FiLoader, FiUserCheck } from "react-icons/fi";

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

export default function Dashboard() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 2).padStart(2, "0");
  const monthNumber = today.getMonth() + 1;

  const defaultDayjs = dayjs(`${year}-${month}-01`, "YYYY-MM-DD");
  const [defaultValue, setDefaultValue] = useState<any>(defaultDayjs);

  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);

  const [employeesTotal, setEmployeesTotal] = useState<any>();
  const [employees, setEmployees] = useState<any>();
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [taxPayTotal, setTaxPayTotal] = useState<any>();
  const [salaryPayTotal, setSalaryPayTotal] = useState<any>();
  const [chartTaxMonth, setChartTaxMonth] = useState<any>();
  const [chartTax, setChartTax] = useState<any>();

  const [summaryTaxLastMonth, setSummaryTaxLastMonth] = useState<any[]>([]);
  const [summaryTaxesCurrentYear, setSummaryTaxesCurrentYear] = useState<any>();
  const [missingSummaryMonths, setMissingSummaryMonths] = useState<number[]>(
    []
  );

  const [config, setConfig] = useState({
    jkk_enabled: false,
    jkm_enabled: false,
    bpjs_enabled: false,
    loading: true,
  });

  useEffect(() => {
    if (!summaryTaxesCurrentYear) return;

    const existingMonths = summaryTaxesCurrentYear.map((d: any) =>
      Number(d.month)
    );
    const currentMonth = new Date().getMonth() + 1;
    const allMonths = Array.from({ length: currentMonth }, (_, i) => i + 1);
    const missing = allMonths.filter((m) => !existingMonths.includes(m));

    setMissingSummaryMonths(missing);
  }, [summaryTaxesCurrentYear]);

  // const handleMonthChange = (date: any) => {
  //   if (date) {
  //     setSelectedMonth(date);
  //     message.success(`Selected Month: ${date.format("MMMM YYYY")}`);
  //   } else {
  //     setSelectedMonth(null);
  //     message.info("No month selected.");
  //   }
  // };

  const fetchConfig = async () => {
    const { data } = await supabase
      .from("tax_config")
      .select("*")
      .eq("id", 1)
      .single();
    setConfig({ ...data, loading: false });
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from("employees").select("*");

    if (error) {
      console.error("Error fetching employees:", error);
      message.error("Gagal mengambil data karyawan");
    } else {
      const activeAdmin = data.find((emp) => emp.is_finance_admin);
      setSelectedAdminId(activeAdmin?.id || null);
      setEmployeesTotal(data.length || 0);
      setEmployees(data);
      setLoading(false);
    }
  };

  const fetchTaxesSummary = async () => {
    const { data, error } = await supabase
      .from("summary_monthly_tax")
      .select(
        "id, year, month, total_netto_salary, total_monthly_tax, payment_proof_url"
      );

    if (error) {
      console.error("Error fetching tax summary:", error);
      message.error("Gagal mengambil taxes summary");
      return;
    }

    const totalTax = data?.reduce(
      (acc: number, tax: any) => acc + Number(tax.total_monthly_tax || 0),
      0
    );
    setTaxPayTotal(totalTax);

    const totalPay = data?.reduce(
      (acc: number, tax: any) => acc + Number(tax.total_netto_salary || 0),
      0
    );
    setSalaryPayTotal(totalPay);

    const chartArray = data
      ?.sort((a, b) => a.month - b.month)
      .map((item: any) => ({
        month: monthNames[item.month - 1],
        total: Number(item.total_monthly_tax || 0),
      }));

    const categories = chartArray?.map((item) => item.month);
    const dataSeries = chartArray?.map((item) => item.total);

    const lastMonth = monthNumber === 1 ? 12 : monthNumber - 1;
    const lastYear = monthNumber === 1 ? year - 1 : year;

    const summaryTaxLastMonth = data.filter(
      (item) =>
        Number(item.month) === lastMonth && Number(item.year) === lastYear
    );

    const summaryTaxCurrentYear = data.filter((item) => item.year == year);

    setSummaryTaxesCurrentYear(summaryTaxCurrentYear);
    setChartTaxMonth(categories);
    setChartTax(dataSeries);
    setSummaryTaxLastMonth(summaryTaxLastMonth);
  };

  useEffect(() => {
    fetchEmployees();
    fetchTaxesSummary();
    fetchConfig();
  }, []);

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

      const lastMonth = monthNumber === 1 ? 12 : monthNumber - 1;
      const lastYear = monthNumber === 1 ? year - 1 : year;

      const { error: updateError } = await supabase
        .from("summary_monthly_tax")
        .update({ payment_proof_url: publicUrl })
        .eq("month", lastMonth)
        .eq("year", lastYear);

      if (updateError) throw updateError;

      fetchTaxesSummary();
      message.success("Upload dan update berhasil!");
      onSuccess?.("OK");
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Upload gagal!");
      onError?.(error);
    }
  };

  const handleDeleteProof = async () => {
    try {
      const publicUrl = summaryTaxLastMonth[0]?.payment_proof_url;

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
        .eq("id", summaryTaxLastMonth[0]?.id);

      if (updateError) {
        throw updateError;
      }

      message.success("Bukti pelaporan berhasil dihapus.");
      fetchTaxesSummary();
    } catch (err: any) {
      console.error("Terjadi kesalahan:", err.message);
      message.error("Terjadi kesalahan saat menghapus bukti pelaporan.");
    }
  };

  const handleChangeAdmin = async (newAdminId: number) => {
    if (!newAdminId) return;

    setLoading(true);

    try {
      // Nonaktifkan semua status admin
      await supabase
        .from("employees")
        .update({ is_finance_admin: false })
        .neq("id", newAdminId);

      // Aktifkan admin baru
      const { error } = await supabase
        .from("employees")
        .update({ is_finance_admin: true })
        .eq("id", newAdminId);

      if (error) throw error;

      setSelectedAdminId(newAdminId);
    } catch (error) {
      console.error("Gagal mengupdate admin keuangan:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (key: string, value: boolean) => {
    try {
      console.log(key, value)
      const { error } = await supabase
        .from("tax_config")
        .update({ [key]: value })
        .eq("id", 1);

      if (error) throw error;

      setConfig((prev) => ({ ...prev, [key]: value }));
      message.success("Konfigurasi diperbarui!");
    } catch (error) {
      message.error("Gagal menyimpan perubahan");
    }
  };

  return (
    <Layout>
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Cardmanual
          title="Total Karyawan"
          value={employeesTotal}
          color="bg-blue-600"
          icon={<FaUsers className="text-white" />}
        />
        <Cardmanual
          title="Total Gaji Dibayar"
          value={formatRupiah(salaryPayTotal)}
          color="bg-green-600"
          icon={<GiMoneyStack className="text-white" />}
        />
        <Cardmanual
          title="Total Pajak Dibayar"
          value={formatRupiah(taxPayTotal)}
          color="bg-yellow-500"
          icon={<TbTax className="text-white" />}
        />
      </div>

      {/* Payment Status Card - New Addition */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FaFileInvoiceDollar className="text-blue-500 mr-2" />
          Status Pelaporan Pajak
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-700 font-medium">
                Masa {monthNumber && monthNumber - 1}/{year && year}
              </p>
              {summaryTaxLastMonth.length > 0 ? (
                summaryTaxLastMonth[0]?.payment_proof_url === null ? (
                  <Tag color="red" className="!text-sm !py-1 !px-3">
                    Belum Dilapor
                  </Tag>
                ) : (
                  <Tag color="green" className="!text-sm !py-1 !px-3">
                    Dilapor
                  </Tag>
                )
              ) : (
                <Tag color="orange" className="!text-sm !py-1 !px-3">
                  Data Tidak Tersedia
                </Tag>
              )}
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-gray-800 font-medium text-lg mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500 mr-2"
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
                Bukti Pelaporan
              </h3>

              {summaryTaxLastMonth.length > 0 &&
              summaryTaxLastMonth[0]?.payment_proof_url ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          File Terupload
                        </p>
                        <a
                          href={summaryTaxLastMonth[0].payment_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium truncate block"
                        >
                          {summaryTaxLastMonth[0].payment_proof_url
                            .split("/")
                            .pop() || "Bukti Pelaporan"}
                        </a>
                      </div>
                    </div>
                  </div>

                  <Button
                    danger
                    onClick={handleDeleteProof}
                    className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300 px-4 py-2 rounded-md transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
                    Hapus
                  </Button>
                </div>
              ) : summaryTaxLastMonth.length > 0 ? (
                <div className="space-y-4">
                  <Upload
                    showUploadList={false}
                    customRequest={(options) => handleUpload(options)}
                    disabled={!summaryTaxLastMonth[0]}
                    className="w-full"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      disabled={!summaryTaxLastMonth[0]}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 ${
                        !summaryTaxLastMonth[0]
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-300"
                      } px-4 py-2 rounded-md transition-colors`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                      Upload Bukti Pelaporan
                    </Button>
                  </Upload>

                  {!summaryTaxLastMonth[0] && (
                    <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p className="text-sm text-yellow-700">
                        Belum waktunya untuk upload bukti pelaporan
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Data pelaporan tidak tersedia
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* You can add additional payment-related information here */}
          {/* <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-gray-700 font-medium mb-3">Informasi Pajak</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Batas Pembayaran:</span> 10{" "}
                {month && monthNames[month]} {year && year}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status Pelaporan:</span>{" "}
                {taxArchieveCurrentPeriod?.reportStatus || "Belum Dilaporkan"}
              </p>
              {taxArchieveCurrentPeriod?.paymentDate && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tanggal Pembayaran:</span>{" "}
                  {formatDate(taxArchieveCurrentPeriod.paymentDate)}
                </p>
              )}
            </div>
          </div> */}

          {/* Date to automate archieve */}
          <div className="mb-6">
            <div className="p-6 rounded-lg shadow-md border-l-4 bg-indigo-950 text-white border-yellow-400">
              <h2 className="text-xl font-semibold text-white mb-4">
                Laporan Pajak Bulan {monthNames[monthNumber - 1]} Diarsipkan
                Secara Otomatis pada Tanggal Berikut
              </h2>
              <DatePicker
                value={defaultValue}
                className="w-full md:w-64 !bg-white !text-black"
                disabled
              />
            </div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <FiUserCheck className="text-blue-500" />
              Admin Keuangan
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
                <FiLoader className="animate-spin" />
                <span>Memuat data karyawan...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Pilih Admin Keuangan:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedAdminId || ""}
                      onChange={(e) =>
                        handleChangeAdmin(Number(e.target.value))
                      }
                      className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white pr-10"
                      disabled={updating}
                    >
                      <option value="">-- Pilih Karyawan --</option>
                      {employees.map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}{" "}
                          {emp.npwp ? `(NPWP: ${emp.npwp})` : "(NPWP Kosong)"}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FiInfo className="text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    NPWP admin akan digunakan untuk pelaporan pajak perusahaan
                  </p>
                </div>

                {selectedAdminId && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <FiUserCheck className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Admin Terpilih:{" "}
                          <span className="text-blue-600">
                            {
                              employees.find(
                                (e: any) => e.id === selectedAdminId
                              )?.name
                            }
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <span>NPWP:</span>
                          {employees.find((e: any) => e.id === selectedAdminId)
                            ?.npwp ? (
                            <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">
                              {
                                employees.find(
                                  (e: any) => e.id === selectedAdminId
                                )?.npwp
                              }
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center gap-1">
                              <FiAlertCircle />
                              Belum diisi
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {updating && (
              <div className="mt-4 flex items-center gap-2 text-blue-600">
                <FiLoader className="animate-spin" />
                <span>Menyimpan perubahan...</span>
              </div>
            )}
          </div>

          {/* toggle jkk, jkm, bpjs */}
          <Card
            title="Konfigurasi Benefit"
            bordered={false}
            className="shadow-sm"
          >
            {config.loading ? (
              <Spin />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={config.jkk_enabled}
                    onChange={(checked) => updateConfig("jkk_enabled", checked)}
                  />
                  <span className="font-medium">
                    Jaminan Kecelakaan Kerja (JKK)
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <Switch
                    checked={config.jkm_enabled}
                    onChange={(checked) => updateConfig("jkm_enabled", checked)}
                  />
                  <span className="font-medium">
                    Jaminan Kematian (JKM)
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <Switch
                    checked={config.bpjs_enabled}
                    onChange={(checked) => updateConfig("bpjs_enabled", checked)}
                  />
                  <span className="font-medium">
                    Jaminan Kematian (JKM)
                  </span>
                </div>

                <p className="text-gray-500 text-sm mt-2">
                  Catatan: Perubahan akan berlaku untuk semua karyawan.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart chartTax={chartTax} chartTaxMonth={chartTaxMonth} />
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Pengingat Pajak Bulanan Belum Tersedia
            </h2>

            {missingSummaryMonths.length === 0 ? (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <CheckCircleOutlined className="text-green-600 text-lg" />
                </div>
                <div>
                  <h4 className="text-green-800 font-medium mb-1">
                    Data pajak bulan ini sudah lengkap
                  </h4>
                  <p className="text-green-600 text-sm">
                    Semua laporan pajak telah terarsip dengan baik 🎉
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center mb-2">
                  <ExclamationCircleOutlined className="text-red-500 mr-2" />
                  <h4 className="font-medium text-gray-800">
                    {missingSummaryMonths.length} Bulan Belum Terlapor
                  </h4>
                </div>

                <div className="border rounded-lg divide-y">
                  {missingSummaryMonths.map((month, index) => (
                    <div
                      key={month}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-400 rounded-full flex-shrink-0"></div>
                        <div>
                          <Link
                            href={`/dashboard/archive/add?month=${month}&year=${new Date().getFullYear()}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {monthNames[month - 1]} {new Date().getFullYear()}{" "}
                          </Link>
                          <p className="text-gray-500 text-sm mt-1">
                            Belum ada laporan pajak tersedia
                          </p>
                        </div>
                      </div>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-gray-500 text-sm mt-2">
                  <InfoCircleOutlined className="mr-1" />
                  Klik pada bulan untuk melengkapi laporan pajak
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
