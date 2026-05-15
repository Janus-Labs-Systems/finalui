import React, { useState } from "react";
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
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LockIcon from "@mui/icons-material/Lock";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";

interface SidebarProps {
  userName?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  currentPage?: string;
  open?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  userName = "Admin",
  onNavigate,
  onLogout,
  currentPage = "",
  open = false,
  onClose,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
    { id: "lockers", label: "Lockers", icon: LockIcon },
    { id: "items", label: "Items", icon: InventoryIcon },
    { id: "users", label: "Users", icon: PeopleIcon },
    { id: "approvals", label: "Approvals", icon: CheckCircleIcon },
    { id: "reports", label: "Reports", icon: BarChartIcon },
  ];

  const sidebarContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--card-bg)",
        color: "var(--text)",
      }}
    >
      {/* Sidebar Header */}
      <Box sx={{ padding: 2, borderBottom: "1px solid var(--border)", display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, position: 'relative' }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
           
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
         
          </Typography>
        </div>
        {/* overlay toggle present on desktop; header toggle removed to avoid duplicate icons */}
        {/* Mobile close button when sidebar rendered as a Drawer */}
        <IconButton
          onClick={() => onClose?.()}
          size="small"
          aria-label="Close sidebar"
          sx={{ position: 'absolute', top: 8, right: 8, display: { xs: 'block', md: 'none' }, color: 'var(--muted)' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ padding: 2, borderBottom: "1px solid var(--border)", display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            marginRight: collapsed ? 0 : 1,
          }}
        >
          {(userName || "A").charAt(0).toUpperCase()}
        </Avatar>
        {!collapsed && (
          <div>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
              {userName}
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: "var(--muted)",
                marginTop: 0.25,
              }}
            >
              Administrator
            </Typography>
          </div>
        )}
      </Box>

      {/* Navigation Items */}
          <List sx={{ flex: 1, padding: "12px 8px" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <ListItem key={item.id} disablePadding sx={{ marginBottom: 1 }}>
              <ListItemButton
                onClick={() => {
                  onNavigate?.(item.id);
                  if (typeof window !== "undefined" && window.innerWidth < 960) onClose?.();
                }}
                sx={{
                  borderRadius: 1,
                  padding: collapsed ? "8px 6px" : "10px 12px",
                  backgroundColor: isActive ? "rgba(167, 139, 250, 0.15)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(167, 139, 250, 0.1)",
                    color: "var(--accent)",
                  },
                  borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                  paddingLeft: isActive ? (collapsed ? "6px" : "9px") : (collapsed ? "6px" : "12px"),
                  justifyContent: collapsed ? "center" : "flex-start",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 40,
                    color: "inherit",
                    justifyContent: "center",
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    sx: {
                      fontSize: 13,
                      fontWeight: 500,
                      color: "inherit",
                      display: collapsed ? "none" : "block",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Divider */}
      <Divider sx={{ borderColor: "var(--border)" }} />

      {/* Settings and Logout */}
      <Box sx={{ padding: "12px 8px" }}>
          <ListItem disablePadding sx={{ marginBottom: 1 }}>
          <ListItemButton
            onClick={() => { if (typeof window !== "undefined" && window.innerWidth < 960) onClose?.(); }}
            sx={{
              borderRadius: 1,
              padding: collapsed ? "8px 6px" : "10px 12px",
              color: "var(--text)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(167, 139, 250, 0.1)",
                color: "var(--accent)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
              <SettingsIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Settings"
                primaryTypographyProps={{
                  sx: {
                    fontSize: 13,
                    fontWeight: 500,
                    color: "inherit",
                  },
                }}
              />
            )}
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => { onLogout?.(); if (typeof window !== "undefined" && window.innerWidth < 960) onClose?.(); }}
            sx={{
              borderRadius: 1,
              padding: collapsed ? "8px 6px" : "10px 12px",
              color: "var(--muted)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255, 107, 107, 0.1)",
                color: "#ff6b6b",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, color: "inherit", justifyContent: 'center' }}>
              <LogoutIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  sx: {
                    fontSize: 13,
                    fontWeight: 500,
                    color: "inherit",
                  },
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar (shows on md+ when `open` is true) */}
      <Box
        sx={{
          display: { xs: "none", md: open ? "block" : "none" },
          width: collapsed ? 72 : 240,
          height: "calc(100vh - 64px)",
          position: "sticky",
          top: 64,
          borderRight: "1px solid var(--border)",
          overflowY: "auto",
          backgroundColor: "var(--card-bg)",
          zIndex: 100,
        }}
      >
        <Box sx={{ position: "relative" }}>
          {sidebarContent}
          {/* Persistent toggle so collapsed sidebar can be expanded */}
          <IconButton
            onClick={() => setCollapsed((s) => !s)}
            size="small"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "var(--muted)",
              bgcolor: "transparent",
            }}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={open && typeof window !== "undefined" && window.innerWidth < 960}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          zIndex: 1600,
          "& .MuiDrawer-paper": {
            width: collapsed ? 72 : 240,
            marginTop: 0,
            backgroundColor: "var(--card-bg)",
            color: "var(--text)",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
