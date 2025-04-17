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
import { MdArrowRightAlt } from "react-icons/md";
import ModalEditHistoryPositions from "./ModalEditHistoryPositions";

interface DataType {
  key: string;
  name: string;
  nik: string;
  ptkp: string;
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
  { key: "4", label: "Delete" },
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

  const columns: TableColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      ...getColumnSearchProps("name"),
    },
    {
      title: "NIK/NPWP",
      dataIndex: "nik",
      key: "nik",
      width: "20%",
    },
    {
      title: "Jabatan Sekarang",
      dataIndex: "positionNow",
      key: "positionNow",
      width: "20%",
    },
    {
      title: "PTKP",
      dataIndex: "ptkp",
      key: "ptkp",
      width: "10%",
      filters: [
        {
          text: "TK/0",
          value: "TK/0",
        },
        {
          text: "K/0",
          value: "K/0",
        },
        {
          text: "K/1",
          value: "K/1",
        },
        {
          text: "K/2",
          value: "K/2",
        },
        {
          text: "K/3",
          value: "K/3",
        },
      ],
      onFilter: (value, record) => record.ptkp.indexOf(value as string) === 0,
    },
    {
      title: "Action",
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
    { title: "Incentive", dataIndex: "incentive", key: "incentive" },
    { title: "Tahun Mulai", dataIndex: "startYear", key: "startYear" },
    { title: "Tahun Selesai", dataIndex: "endYear", key: "endYear" },
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
      setNik(record.nik);
      setNewPtkp(record.ptkp);
      setEditingIndex(index ?? null);
    } else {
      setNewName("");
      setNik("");
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
          name: selectedEmployee.name,
          nik: selectedEmployee.nik,
          idptkp: selectedEmployee.ptkp_id,
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
        title={"Edit Data Karyawan"}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            Save Changes
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
          {ptkpOptions?.map((option: any) => (
            <Select.Option key={option.id} value={option.id}>
              {option.ptkp}
            </Select.Option>
          ))}
        </Select>

        <h3>Jabatan</h3>
        {historiesPosition?.map((jabatan: any, index: any) => (
          <>
            <div key={jabatan.id} className="mb-4 border p-3 rounded">
              <Select
                placeholder="Pilih Jabatan"
                value={jabatan.position || undefined}
                onChange={() => {
                  handleJabatanChange(index, "position", jabatan.id);
                }}
                className="mb-2"
                style={{ width: "100%" }}
              >
                {positionOptions.map((option: any) => (
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
                  onChange={(date) =>
                    handleJabatanChange(index, "startDate", date)
                  }
                  value={jabatan.startDate ? dayjs(jabatan.startDate) : null}
                />
                <MdArrowRightAlt className="text-xl" />
                <DatePicker
                  placeholder="Akhir Jabatan"
                  onChange={(date) =>
                    handleJabatanChange(index, "endDate", date)
                  }
                  value={jabatan.endDate ? dayjs(jabatan.endDate) : null}
                  disabled={jabatan.now}
                />
              </div>
              {historiesPosition?.length > 1 && (
                <Button
                  danger
                  onClick={() => handleRemoveJabatan(index)}
                  className="mt-2"
                >
                  Hapus Jabatan
                </Button>
              )}
            </div>
          </>
        ))}

        <Button type="dashed" onClick={handleAddJabatan} className="w-full">
          + Tambah Jabatan
        </Button>
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
          <Descriptions.Item label="NIK">
            {selectedEmployee?.nik}
          </Descriptions.Item>
          <Descriptions.Item label="Status Pernikahan">
            {selectedEmployee?.ptkp}
          </Descriptions.Item>
        </Descriptions>

        <h3 className="mt-8 mb-4 font-semibold">History Jabatan</h3>
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
