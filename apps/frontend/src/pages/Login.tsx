import { useState } from "react";
import api from "../api/client";

export default function Login() {

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  async function login() {
    const res = await api.post("/auth/login", {
      email,
      password
    });

    localStorage.setItem(
      "token",
      res.data.accessToken
    );

    window.location.href="/dashboard";
  }

  return (
    <div>
      <h2>Admin Login</h2>

      <input
        placeholder="Email"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button onClick={login}>
        Login
      </button>
    </div>
  );
}
