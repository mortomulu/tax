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
  key: string;
  ptkp: string;
  amount: number;
}

type DataIndex = keyof DataType;

const items = [
  { key: "1", label: "Detail" },
  { key: "2", label: "Edit" },
  { key: "3", label: "Delete" },
];

interface PtkpTable {
  data: DataType[];
  fetchPtkps: () => void;
}

const PtkpTable: React.FC<PtkpTable> = ({ data, fetchPtkps }) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editForm] = Form.useForm();

  useEffect(() => {
    if (activeRecord) {
      editForm.setFieldsValue({
        ptkp: activeRecord.ptkp,
        amount: activeRecord.amount,
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
      title: "PTKP",
      dataIndex: "ptkp",
      key: "ptkp",
      width: "20%",
      ...getColumnSearchProps("ptkp"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: "10%",
      sorter: (a, b) => a.amount - b.amount,
      render: (price: number) => <span>{formatRupiah(price)}</span>,
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
      .from("ptkp")
      .update(values)
      .eq("id", activeRecord.id);

    if (error) {
      message.error("Gagal edit data");
    } else {
      message.success("Data berhasil diupdate");
      editForm.resetFields();
      setActiveRecord(null);
      fetchPtkps();
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteData = async () => {
    const { data, error } = await supabase
      .from("ptkp")
      .delete()
      .eq("id", activeRecord.id);

    if (error) {
      message.error("Gagal menghapus data");
    } else {
      message.success("Data berhasil dihapus");
      fetchPtkps();
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <Table<DataType>
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
      />
      <Modal
        title="Detail Data"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
      >
        <p>
          <strong>ID:</strong> {activeRecord?.id}
        </p>
        <p>
          <strong>Nama:</strong>{" "}
          {activeRecord?.position ||
            activeRecord?.ptkp ||
            activeRecord?.typeTer}
        </p>
        <p>
          <strong>Incentive/Amount/Range:</strong>
          {activeRecord?.incentive ||
            activeRecord?.amount ||
            `${activeRecord?.startRange} - ${activeRecord?.endRange}`}
        </p>
      </Modal>
      <Modal
        title="Edit Data PTKP"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="ptkp" label="PTKP" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Hapus Data"
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={handleDeleteData}
      >
        <p>Apakah Anda yakin ingin menghapus data ini?</p>
        <p>
          <strong>ID:</strong> {activeRecord?.id}
        </p>
        <p>
          <strong>Nama:</strong>{" "}
          {activeRecord?.position ||
            activeRecord?.ptkp ||
            activeRecord?.typeTer}
        </p>
      </Modal>
    </>
  );
};

export default PtkpTable;
