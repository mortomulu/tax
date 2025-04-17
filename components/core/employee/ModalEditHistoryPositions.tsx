import {
  Modal,
  Table,
  Form,
  Input,
  DatePicker,
  Checkbox,
  Button,
  Popconfirm,
  message,
  Select,
} from "antd";
import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { supabase } from "@/utils/supabase";

interface DataType {
  key: React.Key;
  id?: any;
  position: string;
  startDate: string | null;
  endDate: string | null;
  now: boolean;
  incentive?: number;
}

// const EditableCell = ({
//   editing,
//   dataIndex,
//   title,
//   inputType,
//   record,
//   index,
//   children,
//   ...restProps
// }: any) => {
//   let inputNode;
//   if (dataIndex === "now") {
//     inputNode = <Checkbox />;
//   } else if (dataIndex === "startDate" || dataIndex === "endDate") {
//     inputNode = <DatePicker />;
//   } else {
//     inputNode = <Input />;
//   }

//   return (
//     <td {...restProps}>
//       {editing ? (
//         <Form.Item
//           name={dataIndex}
//           style={{ margin: 0 }}
//           valuePropName={dataIndex === "now" ? "checked" : "value"}
//         >
//           {inputNode}
//         </Form.Item>
//       ) : (
//         children
//       )}
//     </td>
//   );
// };

const getEditableCell = (positionOptions: any[], form: any) => {
  const EditableCell: React.FC<any> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode =
      dataIndex === "position" ? (
        <Select
          onChange={(value) => {
            const selected = positionOptions.find((pos) => pos.id === value);
            if (selected) {
              form.setFieldsValue({
                positionId: selected.id,
                position: selected.id,
                incentive: selected.incentive,
              });
            }
          }}
        >
          {positionOptions.map((pos) => (
            <Select.Option key={pos.id} value={pos.id}>
              {pos.position}
            </Select.Option>
          ))}
        </Select>
      ) : dataIndex === "incentive" ? (
        <Input disabled />
      ) : dataIndex === "now" ? (
        <Form.Item
          name="now"
          valuePropName="checked"
          initialValue={false}
          style={{ margin: 0 }}
        >
          <Checkbox />
        </Form.Item>
      ) : dataIndex === "startDate" || dataIndex === "endDate" ? (
        <DatePicker />
      ) : (
        <Input />
      );

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[{ required: true, message: `Please Input ${title}!` }]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  return EditableCell;
};

