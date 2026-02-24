"use client";

import {useState, useEffect} from "react";
import {createTournament} from "@/lib/actions/tournament.actions";

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
      <button
        onClick={() => {
          createTournament({metadata: {name}})
            .then(() => {
              setName("");
            })
            .then(() => {
              return fetch("/api/tournaments");
            })
            .then((res) => res.json())
            .then((data) => setTournaments(data))
            .catch((err) => console.error(err));
        }}>
        Create
      </button>

      <h2>Your Tournaments</h2>
      <ul>
        {tournaments.map((t: Tournament) => (
          <li key={t._id}>{t.metadata.name}</li>
        ))}
      </ul>
    </div>
  );
}
