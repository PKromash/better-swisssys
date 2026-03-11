import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";
import {connectToDB} from "@/lib/mongoose";
import Tournament from "@/lib/models/tournament.model";
import Section from "@/lib/models/section.model";
import DashboardView from "@/components/DashboardView";

interface SectionDoc {
  _id: string;
  name: string;
  players: {_id: string}[];
}

interface TournamentDoc {
  _id: string;
  metadata: {
    name: string;
    startDate: string;
    endDate: string;
  };
  sections: SectionDoc[];
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  await connectToDB();
  void Section;

  const tournaments = await Tournament.find({owner: session.user.id})
    .populate("sections")
    .sort({createdAt: -1})
    .lean<TournamentDoc[]>();

  const serialized = JSON.parse(JSON.stringify(tournaments));

  return (
    <DashboardView
      tournaments={serialized}
      userName={session.user.name ?? "Unknown"}
    />
  );
}
