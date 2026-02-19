import { useState } from "react";
import api from "../api/client";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem(
      "token",
      res.data.accessToken
    );

    window.location.href = "/dashboard";

  } catch (err) {
    alert("Invalid credentials");
  }
}


  return (
    <div className="h-screen flex font-sans">

      {/* LEFT PANEL */}
      <div className="w-1/2 flex items-center justify-center bg-white">

        <div className="w-[380px] space-y-8">

          <div>
            <h1 className="text-4xl font-semibold tracking-tight">
              Welcome Back
            </h1>

            <p className="text-gray-500 mt-2">
              Sign in to Palmonas Admin CRM
            </p>
          </div>

          <div className="space-y-4">

            <input
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Email"
              onChange={(e)=>setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Password"
              onChange={(e)=>setPassword(e.target.value)}
            />

          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-900 transition"
          >
            Sign In
          </button>


        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 bg-black text-white flex flex-col justify-between p-12">

        {/* BRAND */}
        <div className="flex items-center justify-center h-full">
          <h2 className="text-6xl font-light tracking-widest">
            PALMONAS
          </h2>
        </div>

        {/* SOCIAL LINKS */}
        <div className="flex justify-center gap-8 text-sm opacity-70">

          <a
            href="https://instagram.com"
            target="_blank"
            className="hover:opacity-100"
          >
            Instagram
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            className="hover:opacity-100"
          >
            LinkedIn
          </a>

          <a
            href="https://palmonas.com"
            target="_blank"
            className="hover:opacity-100"
          >
            Website
          </a>

        </div>

      </div>

    </div>
  );
}
