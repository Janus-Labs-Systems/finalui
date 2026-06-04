import React, { useEffect, useState, useRef } from "react";
import "./App.css";
// removed app logo import - header/logo removed
import MasterPage from "./MasterPage";
import CardTable from "./Message.tsx";
import Sidebar from "./Sidebar";
import LockersPage from "./LockersPage";
// Side panel removed — using full-width main content
import Notifications from "./notifications.tsx";
import { loginApi, fetchRequestApprovals, fetchLoadData, fetchCatalogue, fetchAppUsers, fetchInventory, type InventoryItem } from "./APIService";
import type { Locker } from "./Locker.tsx";
import {
  Box,
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
  Fade,
  Switch,
  FormControlLabel,
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
import InventoryPage from "./InventoryPage";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ApprovalRequestsPage from "./ApprovalRequestsPage";
import ProfilePage from "./ProfilePage";
// use bell/notifications icon for alerts in the top bar
import { fetchAlertsFromApi, fetchNotificationsFromApi } from "./APIService";
import type { AlertRepo } from "./APIService";
import type { Request } from "./ApprovalRequestsPage";

interface Notification {
  locker_Id: number;
  impact: string;
  notifications: string;
}

// Add Item Page Component

interface LoginProps {
  onLogin: (token: string) => void;
  onLoginSuccess?: (userId: string) => void;
}

function Login({ onLogin, onLoginSuccess }: LoginProps) {
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
        // Call onLoginSuccess callback to trigger API calls
        if (onLoginSuccess) {
          onLoginSuccess(userId);
        }
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
          <Card className="login-card" elevation={0} sx={{ background: "transparent", boxShadow: "none", border: "none" }}>
            <div className="login-brand">
              <Typography variant="h4" className="login-title">
                 
              </Typography>
              <Typography variant="subtitle2" className="login-subtitle">
                
              </Typography>
            </div>

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <div className="login-field-group">
                <label className="login-label">User ID <span className="login-required">*</span></label>
                <TextField
                  variant="outlined"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  fullWidth
                  required
                  autoFocus
                  placeholder="Enter your User ID"
                  className="login-field"
                  InputProps={{ sx: { borderRadius: 1 } }}
                />
              </div>

              <div className="login-field-group">
                <label className="login-label">Password <span className="login-required">*</span></label>
                <TextField
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                  placeholder="Enter your password"
                  className="login-field"
                />
              </div>

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
          <Card className="login-side-card" elevation={6} sx={{ backgroundColor: "#000000 !important", background: "#000000 !important", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img
              src="/DexboxHomePageLogo1.png"
              alt="DEXBOX"
              style={{ width: "100%", height: "auto", display: "block", objectFit: "contain", mixBlendMode: "lighten" }}
            />
          </Card>
        </div>
      </div>


    </div>
  );
}

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [displayUserName, setDisplayUserName] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 960 : false
  );
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  // Tracks whether we're rendering the MasterPage detail view.
  // Using state (not just URL) guarantees a re-render when exiting, even when
  // all other state is already at its target values (fresh reload scenario).
  const [masterModeActive, setMasterModeActive] = useState(
    () => typeof window !== "undefined" && window.location.pathname.startsWith("/master/")
  );
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("dexbox-dark-mode") : null;
    return saved === null ? true : saved !== "false";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
    }
    try { localStorage.setItem("dexbox-dark-mode", String(darkMode)); } catch {}
  }, [darkMode]);

  // Search bar state and logic
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showApprovalPage, setShowApprovalPage] = useState(false);
  const [approvalPageInitialFilter, setApprovalPageInitialFilter] = useState<string>("All");
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [showAddItemPage, setShowAddItemPage] = useState(false);
  const [showAddUserPage, setShowAddUserPage] = useState(false);
  const [showEditReturnTime, setShowEditReturnTime] = useState(false);
  const [showLockersPage, setShowLockersPage] = useState(false);
  const [showInventoryPage, setShowInventoryPage] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);

  // Pre-fetched data state - populated on login to avoid re-fetching
  const [prefetchedApprovals, setPrefetchedApprovals] = useState<Request[]>([]);
  const [prefetchedInventory, setPrefetchedInventory] = useState<InventoryItem[]>([]);
  const [previousMainPage, setPreviousMainPage] = useState<"dashboard" | "lockers">("dashboard");

  // Universal search data
  const [searchInventoryData, setSearchInventoryData] = useState<InventoryItem[]>([]);
  const [searchLockerData, setSearchLockerData] = useState<any[]>([]);
  const [lockerSearchTerm, setLockerSearchTerm] = useState("");
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");

  // Dashboard statistics
  const [totalLockers, setTotalLockers] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [totalLocations, setTotalLocations] = useState<number>(0);
  const [lockerRawData, setLockerRawData] = useState<any[]>([]);
  const [showLockerBreakdown, setShowLockerBreakdown] = useState(false);
  const [minReturnTimeValue, setMinReturnTimeValue] = useState("");
  const [minReturnTimeError, setMinReturnTimeError] = useState<string | null>(
    null
  );
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const [notificationsExpanded, setNotificationsExpanded] = useState(true);
  const [readAlerts, setReadAlerts] = useState<Set<number>>(new Set());
  const [readNotifications, setReadNotifications] = useState<Set<number>>(new Set());
  const markAlertRead = (idx: number) => setReadAlerts(prev => new Set(prev).add(idx));
  const markAllAlertsRead = () => setReadAlerts(new Set(alertsApi.map((_, i) => i)));
  const markNotifRead = (idx: number) => setReadNotifications(prev => new Set(prev).add(idx));
  const markAllNotifsRead = () => setReadNotifications(new Set(notifications.map((_, i) => i)));
  const [anchorElAlerts, setAnchorElAlerts] = useState<null | HTMLElement>(
    null
  );
  const alertsButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [alertsApi, setAlertsApi] = useState<AlertRepo[]>([]);
  const [alertsLoaded, setAlertsLoaded] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const approvalBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const addItemBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const addUserBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const editReturnBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const searchBtnRef = React.useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchAnchor, setSearchAnchor] = useState<HTMLElement | null>(null);
  const searchOpen = Boolean(searchAnchor);

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
      // Also restore userId from sessionStorage if available
      const userId = sessionStorage.getItem("userId");
      if (userId) {
        setUserName(userId);
        // Fetch pending approvals count when session is restored
        handleLoginSuccess(userId);
      }
    }
  }, []);

  // Load existing min return time into state
  React.useEffect(() => {
    const existing = sessionStorage.getItem("minReturnTime");
    if (existing) setMinReturnTimeValue(existing);
  }, []);

  // Load pending approvals count when approval page toggles (for refresh)
  React.useEffect(() => {
    if (!token || !showApprovalPage) return;
    const uid = sessionStorage.getItem("userId") || "";
    if (!uid) return;
    let mounted = true;
    (async () => {
      try {
        const arr = await fetchRequestApprovals(uid);
        // Filter to only count items with status equal to "pending"
        const pendingItems = Array.isArray(arr) ? arr.filter((item: any) => {
          const status = item.status || item.Status || "";
          return status.toLowerCase() === "pending";
        }) : [];
        if (mounted) setPendingApprovalsCount(pendingItems.length);
      } catch (err) {
        if (mounted) setPendingApprovalsCount(0);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [showApprovalPage]);

  // Fetch dashboard statistics
  React.useEffect(() => {
    if (!token) return;
    let mounted = true;
    (async () => {
      try {
        console.log("Fetching dashboard statistics...");
        // Fetch live data for lockers and catalogue for items
        const [liveData, catalogue, users, inventoryItems] = await Promise.all([
          fetchLoadData(),
          fetchCatalogue(),
          fetchAppUsers(),
          fetchInventory(),
        ]);

        if (mounted) {
          // Store for universal search
          setSearchInventoryData(Array.isArray(inventoryItems) ? inventoryItems : []);
          setSearchLockerData(Array.isArray(liveData) ? liveData : []);

          // Count total lockers from live data
          const lockers = Array.isArray(liveData) ? liveData : [];
          console.log("Total lockers:", lockers.length);
          setTotalLockers(lockers.length);
          setLockerRawData(lockers);

          // Count total items from catalogue
          const cat = Array.isArray(catalogue) ? catalogue : [];
          console.log("Total items:", cat.length);
          setTotalItems(cat.length);

          // Count active users
          const userList = Array.isArray(users) ? users : [];
          console.log("Active users:", userList.length);
          setActiveUsers(userList.length);

          // Count unique locations from live data
          const locations = new Set<string>();
          lockers.forEach((locker: any) => {
            const loc = locker.location || locker.Location || "INOXPA, Pune";
            locations.add(loc);
          });
          console.log("Total locations:", locations.size);
          setTotalLocations(locations.size);
        }
      } catch (err) {
        console.error("Error fetching dashboard statistics:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

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

  const handleLoginSuccess = async (userId: string) => {
    // Fetch pending approvals count immediately after login
    try {
      const arr = await fetchRequestApprovals(userId);
      console.log("Pending approvals API response:", arr);
      // Filter to only count items with status equal to "pending"
      const pendingItems = Array.isArray(arr) ? arr.filter((item: any) => {
        const status = item.status || item.Status || "";
        return status.toLowerCase() === "pending";
      }) : [];
      const count = pendingItems.length;
      console.log("Pending approvals count (filtered):", count);
      setPendingApprovalsCount(count);
    } catch (err) {
      console.error("Error fetching pending approvals:", err);
      setPendingApprovalsCount(0);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setLoggedIn(false);
    setShowSearch(false);//change by sumit, default was false
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
  };

  // quick route handling: detect master page path but render inside main layout
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isMaster = loggedIn && masterModeActive;
  const masterId = isMaster ? (pathname.split("/").pop() || "") : "";

  if (!loggedIn || !token) {
    return <Login onLogin={handleLogin} onLoginSuccess={handleLoginSuccess} />;
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
          {/* Hamburger — visible only on mobile to open the sidebar drawer */}
          <IconButton
            className="topbar-menu-btn"
            size="small"
            onClick={() => setSidebarOpen(prev => !prev)}
            sx={{ display: { xs: "flex", md: "none" }, color: "#fff", mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>
          <img
            src="/DexboxHomePageLogo2.png"
            alt="Dexbox"
            style={{ height: 54, width: "auto", display: "inherit", objectFit: "fill" }}
          />
        </div>
        <div className="topbar-center">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1 }}>
            <Typography
              variant="h6"
              className="topbar-title"
              sx={{ fontFamily: 'Inter, Roboto, "Segoe UI", Arial, sans-serif', lineHeight: 1.1, mb: 0 }}
            >
              {/* dexbox<span className="topbar-plus">+</span> */}
            </Typography>
            {/* <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.68rem", letterSpacing: "0.05em", lineHeight: 1 }}
            >
              {currentPage === "dashboard" ? `${displayUserName}Admin's Dashboard`
                : currentPage === "lockers" ? "DexBox LIVE Lockers"
                : currentPage === "inventory" ? "Inventory"
                : currentPage === "approvals" ? "Approval Requests"
                : currentPage === "additem" ? "Add Item"
                : currentPage === "adduser" ? "Add User"
                : currentPage === "profile" ? "Profile"
                : ""}
            </Typography> */}
          </div>
        </div>
        <div className="topbar-right">
          {/* Inline search bar in topbar */}
          <Box ref={searchBtnRef} sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 2, px: 1.5, py: 0.4, minWidth: { sm: 160, md: 240 }, maxWidth: { sm: 200, md: 340 }, flex: { sm: 1, md: "unset" } }}>
            <SearchIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.6)", mr: 1 }} />
            <InputBase
              placeholder="Search by locker ID, category, product..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setSearchAnchor(searchBtnRef.current); else setSearchAnchor(null); }}
              onFocus={() => { if (searchQuery) setSearchAnchor(searchBtnRef.current); }}
              onBlur={() => { setTimeout(() => setSearchAnchor(null), 200); }}
              sx={{ fontSize: 13, color: "#fff", "& input": { color: "#fff", "&::placeholder": { color: "rgba(255,255,255,0.5)" } }, flex: 1 }}
            />
            {searchQuery && (
              <IconButton size="small" className="search-clear-btn" onClick={() => closeSearchPopper()} sx={{ p: 0.2 }}>
                <span style={{ fontSize: 16, lineHeight: 1, color: "#fff" }}>×</span>
              </IconButton>
            )}
          </Box>

          <Tooltip title="Alerts & Notifications">
            <IconButton
              size="small"
              onClick={(e) => setAnchorElAlerts(e.currentTarget)}
            >
              <Badge badgeContent={(alertsApi.length - readAlerts.size) + (notifications.length - readNotifications.size)} color="error">
                <NotificationsIcon sx={{ fontSize: 26 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Approvals">
            <IconButton
              size="small"
              onClick={() => {
                if (isMaster) { setMasterModeActive(false); window.history.pushState({}, '', '/'); }
                setShowAddItemPage(false);
                setShowAddUserPage(false);
                setShowEditReturnTime(false);
                setShowInventoryPage(false);
                setShowLockersPage(false);
                setCurrentPage("approvals");
                setShowApprovalPage(true);
              }}
              aria-label="Open approvals"
            >
              <Badge badgeContent={pendingApprovalsCount} color="warning">
                <ApprovalIcon sx={{ fontSize: 24 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Universal Search Popper */}
          <Popper open={searchOpen && searchQuery.length >= 1} anchorEl={searchAnchor} placement="bottom-start" transition sx={{ zIndex: 1300, width: 400 }}>
            {({ TransitionProps }) => {
              const q = searchQuery.trim().toLowerCase();
              const matchedProducts = q.length >= 1
                ? searchInventoryData.filter(item =>
                    item.productName?.toLowerCase().includes(q) ||
                    item.productId?.toLowerCase().includes(q) ||
                    item.serialNumber?.toLowerCase().includes(q) ||
                    item.category?.toLowerCase().includes(q) ||
                    item.subCategory?.toLowerCase().includes(q)
                  ).slice(0, 6)
                : [];
              // Deduplicate to unique master lockers for display
              const uniqueMasters = searchLockerData.reduce((acc: any[], l) => {
                const mid = String(l.mlockerId ?? "");
                if (mid && !acc.find((x: any) => String(x.mlockerId ?? "") === mid)) acc.push(l);
                return acc;
              }, []);
              const matchedLockers = q.length >= 1
                ? uniqueMasters.filter(l => {
                    const mid = String(l.mlockerId ?? "").toLowerCase();
                    const masterLabel = `madv${mid}`;        // "madv1", "madv2"…
                    const loc = String(l.location ?? l.Location ?? "").toLowerCase();
                    return mid.includes(q) || masterLabel.includes(q) || loc.includes(q);
                  }).slice(0, 5)
                : [];
              const uniqueCategories = q.length >= 1
                ? [...new Set(searchInventoryData.map(i => i.category).filter(c => c && c.toLowerCase().includes(q)))].slice(0, 3)
                : [];
              const hasResults = matchedProducts.length > 0 || matchedLockers.length > 0 || uniqueCategories.length > 0;

              return (
                <Fade {...TransitionProps} timeout={200}>
                  <Paper sx={{ p: 2, width: 380, mt: 1, background: "var(--card-bg)", border: "1px solid rgba(167,139,250,0.2)" }}>
                    {q.length >= 1 && !hasResults && (
                      <Typography sx={{ color: "var(--muted)", fontSize: 13, py: 1, textAlign: "center" }}>No results found</Typography>
                    )}
                    {uniqueCategories.length > 0 && (
                      <>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: 1, px: 0.5, mb: 0.5 }}>CATEGORIES</Typography>
                        {uniqueCategories.map(cat => (
                          <Box key={cat} onClick={() => { if (isMaster) { setMasterModeActive(false); window.history.pushState({}, '', '/'); } setInventorySearchTerm(cat); setShowInventoryPage(true); setShowLockersPage(false); setShowApprovalPage(false); setShowAddItemPage(false); setShowAddUserPage(false); setCurrentPage("inventory"); closeSearchPopper(); }}
                            sx={{ px: 1.5, py: 0.8, borderRadius: 1, cursor: "pointer", display: "flex", alignItems: "center", gap: 1, "&:hover": { background: "rgba(167,139,250,0.08)" } }}>
                            <Typography sx={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{cat}</Typography>
                          </Box>
                        ))}
                      </>
                    )}
                    {matchedLockers.length > 0 && (
                      <>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: 1, px: 0.5, mt: 1, mb: 0.5 }}>LOCKERS</Typography>
                        {matchedLockers.map((l, i) => {
                          const mid = l.mlockerId ?? "";
                          const loc = l.location ?? l.Location ?? "INOXPA, Pune";
                          const subCount = searchLockerData.filter((x: any) => String(x.mlockerId ?? "") === String(mid)).length;
                          return (
                            <Box key={i} onClick={() => { if (isMaster) { setMasterModeActive(false); window.history.pushState({}, '', '/'); } setLockerSearchTerm(`MADV${mid}`); setShowLockersPage(true); setShowInventoryPage(false); setShowApprovalPage(false); setShowAddItemPage(false); setShowAddUserPage(false); setCurrentPage("lockers"); closeSearchPopper(); }}
                              sx={{ px: 1.5, py: 0.8, borderRadius: 1, cursor: "pointer", "&:hover": { background: "rgba(167,139,250,0.08)" } }}>
                              <Typography sx={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>Master Locker MADV{mid}</Typography>
                              <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>{subCount} locker{subCount !== 1 ? "s" : ""}{loc ? ` · ${loc}` : ""}</Typography>
                            </Box>
                          );
                        })}
                      </>
                    )}
                    {matchedProducts.length > 0 && (
                      <>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: 1, px: 0.5, mt: 1, mb: 0.5 }}>PRODUCTS</Typography>
                        {matchedProducts.map((item, i) => (
                          <Box key={i} onClick={() => { if (isMaster) { setMasterModeActive(false); window.history.pushState({}, '', '/'); } setInventorySearchTerm(item.productName || item.productId); setShowInventoryPage(true); setShowLockersPage(false); setShowApprovalPage(false); setShowAddItemPage(false); setShowAddUserPage(false); setCurrentPage("inventory"); closeSearchPopper(); }}
                            sx={{ px: 1.5, py: 0.8, borderRadius: 1, cursor: "pointer", "&:hover": { background: "rgba(167,139,250,0.08)" } }}>
                            <Typography sx={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{item.productName}</Typography>
                            <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>{item.category} · ID: {item.productId} · Locker {item.lockerId}</Typography>
                          </Box>
                        ))}
                      </>
                    )}
                  </Paper>
                </Fade>
              );
            }}
          </Popper>


          {/* Combined Alerts & Notifications Popover */}
          <Popover
            open={Boolean(anchorElAlerts)}
            anchorEl={anchorElAlerts}
            onClose={() => setAnchorElAlerts(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{ paper: { sx: { width: 420, maxHeight: 620, overflowY: "auto", backgroundColor: "var(--card-bg)", color: "var(--text)" } } }}
          >
            <div style={{ padding: 16 }}>

              {/* ── ALERTS ── */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: alertsExpanded ? 8 : 4 }}>
                <div
                  onClick={() => setAlertsExpanded(prev => !prev)}
                  style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, cursor: "pointer", userSelect: "none" }}
                >
                  <WarningIcon sx={{ fontSize: 18, color: "#ff5252" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--text)" }}>
                    Alerts <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13 }}>({alertsApi.length - readAlerts.size} unread)</span>
                  </Typography>
                  {alertsExpanded ? <ExpandLessIcon sx={{ fontSize: 18, color: "var(--muted)" }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: "var(--muted)" }} />}
                </div>
                {alertsApi.length > 0 && readAlerts.size < alertsApi.length && (
                  <Typography
                    onClick={markAllAlertsRead}
                    sx={{ fontSize: 11, color: "#b4d7ff", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
                  >
                    Mark all read
                  </Typography>
                )}
              </div>
              {alertsExpanded && (
                alertsApi.length === 0 ? (
                  <Typography sx={{ color: "var(--muted)", fontSize: 13, mb: 1 }}>No alerts</Typography>
                ) : (
                  <List sx={{ padding: 0, mb: 1 }}>
                    {alertsApi.map((alert, idx) => {
                      const isRead = readAlerts.has(idx);
                      return (
                        <Card key={idx} sx={{ mb: 1, p: 1.5, borderRadius: 1, backgroundColor: alert.Severity === "Critical" || alert.Severity === "High" ? "rgba(255,82,82,0.08)" : "rgba(255,176,32,0.08)", borderLeft: `4px solid ${alert.Severity === "Critical" || alert.Severity === "High" ? "#ff5252" : "#ffb020"}`, opacity: isRead || alert.IsResolved ? 0.5 : 1, transition: "opacity 0.2s" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, flex: 1 }}>{alert.Name || `Product ID: ${alert.qtId}`}</Typography>
                            {isRead ? (
                              <Typography sx={{ fontSize: 10, color: "#4caf50", fontWeight: 700, whiteSpace: "nowrap", mt: 0.3 }}>✓ Read</Typography>
                            ) : (
                              <Typography
                                onClick={() => markAlertRead(idx)}
                                sx={{ fontSize: 10, color: "#b4d7ff", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, mt: 0.3, "&:hover": { textDecoration: "underline" } }}
                              >
                                Mark read
                              </Typography>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                            <Chip label={alert.Severity} size="small" sx={{ backgroundColor: alert.Severity === "Critical" || alert.Severity === "High" ? "#ff5252" : "#ffb020", color: "#fff" }} />
                            {alert.IsResolved && <Chip label="Resolved" size="small" sx={{ backgroundColor: "#4caf50", color: "#fff" }} />}
                            {isRead && <Chip label="Read" size="small" sx={{ backgroundColor: "#4caf50", color: "#fff" }} />}
                          </div>
                          <Typography variant="body2" sx={{ color: "var(--text)" }}>{alert.AlertDescription}</Typography>
                          <Typography variant="caption" sx={{ color: "var(--muted)", display: "block", mt: 0.5 }}>Serial: {alert.SerialNumber || "N/A"}</Typography>
                        </Card>
                      );
                    })}
                  </List>
                )
              )}

              <Divider sx={{ borderColor: "var(--border)", my: 1.5 }} />

              {/* ── NOTIFICATIONS ── */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: notificationsExpanded ? 8 : 4 }}>
                <div
                  onClick={() => setNotificationsExpanded(prev => !prev)}
                  style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, cursor: "pointer", userSelect: "none" }}
                >
                  <NotificationsIcon sx={{ fontSize: 18, color: "#00bcd4" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--text)" }}>
                    Notifications <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13 }}>({notifications.length - readNotifications.size} unread)</span>
                  </Typography>
                  {notificationsExpanded ? <ExpandLessIcon sx={{ fontSize: 18, color: "var(--muted)" }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: "var(--muted)" }} />}
                </div>
                {notifications.length > 0 && readNotifications.size < notifications.length && (
                  <Typography
                    onClick={markAllNotifsRead}
                    sx={{ fontSize: 11, color: "#b4d7ff", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
                  >
                    Mark all read
                  </Typography>
                )}
              </div>
              {notificationsExpanded && (
                notifications.length === 0 ? (
                  <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>No notifications</Typography>
                ) : (
                  <List sx={{ padding: 0 }}>
                    {notifications.map((notif, idx) => {
                      const isRead = readNotifications.has(idx);
                      return (
                        <Card key={idx} sx={{ mb: 1, p: 1.5, borderRadius: 1, backgroundColor: notif.impact === "Critical" ? "rgba(255,82,82,0.08)" : "rgba(0,188,212,0.08)", borderLeft: `4px solid ${notif.impact === "Critical" ? "#ff5252" : "#00bcd4"}`, opacity: isRead ? 0.5 : 1, transition: "opacity 0.2s" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, flex: 1 }}>Locker {notif.locker_Id}</Typography>
                            {isRead ? (
                              <Typography sx={{ fontSize: 10, color: "#4caf50", fontWeight: 700, whiteSpace: "nowrap", mt: 0.3 }}>✓ Read</Typography>
                            ) : (
                              <Typography
                                onClick={() => markNotifRead(idx)}
                                sx={{ fontSize: 10, color: "#b4d7ff", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, mt: 0.3, "&:hover": { textDecoration: "underline" } }}
                              >
                                Mark read
                              </Typography>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                            <Chip label={notif.impact} size="small" sx={{ backgroundColor: notif.impact === "Critical" ? "#ff5252" : "#ffb020", color: "#fff" }} />
                            {isRead && <Chip label="Read" size="small" sx={{ backgroundColor: "#4caf50", color: "#fff" }} />}
                          </div>
                          <Typography variant="body2" sx={{ color: "var(--text)" }}>{notif.notifications}</Typography>
                        </Card>
                      );
                    })}
                  </List>
                )
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
                if (isMaster) { setMasterModeActive(false); window.history.pushState({}, '', '/'); }
                setAnchorElUser(null);
                setShowApprovalPage(false);
                setShowAddItemPage(false);
                setShowAddUserPage(false);
                setShowEditReturnTime(false);
                setShowInventoryPage(false);
                setShowLockersPage(false);
                setShowProfilePage(true);
                setCurrentPage("");
              }}
            >
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => setDarkMode(prev => !prev)}
              sx={{ display: "flex", justifyContent: "space-between", gap: 3, minWidth: 180 }}
            >
              <span>Dark Mode</span>
              <Switch
                checked={darkMode}
                size="small"
                sx={{ pointerEvents: "none" }}
                color="secondary"
              />
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
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
      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)", marginTop: "64px", background: "var(--bg)" }}>
        {/* Sidebar */}
        <Sidebar
          userName={userName}
          onNavigate={(page) => {
            setCurrentPage(page);
            if (typeof window !== "undefined" && window.innerWidth < 960) {
              // on small screens close the sidebar (drawer). On desktop keep it open.
              setSidebarOpen(false);
            }
            // If currently on master page, navigate away from it.
            // setMasterModeActive(false) guarantees a re-render even when
            // all other state is already at its target values (dashboard reload case).
            if (isMaster) {
              setMasterModeActive(false);
              window.history.pushState({}, '', '/');
            }
            // Ensure other sub-pages are closed first so the requested one opens reliably
            setShowApprovalPage(false);
            setShowAddItemPage(false);
            setShowAddUserPage(false);
            setShowEditReturnTime(false);
            setShowInventoryPage(false);
            setShowProfilePage(false);

            if (page === "additem") setShowAddItemPage(true);
            else if (page === "adduser") setShowAddUserPage(true);
            else if (page === "approvals") { setApprovalPageInitialFilter("All"); setShowApprovalPage(true); }
            else if (page === "editreturn") setShowEditReturnTime(true);
            else if (page === "inventory") setShowInventoryPage(true);
            else if (page === "lockers") {
              setPreviousMainPage("lockers");
              setShowLockersPage(true);
            }
            else if (page === "dashboard") {
              setPreviousMainPage("dashboard");
              setShowLockersPage(false);
            }
          }}
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
            background: "var(--bg)",
          }}
        >
        {/* If master page path, render MasterPage inside layout so Sidebar stays visible. */}
        {isMaster ? (
          <div style={{ width: "100%", maxWidth: "100%", margin: "20px auto", padding: 12 }}>
            <MasterPage mlockerId={masterId} token={token ?? undefined} showTopBar={false} onBack={() => { setMasterModeActive(false); window.history.pushState({}, '', '/'); setCurrentPage('lockers'); setShowLockersPage(true); }} />
          </div>
        ) : /* If one of the sub-pages is open, render it as a dedicated page inside
            the main content area (TopBar and Side remain visible). Otherwise
            render the dashboard content as before. */ (showApprovalPage || showAddItemPage || showAddUserPage) ? (
          <div className="page-shell page-hero bg-soft-pattern"
            style={{ width: "100%", maxWidth: "100%", margin: "20px auto", padding: 12, position: "relative" }}
          >
            {showApprovalPage && <ApprovalRequestsPage prefetchedData={prefetchedApprovals} initialFilter={approvalPageInitialFilter} />}
            {showAddItemPage && <AddItemPage />}
            {showAddUserPage && (
              <AddUserPage onDone={() => setShowAddUserPage(false)} />
            )}
          </div>
        ) : showProfilePage ? (
          <ProfilePage userName={userName} />
        ) : showInventoryPage ? (
          <InventoryPage prefetchedData={prefetchedInventory} initialSearch={inventorySearchTerm} />
        ) : showLockersPage ? (
          <LockersPage initialSearch={lockerSearchTerm} />
        ) : (
          <>
            {/* Top dashboard action panel removed per request */}
            {/* user menu moved to TopBar */}
            {/* <div className="sm-card">
              <Notifications token={token} />
            </div> */}

            <div className="overview-grid">
              <div
                className="overview-card"
                onClick={() => setShowLockerBreakdown(prev => !prev)}
                style={{ cursor: "pointer", border: showLockerBreakdown ? "2px solid #b4d7ff" : "2px solid transparent", transition: "border 0.2s" }}
              >
                <div className="overview-card-top">
                  <div>
                    <div className="overview-label">Total Lockers</div>
                    <div className="overview-value">{totalLockers}</div>
                    <div className="overview-sub" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      Across all locations
                      {showLockerBreakdown
                        ? <ExpandLessIcon sx={{ fontSize: 14, color: "#b4d7ff" }} />
                        : <ExpandMoreIcon sx={{ fontSize: 14, color: "var(--muted)" }} />}
                    </div>
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
                    <div className="overview-value">{totalItems}</div>
                    <div className="overview-sub">Stored in lockers</div>
                  </div>
                  <div className="overview-icon-wrapper">
                    <InventoryIcon fontSize="small" />
                  </div>
                </div>
              </div>
              <div
                className="overview-card"
                onClick={() => {
                  setApprovalPageInitialFilter("Pending");
                  setShowApprovalPage(true);
                  setShowInventoryPage(false);
                  setShowLockersPage(false);
                  setShowAddItemPage(false);
                  setShowAddUserPage(false);
                  setShowProfilePage(false);
                  setCurrentPage("approvals");
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="overview-card-top">
                  <div>
                    <div className="overview-label">Pending Approvals</div>
                    <div className="overview-value">{pendingApprovalsCount}</div>
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
                    <div className="overview-value">{totalLocations}</div>
                    <div className="overview-sub">Different locations</div>
                  </div>
                  <div className="overview-icon-wrapper">
                    <LocationOnIcon fontSize="small" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Locker Status Breakdown Panel ── */}
            {showLockerBreakdown && (() => {
              const statusColors: Record<string, { bg: string; bar: string; label: string }> = {
                occupied:    { bg: "rgba(239,68,68,0.10)",   bar: "#ef4444", label: "Occupied" },
                booked:      { bg: "rgba(245,158,11,0.10)",  bar: "#f59e0b", label: "Booked" },
                reserved:    { bg: "rgba(245,158,11,0.10)",  bar: "#f59e0b", label: "Reserved" },
                empty:       { bg: "rgba(34,197,94,0.10)",   bar: "#22c55e", label: "Empty" },
                available:   { bg: "rgba(34,197,94,0.10)",   bar: "#22c55e", label: "Available" },
                free:        { bg: "rgba(34,197,94,0.10)",   bar: "#22c55e", label: "Free" },
                maintenance: { bg: "rgba(99,102,241,0.10)",  bar: "#6366f1", label: "Maintenance" },
                service:     { bg: "rgba(99,102,241,0.10)",  bar: "#6366f1", label: "Service" },
              };
              const defaultColor = { bg: "rgba(148,163,184,0.10)", bar: "#94a3b8", label: "" };

              const counts: Record<string, number> = {};
              lockerRawData.forEach((l: any) => {
                const raw = (l.status || l.Status || l.statusinfoM || "Unknown").trim();
                counts[raw] = (counts[raw] || 0) + 1;
              });
              const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
              const total = lockerRawData.length || 1;

              return (
                <div style={{
                  marginTop: 16, padding: "18px 20px", borderRadius: 12,
                  background: "var(--card-bg)", border: "1px solid var(--border)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <LockIcon sx={{ fontSize: 16, color: "#b4d7ff" }} />
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                      Locker Status Breakdown
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "var(--muted)", ml: 1 }}>
                      {lockerRawData.length} total lockers
                    </Typography>
                  </div>

                  {entries.length === 0 ? (
                    <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>No locker data available</Typography>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {entries.map(([status, count]) => {
                        const key = status.toLowerCase();
                        const theme = statusColors[key] || { ...defaultColor, label: status };
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={status}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                                {theme.label || status}
                              </span>
                              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                                {count} locker{count !== 1 ? "s" : ""} &nbsp;
                                <span style={{ color: theme.bar, fontWeight: 700 }}>{pct}%</span>
                              </span>
                            </div>
                            <div style={{ height: 8, borderRadius: 4, background: "var(--border)", overflow: "hidden" }}>
                              <div style={{
                                height: "100%", width: `${pct}%`, borderRadius: 4,
                                background: theme.bar,
                                transition: "width 0.6s ease"
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </>
        )}

        {/* Dialog for editing minimum product return time */}
        <Dialog
          open={showEditReturnTime}
          onClose={() => setShowEditReturnTime(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              minWidth: { xs: "92vw", sm: 480 },
              maxWidth: { xs: "96vw", sm: 560 },
              width: "100%",
              padding: { xs: 1, sm: 2 },
              zIndex: 2000,
              overflow: "visible",
              mx: { xs: 1, sm: "auto" },
            },
          }}
        >
          <DialogTitle sx={{ pt: 1, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            Edit Minimum Product Pickup Time
          </DialogTitle>
          <DialogContent sx={{ pt: 1, overflow: "visible" }}>
            <TextField
              label="Minimum pickup time (e.g. 48h or 2d)"
              value={minReturnTimeValue}
              onChange={(e) => setMinReturnTimeValue(e.target.value)}
              fullWidth
              error={!!minReturnTimeError}
              helperText={
                minReturnTimeError ||
                "Enter number with unit d/h, e.g. 48h or 2d"
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 0 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 }, gap: 1 }}>
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

        </div>
      </div>
    </>
  );
}

export default App;
