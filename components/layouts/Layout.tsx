import Link from "next/link";
import { useRouter } from "next/router";
import { HiReceiptTax } from "react-icons/hi";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-950 text-white p-6 space-y-6">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <HiReceiptTax className="text-yellow-400" />
          <span>Dashboard</span>
        </h2>
        <nav>
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
                href="/dashboard/ptkp"
                className={`flex items-center py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:translate-x-2 ${
                  isActive("/dashboard/ptkp")
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
                PTKP
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/ter"
                className={`flex items-center py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:translate-x-2 ${
                  isActive("/dashboard/ter")
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                TER
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-blue-50">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-400">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;