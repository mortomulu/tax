import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons/lib";
import type { InputRef, TableColumnsType, TableColumnType } from "antd/lib";
import {
  Button,
  Dropdown,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Table,
} from "antd/lib";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { BsThreeDotsVertical } from "react-icons/bs";
import { formatRupiah } from "@/utils/currency";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";

interface DataType {
  id: string;
  position: string;
  incentive: number;
}

type DataIndex = keyof DataType;

const items = [
  { key: "1", label: "Detail" },
  { key: "2", label: "Edit" },
  { key: "3", label: "Hapus" },
];

interface JabatanTableProps {
  data: DataType[];
  fetchPositions: () => void;
}

const JabatanTable: React.FC<JabatanTableProps> = ({
  data,
  fetchPositions,
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editForm] = Form.useForm();

  const [filteredData, setFilteredData] = useState<DataType[]>(data);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    if (activeRecord) {
      editForm.setFieldsValue({
        position: activeRecord.position,
        incentive: activeRecord.incentive,
      });
    }
  }, [activeRecord, editForm, isEditModalOpen]);

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

    const filtered = data.filter(
      (item) =>
        item.position.toLowerCase().includes(value) ||
        item.incentive.toString().includes(value)
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
      title: "Jabatan",
      dataIndex: "position",
      key: "position",
      width: "20%",
      ...getColumnSearchProps("position"),
    },
    {
      title: "Position Allowance",
      dataIndex: "incentive",
      key: "incentive",
      width: "10%",
      sorter: (a, b) => a.incentive - b.incentive,
      render: (price: number) => <span>{formatRupiah(price)}</span>,
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

  const handleMenuClick = (key: string, record: any) => {
    setActiveRecord(record);

    if (key === "1") {
      setIsDetailModalOpen(true);
    } else if (key === "2") {
      setIsEditModalOpen(true);
    } else if (key === "3") {
      setIsDeleteModalOpen(true);
    }
  };

  const handleEdit = async (values: any) => {
    const { error } = await supabase
      .from("positions")
      .update(values)
      .eq("id", activeRecord.id);

    if (error) {
      message.error("Gagal edit data");
      console.log(error);
    } else {
      message.success("Data berhasil diupdate");
      editForm.resetFields();
      setActiveRecord(null);
      fetchPositions();
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteData = async () => {
    const { data, error } = await supabase
      .from("positions")
      .delete()
      .eq("id", activeRecord.id);

    if (error) {
      message.error(
        "Posisi masih digunakan oleh karyawan dan tidak dapat dihapus. Silakan ubah datanya jika diperlukan."
      );
    } else {
      message.success("Data berhasil dihapus");
      fetchPositions();
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="-mt-4">
      <Input
        placeholder="Cari berdasarkan Jabatan"
        value={searchText}
        onChange={handleGlobalSearch}
        style={{ marginBottom: 16, width: 300 }}
      />
      <Table<DataType>
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
      />
      <Modal
        title="Detail Data"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="col-span-1">
              <p className="font-semibold text-gray-600">Jabatan</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-800">{activeRecord?.position || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <p className="font-semibold text-gray-600">Incentive</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-800">
                {formatRupiah(activeRecord?.incentive)}
              </p>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        title="Edit Data Jabatan"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        okText="Perbarui Data"
        cancelText="Batal"
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            name="position"
            label="Nama Jabatan"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="incentive"
            label="Position Allowance"
            rules={[{ required: true }]}
          >
            <InputNumber className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Hapus Data"
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={handleDeleteData}
        okText="Ya, Hapus"
        cancelText="Batal"
        okButtonProps={{ danger: true }}
      >
        <p>Apakah Anda yakin ingin menghapus data {activeRecord?.position}?</p>
      </Modal>
    </div>
  );
};

export default JabatanTable;
