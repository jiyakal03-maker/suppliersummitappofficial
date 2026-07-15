"use client";
import * as React from "react";
import Avatar from "@mui/material/Avatar";
import {
  PageContainer,
  SectionHeader,
  TopNav,
  NavLogo,
  SpeakerCard,
  AgendaTimeline,
  SessionDetail,
  useToast,
  type AgendaSession,
  type AgendaSpeaker,
} from "@/components";

/**
 * Route: /agenda ("Agenda & speakers" in TopNav)
 * Left rail is a dot-and-line timeline of the day's sessions; selecting one
 * updates the detail panel (speaker cards + full copy) beside it on desktop,
 * below it on mobile. A speaker directory follows for browsing the full
 * lineup — the mobile avatar strip under the timeline jumps straight there.
 *
 * TODO: swap SPEAKERS/SESSIONS for real Supabase data once the schedule is finalized.
 */

const SPEAKERS: AgendaSpeaker[] = [
  {
    id: "jn",
    name: "Justin Nelson",
    role: "Executive VP, IT & Supply Chain",
    initials: "JN",
    bio: "Justin leads Etnyre's IT and supply chain strategy, with a focus on modernizing supplier collaboration across every business unit.",
  },
  {
    id: "ab",
    name: "Angela Brooks",
    role: "Chief Supply Chain Officer",
    initials: "AB",
    bio: "Angela sets sourcing and supply chain priorities across the Etnyre family of brands, with 18 years in industrial manufacturing.",
  },
  {
    id: "dk",
    name: "David Kim",
    role: "Director of Procurement",
    initials: "DK",
    bio: "David oversees procurement operations and supplier scorecards, and is the primary point of contact for sourcing questions.",
  },
  {
    id: "ma",
    name: "Maria Alvarez",
    role: "VP of Manufacturing",
    initials: "MA",
    bio: "Maria runs manufacturing and quality across Etnyre's plants, and works closely with suppliers on quality-gate standards.",
  },
  {
    id: "tr",
    name: "Tom Reyes",
    role: "Head of Logistics",
    initials: "TR",
    bio: "Tom manages freight, fulfillment, and logistics partnerships, and is leading the rollout of the new supplier shipping portal.",
  },
];

const SESSIONS: AgendaSession[] = [
  {
    id: "s1",
    title: "Registration & breakfast",
    time: "8:00 – 8:45 AM",
    location: "Main lobby",
    description: "Badge pickup, coffee, and networking before the day kicks off.",
    speakerIds: [],
  },
  {
    id: "s2",
    title: "Welcome & state of the business",
    time: "9:00 – 10:15 AM",
    location: "Main hall",
    description:
      "Leadership opens the summit with a look at where Etnyre stands today and what's ahead for our supplier partners.",
    speakerIds: ["jn", "ab"],
  },
  {
    id: "s3",
    title: "Supply chain roadmap keynote",
    time: "10:30 – 11:15 AM",
    location: "Main hall",
    live: true,
    description:
      "A deep dive into the 18-month supply chain roadmap, sourcing priorities, and how we're investing in our supplier network.",
    speakerIds: ["ab", "dk"],
  },
  {
    id: "s4",
    title: "Q&A with leadership",
    time: "11:15 AM – 12:00 PM",
    location: "Main hall",
    description: "Open floor — bring your questions on sourcing, quality, and the road ahead.",
    speakerIds: ["jn"],
  },
  {
    id: "s5",
    title: "Manufacturing & quality breakout",
    time: "1:00 – 1:45 PM",
    location: "Breakout room B",
    description:
      "A closer look at manufacturing standards, quality gates, and how suppliers can plug into our QA process.",
    speakerIds: ["ma"],
  },
  {
    id: "s6",
    title: "Logistics & fulfillment breakout",
    time: "2:00 – 2:45 PM",
    location: "Breakout room A",
    description:
      "Freight, fulfillment windows, and how we're streamlining logistics with our supplier partners.",
    speakerIds: ["tr"],
  },
];

export default function AgendaPage() {
  const { toast, showToast } = useToast();
  const defaultSession = SESSIONS.find((s) => s.live) ?? SESSIONS[0];
  const [selectedId, setSelectedId] = React.useState(defaultSession.id);
  const selected = SESSIONS.find((s) => s.id === selectedId) ?? SESSIONS[0];
  const speakersFor = (ids: string[]) => SPEAKERS.filter((sp) => ids.includes(sp.id));

  return (
    <div className="min-h-dvh bg-background">
      <TopNav
        activeKey="agenda"
        logo={<NavLogo />}
        initials="SC"
        onQrClick={() => showToast("Badge QR opened")}
        onProfile={() => showToast("Profile", "info")}
        onLogout={() => showToast("Signed out", "info")}
      />
      <PageContainer>
        <SectionHeader eyebrow="Today · July 15" title="Agenda" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <AgendaTimeline sessions={SESSIONS} selectedId={selectedId} onSelect={setSelectedId} />

            {/* Mobile-only quick strip — mirrors the wireframe's row of speaker
                avatars under the agenda list; jumps to the full directory. */}
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1 lg:hidden">
              {SPEAKERS.map((sp) => (
                <a
                  key={sp.id}
                  href="#all-speakers"
                  className="flex shrink-0 flex-col items-center gap-1"
                >
                  <Avatar sx={{ width: 46, height: 46, fontSize: 15 }}>{sp.initials}</Avatar>
                  <span className="max-w-[64px] truncate text-[11px] text-grey-600">
                    {sp.name.split(" ")[0]}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <SessionDetail session={selected} speakers={speakersFor(selected.speakerIds)} />
        </div>

        <SectionHeader eyebrow="Meet the lineup" title="All speakers" />
        <div id="all-speakers" className="scroll-mt-24 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SPEAKERS.map((sp) => (
            <SpeakerCard key={sp.id} {...sp} />
          ))}
        </div>
      </PageContainer>
      {toast}
    </div>
  );
}
