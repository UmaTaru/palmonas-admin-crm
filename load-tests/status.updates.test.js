import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5,
  duration: "20s",

  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.05"], // realistic for write APIs
  },
};

// ✅ Access token
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AcGFsbW9uYXMuY29tIiwicm9sZSI6IlNVUEVSX0FETUlOIiwiaWF0IjoxNzcxNTA3OTIxLCJleHAiOjE3NzE1MDg4MjF9.G8kXcxzRzivZzeiZZPdm8saM-5KPK0ThmU6S7_HPJYc";

export default function () {

    const statuses = ["CONFIRMED", "PACKED", "SHIPPED"];

    const status =
    statuses[Math.floor(Math.random() * statuses.length)];

    const payload = JSON.stringify({ status });

    const ORDER_IDS = [
    "cb4e18e4-a697-48c4-aa28-6f457e197061",
    "bc7e4f48-2fa1-47b1-a158-6dbebc37c0da",
    "edee4d25-2219-4d78-8ef2-8b24f8535098",
    "28ef61a0-4e61-46aa-aae5-5704a661db8f"
    ];

const orderId =
  ORDER_IDS[Math.floor(Math.random() * ORDER_IDS.length)];

    const params = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  // ✅ store response
  const res = http.patch(
    `http://localhost:4000/orders/${orderId}/status`,
    payload,
    params
  );

  console.log(`Status: ${res.status}`);

  check(res, {
    "status update success": (r) => r.status === 200,
  });

  sleep(1);
}
