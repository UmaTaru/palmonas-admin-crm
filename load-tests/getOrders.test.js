import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "60s",
};

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AcGFsbW9uYXMuY29tIiwicm9sZSI6IlNVUEVSX0FETUlOIiwiaWF0IjoxNzcxNTA2OTE0LCJleHAiOjE3NzE1MDc4MTR9.5qEkxhtM8Y9nxjkYkAOzHKqjmzY4l_xepeVOggs1RaU";

export default function () {

  const res = http.get(
    "http://localhost:4000/orders",
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    }
  );

  console.log(`Status: ${res.status}`);

  check(res, {
    "orders fetched": (r) => r.status === 200,
  });

  sleep(1);
}
