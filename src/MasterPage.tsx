import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  InputBase,
  Badge,
  Popover,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WarningIcon from "@mui/icons-material/Warning";
import ApprovalIcon from "@mui/icons-material/AssignmentTurnedIn";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useLiveLoadData, fetchCatalogue, updateCatalogueCaliDates, fetchNotificationsFromApi, fetchAlertsFromApi, fetchRequestApprovals } from "./APIService";
import type { Locker } from "./Locker.tsx";

interface LockerNotification {
  locker_Id: number;
  impact: string;
  notifications: string;
}

interface Alert {
  AlertId: number;
  qtId: number;
  AlertDescription: string;
  AppUserID: string;
  MUserID: string;
  Severity: string;
  IsResolved: boolean;
  CreatedAt: string | null;
  ResolvedAt: string | null;
  Name: string;
  SerialNumber: string;
}

interface MasterPageProps {
  mlockerId?: string | number;
  token?: string;
  onBack?: () => void;
  showTopBar?: boolean;
}

const normalizeLockerKey = (v: any) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return String(v);
  const s = String(v).trim();
  const m = s.match(/(\d+)/);
  return m ? m[0] : s;
};

const parseServerDate = (v: any): Date | null => {
  if (v == null) return null;
  if (v instanceof Date) return v;
  if (typeof v === "number") return new Date(v);
  if (typeof v === "string") {
    const s = v.trim();
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
    const m = s.match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
    if (m && m[1]) return new Date(Number(m[1]));
    const num = s.match(/(\d{10,})/);
    if (num) return new Date(Number(num[1]));
  }
  if (typeof v === "object" && (v as any).Date) {
    try {
      const d = new Date((v as any).Date);
      if (!isNaN(d.getTime())) return d;
    } catch {}
  }
  return null;
};

