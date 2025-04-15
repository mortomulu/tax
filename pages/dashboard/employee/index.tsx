import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Modal,
  Input,
  Select,
  DatePicker,
  Checkbox,
  message,
} from "antd";
import { MdArrowRightAlt } from "react-icons/md";
import Layout from "@/components/layouts/Layout";
import EmployeeTable from "@/components/core/EmployeeTable";
import { supabase } from "@/utils/supabase";

interface DataType {
  id: number;
  name: string;
  nik: string;
  ptkp: any;
  positionNow: any;
  histories_positions: {
    id: number;
    startdate: string;
    enddate: string | null;
    positions: {
      position: string;
    }[];
  }[];
}

type EmployeesResponse = DataType[] | null;

type JabatanType = {
  id: number;
  jabatan: string;
  startDate: Date | null;
  endDate: Date | null;
  now: boolean;
};

export default function EmployeePage() {
  const [data, setData] = useState<any>([]);
  const [ptkpOptions, setPtkpOptions] = useState<any>();
  const [positionOptions, setPositionOptions] = useState<any>();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [nik, setNik] = useState("");
  const [ptkp, setPtkp] = useState("");
  const [jabatanList, setJabatanList] = useState<JabatanType[]>([
    { id: 1, jabatan: "", startDate: null, endDate: null, now: false },
  ]);

  const fetchPtkpOptions = async () => {
    const { data, error } = await supabase.from("ptkp").select(`id, ptkp`);

    if (error) {
      message.error("Gagal mengambil data PTKP");
      console.error("Gagal mengambil data PTKP:", error);
      return;
    }

    setPtkpOptions(data);
  };

  const fetchPositionOptions = async () => {
    const { data, error } = await supabase
      .from("positions")
      .select(`id, position`);

    if (error) {
      message.error("Gagal mengambil data Jabatan");
      console.error("Gagal mengambil data Jabatan:", error);
      return;
    }

    setPositionOptions(data);
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from("employees").select(`
      id,
      name,
      nik,
      ptkp (
        id,
        ptkp
      ),
      histories_positions (
        id,
        startdate,
        enddate,
        positions (
          id,
          position,
          incentive
        )
      )
    `);

    if (error) {
      message.error("Gagal mengambil data");
      console.error("Gagal mengambil data", error);
      return;
    }

    const formatted = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      nik: item.nik,
      ptkp: item.ptkp?.ptkp || "-",
      positionNow: item?.histories_positions?.[0]?.positions?.position || null,
      historiesPosition: item.histories_positions || [],
    }));

    setData(formatted);
  };

  useEffect(() => {
    fetchEmployees();
    fetchPositionOptions();
    fetchPtkpOptions();
  }, []);

  const handleAdd = async () => {
    if (name == "" && nik == "" && ptkp == "") {
      message.error("Isi data terlebih dahulu");
      return
    }

    if (jabatanList[0].jabatan == "" && jabatanList[0].startDate == null) {
      message.error("Isi jabatan terlebih dahulu");
      return;
    }

    if (name && ptkp && nik) {
      const { data: insertEmployee, error: errorEmployee } = await supabase
        .from("employees")
        .insert([
          {
            name,
            nik,
            idptkp: ptkp,
          },
        ])
        .select();

      if (errorEmployee) {
        message.error("Gagal menambahkan data karyawan");
        console.error(errorEmployee);
        return;
      }

      await supabase.from("histories_positions").insert(
        jabatanList.map((jabatan) => ({
          idemployee: insertEmployee[0].id,
          idposition: jabatan.jabatan,
          startdate: jabatan.startDate
            ? new Date(jabatan.startDate).toISOString()
            : null,
          enddate: jabatan.endDate
            ? new Date(jabatan.endDate).toISOString()
            : null,
        }))
      );

      message.success("Data berhasil ditambahkan");

      fetchEmployees?.();

      setName("");
      setNik("");
      setPtkp("");
      setJabatanList([]);
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
        <EmployeeTable
          data={data}
          ptkpOptions={ptkpOptions}
          positionOptions={positionOptions}
          fetchEmployees={fetchEmployees}
        />
      </div>

      {/* Modal Add Data */}
      <Modal
        title="Tambah Data Karyawan"
        open={isAddModalOpen}
        onCancel={() => {
          setName("");
          setNik("");
          setName("");
          setPtkp("");
          setJabatanList([
            { id: 1, jabatan: "", startDate: null, endDate: null, now: false },
          ]);
          setIsAddModalOpen(false);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setName("");
              setNik("");
              setName("");
              setPtkp("");
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
          <Button key="add" type="primary" onClick={handleAdd}>
            Add
          </Button>,
        ]}
      >
        <Input
          placeholder="Masukkan Nama Karyawan"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          value={ptkp || undefined}
          onChange={setPtkp}
          className="mb-3"
          style={{ width: "100%" }}
        >
          {ptkpOptions?.map((option: any) => (
            <Select.Option key={option.id} value={option.id}>
              {option.ptkp}
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
              {positionOptions?.map((option: any) => (
                <Select.Option key={option.id} value={option.id}>
                  {option.position}
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
