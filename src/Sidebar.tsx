import React, { useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  Drawer,
  IconButton,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LockIcon from "@mui/icons-material/Lock";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddBoxIcon from "@mui/icons-material/AddBox";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";

interface SidebarProps {
  userName?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  currentPage?: string;
  open?: boolean;
  onClose?: () => void;
}

interface SidebarSettingsProps {
  collapsed: boolean;
  onNavigate?: (page: string) => void;
  onClose?: () => void;
}

const TRANSITION = "background-color 0.18s, color 0.18s";
const TEXT_TRANSITION = "opacity 0.18s ease, max-width 0.2s ease";
const NO_SHADOW = {
  boxShadow: "none",
  "&.Mui-focusVisible": { boxShadow: "none", outline: "none", backgroundColor: "transparent" },
  "&:active": { boxShadow: "none" },
} as const;

const labelSx = (collapsed: boolean) => ({
  opacity: collapsed ? 0 : 1,
  maxWidth: collapsed ? 0 : 160,
  overflow: "hidden",
  whiteSpace: "nowrap" as const,
  transition: TEXT_TRANSITION,
  pointerEvents: collapsed ? "none" as const : "auto" as const,
});

const SidebarSettings: React.FC<SidebarSettingsProps> = ({ collapsed, onNavigate, onClose }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          disableRipple
          onClick={() => setOpen((s) => !s)}
          sx={{
            ...NO_SHADOW,
            borderRadius: 1,
            py: "10px",
            px: "9px",
            color: "var(--text)",
            transition: TRANSITION,
            borderLeft: "3px solid transparent",
            justifyContent: collapsed ? "center" : "flex-start",
            "&:hover": { backgroundColor: "rgba(167,139,250,0.1)", color: "var(--accent)" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "inherit", justifyContent: "center" }}>
            <SettingsIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText
            primary={open ? "Settings ▾" : "Settings"}
            primaryTypographyProps={{ sx: { fontSize: 13, fontWeight: 700, color: "inherit", ...labelSx(collapsed) } }}
          />
        </ListItemButton>
      </ListItem>

      {open && !collapsed && (
        <List sx={{ pl: 3 }}>
          {[
            { label: "Add Item", icon: <AddBoxIcon sx={{ fontSize: 18 }} />, page: "additem" },
            { label: "Add User", icon: <PersonAddIcon sx={{ fontSize: 18 }} />, page: "adduser" },
            { label: "Edit Min Pickup Time", icon: <AccessTimeIcon sx={{ fontSize: 18 }} />, page: "editreturn" },
          ].map((sub) => (
            <ListItem key={sub.page} disablePadding>
              <ListItemButton
                disableRipple
                onClick={() => { onNavigate?.(sub.page); if (typeof window !== "undefined" && window.innerWidth < 960) onClose?.(); }}
                sx={{ ...NO_SHADOW, borderRadius: 1, py: "8px", px: "9px", color: "var(--text)", transition: TRANSITION, "&:hover": { backgroundColor: "rgba(167,139,250,0.1)", color: "var(--accent)" } }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{sub.icon}</ListItemIcon>
                <ListItemText primary={sub.label} primaryTypographyProps={{ sx: { fontSize: 13, fontWeight: 700 } }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  userName = "Admin",
  onNavigate,
  onLogout,
  currentPage = "",
  open = false,
  onClose,
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const isMobile = useMediaQuery("(max-width: 959.95px)");

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
    { id: "lockers", label: "Lockers", icon: LockIcon },
    { id: "inventory", label: "Inventory", icon: InventoryIcon },
    { id: "approvals", label: "Approvals", icon: CheckCircleIcon },
  ];

  // isCollapsed parameter lets the mobile Drawer always render fully expanded
  const buildContent = (isCollapsed: boolean) => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, backgroundColor: "var(--card-bg)", color: "var(--text)" }}>

      {/* User Profile Section */}
      <Box sx={{ pt: 3, pb: 2, px: 2, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 1.5, overflow: "hidden", position: "sticky", top: 0, zIndex: 2, backgroundColor: "var(--card-bg)", flexShrink: 0 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
          }}
        >
          {(userName || "A").charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ ...labelSx(isCollapsed), display: "flex", flexDirection: "column" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>
            {userName}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "var(--muted)", mt: 0.25, whiteSpace: "nowrap" }}>
            Administrator
          </Typography>
        </Box>
        {/* Mobile close button */}
        <IconButton
          onClick={() => onClose?.()}
          size="small"
          sx={{ display: { xs: "flex", md: "none" }, ml: "auto", color: "var(--muted)" }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flex: 1, padding: "12px 8px", overflow: "hidden", flexShrink: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                disableRipple
                onClick={() => {
                  onNavigate?.(item.id);
                  if (typeof window !== "undefined" && window.innerWidth < 960) onClose?.();
                }}
                sx={{
                  ...NO_SHADOW,
                  borderRadius: 1,
                  py: "10px",
                  px: "9px",
                  backgroundColor: isActive ? "rgba(167,139,250,0.15)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text)",
                  transition: TRANSITION,
                  borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  "&:hover": { backgroundColor: "rgba(167,139,250,0.1)", color: "var(--accent)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit", justifyContent: "center" }}>
                  <Icon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ sx: { fontSize: 13, fontWeight: 700, color: "inherit", ...labelSx(isCollapsed) } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "var(--border)" }} />

      {/* Settings + Logout */}
      <Box sx={{ padding: "12px 8px", overflow: "hidden" }}>
        <SidebarSettings collapsed={isCollapsed} onNavigate={onNavigate} onClose={onClose} />

        <ListItem disablePadding>
          <ListItemButton
            disableRipple
            onClick={() => { onLogout?.(); if (typeof window !== "undefined" && window.innerWidth < 960) onClose?.(); }}
            sx={{
              ...NO_SHADOW,
              borderRadius: 1,
              py: "10px",
              px: "9px",
              color: "var(--muted)",
              transition: TRANSITION,
              justifyContent: isCollapsed ? "center" : "flex-start",
              "&:hover": { backgroundColor: "rgba(255,107,107,0.1)", color: "#ff6b6b" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "inherit", justifyContent: "center" }}>
              <LogoutIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ sx: { fontSize: 13, fontWeight: 700, color: "inherit", ...labelSx(isCollapsed) } }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar — collapses to 72px, expands to 240px on hover */}
      <Box
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        sx={{
          display: { xs: "none", md: open ? "flex" : "none" },
          flexDirection: "column",
          width: collapsed ? 72 : 240,
          minWidth: collapsed ? 72 : 240,
          flexShrink: 0,
          height: "calc(100vh - 64px)",
          position: "sticky",
          top: 64,
          borderRight: "1px solid var(--border)",
          overflowY: "hidden",
          overflowX: "hidden",
          backgroundColor: "var(--card-bg)",
          zIndex: 100,
          transition: "width 0.22s ease, min-width 0.22s ease",
          mr: "10px",
        }}
      >
        {buildContent(collapsed)}
      </Box>

      {/* Mobile Drawer — always expanded (collapsed=false) so Settings sub-items are visible */}
      <Drawer
        anchor="left"
        open={isMobile && open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          zIndex: 1600,
          "& .MuiDrawer-paper": {
            width: 240,
            backgroundColor: "var(--card-bg)",
            color: "var(--text)",
          },
        }}
      >
        {buildContent(false)}
      </Drawer>
    </>
  );
};

export default Sidebar;