const toInputDate = (v: any) => {
  const d = parseServerDate(v);
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const getCaliValue = (item: any, which: "last" | "upcoming") => {
  if (!item) return null;
  const lastKeys = [
    "CaliDateLast",
    "Cali_DateLast",
    "CaliDate_Last",
    "caliDateLast",
    "LastCalibration",
    "LastCali",
    "CaliLast",
  ];
  const nextKeys = [
    "CaliDateUpcoming",
    "Cali_DateUpcoming",
    "CaliDate_Upcoming",
    "caliDateUpcoming",
    "NextCalibration",
    "NextCali",
    "CaliUpcoming",
  ];
  const keys = which === "last" ? lastKeys : nextKeys;
  for (const k of keys) {
    if (item[k] !== undefined && item[k] !== null) return item[k];
  }
  return null;
};

const setCaliOnItem = (item: any, last: string | null, next: string | null) => {
  const lastKeys = [
    "CaliDateLast",
    "Cali_DateLast",
    "CaliDate_Last",
    "caliDateLast",
    "LastCalibration",
    "LastCali",
    "CaliLast",
  ];
  const nextKeys = [
    "CaliDateUpcoming",
    "Cali_DateUpcoming",
    "CaliDate_Upcoming",
    "caliDateUpcoming",
    "NextCalibration",
    "NextCali",
    "CaliUpcoming",
  ];
  for (const k of lastKeys) {
    try { item[k] = last; } catch {}
  }
  for (const k of nextKeys) {
    try { item[k] = next; } catch {}
  }
  return item;
};

const toIsoOrNull = (dateStr: string) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    const sec = pad(d.getSeconds());
    const offsetMin = -d.getTimezoneOffset();
    const sign = offsetMin >= 0 ? "+" : "-";
    const absOff = Math.abs(offsetMin);
    const offH = pad(Math.floor(absOff / 60));
    const offM = pad(absOff % 60);
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${sec}${sign}${offH}:${offM}`;
  } catch {
    return null;
  }
};

const MasterPage: React.FC<MasterPageProps> = ({ mlockerId: propId, onBack, showTopBar }) => {
  const liveData = useLiveLoadData();
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [groupedByLocker, setGroupedByLocker] = useState<Record<string, any[]>>({});
  const [productsForLocker, setProductsForLocker] = useState<any[]>([]);
  const [productsDialogOpen, setProductsDialogOpen] = useState(false);
  const [productsLockerLabel, setProductsLockerLabel] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLast, setEditLast] = useState<string>("");
  const [editNext, setEditNext] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [notifications, setNotifications] = useState<LockerNotification[]>([]);
  const [notifAnchorEl, setNotifAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertAnchorEl, setAlertAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);

  const slug = propId
    ? String(propId)
    : (typeof window !== "undefined" ? window.location.pathname.split("/").pop() : "") || "";
  const numericId = (slug || "").replace(/\D/g, "");

  useEffect(() => {
    let mounted = true;
    fetchCatalogue()
      .then((data) => {
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : [];
        setCatalogue(arr);
        const grouped: Record<string, any[]> = {};
        arr.forEach((p: any) => {
          const raw =
            p.LockerId ??
            p.Locker_Id ??
            p.lockerId ??
            p.locker_Id ??
            p.Locker ??
            null;
          const lid = raw == null ? "" : String(raw).replace(/\D/g, "");
          if (!grouped[lid]) grouped[lid] = [];
          grouped[lid].push(p);
        });
        setGroupedByLocker(grouped);
      })
      .catch((e) => console.error(e));
    return () => { mounted = false; };
  }, []);

  // Fetch notifications from API on mount
  useEffect(() => {
    fetchNotificationsFromApi()
      .then((data) => {
        setNotifications(data as unknown as LockerNotification[]);
      })
      .catch((e) => console.error("Error fetching notifications:", e));
  }, []);

  // Fetch alerts from API on mount
  useEffect(() => {
    fetchAlertsFromApi()
      .then((data) => {
        setAlerts(data);
      })
      .catch((e) => console.error("Error fetching alerts:", e));
  }, []);

  // Load pending approvals count
  useEffect(() => {
    const uid = sessionStorage.getItem("userId") || "";
    if (!uid) return;
    let mounted = true;
    (async () => {
      try {
        const arr = await fetchRequestApprovals(uid);
        if (mounted) setPendingApprovalsCount(Array.isArray(arr) ? arr.length : 0);
      } catch (err) {
        if (mounted) setPendingApprovalsCount(0);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const lockers: Locker[] = (liveData || []).filter((l: any) => {
    const m = String(l.mlockerId ?? "").replace(/\D/g, "");
    return m === numericId || String(l.mlockerId) === slug || slug === "";
  });

  const getProductsForLocker = (lockerId: any) => {
    const k = lockerId == null ? "" : String(lockerId).replace(/\D/g, "");
    return groupedByLocker[k] || [];
  };

  const displayedProducts = (() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return productsForLocker;
    return productsForLocker.filter((p: any) => {
      const fields = [
        p.qtId != null ? String(p.qtId) : "",
        p.SerialNumber ?? p.serialNumber ?? "",
        p.Name ?? p.name ?? "",
      ];
      return fields.some((f) => String(f).toLowerCase().includes(q));
    });
  })();

  const openProductsDialog = (lid: any, label?: string) => {
    const items = getProductsForLocker(lid);
    setProductsForLocker(items);
    setProductsLockerLabel(label ?? `ADV00${lid}`);
    setExpandedProductId(null);
    setProductSearch("");
    setProductsDialogOpen(true);
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: 18,
  };

  return (
    <div className="page-shell">
      <div className="content-wrap">
      {showTopBar !== false && (
        <div className="TopBar">
        <div className="topbar-left">
          <span className="brand">Client<span className="topbar-janus">Name</span></span>
        </div>
        <div className="topbar-center">
          <Typography variant="h6" className="topbar-title">dexbox<span className="topbar-plus">+</span></Typography>
        </div>
        <div className="topbar-right">
          <Tooltip title="Alerts">
            <IconButton
              size="small"
              onClick={(e) => setAlertAnchorEl(e.currentTarget)}
            >
              <Badge badgeContent={alerts.length} color="error">
                <WarningIcon sx={{ fontSize: 26 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Approvals">
            <IconButton
              size="small"
              onClick={() => window.location.href = "/"}
              aria-label="Open approvals"
            >
              <Badge badgeContent={pendingApprovalsCount} color="warning">
                <ApprovalIcon sx={{ fontSize: 24 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton
              size="small"
              onClick={(e) => setNotifAnchorEl(e.currentTarget)}
            >
              <Badge badgeContent={notifications.length} color="info">
                <NotificationsIcon sx={{ fontSize: 26 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Account"><IconButton size="small"><Avatar sx={{ width: 36, height: 36 }}>U</Avatar></IconButton></Tooltip>
        </div>
        </div>
      )}
      </div>

      {/* Alerts Popover */}
      <Popover
        open={Boolean(alertAnchorEl)}
        anchorEl={alertAnchorEl}
        onClose={() => setAlertAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <div style={{ width: 420, maxHeight: 500, overflowY: "auto", padding: 16 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
            Alerts ({alerts.length})
          </Typography>
          {alerts.length === 0 ? (
            <Typography sx={{ color: "var(--muted)" }}>No alerts</Typography>
          ) : (
            <List sx={{ padding: 0 }}>
              {alerts.map((alert, idx) => (
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

      <div className="main-column">
        <div style={{ maxWidth: 1200, margin: "18px auto 12px", padding: "0 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, marginTop: 0 }}>
          {/* <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, margin-top:64 }}> */}
            <Button variant="outlined" onClick={() => (onBack ? onBack() : window.history.back())}>Back</Button>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Master Locker MADV{numericId || propId}</Typography>
          </div>
        </div>

        <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
          <Card className="master-page-wrapper" sx={{ borderRadius: 12 }}>
            <CardContent>
              {lockers.length === 0 ? (
                <Typography>No lockers found for this master.</Typography>
              ) : (
                <div className="master-lockers-grid">
                  {lockers.map((l: any) => {
                    const lid = l.locker_Id ?? l.Locker_Id ?? l.id ?? "";
                    const products = getProductsForLocker(lid);
                    const cond = (l.statusinfoM ?? "").toString().toLowerCase();
                    return (
                      <Card
                        key={String(lid)}
                        sx={{
                          borderRadius: 12,
                          border: "1px solid rgba(30,70,110,0.08)",
                          position: "relative",
                          overflow: "visible",
                        }}
                      >
                        <CardContent sx={{ padding: "18px 24px", border: "2px solid var(--border)", borderRadius: 8 }}>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, width: "100%" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Locker {String(lid).replace(/\D/g, "")}</Typography>
                                  <CheckCircleIcon sx={{ color: "var(--success)", fontSize: 18 }} />
                                </div>

                                <div style={{ marginTop: 8, display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
                                  <div>
                                    <div style={{ color: "var(--danger)", fontWeight: 700, fontSize: 16 }}>Size</div>
                                    <div style={{ color: "var(--text)", fontSize: 12, marginTop: 2 }}>{(() => {
  const LOCKER_SIZE_ID_MAP: Record<string, string> = { "1": "Micro", "2": "Mini", "3": "Medium", "4": "Big", "5": "Biggest" };
  const sizeRaw = String(l.locker_size ?? (l as any).LockerSize ?? (l as any).size ?? "").toLowerCase().trim();
  if (sizeRaw.includes("biggest")) return "Biggest";
  if (sizeRaw.includes("medium")) return "Medium";
  if (sizeRaw.includes("micro")) return "Micro";
  if (sizeRaw.includes("mini")) return "Mini";
  if (sizeRaw === "big") return "Big";
  const idStr = String((l as any).locker_size_Id ?? (l as any).LockerSizeId ?? (l as any).locker_size_id ?? "").trim();
  return LOCKER_SIZE_ID_MAP[idStr] ?? LOCKER_SIZE_ID_MAP[sizeRaw] ?? "—";
})()}</div>
                                  </div>

                                  <div>
                                    <div style={{ color: "var(--danger)", fontWeight: 700, fontSize: 16 }}>Status</div>
                                    <div style={{ color: "var(--text)", fontSize: 12, marginTop: 2 }}>{String(l.status ?? "Filled")}</div>
                                  </div>

                                  <div>
                                    <div style={{ color: "var(--danger)", fontWeight: 700, fontSize: 16 }}>Product Count</div>
                                    <div style={{ color: "var(--text)", fontSize: 12, marginTop: 2 }}>{products.length}</div>
                                  </div>
                                </div>
                              </div>

                              <div style={{ width: 140, display: "flex", justifyContent: "flex-end", alignSelf: "flex-start" }}>
                                <Button
                                  className="show-btn"
                                  variant="contained"
                                  onClick={() => openProductsDialog(lid, `ADV00${lid}`)}
                                  sx={{
                                    background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
                                    color: "#ffffff",
                                    textTransform: "none",
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.3,
                                    border: "2px solid #7c3aed",
                                    boxShadow: "0 4px 12px rgba(139,92,246,0.35)",
                                    minWidth: 96,
                                    fontWeight: 600,
                                    "&:hover": {
                                      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                                      borderColor: "#6d28d9",
                                      boxShadow: "0 6px 16px rgba(139,92,246,0.5)",
                                    },
                                  }}
                                >
                                  Show
                                </Button>
                              </div>
                            </div>

                            <Divider sx={{ my: 1.5 }} />

                            <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 8, flexWrap: "wrap" }}>
                              <Chip
                                size="small"
                                sx={{ borderRadius: 2, height: "auto", py: 0.4 }}
                                label={
                                  <span>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>Locker Id: </span>
                                    <span style={{ fontSize: 11 }}>{lid}</span>
                                  </span>
                                }
                              />
                              <Chip
                                size="small"
                                sx={{ borderRadius: 2, height: "auto", py: 0.4 }}
                                label={
                                  <span>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>Location: </span>
                                    <span style={{ fontSize: 11 }}>{l.Location ?? l.site ?? "INOXPA, Pune"}</span>
                                  </span>
                                }
                              />
                              <Chip
                                size="small"
                                sx={{ borderRadius: 2, height: "auto", py: 0.4, backgroundColor: cond === 'ready' ? '#4caf50' : '#ff5252', color: '#ffffff' }}
                                label={
                                  <span>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>Condition: </span>
                                    <span style={{ fontSize: 11 }}>{cond || "not ready"}</span>
                                  </span>
                                }
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={productsDialogOpen} onClose={() => setProductsDialogOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>
            Products in {productsLockerLabel} {productsForLocker.length > 0 && `(${productsForLocker.length})`}
          </DialogTitle>

          <DialogContent dividers>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <SearchIcon style={{ color: "var(--muted)" }} />
              <InputBase
                placeholder="Search products by QT ID, serial or name"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                sx={{ flex: 1 }}
                inputProps={{ "aria-label": "product-search" }}
              />
              {productSearch && <Button size="small" className="search-clear-btn" onClick={() => setProductSearch("")}>×</Button>}
            </div>

            {productsForLocker.length === 0 ? (
              <Typography>No products found for this locker.</Typography>
            ) : (
              <List>
                {displayedProducts.map((p: any, i: number) => {
                  const pid = p.qtId != null ? String(p.qtId) : p.ProductId || p.id || String(i);
                  const isExpanded = expandedProductId === pid;
                  const title = p.Name ?? p.name ?? "Product";
                  const thumb = p.ImageUrl ?? p.image ?? p.thumbnail ?? null;

                  return (
                    <div key={pid} style={{ padding: 6 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Avatar variant="rounded" src={thumb || undefined} style={{ width: 56, height: 56 }}>
                          {!thumb && (title[0] ?? "P")}
                        </Avatar>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>{title}</div>
                              <div style={{ color: "var(--muted)", marginTop: 4 }}>
                                {(p.Category ?? p.category) && <Chip size="small" label={p.Category ?? p.category} style={{ marginRight: 6 }} />}
                                {(p.SubCategory ?? p.subCategory) && <Chip size="small" label={p.SubCategory ?? p.subCategory} />}
                              </div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: 600 }}>qt:{p.qtId ?? "-"}</div>
                              <div style={{ color: "var(--muted)", marginTop: 6 }}>{p.ProductId ? `ID:${p.ProductId}` : ""}</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Button size="small" onClick={() => setExpandedProductId(isExpanded ? null : pid)}>{isExpanded ? "Hide" : "Details"}</Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ marginTop: 10, padding: 12, background: "rgba(0,0,0,0.03)", borderRadius: 8 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                              <div style={{ color: "var(--text)", fontWeight: 600 }}>Serial</div>
                              <div style={{ color: "var(--text)" }}>{p.SerialNumber ?? p.serialNumber ?? "—"}</div>
                            </div>
                            <div>
                              <div style={{ color: "var(--text)", fontWeight: 600 }}>Category</div>
                              <div style={{ color: "var(--text)" }}>{p.Category ?? p.category ?? "—"}</div>
                            </div>
                            <div>
                              <div style={{ color: "var(--text)", fontWeight: 600 }}>SubCategory</div>
                              <div style={{ color: "var(--text)" }}>{p.SubCategory ?? p.subCategory ?? "—"}</div>
                            </div>
                            <div>
                              <div style={{ color: "var(--text)", fontWeight: 600 }}>QT ID</div>
                              <div style={{ color: "var(--text)" }}>{p.qtId ?? "—"}</div>
                            </div>
                          </div>

                          <div style={{ marginTop: 12 }}>
                            {editingId === pid ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <label style={{ fontWeight: 600 }}>Last Calibration</label>
                                <input type="datetime-local" value={editLast} onChange={(e) => setEditLast(e.target.value)} style={{ width: "100%", padding: 6, borderRadius: 4, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text)" }} />
                                <label style={{ fontWeight: 600 }}>Next Calibration</label>
                                <input type="datetime-local" value={editNext} onChange={(e) => setEditNext(e.target.value)} style={{ width: "100%", padding: 6, borderRadius: 4, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text)" }} />

                                <div style={{ display: "flex", gap: 8 }}>
                                  <Button size="small" variant="contained" disabled={savingEdit} onClick={async () => {
                                    const qt = p.qtId ?? p.ProductId ?? null;
                                    if (!qt) return;
                                    setSavingEdit(true);
                                    const payload = {
                                      qtId: qt,
                                      CaliDateLast: toIsoOrNull(editLast),
                                      CaliDateUpcoming: toIsoOrNull(editNext),
                                    };
                                    try {
                                      const res = await updateCatalogueCaliDates(payload as any);
                                      if (res && res > 0) {
                                        setProductsForLocker((prev) => prev.map((it) =>
                                          (it.qtId != null ? String(it.qtId) : it.ProductId) === String(qt)
                                            ? setCaliOnItem({ ...it }, payload.CaliDateLast, payload.CaliDateUpcoming)
                                            : it
                                        ));
                                        setCatalogue((prev) => {
                                          const next = prev.map((it) =>
                                            (it.qtId != null ? String(it.qtId) : it.ProductId) === String(qt)
                                              ? setCaliOnItem({ ...it }, payload.CaliDateLast, payload.CaliDateUpcoming)
                                              : it
                                          );
                                          const grouped: Record<string, any[]> = {};
                                          (next || []).forEach((item: any) => {
                                            const raw = item.LockerId ?? item.Locker_Id ?? item.lockerId ?? item.locker_Id ?? item.Locker ?? null;
                                            const lid = normalizeLockerKey(raw);
                                            if (!grouped[lid]) grouped[lid] = [];
                                            grouped[lid].push(item);
                                          });
                                          setGroupedByLocker(grouped);
                                          return next;
                                        });
                                      }
                                    } catch (e) { console.error(e); }
                                    finally { setSavingEdit(false); setEditingId(null); }
                                  }}>Save</Button>
                                  <Button size="small" onClick={() => setEditingId(null)} disabled={savingEdit}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                  <div><strong>Last Calibration:</strong> {(() => { const d = parseServerDate(getCaliValue(p, "last")); return d ? d.toLocaleString() : "—"; })()}</div>
                                  <div style={{ marginTop: 6 }}><strong>Next Calibration:</strong> {(() => { const d = parseServerDate(getCaliValue(p, "upcoming")); return d ? d.toLocaleString() : "—"; })()}</div>
                                </div>
                                {p.qtId && <Button size="small" onClick={() => { setEditingId(pid); setEditLast(toInputDate(getCaliValue(p, "last"))); setEditNext(toInputDate(getCaliValue(p, "upcoming"))); }}>Edit</Button>}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {i < displayedProducts.length - 1 && <Divider sx={{ my: 1 }} />}
                    </div>
                  );
                })}
              </List>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setProductsDialogOpen(false)} variant="contained">Close</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default MasterPage;