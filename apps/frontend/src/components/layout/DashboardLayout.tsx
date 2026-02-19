import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex h-screen">

      {/* SIDEBAR */}
      <div className="w-64 bg-black text-white flex flex-col p-6">

        <h2 className="text-xl font-semibold mb-10">
          PALMONAS
        </h2>

        <nav className="space-y-4">

  <Link
    to="/dashboard"
    className="block opacity-80 hover:opacity-100"
  >
    Orders
  </Link>

  <Link
    to="/health"
    className="block opacity-80 hover:opacity-100"
  >
    System Health
  </Link>

</nav>


      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="h-16 border-b flex items-center justify-between px-6">

          <h1 className="font-semibold">
            Admin Dashboard
          </h1>

          <button
            onClick={()=>{
              localStorage.removeItem("token");
              window.location.href="/";
            }}
            className="text-sm border px-3 py-1 rounded"
          >
            Logout
          </button>

        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-auto">
          {children}
        </div>

      </div>

    </div>
  );
}
