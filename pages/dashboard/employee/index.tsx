import { useState } from "react";
import dayjs from "dayjs";
import { Button, Modal, Input, Select, DatePicker, Checkbox, message } from "antd";
import { MdArrowRightAlt } from "react-icons/md";
import Layout from "@/components/layouts/Layout";
import EmployeeTable from "@/components/core/EmployeeTable";

interface DataType {
  key: string;
  name: string;
  jabatan: any;
  ptkp: string;
}

type JabatanType = {
  id: number;
  jabatan: string;
  startDate: Date | null;
  endDate: Date | null;
  now: boolean;
};

const ptkpOptions = ["TK/0", "K/0", "K/1", "K/2", "K/3"];

const jabatanOptions = ["Karyawan", "Leader", "Manager", "CTO", "CEO"];

export default function EmployeePage() {
  const [data, setData] = useState<DataType[]>([
    {
      key: "1",
      name: "Sumarmo",
      jabatan: "Karyawan",
      ptkp: "K/2",
    },
    {
      key: "2",
      name: "Edi Wahyono",
      jabatan: "Karyawan",
      ptkp: "K/2",
    },
    {
      key: "3",
      name: "Dimas Maulana Walidayni",
      jabatan: "Karyawan",
      ptkp: "TK/0",
    },
    {
      key: "4",
      name: "Priyo Adi Prayogo",
      jabatan: "Karyawan",
      ptkp: "TK/0",
    },
    {
      key: "5",
      name: "Andika Adnan Husaini",
      jabatan: "Karyawan",
      ptkp: "TK/0",
    },
    {
      key: "6",
      name: "Puji Suryanto",
      jabatan: "Karyawan",
      ptkp: "TK/0",
    },
    {
      key: "7",
      name: "Abdullah Wafi ",
      jabatan: "Karyawan",
      ptkp: "K/2",
    },
    {
      key: "8",
      name: "Sri Pujo Adi",
      jabatan: "Karyawan",
      ptkp: "TK/0",
    },
    {
      key: "9",
      name: "Khairus saleh,SP",
      jabatan: "Karyawan",
      ptkp: "K/0",
    },
    {
      key: "10",
      name: "Dandi kurnia Putra",
      jabatan: "Karyawan",
      ptkp: "TK/0",
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [nik, setNik] = useState("");
  const [newPtkp, setNewPtkp] = useState("");
  const [jabatanList, setJabatanList] = useState<JabatanType[]>([
    { id: 1, jabatan: "", startDate: null, endDate: null, now: false },
  ]);

  const handleAdd = () => {
    if (newName && newPtkp) {
      setData([
        ...data,
        {
          key: (data.length + 1).toString(),
          name: newName,
          jabatan: jabatanList,
          ptkp: newPtkp,
        },
      ]);

      setNewName("");
      setNewPtkp("");
      setIsAddModalOpen(false);
    }
  };

  const handleJabatanChange = (
    index: number,
    field: keyof JabatanType,
    value: any
  ) => {
    setJabatanList((prevList) => {
      return prevList.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
              ...(field === "now" && value ? { endDate: null } : {}),
            }
          : item
      );
    });
  };

  const handleAddJabatan = () => {
    setJabatanList((prevList) => [
      ...prevList,
      {
        id: prevList.length + 1,
        jabatan: "",
        startDate: null,
        endDate: null,
        now: false,
      },
    ]);
  };

  const handleRemoveJabatan = (index: number) => {
    setJabatanList((prevList) => prevList.filter((_, i) => i !== index));
  };

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">List Data Karyawan</h1>
          <Button type="primary" onClick={() => setIsAddModalOpen(true)}>
            Add Data Karyawan
          </Button>
        </div>
        <EmployeeTable data={data} />
      </div>

      {/* Modal Add Data */}
      <Modal
        title="Tambah Data Karyawan"
        open={isAddModalOpen}
        onCancel={() => {
          setNewName("");
          setNik("");
          setNewPtkp("");
          setJabatanList([
            { id: 1, jabatan: "", startDate: null, endDate: null, now: false },
          ]);
          setIsAddModalOpen(false);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setNewName("");
              setNik("");
              setNewPtkp("");
              setJabatanList([
                {
                  id: 1,
                  jabatan: "",
                  startDate: null,
                  endDate: null,
                  now: false,
                },
              ]);
              setIsAddModalOpen(false);
            }}
          >
            Cancel
          </Button>,
          <Button key="add" type="primary">
            Add
          </Button>,
        ]}
      >
        <Input
          placeholder="Masukkan Nama Karyawan"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Masukkan NIK/NPWP"
          value={nik}
          onChange={(e) => setNik(e.target.value)}
          className="mb-3"
        />
        <Select
          placeholder="Pilih PTKP"
          value={newPtkp || undefined}
          onChange={setNewPtkp}
          className="mb-3"
          style={{ width: "100%" }}
        >
          {ptkpOptions.map((option) => (
            <Select.Option key={option} value={option}>
              {option}
            </Select.Option>
          ))}
        </Select>

        <h3 className="mb-2">Jabatan</h3>
        {jabatanList.map((jabatan, index) => (
          <div key={jabatan.id} className="mb-4 border p-3 rounded">
            <Select
              placeholder="Pilih Jabatan"
              value={jabatan.jabatan || undefined}
              onChange={(value) => handleJabatanChange(index, "jabatan", value)}
              className="mb-2"
              style={{ width: "100%" }}
            >
              {jabatanOptions.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>

            <Checkbox
              onChange={(e) =>
                handleJabatanChange(index, "now", e.target.checked)
              }
              checked={jabatan.now}
              className="w-full mb-3"
            >
              Jabatan Sekarang
            </Checkbox>

            <div className="flex items-center gap-4">
              <DatePicker
                placeholder="Mulai Jabatan"
                onChange={(date) =>
                  handleJabatanChange(index, "startDate", date)
                }
                value={jabatan.startDate ? dayjs(jabatan.startDate) : null}
              />
              <MdArrowRightAlt className="text-xl" />
              <DatePicker
                placeholder="Akhir Jabatan"
                onChange={(date) => handleJabatanChange(index, "endDate", date)}
                value={jabatan.endDate ? dayjs(jabatan.endDate) : null}
                disabled={jabatan.now}
              />
            </div>

            {jabatanList.length > 1 && (
              <Button
                danger
                onClick={() => handleRemoveJabatan(index)}
                className="mt-2"
              >
                Hapus Jabatan
              </Button>
            )}
          </div>
        ))}

        <Button type="dashed" onClick={handleAddJabatan} className="w-full">
          + Tambah Jabatan
        </Button>
      </Modal>
    </Layout>
  );
}
