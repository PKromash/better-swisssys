import {getServerSession} from "next-auth";
import {redirect} from "next/navigation";
import {authOptions} from "@/lib/auth";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  console.log("Session:", session);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.name}</p>

      <form action="/api/auth/signout" method="post">
        <button type="submit">Sign Out</button>
      </form>

      <DashboardClient
        user={session.user ? {name: session.user.name ?? undefined} : undefined}
      />
    </div>
  );
}
