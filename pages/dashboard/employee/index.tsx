import { useState } from "react";
import Layout from "@/components/layouts/Layout";
import AnotherTable from "@/components/core/AnotherTable";
import { Button, Modal, Input, Select } from "antd";
import { calculateGajiBruto } from "@/helpers/taxCalc";

interface DataType {
  key: string;
  name: string;
  ptkp: string;
  gajiPokok: number;
  gajiBruto: number;
  gajiNeto: number;
  monthlyTax: number;
}

const ptkpOptions = ["TK/0", "K/0", "K/1", "K/2", "K/3"];

export default function List() {
  const [data, setData] = useState<DataType[]>([
    {
      key: "1",
      name: "Sumarmo",
      ptkp: "K/2",
      gajiPokok: 4100000,
      gajiBruto: 4100000,
      gajiNeto: 4100000,
      monthlyTax: 0,
    },
    {
      key: "2",
      name: "Edi Wahyono",
      ptkp: "K/2",
      gajiPokok: 3600000,
      gajiBruto: 3600000,
      gajiNeto: 3600000,
      monthlyTax: 0,
    },
    {
      key: "3",
      name: "Dimas Maulana Walidayni",
      ptkp: "TK/0",
      gajiPokok: 1700000,
      gajiBruto: 1700000,
      gajiNeto: 1700000,
      monthlyTax: 0,
    },
    {
      key: "4",
      name: "Priyo Adi Prayogo",
      ptkp: "TK/0",
      gajiPokok: 1560000,
      gajiBruto: 1560000,
      gajiNeto: 1560000,
      monthlyTax: 0,
    },
    {
      key: "5",
      name: "Andika Adnan Husaini",
      ptkp: "TK/0",
      gajiPokok: 1600000,
      gajiBruto: 1600000,
      gajiNeto: 1600000,
      monthlyTax: 0,
    },
    {
      key: "6",
      name: "Puji Suryanto",
      ptkp: "TK/0",
      gajiPokok: 1447000,
      gajiBruto: 1447000,
      gajiNeto: 1447000,
      monthlyTax: 0,
    },
    {
      key: "7",
      name: "Abdullah Wafi ",
      ptkp: "K/2",
      gajiPokok: 1447000,
      gajiBruto: 1447000,
      gajiNeto: 1447000,
      monthlyTax: 0,
    },
    {
      key: "8",
      name: "Sri Pujo Adi",
      ptkp: "TK/0",
      gajiPokok: 1447000,
      gajiBruto: 1447000,
      gajiNeto: 1447000,
      monthlyTax: 0,
    },
    {
      key: "9",
      name: "Khairus saleh,SP",
      ptkp: "K/0",
      gajiPokok: 1447000,
      gajiBruto: 1447000,
      gajiNeto: 1447000,
      monthlyTax: 0,
    },
    {
      key: "10",
      name: "Dandi kurnia Putra",
      ptkp: "TK/0",
      gajiPokok: 1447000,
      gajiBruto: 1447000,
      gajiNeto: 1447000,
      monthlyTax: 0,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPtkp, setNewPtkp] = useState("");
  const [newGajiPokok, setNewGajiPokok] = useState("");

  const handleAdd = () => {
    if (newName && newPtkp && newGajiPokok) {
      setData([
        ...data,
        {
          key: (data.length + 1).toString(),
          name: newName,
          ptkp: newPtkp,
          gajiPokok: parseFloat(newGajiPokok),
          gajiBruto: calculateGajiBruto(parseFloat(newGajiPokok)),
          gajiNeto: parseFloat(newGajiPokok),
          monthlyTax: 0,
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
          <h1 className="text-2xl font-bold">List Data Karyawan</h1>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Add Data
          </Button>
        </div>
        <AnotherTable data={data} />
      </div>

      {/* Modal Add Data */}
      <Modal
        title="Tambah Data Karyawan"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="add" type="primary" onClick={handleAdd}>
            Add
          </Button>,
        ]}
      >
        <Input
          placeholder="Masukkan Nama"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="mb-3"
        />
        <Select
          placeholder="Pilih PTKP"
          onChange={(value) => setNewPtkp(value)}
          className="mb-3"
          style={{ width: "100%" }}
        >
          {ptkpOptions.map((option) => (
            <Select.Option key={option} value={option}>
              {option}
            </Select.Option>
          ))}
        </Select>
        <Input
          placeholder="Masukkan Gaji Pokok"
          type="number"
          value={newGajiPokok}
          onChange={(e) => setNewGajiPokok(e.target.value)}
        />
      </Modal>
    </Layout>
  );
}
