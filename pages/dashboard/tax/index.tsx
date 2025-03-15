import { useState } from "react";
import Layout from "@/components/layouts/Layout";
import AnotherTable from "@/components/core/AnotherTable";
import { Button, Modal, Input, Select } from "antd";
import { calculateGajiBruto, calculateTax } from "@/helpers/taxCalc";

interface DataType {
  key: string;
  name: string;
  jabatan: string;
  ptkp: string;
  gajiPokok: number;
  gajiBruto: number;
  gajiNeto: number;
  monthlyTax: number;
}

const karyawanOptions = [
  "Sumarmo",
  "Edi Wahyono",
  "Dimas Maulana Walidayni",
  "Priyo Adi Prayogo",
  "Andika Adnan Husaini",
];

export default function List() {
  const [data, setData] = useState<DataType[]>([
    {
      key: "1",
      name: "Sumarmo",
      jabatan: "Karyawan",
      ptkp: "K/2",
      gajiPokok: 4100000,
      gajiBruto: 4100000,
      gajiNeto: 4100000,
      monthlyTax: 0,
    },
    {
      key: "2",
      name: "Edi Wahyono",
      jabatan: "Karyawan",
      ptkp: "K/2",
      gajiPokok: 3600000,
      gajiBruto: 3600000,
      gajiNeto: 3600000,
      monthlyTax: 0,
    },
    {
      key: "3",
      name: "Dimas Maulana Walidayni",
      jabatan: "Karyawan",
      ptkp: "TK/0",
      gajiPokok: 1700000,
      gajiBruto: 1700000,
      gajiNeto: 1700000,
      monthlyTax: 0,
    },
    {
      key: "4",
      name: "Priyo Adi Prayogo",
      jabatan: "Karyawan",
      ptkp: "TK/0",
      gajiPokok: 1560000,
      gajiBruto: 1560000,
      gajiNeto: 1560000,
      monthlyTax: 0,
    },
    {
      key: "5",
      name: "Andika Adnan Husaini",
      jabatan: "Karyawan",
      ptkp: "TK/0",
      gajiPokok: 1600000,
      gajiBruto: 1600000,
      gajiNeto: 1600000,
      monthlyTax: 0,
    },
    {
      key: "6",
      name: "Puji Suryanto",
      jabatan: "Karyawan",
      ptkp: "TK/0",
      gajiPokok: 1447000,
      gajiBruto: 1447000,
      gajiNeto: 1447000,
      monthlyTax: 0,
    },
    {
      key: "7",
      name: "Abdullah Wafi ",
      jabatan: "Karyawan",
      ptkp: "K/2",
      gajiPokok: 1447000,
      gajiBruto: 1447000,
      gajiNeto: 1447000,
      monthlyTax: 0,
    },
    {
      key: "8",
      name: "Sri Pujo Adi",
      jabatan: "Karyawan",
      ptkp: "TK/0",
      gajiPokok: 1447000,
      gajiBruto: 1447000,
      gajiNeto: 1447000,
      monthlyTax: 0,
    },
    {
      key: "9",
      name: "Khairus saleh,SP",
      jabatan: "Karyawan",
      ptkp: "K/0",
      gajiPokok: 1447000,
      gajiBruto: 1447000,
      gajiNeto: 1447000,
      monthlyTax: 0,
    },
    {
      key: "10",
      name: "Dandi kurnia Putra",
      jabatan: "Karyawan",
      ptkp: "TK/0",
      gajiPokok: 1447000,
      gajiBruto: 1447000,
      gajiNeto: 1447000,
      monthlyTax: 0,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [newPtkp, setNewPtkp] = useState("");
  const [newGajiPokok, setNewGajiPokok] = useState("");
  const [positionAllowance, setPositionAllowance] = useState("");
  const [incentive, setIncentive] = useState("");
  const [overtimeAllowance, setOvertimeAllowance] = useState("");
  const [jkk, setJkk] = useState("");
  const [jkm, setJkm] = useState("");
  const [bpjs, setBpjs] = useState("");
  const [bonus, setBonus] = useState("");
  const [etc, setEtc] = useState("");
  const [thr, setThr] = useState("");

  const handleAdd = () => {
    if (newName && newPtkp && newGajiPokok) {
      const brutoSalary = calculateGajiBruto(parseFloat(newGajiPokok));
      const yearlyBrutoSalary = brutoSalary * 12;

      const monthlyTax = calculateTax(yearlyBrutoSalary, newPtkp);

      setData([
        ...data,
        {
          key: (data.length + 1).toString(),
          name: newName,
          jabatan: jabatan,
          ptkp: newPtkp,
          gajiPokok: parseFloat(newGajiPokok),
          gajiBruto: brutoSalary,
          gajiNeto: parseFloat(newGajiPokok),
          monthlyTax: monthlyTax,
        },
      ]);

      setNewName("");
      setNewPtkp("");
      setNewGajiPokok("");
      setIsModalOpen(false);
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
        <AnotherTable data={data} />
      </div>

      {/* Modal Add Data */}
      <Modal
        title="Tambah Data Pajak Karyawan"
        open={isModalOpen}
        onCancel={() => {
          setNewName("");
          setIsModalOpen(false);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsModalOpen(false);
              setNewName("");
            }}
          >
            Cancel
          </Button>,
          <Button key="add" type="primary" onClick={handleAdd}>
            Add
          </Button>,
        ]}
      >
        <Select
          placeholder="Pilih Karyawan"
          value={newName || undefined}
          onChange={(value) => setNewName(value)}
          className="mb-3"
          style={{ width: "100%" }}
        >
          {karyawanOptions.map((option) => (
            <Select.Option key={option} value={option}>
              {option}
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
          value={positionAllowance}
          onChange={(e) => setPositionAllowance(e.target.value)}
          className="mb-3"
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
        />
        <Input
          placeholder="Masukkan Death Security/JKM"
          type="number"
          value={jkm}
          onChange={(e) => setJkm(e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Masukkan BPJS Health/Jaminan Kesehatan"
          type="number"
          value={bpjs}
          onChange={(e) => setBpjs(e.target.value)}
          className="mb-3"
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
        <Input
          placeholder="Masukkan Etc."
          type="number"
          value={etc}
          onChange={(e) => setEtc(e.target.value)}
          className="mb-3"
        />
      </Modal>
    </Layout>
  );
}
