import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";
import { FaCircle } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function testSupabaseConnection() {
    const { data, error } = await supabase
      .from('testing')
      .select('*')
    if (error) {
      console.error('❌ Error fetching data:', error.message)
    } else {
      console.log('✅ Supabase connected! Sample data:', data)
    }
  }

  testSupabaseConnection()


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "admin@gmail.com" && password === "123") {
      router.push("/dashboard");
    } else {
      alert("Email atau password salah!");
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-screen bg-gray-100">
      <FaCircle className="text-primary-secondary text-5xl" />
      <div className="bg-primary-primary bg-opacity-15 p-8 border border-primary-primary rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label className="block text-primary-primary">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border text-primary-primary rounded-lg border-[#666666] border-opacity-35 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-inherit"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-3">
            <label className="block text-primary-primary">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border text-primary-primary rounded-lg border-[#666666] border-opacity-35 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-inherit"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-primary rounded-full text-white py-3 transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
