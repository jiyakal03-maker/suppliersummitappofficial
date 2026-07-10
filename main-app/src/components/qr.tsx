"use client";
import * as React from "react";
import Switch from "@mui/material/Switch";

/**
 * Frame for the "Share my contact" QR. Renders whichever QR library the
 * project lands on (react-qr-code / qrcode.react) via `children`, keeping
 * this library dependency-free:
 *
 *   <QrBadge name="Sarah Chen" company="Hendrick Screen">
 *     <QRCode value={shareUrl} size={220} />
 *   </QrBadge>
 */
export function QrBadge({
  name,
  company,
  children,
}: {
  name: string;
  company?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-xs rounded-(--radius-card) border border-grey-200 bg-surface p-5 text-center">
      {/* Intentionally literal white in both modes: QR codes need a white
          quiet zone to scan reliably, especially on a dark screen. */}
      <div className="mx-auto flex aspect-square w-full items-center justify-center rounded-(--radius-control) bg-white p-2 outline-4 outline-yellow">
        {children}
      </div>
      <p className="mt-4 text-[15px] font-bold text-ink">{name}</p>
      {company && <p className="text-[13px] text-grey-600">{company}</p>}
      <p className="mt-2 text-xs text-grey-500">Have them scan this code to save your contact</p>
    </div>
  );
}

export interface ShareField {
  id: string;
  label: string;
  value: string;
  shared: boolean;
}

/** Per-field visibility toggles for contact sharing. */
export function ContactShareList({
  fields,
  onToggle,
}: {
  fields: ShareField[];
  onToggle: (id: string, shared: boolean) => void;
}) {
  return (
    <div className="overflow-hidden rounded-(--radius-card) border border-grey-200 bg-surface">
      {fields.map((f, i) => (
        <label
          key={f.id}
          className={`flex cursor-pointer items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-grey-100" : ""}`}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-ink">{f.label}</span>
            <span className="block truncate text-[13px] text-grey-600">{f.value}</span>
          </span>
          <Switch
            checked={f.shared}
            onChange={(e) => onToggle(f.id, e.target.checked)}
            slotProps={{ input: { "aria-label": `Share ${f.label}` } }}
          />
        </label>
      ))}
    </div>
  );
}
