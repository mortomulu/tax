import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons/lib";
import type { InputRef, TableColumnsType, TableColumnType } from "antd/lib";
import {
  Button,
  Checkbox,
  DatePicker,
  Descriptions,
  Dropdown,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Timeline,
} from "antd/lib";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { supabase } from "@/utils/supabase";
import ModalEditHistoryPositions from "./ModalEditHistoryPositions";

interface DataType {
  key: string;
  name: string;
  idType: string;
  nik: string;
  npwp: string;
  idPtkp: any;
  ptkp: string;
  isActiveEmployee: boolean;
  jabatanList: Jabatan[];
}

interface Jabatan {
  id: number;
  jabatan: string;
  startDate: any;
  endDate: any;
  now: boolean;
}

type DataIndex = keyof DataType;

const items = [
  { key: "1", label: "Detail" },
  { key: "2", label: "Edit Profil" },
  { key: "3", label: "Edit Riwayat Jabatan" },
  { key: "4", label: "Hapus" },
];

interface AnotherTableProps {
  data: DataType[];
}

const EmployeeTable: any = ({
  data,
  ptkpOptions,
  positionOptions,
  fetchEmployees,
}: any) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [historiesPosition, setHistoriesPosition] = useState<any>();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditHistoryPositionModalOpen, setIsEditHistoryPositionModalOpen] =
    useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [idType, setIdType] = useState<any>("NIK");
  const [idValue, setIdValue] = useState<any>();
  const [newName, setNewName] = useState("");
  const [nik, setNik] = useState("");
  const [newPtkp, setNewPtkp] = useState<string | null>(null);

  const [visible, setVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee]: any = useState(null);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  const router = useRouter();

  const [filteredData, setFilteredData] = useState<DataType[]>(data);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    if (selectedEmployee?.historiesPosition) {
      const formattedHistories = selectedEmployee.historiesPosition
        .map((item: any, index: number) => ({
          key: index,
          id: item.id,
          startDate: item.startdate,
          endDate: item.enddate,
          idPosition: item.positions?.id,
          position: item.positions?.position || "-",
          incentive: item.positions?.incentive || 0,
        }))
        .sort(
          (a: any, b: any) =>
            new Date(b.startYear).getTime() - new Date(a.startYear).getTime()
        );

      setHistoriesPosition(formattedHistories);
    }
  }, [selectedEmployee]);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleGlobalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    const filtered = data.filter((item: any) =>
      item.name.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleStatusChange = async (newStatus: boolean, record: any) => {
    const { error } = await supabase
      .from("employees")
      .update({ is_active: newStatus })
      .eq("id", record.id);

    if (error) {
      message.error("Gagal memperbarui status");
      console.error(error);
    } else {
      message.success("Status berhasil diperbarui");
      fetchEmployees();
    }
  };

  const columns: TableColumnsType<DataType> = [
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
      width: "20%",
      ...getColumnSearchProps("name"),
    },
    {
      title: "NIK/NPWP",
      key: "niknpwp",
      width: "20%",
      render: (text: any, record: any) => record.nik || record.npwp || "-",
    },
    {
      title: "Jabatan Sekarang",
      dataIndex: "positionNow",
      key: "positionNow",
      width: "20%",
      render: (_: any, record: any) => {
        return record.isActiveEmployee ? record.positionNow || "-" : "-";
      },
    },
    {
      title: "Status",
      dataIndex: "isActiveEmployee",
      key: "isActiveEmployee",
      width: "10%",
      render: (value: boolean, record: any) => (
        <Select
          value={value}
          onChange={(val) => handleStatusChange(val, record)}
          className="w-32" // Equivalent to width: 128px (Tailwind's w-32)
          dropdownClassName="[&_.ant-select-item]:px-4 [&_.ant-select-item]:py-2" // Styling dropdown items
        >
          <Select.Option
            value={true}
            className={`${
              value ? "bg-green-50 text-green-600" : ""
            } hover:bg-green-100`}
          >
            <span className="flex items-center">
              {value && (
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              )}
              Aktif
            </span>
          </Select.Option>
          <Select.Option
            value={false}
            className={`${
              !value ? "bg-red-50 text-red-600" : ""
            } hover:bg-red-100`}
          >
            <span className="flex items-center">
              {!value && (
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              )}
              Tidak Aktif
            </span>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: "Aksi",
      key: "operation",
      width: "15%",
      render: (_, record) => (
        <Space size="middle">
          <Dropdown
            menu={{
              items: items.map((item) => ({
                ...item,
                onClick: () => handleMenuClick(item.key, record),
              })),
            }}
          >
            <a>
              <BsThreeDotsVertical />
            </a>
          </Dropdown>
        </Space>
      ),
    },
  ];

  const columnsHistoryPositions = [
    { title: "Jabatan", dataIndex: "position", key: "position" },
    { title: "Position Allowance", dataIndex: "incentive", key: "incentive" },
    { title: "Mulai Jabatan", dataIndex: "startDate", key: "startDate" },
    { title: "Selesai Jabatan", dataIndex: "endDate", key: "endDate" },
  ];

  const handleMenuClick = (key: string, record: any) => {
    if (key === "1") {
      openDetailModal(record);
    } else if (key === "2") {
      openModalEditProfil(record, key);
    } else if (key === "3") {
      openModalEditHistoryPositions(record, key);
    } else if (key === "4") {
      showDeleteModal(record.id);
    }
  };

  const showDeleteModal = (key: string) => {
    setSelectedKey(key);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedKey !== null) {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", Number(selectedKey));

      if (error) {
        message.error("Gagal menghapus data");
        console.error(error);
      } else {
        message.success("Data berhasil dihapus");
        fetchEmployees?.();
      }

      setIsDeleteModalOpen(false);
      setSelectedKey(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedKey(null);
  };

  const openModalEditProfil = (record?: DataType, index?: any) => {
    if (record) {
      setNewName(record.name);
      setIdType(record?.idType);
      setIdValue(record?.idType == "NIK" ? record.nik : record.npwp);
      setNewPtkp(record.idPtkp);
      setEditingIndex(index ?? null);
    } else {
      setNewName("");
      setIdType("");
      setIdValue("");
      setNewPtkp(null);
      setEditingIndex(null);
    }
    setSelectedEmployee(record);
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!selectedEmployee) return;

      const { error: employeeError } = await supabase
        .from("employees")
        .update({
          name: newName,
          idtype: idType,
          idptkp: newPtkp,
          nik: idType === "NIK" ? idValue : null,
          npwp: idType === "NPWP" ? idValue : null,
        })
        .eq("id", selectedEmployee.id);

      if (employeeError) {
        message.error("Gagal mengupdate data karyawan");
        console.error("Employee Update Error:", employeeError);
        return;
      }

      for (const item of historiesPosition) {
        const { error: historyError } = await supabase
          .from("histories_positions")
          .update({
            idposition: item.idPosition,
            startdate: item.startDate,
            enddate: item.now ? null : item.endDate,
          })
          .eq("id", item.id);

        if (historyError) {
          message.error("Gagal mengupdate riwayat jabatan");
          console.error("Histories Update Error:", historyError);
          return;
        }
      }

      fetchEmployees();
      message.success("Data berhasil diperbarui");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Unexpected Error:", error);
      message.error("Terjadi kesalahan saat menyimpan data");
    }
  };

  const openModalEditHistoryPositions = (record?: DataType, index?: any) => {
    setSelectedEmployee(record);
    setIsEditHistoryPositionModalOpen(true);
  };

  const handleJabatanChange = (index: number, field: keyof any, value: any) => {
    const updatedHistories = [...historiesPosition];

    const formattedValue =
      field === "startDate" || field === "endDate"
        ? value
          ? dayjs(value).format("YYYY-MM-DD")
          : null
        : value;

    updatedHistories[index] = {
      ...updatedHistories[index],
      [field]: formattedValue,
    };

    if (field === "now" && value === true) {
      updatedHistories[index].endDate = null;
    }

    setHistoriesPosition(updatedHistories);
  };

  const handleAddJabatan = () => {
    setHistoriesPosition((prev: any) => [
      ...(prev || []),
      {
        key: Date.now(),
        id: Date.now(),
        position: "",
        startDate: null,
        endDate: null,
        incentive: 0,
        now: false,
      },
    ]);
  };

  const handleRemoveJabatan = (index: number) => {
    setHistoriesPosition(
      historiesPosition.filter((_: any, i: any) => i !== index)
    );
  };

  const openDetailModal = (record: any) => {
    setSelectedEmployee(record);
    setVisible(true);
  };

  return (
    <div className="mt-4">
      <Input
        placeholder="Cari berdasarkan Nama"
        value={searchText}
        onChange={handleGlobalSearch}
        style={{ marginBottom: 16, width: 300 }}
      />
      <Table<DataType>
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
      />

      {/* modal delete data */}
      <Modal
        title="Konfirmasi Hapus"
        open={isDeleteModalOpen}
        onOk={handleDelete}
        onCancel={handleCancelDelete}
        okText="Ya, Hapus"
        cancelText="Batal"
        okButtonProps={{ danger: true }}
      >
        <p>Apakah Anda yakin ingin menghapus data ini?</p>
      </Modal>

      {/* modal edit data */}
      <Modal
        title="Edit Data Karyawan"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalOpen(false)}>
            Batal
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            Perbarui Data
          </Button>,
        ]}
      >
        <div className="space-y-4">
          {/* Nama Karyawan */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Nama Karyawan
              <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Masukkan Nama Karyawan"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          {/* Jenis Identitas */}
          {/* <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Jenis Identitas
              <span className="text-red-500">*</span>
            </label>
            <Select
              value={idType || undefined}
              onChange={(val) => setIdType(val)}
              placeholder="Pilih NIK/NPWP"
              disabled
            >
              <Select.Option value="NIK">NIK</Select.Option>
              <Select.Option value="NPWP">NPWP</Select.Option>
            </Select>
          </div> */}

          {/* Nomor Identitas */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              {idType ? `${idType.toUpperCase()}` : "Nomor Identitas"}
              <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder={`Masukkan ${idType?.toUpperCase() || "Identitas"}`}
              value={idValue}
              onChange={(e) => setIdValue(e.target.value)}
            />
          </div>

          {/* PTKP */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              PTKP
              <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="Pilih PTKP"
              value={newPtkp || undefined}
              onChange={setNewPtkp}
            >
              {ptkpOptions?.map((option: any) => (
                <Select.Option key={option.id} value={option.id}>
                  {option.ptkp}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>

      {/* modal edit history positions */}
      <ModalEditHistoryPositions
        isOpen={isEditHistoryPositionModalOpen}
        onClose={() => setIsEditHistoryPositionModalOpen(false)}
        initialData={historiesPosition}
        selectedEmployee={selectedEmployee}
        onSave={(updatedData) => {
          setHistoriesPosition(updatedData);
          setIsEditHistoryPositionModalOpen(false);
        }}
        fetchEmployees={fetchEmployees}
        positionOptions={positionOptions}
      />

      {/* modal detail data karyawan by table */}
      <Modal
        title="Detail Karyawan"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={[
          <Button key="close" onClick={() => setVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={800}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Nama">
            {selectedEmployee?.name}
          </Descriptions.Item>
          <Descriptions.Item label={selectedEmployee?.nik ? "NIK" : "NPWP"}>
            {selectedEmployee?.nik || selectedEmployee?.npwp || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="PTKP">
            {selectedEmployee?.ptkp}
          </Descriptions.Item>
          <Descriptions.Item label="Alamat">
            {selectedEmployee?.address}
          </Descriptions.Item>
        </Descriptions>

        <h3 className="mt-8 mb-4 font-semibold">Riwayat Jabatan</h3>
        <Table
          columns={columnsHistoryPositions}
          dataSource={historiesPosition}
          rowKey="id"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default EmployeeTable;
