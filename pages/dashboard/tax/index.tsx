import { useEffect, useState } from "react";
import Layout from "@/components/layouts/Layout";
import AnotherTable from "@/components/core/tax/AnotherTable";
import { Button, Modal, Input, Select, message } from "antd";
import InformationCircleIcon, { PlusOutlined } from "@ant-design/icons";
import {
  calculateBrutoSalary,
  getTypeTer,
  getTerArt21,
  calcMonthlyTax,
} from "@/helpers/taxCalc";
import { supabase } from "@/utils/supabase";
import { calcDecTax, calcDecTaxFinal } from "@/helpers/decTaxCalc";

interface DataType {
  id: string;
  idName: string;
  name: string;
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

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from("employees").select(`
      id,
      name,
      nik,
      ptkp (
        id,
        ptkp
      ),
      positions (
          id,
          position,
          incentive
        )
      )
    `);

    if (error) {
      message.error("Gagal mengambil opsi pegawai");
      console.error("Gagal mengambil employee options", error);
      return;
    }

    const formatted = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      nik: item.nik,
      ptkp: item.ptkp?.ptkp || "-",
      idPosition: item?.positions?.id,
      positionNow: item?.positions?.position || null,
      positionAllowance: item?.positions?.incentive,
    }));

    setEmployeeOptions(formatted);
  };

  const fetchAllTaxData = async () => {
    const { data, error } = await supabase.from("tax").select(`
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
      ptkp (
        id,
        ptkp
      )
    )
  `);

    if (error) {
      console.error("Error fetching tax data:", error);
      return [];
    }

    const formatted = data.map((item: any) => ({
      id: item?.id,
      idName: item?.employees?.id,
      name: item?.employees?.name,
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
    }));

    setData(formatted);
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

  useEffect(() => {
    fetchEmployees();
    fetchAllTaxData();
    fetchTer();
    fetchPtkp();
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
      Number(jkk) || 0,
      Number(jkm) || 0,
      Number(bpjs) || 0,
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
        ...(month === 12 && { dectax: Number(decTax) }),
      },
    ]);

    if (error) {
      console.error("Gagal menambahkan data:", error.message);
      message.error("Gagal menambahkan data pajak.");
    } else {
      fetchEmployees();
      fetchAllTaxData();
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

        {/* Header with Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Data Pajak Karyawan
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Total {data.length} karyawan
            </p>
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
          <AnotherTable
            data={data}
            fetchAllTaxData={fetchAllTaxData}
            employeeOptions={employeeOptions}
          />
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
            >
              {employeeOptions?.map((option: any) => (
                <Select.Option key={option.id} value={option.id}>
                  {option.name}
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
                  type="number"
                  value={newGajiPokok}
                  onChange={(e) => setNewGajiPokok(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Position Allowance
                </label>
                <Input
                  placeholder="Masukkan Position Allowance"
                  type="number"
                  value={idName ? positionAllowance : ""}
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
                  type="number"
                  value={incentive}
                  onChange={(e) => setIncentive(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Overtime Allowance
                </label>
                <Input
                  placeholder="Masukkan Overtime Allowance"
                  type="number"
                  value={overtimeAllowance}
                  onChange={(e) => setOvertimeAllowance(e.target.value)}
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
                  type="number"
                  value={jkk}
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
                  type="number"
                  value={jkm}
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
                  type="number"
                  value={bpjs}
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
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Tunjangan Hari Raya (THR)
                </label>
                <Input
                  placeholder="Masukkan THR"
                  type="number"
                  value={thr}
                  onChange={(e) => setThr(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
