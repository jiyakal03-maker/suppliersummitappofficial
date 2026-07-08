"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

/** Top bar: greeting on the left, QR badge + profile on the right. */
export function TopAppBar({
  name,
  company,
  initials,
  onQrClick,
  onProfile,
  onLogout,
}: {
  name: string;
  company?: string;
  initials: string;
  onQrClick?: () => void;
  onProfile?: () => void;
  onLogout?: () => void;
}) {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  return (
    <AppBar position="sticky">
      <Toolbar className="gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold leading-tight text-ink">Welcome, {name}</p>
          {company && <p className="truncate text-xs text-grey-600">{company}</p>}
        </div>
        <IconButton aria-label="My badge QR" onClick={onQrClick} className="bg-yellow text-on-yellow hover:bg-yellow-hover">
          <QrCode2Icon />
        </IconButton>
        <IconButton aria-label="Profile menu" onClick={(e) => setAnchor(e.currentTarget)}>
          <Avatar sx={{ width: 34, height: 34, fontSize: 14 }}>{initials}</Avatar>
        </IconButton>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <MenuItem
            onClick={() => {
              setAnchor(null);
              onProfile?.();
            }}
          >
            <ListItemIcon>
              <PersonRoundedIcon fontSize="small" />
            </ListItemIcon>
            My profile
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchor(null);
              onLogout?.();
            }}
          >
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export type SummitTab = "home" | "agenda" | "speakers" | "contacts";

/** Fixed bottom navigation for the four app sections. */
export function BottomNav({
  value,
  onChange,
}: {
  value: SummitTab;
  onChange: (tab: SummitTab) => void;
}) {
  return (
    <BottomNavigation
      showLabels
      value={value}
      onChange={(_, v: SummitTab) => onChange(v)}
      className="fixed inset-x-0 bottom-0 z-40"
      sx={{ pb: "env(safe-area-inset-bottom)", height: "auto", minHeight: 60 }}
    >
      <BottomNavigationAction label="Home" value="home" icon={<HomeRoundedIcon />} />
      <BottomNavigationAction label="Agenda" value="agenda" icon={<CalendarMonthRoundedIcon />} />
      <BottomNavigationAction label="Speakers" value="speakers" icon={<MicRoundedIcon />} />
      <BottomNavigationAction label="Contacts" value="contacts" icon={<PeopleAltRoundedIcon />} />
    </BottomNavigation>
  );
}
