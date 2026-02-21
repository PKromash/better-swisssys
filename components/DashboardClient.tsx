"use client";

import {useState, useEffect} from "react";

interface DashboardClientProps {
  user?: {
    name?: string;
  };
}

interface Tournament {
  _id: string;
  metadata: {
    name: string;
  };
}

export default function DashboardClient({user}: DashboardClientProps) {
  const [name, setName] = useState("");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  async function fetchTournaments() {
    const res = await fetch("/api/tournaments");
    const data = await res.json();
    setTournaments(data);
  }

  async function createTournament() {
    const res = await fetch("/api/tournaments", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name}),
    });

    if (res.ok) {
      setName("");
      fetchTournaments();
    }
  }

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/tournaments");
      const data = await res.json();
      setTournaments(data);
    })();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}</p>

      <input
        placeholder="Tournament Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={createTournament}>Create</button>

      <h2>Your Tournaments</h2>
      <ul>
        {tournaments.map((t: Tournament) => (
          <li key={t._id}>{t.metadata.name}</li>
        ))}
      </ul>
    </div>
  );
}
