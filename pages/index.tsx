import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";
import { FaCircle } from "react-icons/fa";
import { message } from "antd";
import Cookies from "js-cookie";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   const res = await fetch("/api/login", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ email, password }),
  //   });

  //   if (!res.ok) {
  //     message.error("Login gagal!");
  //     return;
  //   }

  //   const { role } = await res.json();
  //   message.success("Login berhasil!");

  //   if (role === "superadmin") {
  //     router.push("/superadmin");
  //   } else {
  //     router.push("/dashboard");
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: loginData, error } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (error || !loginData.user) {
        message.error("Login gagal: email atau password salah.");
        return;
      }

      const userId = loginData.user.id;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileError || !profile?.role) {
        message.error("Gagal mengambil role user.");
        return;
      }

      if (loginData.session) {
        document.cookie = `sb-access-token=${
          loginData.session.access_token
        }; path=/; max-age=${60 * 60 * 24}`; // 1 hari
        document.cookie = `sb-refresh-token=${
          loginData.session.refresh_token
        }; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 hari
        document.cookie = `role=${profile.role}; path=/; max-age=${
          60 * 60 * 24
        }`;
      }

      message.success("Login berhasil!");

      if (profile.role === "superadmin") {
        router.push("/superadmin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      message.error("Terjadi kesalahan saat login");
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-screen bg-gray-100 p-4">
      <FaCircle className="text-primary-secondary text-5xl" />
      <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Masuk ke Akun Anda
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border text-gray-700 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-primary focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary-primary hover:text-primary-secondary transition-colors"
              >
                Lupa password?
              </Link>
            </div>
            <input
              type="password"
              className="w-full px-4 py-3 border text-gray-700 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-primary focus:border-transparent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-primary hover:bg-primary-secondary text-white font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Sign In
          </button>
        </form>

        {/* <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary-primary hover:text-primary-secondary transition-colors"
          >
            Create one
          </Link>
        </div> */}
      </div>
    </div>
  );
}
