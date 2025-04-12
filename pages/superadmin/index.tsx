import { useEffect, useState } from "react";
import { supabase, supabaseAdmin } from "@/utils/supabase";
import {
  Table,
  Button,
  Select,
  message,
  Modal,
  Form,
  Input,
  Space,
} from "antd";

import { useRouter } from "next/router";

type User = {
  id: string;
  email?: string;
  role: string;
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, email");

    if (error) {
      message.error("Gagal mengambil data user");
      console.error(error);
    } else {
      const mapped = data.map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role,
      }));
      setUsers(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (!authError) {
      message.success("User dihapus");
      fetchUsers();
    } else {
      message.error("Gagal hapus user");
    }
  };

  const handleChangeRole = async (id: string, newRole: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", id);
    if (!error) {
      message.success("Role diperbarui");
      fetchUsers();
    } else {
      message.error("Gagal update role");
    }
  };

  const handleAddUser = async (values: any) => {
    const { email, password, role } = values;

    const { data: signUpData, error: signUpError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (signUpError || !signUpData.user) {
      message.error("Gagal membuat user: " + signUpError?.message);
      return;
    }

    const userId = signUpData.user.id;

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: userId, role, email });

    if (profileError) {
      message.error("User dibuat tapi gagal simpan role");
    } else {
      message.success("User berhasil ditambahkan");
      form.resetFields();
      setModalOpen(false);
      fetchUsers();
    }
  };

  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (text: string, record: User) => (
        <Select
          value={text}
          onChange={(val) => handleChangeRole(record.id, val)}
        >
          <Select.Option value="admin">admin</Select.Option>
          <Select.Option value="superadmin">superadmin</Select.Option>
          <Select.Option value="user">user</Select.Option>
        </Select>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_: any, record: User) => (
        <Button danger onClick={() => handleDelete(record.id)}>
          Hapus
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Space
        style={{
          marginBottom: 16,
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <h1>Manajemen User</h1>
        <Button type="primary" onClick={() => setModalOpen(true)}>
          Tambah User
        </Button>
      </Space>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="Tambah User Baru"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Tambah"
      >
        <Form layout="vertical" form={form} onFinish={handleAddUser}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="contoh@email.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password placeholder="Minimal 6 karakter" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Pilih role user">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="superadmin">Superadmin</Select.Option>
              <Select.Option value="user">User</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
