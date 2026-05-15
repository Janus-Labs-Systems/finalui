import React, { useEffect, useState, useRef } from "react";
import "./App.css";
// removed app logo import - header/logo removed
import MasterPage from "./MasterPage";
import CardTable from "./Message.tsx";
import Sidebar from "./Sidebar";
// Side panel removed — using full-width main content
import Notifications from "./notifications.tsx";
import { loginApi } from "./APIService"; // removed fetchRequestApprovals from here
import type { Locker } from "./Locker.tsx";
import {
  Card,
  IconButton,
  InputBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Typography,
  Popper,
  Paper,
  List,
  ListItem,
  Divider,
  Badge,
  Popover,
  Chip,
} from "@mui/material"; // removed table/dialog related imports
import SearchIcon from "@mui/icons-material/Search";
import ApprovalIcon from "@mui/icons-material/AssignmentTurnedIn";
import AddBoxIcon from "@mui/icons-material/AddBox";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import WarningIcon from "@mui/icons-material/Warning";
import LockIcon from "@mui/icons-material/Lock";
import InventoryIcon from "@mui/icons-material/Inventory";
import PersonIcon from "@mui/icons-material/Person";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddItemPage from "./AddItem_recovered";
import AddUserPage from "./AddUser.tsx";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ApprovalRequestsPage from "./ApprovalRequestsPage"; // use external page component
// use bell/notifications icon for alerts in the top bar
import { fetchAlertsFromApi, fetchNotificationsFromApi } from "./APIService";
import type { AlertRepo } from "./APIService";

interface Notification {
  locker_Id: number;
  impact: string;
  notifications: string;
}

// Add Item Page Component

