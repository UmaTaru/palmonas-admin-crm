import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../api/client";

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  requestId?: string;
  userId?: number;
  email?: string;
}

interface LogsResponse {
  logs: LogEntry[];
  total: number;
  filtered: number;
}

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  async function fetchLogs() {
    try {
      console.log("Fetching logs...");
      const res = await api.get(`/logs?limit=100&level=${selectedLevel}`);
      console.log("Logs response:", res.data);
      const data: LogsResponse = res.data;
      setLogs(data.logs);
    } catch (error) {
      console.error("Logs API error:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [selectedLevel]);

  function getLevelColor(level: string) {
    switch (level.toLowerCase()) {
      case "error":
        return "bg-red-100 text-red-700 border-red-200";
      case "warn":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "info":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  }

  function formatTimestamp(timestamp: string) {
    return new Date(timestamp).toLocaleString();
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading logs...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Application Logs</h2>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
            
            <button
              onClick={fetchLogs}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No logs found for the selected level.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {logs.map((log, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getLevelColor(
                          log.level
                        )}`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {log.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </p>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                        {log.requestId && (
                          <span>Request ID: {log.requestId}</span>
                        )}
                        {log.userId && (
                          <span>User ID: {log.userId}</span>
                        )}
                        {log.email && (
                          <span>Email: {log.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 text-center">
          Showing {logs.length} logs • Auto-refresh every 10 seconds
        </div>
      </div>
    </DashboardLayout>
  );
}
