import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { Input, Button, message } from "antd";
import Link from "next/link";
import { ArrowLeftOutlined, LockOutlined, MailOutlined, SendOutlined } from "@ant-design/icons";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      message.error("Gagal mengirim email reset password");
    } else {
      message.success("Link reset password telah dikirim ke email!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <LockOutlined className="text-4xl text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-gray-500 mt-2">
            Masukkan email kamu untuk menerima link reset password
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              size="large"
              placeholder="you@example.com"
              prefix={<MailOutlined className="text-gray-400" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hover:border-blue-400 focus:border-blue-400"
            />
          </div>

          <Button
            type="primary"
            size="large"
            block
            onClick={handleResetPassword}
            className="h-11 font-medium text-base shadow-sm hover:shadow-md transition-all"
            icon={<SendOutlined />}
            // loading={isLoading}
          >
            Kirim Link Reset
          </Button>

          <div className="text-center mt-4">
            <Link
              href="/"
              className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              <ArrowLeftOutlined className="mr-1" />
              Kembali ke halaman login
            </Link>
          </div>
        </div>

        {/* {message && (
          <div
            className={`mt-6 p-3 rounded-md text-center ${
              message.type === "error"
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {message.text}
          </div>
        )} */}
      </div>
    </div>
  );
}
