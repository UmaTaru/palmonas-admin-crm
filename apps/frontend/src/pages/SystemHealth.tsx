import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../api/client";

export default function SystemHealth() {

  const [health, setHealth] = useState<any>(null);

  async function fetchHealth() {
    try {
      console.log("Health API");
      const res = await api.get("/health");
      console.log("Health API response:", res);
      setHealth(res.data);
    } catch (error) {
      console.error("Health API error:", error);
      setHealth({ status: "down" });
    }
  }

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>

      <h2 className="text-2xl font-semibold mb-6">
        System Health
      </h2>

      <div className="grid grid-cols-3 gap-6">

        <HealthCard
          title="Backend API"
          status={health?.status === "UP"}
        />

        <HealthCard
          title="Database"
          status={health?.database === "CONNECTED"}
        />

        <HealthCard
          title="Redis"
          status={health?.redis === "ready"}
        />

      </div>

      {health && (
        <div className="mt-6 text-sm text-gray-600">
          Uptime: {Math.floor(health.uptime)} seconds
        </div>
      )}

    </DashboardLayout>
  );
}

function HealthCard({
  title,
  status,
}: {
  title: string;
  status: boolean;
}) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">

      <h3 className="mb-2 font-medium">
        {title}
      </h3>

      <span
        className={`px-3 py-1 rounded-full text-sm ${
          status
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {status ? "Healthy" : "Down"}
      </span>

    </div>
  );
}