const EditHistoryModal = ({
  isOpen,
  onClose,
  initialData,
  selectedEmployee,
  onSave,
  fetchEmployees,
  positionOptions,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: DataType[];
  selectedEmployee: any;
  onSave: (data: DataType[]) => void;
  fetchEmployees: () => void;
  positionOptions: any;
}) => {
  const [form] = Form.useForm();
  const [data, setData] = useState<any[]>([]);
  const [editingKey, setEditingKey] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const fetchHistoryPositions = async () => {
    const { data, error } = await supabase
      .from("histories_positions")
      .select(
        `
        id,
        startdate,
        enddate,
        idposition,
        positions (
          position,
          incentive
        )
      `
      )
      .eq("idemployee", selectedEmployee.id)
      .order("startdate", { ascending: false });

    if (error) {
      console.error("Failed to fetch history positions:", error);
      message.error("Gagal mengambil data riwayat jabatan.");
      return;
    }

    const formatted = data.map((item: any, index) => ({
      key: item.id || index,
      id: item.id,
      startDate: item.startdate,
      endDate: item.enddate,
      positionId: item.idposition,
      position: item.positions?.position || "-",
      incentive: item.positions?.incentive || 0,
    }));

    setData(formatted);
  };

  const isEditing = (record: DataType) => record.key === editingKey;

  const edit = (record: DataType) => {
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setType("edit");
    setEditingKey(record.key as string);
  };

  const cancel = () => {
    if (type === "add") {
      setData((prevData) => prevData.filter((item) => item.key !== editingKey));
    }
    setEditingKey("");
    setType("");
  };

  const save = async (key: React.Key) => {
    try {
      const row = await form.validateFields();
      console.log(row);

      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      const formattedStartDate =
        row.startDate?.toISOString?.() || row.startDate;
      const formattedEndDate = row.now
        ? null
        : row.endDate?.toISOString?.() || row.endDate;

      let selectedPosition = positionOptions.find(
        (pos: any) => pos.id === row.position
      );

      if (!selectedPosition) {
        selectedPosition = positionOptions.find(
          (pos: any) => pos.position === row.position
        );
      }

      if (index > -1) {
        const item = newData[index];

        const updatedRow = {
          ...item,
          ...row,
          position: selectedPosition.position,
          incentive: selectedPosition.incentive,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        };

        newData.splice(index, 1, updatedRow);
        setData(newData);
        setEditingKey("");

        if (type === "edit") {
          const { error } = await supabase
            .from("histories_positions")
            .update({
              idposition: item.idPosition,
              startdate: formattedStartDate,
              enddate: formattedEndDate,
            })
            .eq("id", item.id);

          if (error) {
            console.error("Update failed:", error);
            message.error("Gagal memperbarui data.");
          } else {
            message.success("Data berhasil diperbarui.");
          }
        } else if (type === "add") {
          const { error } = await supabase.from("histories_positions").insert([
            {
              idemployee: selectedEmployee.id,
              idposition: row.position,
              startdate: formattedStartDate,
              enddate: formattedEndDate,
            },
          ]);

          if (error) {
            console.error("Insert failed:", error);
            message.error("Gagal menambahkan data.");
          } else {
            fetchHistoryPositions();
            message.success("Data berhasil ditambahkan.");
          }
        }
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleDelete = async (key: React.Key) => {
    try {
      const { error } = await supabase
        .from("histories_positions")
        .delete()
        .eq("id", key);

      if (error) {
        message.error("Gagal menghapus jabatan dari database.");
        console.error("Delete error:", error);
        return;
      }

      setData((prevData) => prevData.filter((item) => item.key !== key));
      fetchHistoryPositions();
      message.success("Jabatan berhasil dihapus.");
    } catch (err) {
      console.error("Unexpected error:", err);
      message.error("Terjadi kesalahan saat menghapus data.");
    }
  };

  const handleAdd = () => {
    const newItem: DataType = {
      key: Date.now(),
      position: "",
      startDate: null,
      endDate: null,
      now: false,
    };
    setData([...data, newItem]);
    edit(newItem);
    setType("add");
  };

  const columns = [
    {
      title: "Posisi",
      dataIndex: "position",
      editable: true,
    },
    {
      title: "Mulai",
      dataIndex: "startDate",
      editable: true,
      render: (text: string) => (text ? dayjs(text).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Selesai",
      dataIndex: "endDate",
      editable: true,
      render: (text: string) => (text ? dayjs(text).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Sekarang?",
      dataIndex: "now",
      editable: true,
      render: (checked: boolean) => (checked ? "✔️" : "❌"),
    },
    {
      title: "Incentive",
      dataIndex: "incentive",
      editable: false,
    },
    {
      title: "Aksi",
      dataIndex: "operation",
      render: (_: any, record: DataType) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              Simpan
            </a>
            <a onClick={cancel}>Batal</a>
          </span>
        ) : (
          <span>
            <a onClick={() => edit(record)} style={{ marginRight: 8 }}>
              Edit
            </a>
            <Popconfirm
              title="Yakin ingin menghapus?"
              onConfirm={() => handleDelete(record.id)}
            >
              <a>Hapus</a>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) =>
    col.editable
      ? {
          ...col,
          onCell: (record: DataType) => ({
            record,
            inputType: col.dataIndex === "incentive" ? "number" : col.dataIndex,
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
          }),
        }
      : col
  );

  return (
    <Modal
      title="Kelola Riwayat Jabatan"
      open={isOpen}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="add" onClick={handleAdd}>
          Tambah Jabatan
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Batal
        </Button>,
        <Button key="submit" type="primary" onClick={() => onSave(data)}>
          Simpan Semua
        </Button>,
      ]}
    >
      <Form form={form} component={false}>
        <Table<DataType>
          components={{
            body: {
              cell: getEditableCell(positionOptions, form),
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{ onChange: cancel }}
        />
      </Form>
    </Modal>
  );
};

export default EditHistoryModal;
