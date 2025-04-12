// pages/update-password.tsx
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { Input, Button, message } from "antd";
import { useRouter } from "next/router";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleUpdate = async () => {
    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      message.error("Gagal update password");
    } else {
      message.success("Password berhasil diubah!");
      router.push("/");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Reset Password</h2>
      <Input.Password
        placeholder="Masukkan password baru"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <Button type="primary" block onClick={handleUpdate}>
        Update Password
      </Button>
    </div>
  );
}
