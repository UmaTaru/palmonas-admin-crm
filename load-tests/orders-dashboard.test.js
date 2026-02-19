import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "20s", target: 20 }, // ramp up
    { duration: "40s", target: 50 }, // steady load
    { duration: "20s", target: 0 },  // ramp down
  ],

  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

// ✅ Admin JWT
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AcGFsbW9uYXMuY29tIiwicm9sZSI6IlNVUEVSX0FETUlOIiwiaWF0IjoxNzcxNTA4NTUzLCJleHAiOjE3NzE1MDk0NTN9.-p274810VSJRip24JP6XV6OSeVDsCE-DtaISwi5iYVk";

export default function () {

  const res = http.get(
    "http://localhost:4000/orders?page=1&limit=10",
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    }
  );

  console.log(`Status: ${res.status}`);

  check(res, {
    "dashboard loaded": (r) => r.status === 200,
  });

  sleep(1);
}
