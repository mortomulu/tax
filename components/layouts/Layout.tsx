import Link from "next/link";
import { useRouter } from "next/router";
import { HiReceiptTax } from "react-icons/hi";
import { TbTax } from "react-icons/tb";
import { message } from "antd";
import axios from "axios";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { BuildingOfficeIcon } from "@ant-design/icons";

function toTitleCase(str: string) {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = router.asPath;

  const [companyData, setCompanyData] = useState({
    company_name: "",
    company_npwp: "",
    loading: true,
  });

  const fetchCompanyProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("company_profile")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) throw error;

      setCompanyData({
        company_name: data?.company_name || "",
        company_npwp: data?.company_npwp || "",
        loading: false,
      });
    } catch (error) {
      message.error("Gagal memuat data perusahaan");
      console.error(error);
      setCompanyData((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const generateBreadcrumb = () => {
    const segments = pathname.split("/").filter((segment) => segment);
    const breadcrumbItems = [
      {
        title: (
          <Link href="/">
            <HomeOutlined />
          </Link>
        ),
      },
      ...segments.map((segment, index) => {
        const url = "/" + segments.slice(0, index + 1).join("/");
        return {
          title: (
            <Link href={url}>{decodeURIComponent(toTitleCase(segment))}</Link>
          ),
        };
      }),
    ];
    return breadcrumbItems;
  };

  const isActive = (path: string) => {
    return router.pathname === path;
  };

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
      await axios.post("/api/logout");
      router.push("/");
    } catch (err) {
      message.error("Gagal logout");
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-950 text-white p-6 flex flex-col justify-between h-screen">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2 mb-6">
            <HiReceiptTax className="text-yellow-400" />
            <span>SIPEKA</span>
          </h2>
          <nav>
            <div className="flex flex-col h-full justify-between">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/dashboard"
                    className={`flex items-center py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:translate-x-2 ${
                      isActive("/dashboard")
                        ? "bg-blue-800 text-yellow-400 border-l-4 border-yellow-400"
                        : "hover:bg-blue-800 hover:text-yellow-400"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/employee"
                    className={`flex items-center py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:translate-x-2 ${
                      isActive("/dashboard/employee")
                        ? "bg-blue-800 text-yellow-400 border-l-4 border-yellow-400"
                        : "hover:bg-blue-800 hover:text-yellow-400"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    Karyawan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/tax"
                    className={`flex items-center py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:translate-x-2 ${
                      isActive("/dashboard/tax")
                        ? "bg-blue-800 text-yellow-400 border-l-4 border-yellow-400"
                        : "hover:bg-blue-800 hover:text-yellow-400"
                    }`}
                  >
                    <TbTax className="h-5 w-5 mr-2 text-yellow-400" />
                    Pajak
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/archive"
                    className={`flex items-center py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:translate-x-2 ${
                      isActive("/dashboard/archive")
                        ? "bg-blue-800 text-yellow-400 border-l-4 border-yellow-400"
                        : "hover:bg-blue-800 hover:text-yellow-400"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    Arsip Laporan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/additionalData"
                    className={`flex items-center py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:translate-x-2 ${
                      isActive("/dashboard/additionalData")
                        ? "bg-blue-800 text-yellow-400 border-l-4 border-yellow-400"
                        : "hover:bg-blue-800 hover:text-yellow-400"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    Data Tambahan
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="mt-auto flex items-center">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ease-in-out text-white group"
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3 text-red-300 group-hover:text-red-200 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                />
              </svg>
              <span className="font-medium group-hover:font-semibold">
                Logout
              </span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <Breadcrumb items={generateBreadcrumb()} className="mb-6" />

        {/* Enhanced Company Profile Card */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Company Avatar/Initial */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                  {companyData.company_name.charAt(0)}
                </div>
              </div>

              {/* Company Info */}
              <div className="flex-1 text-white">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 mb-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {companyData.company_name}
                  </h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                    {/* <BadgeCheckIcon className="w-4 h-4 mr-1" /> */}
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    {/* <IdentificationIcon className="w-5 h-5 mr-2 opacity-80" /> */}
                    <div>
                      <p className="text-sm text-blue-100">Company NPWP</p>
                      <p className="font-mono tracking-wider flex items-center">
                        {companyData.company_npwp || "Not set"}
                        <button
                          // onClick={() =>
                          //   copyToClipboard(companyData.company_npwp)
                          // }
                          className="ml-2 p-1 text-blue-200 hover:text-white transition-colors"
                        >
                          {/* <DocumentDuplicateIcon className="w-4 h-4" /> */}
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          {children}
        </div>

        {/* Edit Modal */}
        {/* <CompanyProfileEditModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          initialData={companyData}
          onSave={(updatedData) => {
            setCompanyData(updatedData);
            setIsEditing(false);
          }}
        /> */}
      </main>
    </div>
  );
};

export default Layout;