interface LoginProps {
  onLogin: (token: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      const response = await loginApi(userId, password);
      console.log("Login handler received:", response);

      // If server returned 200 and token -> success
      if (response && response.status === 200 && response.token) {
        setError("");
        onLogin(response.token);
        sessionStorage.setItem("token", response.token);
        sessionStorage.setItem("userId", userId);
      } else if (response && response.status === 204) {
        // 204 means no content — surface a clearer message
        setError(
          "Login failed: server returned 204 No Content. Check server or credentials."
        );
      } else if (response && response.body && response.body.message) {
        setError(String(response.body.message));
      } else {
        setError(`Login failed (status ${response?.status || "unknown"}).`);
      }
    } catch (ex) {
      console.error("Login exception:", ex);
      setError("Login failed. Please try again.");
    }
  };
  return (
    <div className="login-page">
      <div className="login-inner">
        <div className="login-card-wrapper">
          <Card className="login-card" elevation={8}>
            <div className="login-brand">
              <Typography variant="h4" className="login-title">
                DEXBOX
              </Typography>
              <Typography variant="subtitle2" className="login-subtitle">
                Secure Locker Management
              </Typography>
            </div>

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <TextField
                label="User ID"
                variant="outlined"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                fullWidth
                required
                autoFocus
                className="login-field"
                InputProps={{ sx: { borderRadius: 1 } }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                className="login-field"
                InputLabelProps={{ shrink: true }}
              />

              {error && (
                <Typography color="error" sx={{ mt: 0.5, mb: 1 }}>
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                className="login-submit"
              >
                Sign in
              </Button>
            </form>

            <div className="login-footnote">
              <Typography variant="caption">
                Need an account? Contact your admin.
              </Typography>
            </div>
          </Card>
        </div>

        <div className="login-side-card-wrapper" aria-hidden="true">
          <Card className="login-side-card" elevation={6}>
            <div className="side-card-content">
              <svg
                viewBox="0 0 800 200"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="g2" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="var(--accent)">
                      <animate
                        attributeName="stop-color"
                        dur="6s"
                        repeatCount="indefinite"
                        values="var(--accent);var(--accent-2);var(--accent);var(--accent)"
                      />
                    </stop>
                    <stop offset="100%" stopColor="var(--accent-2)">
                      <animate
                        attributeName="stop-color"
                        dur="6s"
                        repeatCount="indefinite"
                        values="var(--accent-2);var(--accent);var(--accent-2);var(--accent-2)"
                      />
                    </stop>
                  </linearGradient>
                </defs>
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Open Sans', Inter, Roboto, Arial, sans-serif"
                  fontWeight="900"
                  fontSize="86"
                  fill="url(#g2)"
                  style={{ letterSpacing: "-1px" }}
                >
                  live<tspan fill="var(--topbar-dexbox)">JANUS</tspan>
                </text>
              </svg>
              <div className="side-card-sub">Powered by JANUS Labs</div>
            </div>
          </Card>
        </div>
      </div>

      {/* login page footer (visible on login screen) */}
      <footer className="login-page-footer" aria-hidden="false">
        <small>
          © 2025 DexBoxZ ADV. All rights reserved. | Legal Disclaimer: This is
          dummy legal information for demonstration purposes only.
        </small>
      </footer>
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);

  // Search bar state and logic
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showApprovalPage, setShowApprovalPage] = useState(false);
  const [showAddItemPage, setShowAddItemPage] = useState(false);
  const [showAddUserPage, setShowAddUserPage] = useState(false);
  const [showEditReturnTime, setShowEditReturnTime] = useState(false);
  const [minReturnTimeValue, setMinReturnTimeValue] = useState("");
  const [minReturnTimeError, setMinReturnTimeError] = useState<string | null>(
    null
  );
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElAlerts, setAnchorElAlerts] = useState<null | HTMLElement>(
    null
  );
  const alertsButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [alertsApi, setAlertsApi] = useState<AlertRepo[]>([]);
  const [alertsLoaded, setAlertsLoaded] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifAnchorEl, setNotifAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 960; // open by default on desktop
  });
  const approvalBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const addItemBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const addUserBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const editReturnBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const searchBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchAnchor, setSearchAnchor] = useState<HTMLElement | null>(null);
  const searchOpen = Boolean(searchAnchor);

  // display only first 5 characters of username in the dashboard title
  const displayUserName = (userName || "User").slice(0, 5);
  const prevStateRef = React.useRef({ approval: false, additem: false, adduser: false, editreturn: false });

  // Handle browser back/forward navigation for approval/add pages and keep history entries
  React.useEffect(() => {
    // set an initial replaceState representing the main page
    window.history.replaceState(
      { approval: false, additem: false, adduser: false, editreturn: false },
      ""
    );

    const handlePopState = (ev: PopStateEvent) => {
      const state = (ev.state as any) || {};
      setShowApprovalPage(Boolean(state.approval));
      setShowAddItemPage(Boolean(state.additem));
      setShowAddUserPage(Boolean(state.adduser));
      setShowEditReturnTime(Boolean(state.editreturn));
      prevStateRef.current = state;
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Push history entries when navigating into sub-pages so Back returns to main
  React.useEffect(() => {
    const currentState = {
      approval: showApprovalPage,
      additem: showAddItemPage,
      adduser: showAddUserPage,
      editreturn: showEditReturnTime,
    };
    
    // Check if we're transitioning from a different state
    const prevState = prevStateRef.current;
    const isTransitioning = 
      (currentState.approval !== prevState.approval) ||
      (currentState.additem !== prevState.additem) ||
      (currentState.adduser !== prevState.adduser) ||
      (currentState.editreturn !== prevState.editreturn);
    
    if (isTransitioning) {
      const isAnyPageOpen = currentState.approval || currentState.additem || currentState.adduser || currentState.editreturn;
      const wasAnyPageOpen = prevState.approval || prevState.additem || prevState.adduser || prevState.editreturn;
      
      if (isAnyPageOpen && !wasAnyPageOpen) {
        // Transitioning from main to sub-page: push new history entry
        window.history.pushState(currentState, "");
      } else if (isAnyPageOpen && wasAnyPageOpen) {
        // Switching between sub-pages: replace history entry
        window.history.replaceState(currentState, "");
      } else if (!isAnyPageOpen && wasAnyPageOpen) {
        // Closing sub-page and going back to main: push back to main
        window.history.pushState(currentState, "");
      }
      
      prevStateRef.current = currentState;
    }
  }, [showApprovalPage, showAddItemPage, showAddUserPage, showEditReturnTime]);

  // Persist session across reloads if token exists in sessionStorage
  React.useEffect(() => {
    const existing = sessionStorage.getItem("token");
    if (existing) {
      setToken(existing);
      setLoggedIn(true);
    }
  }, []);

  // Load existing min return time into state
  React.useEffect(() => {
    const existing = sessionStorage.getItem("minReturnTime");
    if (existing) setMinReturnTimeValue(existing);
  }, []);

  // Keep userName in state from sessionStorage
  React.useEffect(() => {
    const u = sessionStorage.getItem("userId");
    if (u) setUserName(u);
  }, [token, loggedIn]);

  // Focus the search input when it's shown
  useEffect(() => {
    if (showSearch) {
      // wait for render
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [showSearch]);

  // Fetch alerts from backend once the user is logged in
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        console.debug(
          "alerts: load() starting - will call fetchAlertsFromApi",
          {
            token,
            sessionToken: sessionStorage.getItem("token"),
            alertsLoaded,
          }
        );
        console.log("alerts: calling fetchAlertsFromApi()");
        const a = await fetchAlertsFromApi();
        console.debug("alerts: fetchAlertsFromApi() returned", {
          length: a.length,
        });
        if (!mounted) return;
        setAlertsApi(a);
      } catch (err) {
        console.error("Failed to load alerts:", err);
      } finally {
        if (mounted) setAlertsLoaded(true);
      }
    };
    // Be resilient: prefer explicit token state but fall back to sessionStorage
    const sessionToken = sessionStorage.getItem("token");
    if ((token || sessionToken) && !alertsLoaded) {
      console.debug("alerts: triggering load() - token present", {
        token,
        sessionToken,
        alertsLoaded,
      });
      load();
    } else {
      console.debug("alerts: not triggering load()", {
        token,
        sessionToken,
        alertsLoaded,
      });
    }
    return () => {
      mounted = false;
    };
  }, [token, alertsLoaded]);

  // Fetch notifications from API on mount and when logged in
  React.useEffect(() => {
    if (!token && !sessionStorage.getItem("token")) return;
    
    fetchNotificationsFromApi()
      .then((data) => {
        setNotifications(data);
      })
      .catch((e) => console.error("Error fetching notifications:", e));
  }, [token]);

  const handleLogin = (token: string) => {
    setToken(token);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setToken(null);
    setLoggedIn(false);
    setShowSearch(false);//change by sumit, default was false
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
  };

  // quick route: if pathname is /master/MADV{id} show MasterPage
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  if (loggedIn && pathname.startsWith("/master/")) {
    // pass token if needed; allow MasterPage to use history back
    return <MasterPage token={token ?? undefined} />;
  }

  if (!loggedIn || !token) {
    return <Login onLogin={handleLogin} />;
  }

  const toggleSearchPopper = (e: React.MouseEvent<HTMLElement>) => {
    setSearchAnchor((prev) => (prev ? null : (e.currentTarget as HTMLElement)));
  };
  const closeSearchPopper = () => {
    setSearchAnchor(null);
    setSearchQuery("");
  };

  return (
    <>
      {/* TopBar with fixed position */}
      <div className="TopBar">
        <div className="topbar-left">
          <IconButton
            size="small"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle sidebar"
            sx={{ marginRight: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <span className="brand">
            Client<span className="topbar-janus">Name</span>
          </span>
        </div>
        <div className="topbar-center">
          <Typography
            variant="h6"
            className="topbar-title"
            sx={{ fontFamily: 'Inter, Roboto, "Segoe UI", Arial, sans-serif' }}
          >
            dexbox<span className="topbar-plus">+</span>
          </Typography>
        </div>
        <div className="topbar-right">
          <Tooltip title="Alerts">
            <IconButton
              size="small"
              onClick={(e) => setAnchorElAlerts(e.currentTarget)}
            >
              <Badge badgeContent={alertsApi.length} color="error">
                <WarningIcon sx={{ fontSize: 26 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton
              size="small"
              onClick={(e) => setNotifAnchorEl(e.currentTarget as HTMLButtonElement)}
            >
              <Badge badgeContent={notifications.length} color="info">
                <NotificationsIcon sx={{ fontSize: 26 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Alerts Popover */}
          <Popover
            open={Boolean(anchorElAlerts)}
            anchorEl={anchorElAlerts}
            onClose={() => setAnchorElAlerts(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <div style={{ width: 420, maxHeight: 500, overflowY: "auto", padding: 16 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
                Alerts ({alertsApi.length})
              </Typography>
              {alertsApi.length === 0 ? (
                <Typography sx={{ color: "var(--muted)" }}>No alerts</Typography>
              ) : (
                <List sx={{ padding: 0 }}>
                  {alertsApi.map((alert, idx) => (
                    <Card
                      key={idx}
                      sx={{
                        marginBottom: 1,
                        padding: 2,
                        borderRadius: 1,
                        backgroundColor: alert.Severity === "Critical" || alert.Severity === "High" ? "rgba(255, 82, 82, 0.08)" : "rgba(255, 176, 32, 0.08)",
                        borderLeft: `4px solid ${alert.Severity === "Critical" || alert.Severity === "High" ? "#ff5252" : "#ffb020"}`,
                        opacity: alert.IsResolved ? 0.6 : 1,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, marginBottom: 0.5 }}>
                            {alert.Name || `Product ID: ${alert.qtId}`}
                          </Typography>
                          <Chip
                            label={alert.Severity}
                            size="small"
                            sx={{
                              backgroundColor: alert.Severity === "Critical" || alert.Severity === "High" ? "#ff5252" : "#ffb020",
                              color: "#fff",
                              marginBottom: 1,
                              marginRight: 1,
                            }}
                          />
                          {alert.IsResolved && (
                            <Chip
                              label="Resolved"
                              size="small"
                              sx={{
                                backgroundColor: "#4caf50",
                                color: "#fff",
                                marginBottom: 1,
                                marginRight: 1,
                              }}
                            />
                          )}
                          <Typography variant="body2" sx={{ color: "var(--text)", marginTop: 0.5 }}>
                            {alert.AlertDescription}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "var(--muted)", marginTop: 0.5, display: "block" }}>
                            Serial: {alert.SerialNumber || "N/A"}
                          </Typography>
                        </div>
                      </div>
                    </Card>
                  ))}
                </List>
              )}
            </div>
          </Popover>

          {/* Notifications Popover */}
          <Popover
            open={Boolean(notifAnchorEl)}
            anchorEl={notifAnchorEl}
            onClose={() => setNotifAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <div style={{ width: 400, maxHeight: 500, overflowY: "auto", padding: 16 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
                Notifications ({notifications.length})
              </Typography>
              {notifications.length === 0 ? (
                <Typography sx={{ color: "var(--muted)" }}>No notifications</Typography>
              ) : (
                <List sx={{ padding: 0 }}>
                  {notifications.map((notif, idx) => (
                    <Card
                      key={idx}
                      sx={{
                        marginBottom: 1,
                        padding: 2,
                        borderRadius: 1,
                        backgroundColor: notif.impact === "Critical" ? "rgba(255, 82, 82, 0.08)" : "rgba(0, 188, 212, 0.08)",
                        borderLeft: `4px solid ${notif.impact === "Critical" ? "#ff5252" : "#00bcd4"}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, marginBottom: 0.5 }}>
                            Locker {notif.locker_Id}
                          </Typography>
                          <Chip
                            label={notif.impact}
                            size="small"
                            sx={{
                              backgroundColor: notif.impact === "Critical" ? "#ff5252" : "#ffb020",
                              color: "#fff",
                              marginBottom: 1,
                              marginRight: 1,
                            }}
                          />
                          <Typography variant="body2" sx={{ color: "var(--text)" }}>
                            {notif.notifications}
                          </Typography>
                        </div>
                      </div>
                    </Card>
                  ))}
                </List>
              )}
            </div>
          </Popover>

          <Tooltip title={userName || "Account"}>
            <IconButton
              size="small"
              onClick={(e) => setAnchorElUser(e.currentTarget)}
              aria-controls={anchorElUser ? "user-menu" : undefined}
              aria-haspopup="true"
            >
              <Avatar sx={{ width: 36, height: 36 }}>
                {(userName || "U").charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            id="user-menu"
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={() => setAnchorElUser(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            disableScrollLock={true}
          >
            <MenuItem disabled>
              <Typography variant="subtitle2">{userName || "User"}</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorElUser(null);
                handleLogout();
              }}
            >
              Sign out
            </MenuItem>
          </Menu>
        </div>
      </div>

      {/* Layout container with sidebar and main content */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {/* Sidebar */}
        <Sidebar
          userName={userName}
          onNavigate={(page) => { setCurrentPage(page); setSidebarOpen(false); }}
          onLogout={handleLogout}
          currentPage={currentPage}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <div
          className="main-column"
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            alignItems: "stretch",
            width: "100%",
            maxWidth: "100%",
            overflowY: "auto",
          }}
        >
        {/* If one of the sub-pages is open, render it as a dedicated page inside
            the main content area (TopBar and Side remain visible). Otherwise
            render the dashboard content as before. */}
        {showApprovalPage || showAddItemPage || showAddUserPage ? (
          <div className="page-shell page-hero bg-soft-pattern"
            style={{
              width: "100%",
              maxWidth: "100%",
              margin: "20px auto",
              padding: 12,
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                paddingBottom: 12,
                marginBottom: 8,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setShowApprovalPage(false);
                  setShowAddItemPage(false);
                  setShowAddUserPage(false);
                }}
                sx={{
                  textTransform: "none",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              >
                Back
              </Button>
              <div style={{ flex: 1 }} />
            </div>
            {showApprovalPage && <ApprovalRequestsPage />}
            {showAddItemPage && <AddItemPage />}
            {showAddUserPage && (
              <AddUserPage onDone={() => setShowAddUserPage(false)} />
            )}
          </div>
        ) : (
          <>
            {/* Dashboard title placed under TopBar; styled in App.css */}
            <h1 className="dashboard-title" aria-hidden={false}>
              <span className="dashboard-username" >
                {displayUserName + "'s"}
              </span>
              {/* <span className="dashboard-label" >Dashboard</span> */}
            </h1>
            {/* App header/logo removed per recent change request */}
            <div
              className="search-logo"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                className="dt-searchbar-x"
                style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
              >
                <Button
                  size="small"
                  startIcon={<ApprovalIcon sx={{ fontSize: 20 }} />}
                  onClick={() => setShowApprovalPage(true)}
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                    fontWeight: 600,
                  }}
                  ref={approvalBtnRef}
                >
                  Request for Approval
                </Button>

                <Button
                  size="small"
                  startIcon={<AddBoxIcon sx={{ fontSize: 20 }} />}
                  onClick={() => setShowAddItemPage(true)}
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                    fontWeight: 500,
                  }}
                  ref={addItemBtnRef}
                >
                  Add Item
                </Button>

                <Button
                  size="small"
                  startIcon={
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ color: "currentColor" }}
                    >
                      <path d="M15 14c2.761 0 5 2.239 5 5v1H4v-1c0-2.761 2.239-5 5-5h6z" />
                      <circle cx="9" cy="8" r="4" />
                      <path d="M21 8v2h-2v2h-2v-2h-2V8h2V6h2v2h2z" />
                    </svg>
                  }
                  onClick={() => setShowAddUserPage(true)}
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                    fontWeight: 500,
                  }}
                  ref={addUserBtnRef}
                >
                  Add User
                </Button>

                <Button
                  size="small"
                  startIcon={<AccessTimeIcon sx={{ fontSize: 20 }} />}
                  onClick={() => setShowEditReturnTime(true)}
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                    fontWeight: 500,
                  }}
                  ref={editReturnBtnRef}
                >
                  Edit Min Return Time
                </Button>

                <Button
                  size="small"
                  startIcon={<SearchIcon sx={{ fontSize: 20 }} />}
                  onClick={toggleSearchPopper}
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                    fontWeight: 500,
                  }}
                  ref={searchBtnRef}
                >
                  Search
                </Button>

                <Popper
                  open={searchOpen}
                  anchorEl={searchAnchor}
                  placement="bottom-start"
                  modifiers={[
                    { name: "offset", options: { offset: [0, 8] } },
                    { name: "preventOverflow", options: { boundary: "viewport", padding: 8 } },
                    { name: "flip", options: { fallbackPlacements: ["bottom", "top"] } }
                  ]}
                >
                  <Paper className="search-popper" elevation={4} sx={{ p: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", padding: 8 }}>
                      <InputBase
                        placeholder="Search lockers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        inputRef={searchInputRef}
                        autoFocus
                        inputProps={{ "aria-label": "search-lockers" }}
                        sx={{ flex: 1, px: 1 }}
                      />
                      <Button size="small" onClick={closeSearchPopper}>Close</Button>
                    </div>
                    <Divider />
                    <List dense sx={{ maxHeight: 280, overflow: "auto", minWidth: 240 }}>
                      {searchQuery ? (
                        // TODO: replace suggestions array with real search results, e.g. filtered lockers/products
                        ["Search result 1", "Search result 2", "Search result 3"].map((s) => (
                          <ListItem button key={s} onClick={() => { setSearchQuery(s); closeSearchPopper(); }}>
                            {s}
                          </ListItem>
                        ))
                      ) : null}
                    </List>
                  </Paper>
                </Popper>
              </div>
            </div>
            {/* user menu moved to TopBar */}
            {/* <div className="sm-card">
              <Notifications token={token} />
            </div> */}

            <div className="overview-grid">
              <div className="overview-card">
                <div className="overview-card-top">
                  <div>
                    <div className="overview-label">Total Lockers</div>
                    <div className="overview-value">10</div>
                    <div className="overview-sub">Across all locations</div>
                  </div>
                  <div className="overview-icon-wrapper">
                    <LockIcon fontSize="small" />
                  </div>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-card-top">
                  <div>
                    <div className="overview-label">Total Items</div>
                    <div className="overview-value">36</div>
                    <div className="overview-sub">Stored in lockers</div>
                  </div>
                  <div className="overview-icon-wrapper">
                    <InventoryIcon fontSize="small" />
                  </div>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-card-top">
                  <div>
                    <div className="overview-label">Active Users</div>
                    <div className="overview-value">8</div>
                    <div className="overview-sub">System users</div>
                  </div>
                  <div className="overview-icon-wrapper">
                    <PersonIcon fontSize="small" />
                  </div>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-card-top">
                  <div>
                    <div className="overview-label">Pending Approvals</div>
                    <div className="overview-value">7</div>
                    <div className="overview-sub">Awaiting review</div>
                  </div>
                  <div className="overview-icon-wrapper">
                    <HourglassBottomIcon fontSize="small" />
                  </div>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-card-top">
                  <div>
                    <div className="overview-label">Total Locations</div>
                    <div className="overview-value">3</div>
                    <div className="overview-sub">Different locations</div>
                  </div>
                  <div className="overview-icon-wrapper">
                    <LocationOnIcon fontSize="small" />
                  </div>
                </div>
              </div>
            </div>

            <div className="Table-class" style={{ width: "100%", maxWidth: "100%", margin: "0 auto", boxSizing: "border-box", padding: "0 12px" }}>
              <CardTable
                onLockerSelect={setSelectedLocker}
                searchQuery={searchQuery}
                token={token}
              />
            </div>
          </>
        )}

        {/* Dialog for editing minimum product return time */}
        <Dialog
          open={showEditReturnTime}
          onClose={() => setShowEditReturnTime(false)}
          fullWidth
          maxWidth="sm"
          /* Raise z-index above the TopBar and allow visible overflow so the title
             or labels aren't unexpectedly clipped. Keep minWidth/padding for size. */
          PaperProps={{
            sx: {
              minWidth: 520,
              padding: 2,
              zIndex: 2000,
              overflow: "visible",
            },
          }}
        >
          <DialogTitle sx={{ pt: 1 }}>
            Edit Minimum Product Return Time
          </DialogTitle>
          <DialogContent sx={{ pt: 1, overflow: "visible" }}>
            <TextField
              label="Minimum return time (e.g. 48h or 2d)"
              value={minReturnTimeValue}
              onChange={(e) => setMinReturnTimeValue(e.target.value)}
              fullWidth
              error={!!minReturnTimeError}
              helperText={
                minReturnTimeError ||
                "Enter number with unit d/h, e.g. 48h or 2d"
              }
              /* Keep the label shrunk when the field is focused/filled so it
                 cannot overlap or clip the dialog title in some layouts. */
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 0 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditReturnTime(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                const v = minReturnTimeValue.trim().toLowerCase();
                if (!/^\d+\s*(d|h)?$/.test(v)) {
                  setMinReturnTimeError("Enter value like 48h or 2d");
                  return;
                }
                sessionStorage.setItem("minReturnTime", v);
                setMinReturnTimeError(null);
                setShowEditReturnTime(false);
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <footer
          style={{
            marginTop: "fit-content",
            padding: "00px",
            background: "var(--footer-bg)",
            textAlign: "left",
            position: "fixed",
            bottom: "0",
            width: "100%",
            color: "var(--footer-text, #222)",
          }}
        >
          <small>
            © 2025 DexBoxZ ADV. All rights reserved. | Legal Disclaimer: This is
            dummy legal information for demonstration purposes only.
          </small>
        </footer>
        </div>
      </div>
    </>
  );
}

export default App;
