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
  Dropdown,
  Menu,
  Avatar,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  PlusOutlined,
  MailOutlined,
  LockOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axios from "axios";

type User = {
  id: string;
  email?: string;
  role: string;
};

export default function UserList() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<any>();
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

  const handleDelete = async () => {
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      selectedId.id
    );
    if (!authError) {
      message.success("User dihapus");
      setModalDeleteOpen(false);
      setSelectedId("");
      fetchUsers();
    } else {
      message.error("Gagal hapus user");
    }
  };

  // const handleChangeRole = async (id: string, newRole: string) => {
  //   const { error } = await supabase
  //     .from("profiles")
  //     .update({ role: newRole })
  //     .eq("id", id);
  //   if (!error) {
  //     message.success("Role diperbarui");
  //     fetchUsers();
  //   } else {
  //     message.error("Gagal update role");
  //   }
  // };

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
      // render: (text: string, record: User) => (
      //   <Select
      //     value={text}
      //     onChange={(val) => handleChangeRole(record.id, val)}
      //   >
      //     <Select.Option value="admin">admin</Select.Option>
      //     <Select.Option value="superadmin">superadmin</Select.Option>
      //     <Select.Option value="user">user</Select.Option>
      //   </Select>
      // ),
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_: any, record: User) => (
        <Button
          danger
          onClick={() => {
            setSelectedId(record);
            setModalDeleteOpen(true);
          }}
        >
          Hapus
        </Button>
      ),
    },
  ];

  // const handleLogout = async () => {
  //   const { error } = await supabase.auth.signOut();

  //   if (error) {
  //     message.error("Gagal logout: " + error.message);
  //   } else {
  //     Cookies.remove("sb-access-token", { path: "/" });
  //     Cookies.remove("sb-refresh-token", { path: "/" });
  //     Cookies.remove("role", { path: "/" });

  //     message.success("Berhasil logout!");
  //     router.push("/");
  //   }
  // };

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout"); // panggil API logout
      router.push("/"); // redirect ke halaman login/landing
    } catch (err) {
      message.error("Gagal logout")
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Dropdown
                overlay={
                  <Menu>
                    {/* <Menu.Item
                      key="profile"
                      className="px-4 py-2 hover:bg-gray-100"
                    >
                      <UserOutlined className="mr-2" /> Profile
                    </Menu.Item> */}
                    <Menu.Item
                      key="logout"
                      className="px-4 py-2 hover:bg-gray-100 text-red-500"
                      onClick={handleLogout}
                    >
                      <LogoutOutlined className="mr-2" /> Logout
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <Button
                  type="text"
                  className="flex items-center gap-2 hover:bg-gray-100"
                >
                  <Avatar
                    size="small"
                    className="bg-blue-500"
                    icon={<UserOutlined />}
                  />
                  <span className="hidden md:inline">Superadmin</span>
                  <DownOutlined className="text-xs" />
                </Button>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header and Add User Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all system users and their permissions
            </p>
          </div>
          <Button
            type="primary"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            icon={<PlusOutlined />}
          >
            Add User
          </Button>
        </div>

        {/* User Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Table
            dataSource={users}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              // showSizeChanger: true,
              // pageSizeOptions: ["10", "20", "50"],
              className: "px-4 py-2",
            }}
            rowClassName="hover:bg-gray-50 transition-colors"
          />
        </div>

        {/* Add User Modal */}
        <Modal
          title={<span className="text-lg font-semibold">Add New User</span>}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={() => form.submit()}
          okText="Add User"
          okButtonProps={{ className: "bg-blue-600 hover:bg-blue-700" }}
          cancelButtonProps={{ className: "hover:bg-gray-100" }}
          width={600}
          bodyStyle={{ padding: "24px" }}
          destroyOnClose
        >
          <Form layout="vertical" form={form} onFinish={handleAddUser}>
            <Form.Item
              name="email"
              label={<span className="font-medium text-gray-700">Email</span>}
              rules={[{ required: true, type: "email" }]}
            >
              <Input
                placeholder="user@example.com"
                prefix={<MailOutlined className="text-gray-400" />}
                className="py-2"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={
                <span className="font-medium text-gray-700">Password</span>
              }
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password
                placeholder="Minimum 6 characters"
                prefix={<LockOutlined className="text-gray-400" />}
                className="py-2"
              />
            </Form.Item>
            <Form.Item
              name="role"
              label={<span className="font-medium text-gray-700">Role</span>}
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select user role"
                className="w-full"
                options={[
                  { value: "user", label: "User" },
                  { value: "admin", label: "Admin" },
                  { value: "superadmin", label: "Super Admin" },
                ]}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          title={
            <span className="text-lg font-semibold">Confirm User Deletion</span>
          }
          open={modalDeleteOpen}
          onOk={handleDelete}
          onCancel={() => {
            setModalDeleteOpen(false);
            setSelectedId("");
          }}
          okText="Delete"
          okButtonProps={{
            danger: true,
            className: "bg-red-600 hover:bg-red-700",
          }}
          cancelButtonProps={{ className: "hover:bg-gray-100" }}
          width={500}
        >
          <div className="flex items-start gap-4">
            <ExclamationCircleFilled className="text-2xl text-yellow-500 mt-1" />
            <div>
              <p className="text-gray-700 mb-2">
                Are you sure you want to permanently delete the user:
              </p>
              <p className="font-medium text-gray-900">
                {selectedId?.name || selectedId?.email}
              </p>
              <p className="text-gray-500 mt-2 text-sm">
                This action cannot be undone and will revoke all user access
                immediately.
              </p>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
