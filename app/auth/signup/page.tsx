"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/auth/signin");
    } else {
      alert("Failed to sign up");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign Up</h1>

      <input
        placeholder="Name"
        onChange={(e) => setForm({...form, name: e.target.value})}
      />
      <input
        placeholder="Username"
        onChange={(e) => setForm({...form, username: e.target.value})}
      />
      <input
        placeholder="Email"
        onChange={(e) => setForm({...form, email: e.target.value})}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({...form, password: e.target.value})}
      />

      <button type="submit">Create Account</button>
    </form>
  );
}
