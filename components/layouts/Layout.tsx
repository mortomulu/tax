import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 space-y-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <nav>
          <ul className="space-y-4">
            <li>
              <Link
                href="/dashboard"
                className="block py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/employee"
                className="block py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Karyawan
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/archive"
                className="block py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Arsip Laporan
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/ptkp"
                className="block py-2 px-4 rounded-md hover:bg-gray-700"
              >
                PTKP
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/ter"
                className="block py-2 px-4 rounded-md hover:bg-gray-700"
              >
                TER
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
};

export default Layout;
