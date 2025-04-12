import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { Input, Button, message } from "antd";

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
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Lupa Password</h2>
      <Input
        placeholder="Masukkan email kamu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <Button type="primary" block onClick={handleResetPassword}>
        Kirim Link Reset
      </Button>
    </div>
  );
}
