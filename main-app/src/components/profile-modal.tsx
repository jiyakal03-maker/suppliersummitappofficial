"use client";
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { ContactShareList, type ShareField } from "./qr";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  name: string;
  initials: string;
  company: string | null;
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * "My profile" dialog — real signed-in user's contact info, with the same
 * per-field share toggles as the style guide's "Contact sharing" section.
 * Toggle state is local/session-only (no share-preference column exists
 * on "user" yet), matching how the style guide's own reference treats it.
 */
export function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [fields, setFields] = React.useState<ShareField[]>([]);
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle");

  React.useEffect(() => {
    if (!open || profile) return;
    setStatus("loading");
    const supabase = createClient();

    (async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        setStatus("error");
        return;
      }

      const { data, error } = await supabase
        .from("user")
        .select("first_name, last_name, company, email, phone")
        .eq("user_id", authUser.id)
        .single();

      if (error || !data) {
        setStatus("error");
        return;
      }

      const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || "Attendee";
      setProfile({ name, initials: initialsOf(name), company: data.company });
      setFields([
        { id: "email", label: "Email", value: data.email ?? "Not set", shared: Boolean(data.email) },
        { id: "phone", label: "Phone", value: data.phone ?? "Not set", shared: Boolean(data.phone) },
        { id: "company", label: "Company", value: data.company ?? "Not set", shared: Boolean(data.company) },
      ]);
      setStatus("idle");
    })();
  }, [open, profile]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle className="flex items-center justify-between gap-2">
        My profile
        <IconButton aria-label="Close" onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {status === "loading" && (
          <p className="py-6 text-center text-sm text-grey-600">Loading…</p>
        )}
        {status === "error" && (
          <p className="py-6 text-center text-sm text-grey-600">Couldn&apos;t load your profile.</p>
        )}
        {status === "idle" && profile && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar sx={{ width: 56, height: 56, fontSize: 20 }}>{profile.initials}</Avatar>
              <div className="min-w-0">
                <p className="truncate text-[16px] font-bold text-ink">{profile.name}</p>
                {profile.company && <p className="truncate text-[13px] text-grey-600">{profile.company}</p>}
              </div>
            </div>
            <ContactShareList
              fields={fields}
              onToggle={(id, shared) =>
                setFields((fs) => fs.map((f) => (f.id === id ? { ...f, shared } : f)))
              }
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}

/** Owns the open/close state so pages only need `openProfile` + `{profileModal}`. */
export function useProfileModal() {
  const [open, setOpen] = React.useState(false);
  return {
    profileModal: <ProfileModal open={open} onClose={() => setOpen(false)} />,
    openProfile: () => setOpen(true),
  };
}
