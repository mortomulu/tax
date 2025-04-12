import React, { useRef, useState } from "react";
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
  { key: "2", label: "Edit" },
  { key: "3", label: "Delete" },
];

interface AnotherTableProps {
  data: DataType[];
}

const ptkpOptions = ["PTKP 1", "PTKP 2", "PTKP 3"];
const jabatanOptions = ["Karyawan", "Leader", "Manager", "CEO", "CTO"];

const dummyHistoryPosition = [
  { id: 1, position: "Software Engineer", department: "IT", startYear: 2018, endYear: 2020 },
  { id: 2, position: "Senior Engineer", department: "IT", startYear: 2020, endYear: 2023 },
  { id: 3, position: "Tech Lead", department: "IT", startYear: 2023, endYear: "Sekarang" },
]

const employeeData = {
  name: "Budi Santoso",
  nik: "1234567890",
  maritalStatus: "Menikah",
  history: [
    { id: 1, position: "Software Engineer", incentive: "0", startYear: 2018, endYear: 2020 },
    { id: 2, position: "Senior Engineer", incentive: "2000000", startYear: 2020, endYear: 2023 },
    { id: 3, position: "Tech Lead", incentive: "3000000", startYear: 2023, endYear: "Sekarang" },
  ],
};

const EmployeeTable: any = ({ data } : any) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [nik, setNik] = useState("");
  const [newPtkp, setNewPtkp] = useState<string | null>(null);
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([
    { id: 1, jabatan: "", startDate: null, endDate: null, now: false },
  ]);

  const [visible, setVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] : any = useState(null);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  const router = useRouter();

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
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
      title: "Jabatan",
      dataIndex: "jabatan",
      key: "jabatan",
      width: "20%",
      filters: [
        {
          text: "Karyawan",
          value: "Karyawan",
        },
        {
          text: "Leader",
          value: "Leader",
        },
        {
          text: "Manager",
          value: "Manager",
        },
        {
          text: "CTO",
          value: "CTO",
        },
        {
          text: "CEO",
          value: "CEO",
        },
      ],
      onFilter: (value, record) =>
        record.jabatanList.indexOf(value as any) === 0,
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
      // router.push(`/dashboard/employee/${record.key}`);
      openDetailModal(record);
    } else if (key === "2") {
      // router.push(`/dashboard/employee/${record.key}`);
      openModal(record, key);
    } else if (key === "3") {
      showDeleteModal(record.key);
    }
  };

  const showDeleteModal = (key: string) => {
    setSelectedKey(key);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedKey !== null) {
      message.success("Data berhasil dihapus");
    }
    setIsDeleteModalOpen(false);
    setSelectedKey(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedKey(null);
  };

  const resetForm = () => {
    setNewName("");
    setNik("");
    setNewPtkp(null);
    setJabatanList([
      { id: 1, jabatan: "", startDate: null, endDate: null, now: false },
    ]);
  };

  const openModal = (record?: DataType, index?: any) => {
    if (record) {
      // Jika edit, isi modal dengan data yang dipilih
      setNewName(record.name);
      setNik(record.nik);
      setNewPtkp(record.ptkp);
      setJabatanList(record.jabatanList);
      // setIsEditing(true);
      setEditingIndex(index ?? null);
    } else {
      // Jika tambah, kosongkan modal
      setNewName("");
      setNik("");
      setNewPtkp(null);
      setJabatanList([
        { id: 1, jabatan: "", startDate: null, endDate: null, now: false },
      ]);
      // setIsEditing(false);
      setEditingIndex(null);
    }
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleJabatanChange = (
    index: number,
    field: keyof Jabatan,
    value: any
  ) => {
    const newJabatanList = [...jabatanList];
    newJabatanList[index] = { ...newJabatanList[index], [field]: value };

    if (field === "now" && value === true) {
      newJabatanList[index].endDate = null;
    }

    setJabatanList(newJabatanList);
  };

  const handleAddJabatan = () => {
    setJabatanList((prev) => [
      ...(prev || []),
      {
        id: Date.now(),
        jabatan: "",
        startDate: null,
        endDate: null,
        now: false,
      },
    ]);
  };

  // Hapus Jabatan
  const handleRemoveJabatan = (index: number) => {
    setJabatanList(jabatanList.filter((_, i) => i !== index));
  };

  const openDetailModal = (record: any) => {
    setSelectedEmployee(record);
    setVisible(true);
  };

  console.log("visible", visible);

  return (
    <>
      <Table<DataType>
        columns={columns}
        dataSource={data}
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
          {ptkpOptions.map((option) => (
            <Select.Option key={option} value={option}>
              {option}
            </Select.Option>
          ))}
        </Select>

        <h3>Jabatan</h3>
        {jabatanList?.map((jabatan, index) => (
          <>
            <div key={jabatan.id} className="mb-4 border p-3 rounded">
              <Select
                placeholder="Pilih Jabatan"
                value={jabatan.jabatan || undefined}
                onChange={(value) =>
                  handleJabatanChange(index, "jabatan", value)
                }
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
              >
                Jabatan Sekarang
              </Checkbox>

              <DatePicker
                onChange={(date) =>
                  handleJabatanChange(index, "startDate", date)
                }
                value={jabatan.startDate ? dayjs(jabatan.startDate) : null}
              />
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
          </>
        ))}

        <Button type="dashed" onClick={handleAddJabatan} className="w-full">
          + Tambah Jabatan
        </Button>
      </Modal>

      {/* modal detail data karyawan */}
      <Modal
        title="Detail Karyawan"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={[
          <Button key="close" onClick={() => setVisible(false)}>
            Tutup
          </Button>,
        ]}
      >
        {selectedEmployee && (
            <>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Nama">
                  {selectedEmployee.name}
                </Descriptions.Item>
                <Descriptions.Item label="NIK">
                  {selectedEmployee.nik}
                </Descriptions.Item>
                <Descriptions.Item label="Status Pernikahan">
                  {selectedEmployee.ptkp}
                </Descriptions.Item>
              </Descriptions>

              <h3 style={{ marginTop: "20px" }} className="mb-4">History Jabatan</h3>
              <Timeline>
                {dummyHistoryPosition?.map((item) => (
                  <Timeline.Item key={item.id}>
                    <strong>{item.position}</strong> - {item.department} <br />
                    {item.startYear} - {item.endYear}
                  </Timeline.Item>
                ))}
              </Timeline>
            </>
          )}
      </Modal>

      {/* modal detail data karyawan by table */}
      <Modal 
      title="Detail Karyawan" 
      open={visible} 
      onCancel={() => setVisible(false)} 
      footer={[
        <Button key="close" onClick={()=> setVisible(false)}>Tutup</Button>
      ]}
      width={800}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Nama">{employeeData?.name}</Descriptions.Item>
        <Descriptions.Item label="NIK">{employeeData?.nik}</Descriptions.Item>
        <Descriptions.Item label="Status Pernikahan">{employeeData?.maritalStatus}</Descriptions.Item>
      </Descriptions>

      <h3 style={{ marginTop: "20px" }}>History Jabatan</h3>
      <Table 
        columns={columnsHistoryPositions} 
        dataSource={employeeData?.history} 
        rowKey="id" 
        pagination={false} 
      />
    </Modal>
    </>
  );
};

export default EmployeeTable;
