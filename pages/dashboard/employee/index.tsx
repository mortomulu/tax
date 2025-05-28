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
import EmployeeTable from "@/components/core/employee/EmployeeTable";
import { supabase } from "@/utils/supabase";
import TextArea from "antd/lib/input/TextArea";

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
  const [idType, setIdType] = useState<any>();
  const [idValue, setIdValue] = useState<any>();
  const [nik, setNik] = useState("");
  const [npwp, setNpwp] = useState("");
  const [ptkp, setPtkp] = useState("");
  const [isActiveEmployee, setIsActiveEmployee] = useState<any>();
  const [jabatanList, setJabatanList] = useState<JabatanType[]>([
    { id: 1, jabatan: "", startDate: null, endDate: null, now: false },
  ]);
  const [address, setAddress] = useState<any>();

  const fetchPtkpOptions = async () => {
    const { data, error } = await supabase.from("ptkp").select(`id, ptkp`);

    if (error) {
      message.error("Gagal mengambil data PTKP");
      console.error("Gagal mengambil data PTKP:", error);
      return;
    }

    const sortedData = [...data].sort((a, b) => a.ptkp.localeCompare(b.ptkp));

    setPtkpOptions(sortedData);
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

    const sortedData = [...data].sort((a, b) =>
      a.position.localeCompare(b.position)
    );

    setPositionOptions(sortedData);
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from("employees").select(`
      id,
      name,
      idtype,
      nik,
      npwp,
      address,
      is_active,
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

    const { data: companyProfile, error: companyError } = await supabase
      .from("company_profile")
      .select("company_name, company_npwp, selected_npwp, selected_name")
      .eq("id", 1)
      .single();

    if (companyError) {
      message.error("Gagal mengambil data perusahaan");
      console.log("fetch company profile error:", companyError);
      return;
    }

    if (!companyProfile) {
      message.error("Data perusahaan tidak ditemukan");
      return;
    }

    if (!companyProfile.selected_npwp || !companyProfile.selected_name) {
      const { error: updateError } = await supabase
        .from("company_profile")
        .update({
          selected_npwp: companyProfile.company_npwp,
          selected_name: companyProfile.company_name, 
        })
        .eq("id", 1);

      if (updateError) {
        message.error("Gagal mengupdate data perusahaan");
        console.log("update company profile error:", updateError);
      }
    }

    const formatted = data
      ?.map((item: any) => ({
        id: item.id,
        name: item.name,
        idType: item.idtype,
        nik: item.nik,
        npwp: item.npwp,
        address: item.address,
        idPtkp: item.ptkp?.id,
        ptkp: item.ptkp?.ptkp || "-",
        isActiveEmployee: item?.is_active,
        positionNow:
          item?.histories_positions?.[0]?.positions?.position || null,
        historiesPosition: item.histories_positions || [],
      }))
      .sort((a, b) => a.id - b.id);

    setData(formatted);
  };

  useEffect(() => {
    fetchEmployees();
    fetchPositionOptions();
    fetchPtkpOptions();
  }, []);

  const handleAdd = async () => {
    if (name == "" || idValue == "" || isActiveEmployee == null) {
      message.error("Isi data terlebih dahulu");
      return;
    }

    if (jabatanList[0].jabatan == "" && jabatanList[0].startDate == null) {
      message.error("Isi jabatan terlebih dahulu");
      return;
    }

    const latestJabatan = jabatanList
      .filter((j) => j.startDate !== null)
      .sort(
        (a: any, b: any) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )[0];

    const idPositionTerbaru = latestJabatan?.jabatan || 0;

    if (name && ptkp && idValue) {
      const { data: insertEmployee, error: errorEmployee } = await supabase
        .from("employees")
        .insert([
          {
            name,
            idptkp: ptkp,
            idposition: idPositionTerbaru,
            address,
            idtype: idType,
            is_active: isActiveEmployee,
            ...(idType === "NIK" ? { nik: idValue } : { npwp: idValue }),
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
      setIsActiveEmployee(null);
      setAddress("");
      setIdType("");
      setIdValue("");
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
          <h1 className="text-2xl font-bold">Data Karyawan</h1>
          <Button type="primary" onClick={() => setIsAddModalOpen(true)}>
            Tambah Data Karyawan
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
          setIsActiveEmployee(null);
          setJabatanList([
            { id: 1, jabatan: "", startDate: null, endDate: null, now: false },
          ]);
          setAddress("");
          setIdType("");
          setIdValue("");
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
              setIsActiveEmployee(null);
              setJabatanList([
                {
                  id: 1,
                  jabatan: "",
                  startDate: null,
                  endDate: null,
                  now: false,
                },
              ]);
              setAddress("");
              setIdType("");
              setIdValue("");
              setIsAddModalOpen(false);
            }}
          >
            Batal
          </Button>,
          <Button key="add" type="primary" onClick={handleAdd}>
            Simpan Data
          </Button>,
        ]}
      >
        <div className="space-y-4">
          {/* Nama Karyawan */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Nama Karyawan
            </label>
            <Input
              placeholder="Masukkan Nama Karyawan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Jenis Identitas */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Jenis Identitas
            </label>
            <Select
              value={idType || undefined}
              className="w-full"
              onChange={(val) => setIdType(val)}
              placeholder="Pilih NIK/NPWP"
            >
              <Select.Option value="NIK">NIK</Select.Option>
              <Select.Option value="NPWP">NPWP</Select.Option>
            </Select>
          </div>

          {/* Nomor Identitas */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              {idType ? idType.toUpperCase() : "Nomor Identitas"}
            </label>
            <Input
              placeholder={`Masukkan ${idType?.toUpperCase() || "Identitas"}`}
              value={idValue}
              onChange={(e) => setIdValue(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Alamat */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Alamat</label>
            <TextArea
              placeholder="Masukkan Alamat"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoSize={{ minRows: 2 }}
              className="w-full"
            />
          </div>

          {/* PTKP */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">PTKP</label>
            <Select
              placeholder="Pilih PTKP"
              value={ptkp || undefined}
              onChange={setPtkp}
              className="w-full"
            >
              {ptkpOptions?.map((option: any) => (
                <Select.Option key={option.id} value={option.id}>
                  {option.ptkp}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* status karyawan */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Status Karyawan
            </label>
            <Select
              value={isActiveEmployee}
              className="w-full"
              onChange={(val) => setIsActiveEmployee(val)}
              placeholder="Pilih Status"
            >
              <Select.Option value={true}>Aktif</Select.Option>
              <Select.Option value={false}>Tidak Aktif</Select.Option>
            </Select>
          </div>

          {/* Jabatan Section */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-800">Jabatan</h3>
            {jabatanList.map((jabatan, index) => (
              <div
                key={jabatan.id}
                className="p-4 border border-gray-200 rounded-lg space-y-3"
              >
                {/* Jabatan */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Jabatan
                  </label>
                  <Select
                    placeholder="Pilih Jabatan"
                    value={jabatan.jabatan || undefined}
                    onChange={(value) =>
                      handleJabatanChange(index, "jabatan", value)
                    }
                    className="w-full"
                  >
                    {positionOptions?.map((option: any) => (
                      <Select.Option key={option.id} value={option.id}>
                        {option.position}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Checkbox */}
                {/* <div className="flex items-center">
                  <Checkbox
                    onChange={(e) =>
                      handleJabatanChange(index, "now", e.target.checked)
                    }
                    checked={jabatan.now}
                  >
                    <span className="text-sm text-gray-700">
                      Jabatan Sekarang
                    </span>
                  </Checkbox>
                </div> */}

                {/* Date Range */}
                <div className="flex items-end gap-3">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Mulai Jabatan
                    </label>
                    <DatePicker
                      placeholder="Mulai Jabatan"
                      onChange={(date) =>
                        handleJabatanChange(index, "startDate", date)
                      }
                      value={
                        jabatan.startDate ? dayjs(jabatan.startDate) : null
                      }
                      className="w-full"
                    />
                  </div>
                  <MdArrowRightAlt className="text-xl text-gray-500 mb-1" />
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Akhir Jabatan
                    </label>
                    <DatePicker
                      placeholder="Akhir Jabatan"
                      onChange={(date) =>
                        handleJabatanChange(index, "endDate", date)
                      }
                      value={jabatan.endDate ? dayjs(jabatan.endDate) : null}
                      disabled={jabatan.now}
                      className="w-full"
                    />
                  </div>
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
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
