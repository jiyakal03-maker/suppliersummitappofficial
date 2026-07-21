import { createClient } from "@/lib/supabase/server";
import { AgendaPageClient } from "./agenda-page-client";
import type { AgendaSession, AgendaSpeaker } from "@/components";

/**
 * Route: /agenda ("Agenda & speakers" in TopNav)
 * Server Component: reads event + speakers straight from Supabase (RLS
 * requires an authenticated session — signed-out visitors see the empty
 * state in AgendaPageClient until login is wired up).
 */

type EventRow = {
  event_id: string;
  event_name: string;
  topic: string | null;
  description: string | null;
  status: string;
  start_time: string | null;
  end_time: string | null;
};

type SpeakerRow = {
  speaker_id: string;
  event_id: string | null;
  bio: string | null;
  user: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    company: string | null;
  } | null;
};

function formatTimeRange(start: string | null, end: string | null) {
  if (!start) return "";
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(
      new Date(iso),
    );
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function AgendaPage() {
  const supabase = await createClient();

  const [{ data: events }, { data: speakerRows }] = await Promise.all([
    supabase
      .from("event")
      .select("event_id, event_name, topic, description, status, start_time, end_time")
      .order("start_time", { ascending: true })
      .returns<EventRow[]>(),
    supabase
      .from("speakers")
      .select("speaker_id, event_id, bio, user(user_id, first_name, last_name, company)")
      .returns<SpeakerRow[]>(),
  ]);

  const speakerByUser = new Map<string, AgendaSpeaker>();
  const speakerIdsByEvent = new Map<string, string[]>();

  for (const row of speakerRows ?? []) {
    const person = row.user;
    if (!person || !row.event_id) continue;

    const name = [person.first_name, person.last_name].filter(Boolean).join(" ") || "Speaker";
    if (!speakerByUser.has(person.user_id)) {
      speakerByUser.set(person.user_id, {
        id: person.user_id,
        name,
        role: person.company ?? "",
        initials: initialsOf(name),
        bio: row.bio ?? undefined,
      });
    }

    const ids = speakerIdsByEvent.get(row.event_id) ?? [];
    ids.push(person.user_id);
    speakerIdsByEvent.set(row.event_id, ids);
  }

  const sessions: AgendaSession[] = (events ?? []).map((e) => ({
    id: e.event_id,
    title: e.event_name,
    time: formatTimeRange(e.start_time, e.end_time),
    location: e.topic ?? "",
    description: e.description ?? "",
    live: e.status === "live",
    speakerIds: speakerIdsByEvent.get(e.event_id) ?? [],
  }));

  const speakers = [...speakerByUser.values()];

  return <AgendaPageClient sessions={sessions} speakers={speakers} />;
}
