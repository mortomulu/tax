import { useEffect, useState } from "react";
import Layout from "@/components/layouts/Layout";
import AnotherTable from "@/components/core/tax/AnotherTable";
import { Button, Modal, Input, Select, message } from "antd";
import {
  calculateBrutoSalary,
  getTypeTer,
  getTerArt21,
  calcMonthlyTax,
} from "@/helpers/taxCalc";
import { supabase } from "@/utils/supabase";

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

  useEffect(() => {
    fetchEmployees();
    fetchAllTaxData();
    fetchTer();
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">List Data Pajak Karyawan</h1>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Add Data
          </Button>
        </div>
        <AnotherTable
          data={data}
          fetchAllTaxData={fetchAllTaxData}
          employeeOptions={employeeOptions}
        />
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
            Cancel
          </Button>,
          <Button key="add" type="primary" onClick={handleAddTaxData}>
            Add
          </Button>,
        ]}
      >
        <Select
          placeholder="Pilih Karyawan"
          value={idName || undefined}
          onChange={(value) => setIdName(value)}
          className="mb-3"
          style={{ width: "100%" }}
        >
          {employeeOptions?.map((option: any) => (
            <Select.Option key={option.id} value={option.id}>
              {option.name}
            </Select.Option>
          ))}
        </Select>

        <Input
          placeholder="Masukkan THP"
          type="number"
          value={newGajiPokok}
          onChange={(e) => setNewGajiPokok(e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Masukkan Position Allowance"
          type="number"
          value={idName ? positionAllowance : ""}
          onChange={(e) => setPositionAllowance(e.target.value)}
          className="mb-3"
          disabled
        />
        <Input
          placeholder="Masukkan Incentive"
          type="number"
          value={incentive}
          onChange={(e) => setIncentive(e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Masukkan Overtime Allowance"
          type="number"
          value={overtimeAllowance}
          onChange={(e) => setOvertimeAllowance(e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Masukkan Employement Injury Security/JKK"
          type="number"
          value={jkk}
          onChange={(e) => setJkk(e.target.value)}
          className="mb-3"
          disabled
        />
        <Input
          placeholder="Masukkan Death Security/JKM"
          type="number"
          value={jkm}
          onChange={(e) => setJkm(e.target.value)}
          className="mb-3"
          disabled
        />
        <Input
          placeholder="Masukkan BPJS Health/Jaminan Kesehatan"
          type="number"
          value={bpjs}
          onChange={(e) => setBpjs(e.target.value)}
          className="mb-3"
          disabled
        />
        <Input
          placeholder="Masukkan Bonus"
          type="number"
          value={bonus}
          onChange={(e) => setBonus(e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Masukkan Religius Holiday Allowance/THR"
          type="number"
          value={thr}
          onChange={(e) => setThr(e.target.value)}
          className="mb-3"
        />
        {/* <Input
          placeholder="Masukkan Etc."
          type="number"
          value={etc}
          onChange={(e) => setEtc(e.target.value)}
          className="mb-3"
        /> */}
      </Modal>
    </Layout>
  );
}
