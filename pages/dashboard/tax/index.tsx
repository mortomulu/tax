import { useEffect, useState } from "react";
import Layout from "@/components/layouts/Layout";
import AnotherTable from "@/components/core/tax/AnotherTable";
import { Button, Modal, Input, Select, message, Tabs } from "antd";
import InformationCircleIcon, { PlusOutlined } from "@ant-design/icons";
import {
  calculateBrutoSalary,
  getTypeTer,
  getTerArt21,
  calcMonthlyTax,
} from "@/helpers/taxCalc";
import { supabase } from "@/utils/supabase";
import { calcDecTax, calcDecTaxFinal } from "@/helpers/decTaxCalc";
import { anotherFormatRupiah } from "@/helpers/formatter";

interface DataType {
  id: string;
  idName: any;
  name: string;
  isActiveEmployee: boolean;
  position: string;
  positionAllowance: number;
  ptkp: string;
  thp: number;
  incentive: number;
  overtimeAllowance: number;
  jkk: number;
  jkm: number;
  bpjs: number;
  bonus: number;
  thr: number;
  nettoSalary: number;
  brutoSalary: number;
  monthlyTax: number;
}

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

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;

export default function List() {
  const [data, setData] = useState<DataType[]>([]);

  const [employeeOptions, setEmployeeOptions] = useState<any>();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [idName, setIdName] = useState<any>();
  const [newName, setNewName] = useState("");
  const [idPosition, setIdPosition] = useState("");
  const [newGajiPokok, setNewGajiPokok] = useState<any>();
  const [positionAllowance, setPositionAllowance] = useState<any>("");
  const [incentive, setIncentive] = useState<any>();
  const [overtimeAllowance, setOvertimeAllowance] = useState<any>("");
  const [jkk, setJkk] = useState<any>("");
  const [jkm, setJkm] = useState<any>("");
  const [bpjs, setBpjs] = useState<any>("");
  const [bonus, setBonus] = useState<any>("");
  const [thr, setThr] = useState<any>("");
  const [etc, setEtc] = useState("");

  const [ptkp, setPtkp] = useState<any>();
  const [ter, setTer] = useState<any>();

  const [ptkpOptions, setPtkpOptions] = useState<any>();

  const [config, setConfig] = useState({
    jkk_enabled: false,
    jkm_enabled: false,
    bpjs_enabled: false,
    loading: true,
  });

  const fetchAll = async () => {
    const { data: taxData, error: taxError } = await supabase.from("tax")
      .select(`
      *,
      positions: idposition (
        id,
        position, 
        incentive
      ),
      employees: idemployee (
        id,
        name,
        nik,
        is_active,
        ptkp (
          id,
          ptkp
        )
      )
    `);

    if (taxError) {
      console.error("Error fetching tax data:", taxError);
      return;
    }

    const formattedTax = taxData
      .map((item: any) => ({
        id: item?.id,
        idName: item?.employees?.id,
        name: item?.employees?.name,
        isActiveEmployee: item?.employees?.is_active,
        position: item?.positions?.position,
        positionAllowance: item?.positions?.incentive,
        ptkp: item?.employees?.ptkp?.ptkp,
        thp: item?.thp,
        incentive: item?.incentive,
        overtimeAllowance: item?.overtime_allowance,
        jkk: item?.jkk,
        jkm: item?.jkm,
        bpjs: item?.bpjs,
        bonus: item?.bonus,
        thr: item?.thr,
        nettoSalary: item?.nettosalary,
        brutoSalary: item?.brutosalary,
        monthlyTax: item?.monthlytax,
      }))
      .sort((a, b) => a.id - b.id);

    setData(formattedTax);

    const existingEmployeeIds = formattedTax.map((item) => item.idName);

    const { data: employees, error: empError } = await supabase.from(
      "employees"
    ).select(`
      id,
      name,
      nik,
      is_active,
      ptkp (
        id,
        ptkp
      ),
      positions (
          id,
          position,
          incentive
        )
    `);

    if (empError) {
      message.error("Gagal mengambil opsi pegawai");
      console.error("Gagal mengambil employee options", empError);
      return;
    }

    const filteredEmployees = employees.filter(
      (emp: any) => !existingEmployeeIds.includes(emp.id)
    );

    const formattedEmployees = filteredEmployees.map((item: any) => ({
      id: item.id,
      name: item.name,
      nik: item.nik,
      isActiveEmployee: item.is_active,
      ptkp: item.ptkp?.ptkp || "-",
      idPosition: item?.positions?.id,
      positionNow: item?.positions?.position || null,
      positionAllowance: item?.positions?.incentive,
    }));

    setEmployeeOptions(formattedEmployees);
  };

  const fetchTer = async () => {
    const { data, error } = await supabase.from("ter").select(`*`);

    if (error) {
      console.error("Error fetching ter data:", error);
      return [];
    }

    setTer(data);
  };

  const fetchPtkp = async () => {
    const { data: ptkp, error: fetchPtkpError } = await supabase
      .from("ptkp")
      .select("ptkp, amount");

    if (fetchPtkpError) {
      console.error("Error fetching ptkp data:", fetchPtkpError);
      message.error("Error fetching ptkp data");
      return [];
    }

    setPtkpOptions(ptkp);
  };

  const fetchConfig = async () => {
    const { data } = await supabase
      .from("tax_config")
      .select("*")
      .eq("id", 1)
      .single();
    setConfig({ ...data, loading: false });
  };

  useEffect(() => {
    fetchAll();
    fetchTer();
    fetchPtkp();
    fetchConfig();
  }, []);

  useEffect(() => {
    const selectedEmployee = employeeOptions?.find(
      (emp: any) => emp.id === idName
    );

    if (selectedEmployee) {
      setPositionAllowance(selectedEmployee.positionAllowance || 0);
      setIdPosition(selectedEmployee.idPosition);
      setPtkp(selectedEmployee.ptkp);
    } else {
      setPositionAllowance(0);
    }
  }, [idName]);

  useEffect(() => {
    const gaji = parseFloat(newGajiPokok) || 0;

    setJkk((gaji * 0.89) / 100);
    setJkm((gaji * 0.3) / 100);
    setBpjs((gaji * 4) / 100);
  }, [newGajiPokok]);

  const resetForm = () => {
    setNewName("");
    setIdName("");
    setNewGajiPokok("");
    setPositionAllowance("");
    setIncentive("");
    setOvertimeAllowance("");
    setJkk("");
    setJkm("");
    setBpjs("");
    setBonus("");
    setThr("");
    setBonus("");
    setIsModalOpen(false);
  };

  const handleAddTaxData = async () => {
    if (!idName || !newGajiPokok) {
      message.error("Nama dan Gaji Pokok wajib diisi.");
      return;
    }

    const typeTer = getTypeTer(ptkp);

    const brutoSalary = calculateBrutoSalary(
      Number(newGajiPokok) || 0,
      Number(positionAllowance) || 0,
      Number(incentive) || 0,
      Number(overtimeAllowance) || 0,
      config.jkk_enabled ? Number(jkk) || 0 : 0,
      config.jkm_enabled ? Number(jkm) || 0 : 0,
      config.bpjs_enabled ? Number(bpjs) || 0 : 0,
      Number(bonus) || 0,
      Number(thr) || 0
    );

    const terArt = getTerArt21(brutoSalary, typeTer, ter);
    let monthlyTax = 0;

    if (terArt !== null && terArt !== 0) {
      monthlyTax = calcMonthlyTax(brutoSalary, terArt);
    }

    let decTax = undefined;

    if (month === 12) {
      const { data: monthlyTaxData, error } = await supabase
        .from("monthly_tax_archive")
        .select("tax_total, bruto_salary")
        .eq("idemployee", idName)
        .eq("year", year)
        .lt("month", 12);

      if (error) {
        console.error("Gagal mengambil data bulan 1-11:", error.message);
        return;
      }

      const monthsCount = monthlyTaxData?.length || 0;

      const totalTax11 =
        monthlyTaxData?.reduce((sum, item) => sum + (item.tax_total || 0), 0) ||
        0;

      const totalBruto11 =
        monthlyTaxData?.reduce(
          (sum, item) => sum + (item.bruto_salary || 0),
          0
        ) || 0;

      const yearlyBruto = totalBruto11 + brutoSalary;

      const ptkpEmployee = ptkpOptions.find((item: any) => item.ptkp === ptkp);
      if (!ptkpEmployee) {
        console.warn(`PTKP tidak ditemukan untuk ID ${newName}`);
        return;
      }

      const isIncompleteData = monthsCount < 11 && monthsCount > 0;

      const adjustedBruto = isIncompleteData
        ? (yearlyBruto / monthsCount) * 12
        : yearlyBruto;

      const totalTaxable = calcDecTax(adjustedBruto, ptkpEmployee.amount);

      let yearlyPPh = calcDecTaxFinal(totalTaxable);

      if (isIncompleteData) {
        yearlyPPh = (yearlyPPh / 12) * monthsCount;
      }

      decTax = Math.max(yearlyPPh - (totalTax11 + monthlyTax), 0);
    }

    const { error } = await supabase.from("tax").insert([
      {
        idemployee: idName,
        idposition: idPosition,
        thp: newGajiPokok,
        incentive: incentive || positionAllowance || 0,
        overtime_allowance: overtimeAllowance || 0,
        jkk: jkk || 0,
        jkm: jkm || 0,
        bpjs: bpjs || 0,
        bonus: bonus || 0,
        thr: thr || 0,
        brutosalary: brutoSalary,
        monthlytax: monthlyTax,
        tarif: terArt,
        ...(month === 12 && { dectax: Number(decTax) }),
      },
    ]);

    if (error) {
      console.error("Gagal menambahkan data:", error.message);
      message.error("Gagal menambahkan data pajak.");
    } else {
      fetchAll();
      message.success("Data berhasil ditambahkan!");
      resetForm();
    }
  };

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Information Alert */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Jika diperlukan, Anda dapat mengedit data pajak untuk bulan{" "}
                <span className="font-semibold">{monthNames[month - 1]}</span>{" "}
                sebelum sistem melakukan arsip laporan pajak otomatis pada
                tanggal{" "}
                <span className="font-semibold">
                  {year}-{month + 1}-01
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        {employeeOptions?.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              ⚠️ Perhatian:
            </p>
            <p className="text-sm text-yellow-800">
              Terdapat beberapa karyawan yang belum memiliki data pajak untuk
              bulan{" "}
              <strong>
                {monthNames[month - 1]} {year}
              </strong>
              . Harap lengkapi data pajak mereka sebelum sistem mengarsipkan
              laporan secara otomatis pada{" "}
              <strong>
                {year}-{month + 1}-01
              </strong>
              .
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-yellow-800">
              {employeeOptions?.map((item: any, i: number) => (
                <li key={i}>{item.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Header with Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Data Pajak Karyawan
            </h1>
            {/* <p className="text-sm text-gray-500 mt-1">
              Total {data.length} karyawan
            </p> */}
          </div>
          <Button
            type="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<PlusOutlined />}
            className="w-full sm:w-auto"
          >
            Tambah Data Pajak
          </Button>
        </div>

        {/* Table */}
        <div className=" rounded-lg overflow-hidden">
          <Tabs defaultActiveKey="active" className="mb-6">
            <Tabs.TabPane tab="Pajak Karyawan Aktif" key="active">
              <AnotherTable
                data={data.filter((item) => item.isActiveEmployee === true)}
                fetchAllTaxData={fetchAll}
                employeeOptions={employeeOptions}
              />
            </Tabs.TabPane>

            <Tabs.TabPane tab="Pajak Karyawan Tidak Aktif" key="inactive">
              <AnotherTable
                data={data.filter((item) => item.isActiveEmployee === false)}
                fetchAllTaxData={fetchAll}
                employeeOptions={employeeOptions}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>

      {/* Modal Add Data */}
      <Modal
        title="Tambah Data Pajak Karyawan"
        open={isModalOpen}
        onCancel={() => {
          resetForm();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              resetForm();
            }}
          >
            Batal
          </Button>,
          <Button key="add" type="primary" onClick={handleAddTaxData}>
            Simpan Data
          </Button>,
        ]}
      >
        <div className="space-y-4">
          {/* Employee Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Nama Karyawan <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="Pilih Karyawan"
              value={idName || undefined}
              onChange={(value) => setIdName(value)}
              className="w-full min-w-[200px]"
              optionFilterProp="children"
            >
              {employeeOptions?.map((option: any) => (
                <Select.Option
                  key={option.id}
                  value={option.id}
                  className="hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate">{option.name}</span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        option.isActiveEmployee
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {option.isActiveEmployee ? "Aktif" : "Non-Aktif"}
                    </span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Salary Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1 */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Take Home Pay (THP) <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Masukkan THP"
                  type="text"
                  value={anotherFormatRupiah(newGajiPokok)}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, "");
                    if (rawValue.length > 1 && rawValue.startsWith("0")) return;
                    setNewGajiPokok(rawValue);
                  }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Position Allowance
                </label>
                <Input
                  placeholder="Masukkan Position Allowance"
                  type="text"
                  value={idName ? anotherFormatRupiah(positionAllowance) : ""}
                  onChange={(e) => setPositionAllowance(e.target.value)}
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Incentive
                </label>
                <Input
                  placeholder="Masukkan Incentive"
                  type="text"
                  value={anotherFormatRupiah(incentive)}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, "");
                    if (rawValue.length > 1 && rawValue.startsWith("0")) return;
                    setIncentive(rawValue);
                  }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Overtime Allowance
                </label>
                <Input
                  placeholder="Masukkan Overtime Allowance"
                  type="text"
                  value={anotherFormatRupiah(overtimeAllowance)}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, "");
                    if (rawValue.length > 1 && rawValue.startsWith("0")) return;
                    setOvertimeAllowance(rawValue);
                  }}
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Jaminan Kecelakaan Kerja (JKK)
                </label>
                <Input
                  placeholder="Masukkan JKK"
                  type="text"
                  value={config?.jkk_enabled ? anotherFormatRupiah(jkk) : 0}
                  onChange={(e) => setJkk(e.target.value)}
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Jaminan Kematian (JKM)
                </label>
                <Input
                  placeholder="Masukkan JKM"
                  type="text"
                  value={config?.jkm_enabled ? anotherFormatRupiah(jkm) : 0}
                  onChange={(e) => setJkm(e.target.value)}
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  BPJS Kesehatan
                </label>
                <Input
                  placeholder="Masukkan BPJS Kesehatan"
                  type="text"
                  value={config?.bpjs_enabled ? anotherFormatRupiah(bpjs) : 0}
                  onChange={(e) => setBpjs(e.target.value)}
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Bonus
                </label>
                <Input
                  placeholder="Masukkan Bonus"
                  type="text"
                  value={anotherFormatRupiah(bonus)}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, "");
                    if (rawValue.length > 1 && rawValue.startsWith("0")) return;
                    setBonus(rawValue);
                  }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Tunjangan Hari Raya (THR)
                </label>
                <Input
                  placeholder="Masukkan THR"
                  type="text"
                  value={anotherFormatRupiah(thr)}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, "");
                    if (rawValue.length > 1 && rawValue.startsWith("0")) return;
                    setThr(rawValue);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
