import React from "react";

import "react-tabulator/lib/styles.css";
import "react-tabulator/lib/css/tabulator.min.css";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import { useEffect, useState } from "react";
import {
  useLiveLoadData,
  fetchCatalogue,
  updateCatalogueCaliDates,
} from "./APIService";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import BuildIcon from "@mui/icons-material/Build";

import ErrorIcon from "@mui/icons-material/Error";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewInArIcon from "@mui/icons-material/ViewInAr";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import type { Locker } from "./Locker.tsx";

/* ── Condition icons — document + badge design ── */
const ConditionWarnIcon = () => (
  <svg viewBox="0 0 110 110" width="30" height="30" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {/* Document body */}
    <rect x="6" y="6" width="76" height="76" rx="20" stroke="currentColor" strokeWidth="7"/>
    {/* Text line 1 */}
    <line x1="22" y1="36" x2="66" y2="36" stroke="currentColor" strokeWidth="7"/>
    {/* Text line 2 (shorter) */}
    <line x1="22" y1="55" x2="56" y2="55" stroke="currentColor" strokeWidth="7"/>
    {/* Badge circle — bottom right, white fill so it overlaps cleanly */}
    <circle cx="80" cy="80" r="24" fill="white" stroke="currentColor" strokeWidth="7"/>
    {/* Exclamation stem */}
    <line x1="80" y1="67" x2="80" y2="80" stroke="currentColor" strokeWidth="7"/>
    {/* Exclamation dot */}
    <circle cx="80" cy="90" r="4" fill="currentColor" stroke="none"/>
  </svg>
);

const ConditionOkIcon = () => (
  <svg viewBox="0 0 110 110" width="30" height="30" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {/* Document body */}
    <rect x="6" y="6" width="76" height="76" rx="20" stroke="currentColor" strokeWidth="7"/>
    {/* Text line 1 */}
    <line x1="22" y1="36" x2="66" y2="36" stroke="currentColor" strokeWidth="7"/>
    {/* Text line 2 (shorter) */}
    <line x1="22" y1="55" x2="56" y2="55" stroke="currentColor" strokeWidth="7"/>
    {/* Badge circle */}
    <circle cx="80" cy="80" r="24" fill="white" stroke="currentColor" strokeWidth="7"/>
    {/* Checkmark */}
    <polyline points="68,80 77,89 94,70" stroke="currentColor" strokeWidth="7" fill="none"/>
  </svg>
);

/* ── Locker cabinet icon — same design, different render sizes ── */
const LockerCabinetIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
    {/* Outer frame */}
    <rect x="4" y="4" width="92" height="92" rx="6"/>
    {/* Top header bar */}
    <rect x="4" y="4" width="92" height="15" rx="6"/>
    {/* Vertical grid dividers */}
    <line x1="37" y1="19" x2="37" y2="96"/>
    <line x1="63" y1="19" x2="63" y2="96"/>
    {/* Horizontal grid dividers */}
    <line x1="4"  y1="46" x2="96" y2="46"/>
    <line x1="4"  y1="71" x2="96" y2="71"/>
    {/* Center cell door panel */}
    <rect x="43" y="51" width="14" height="16" rx="2"/>
    {/* Door handle */}
    <line x1="44" y1="69" x2="52" y2="69" strokeWidth="4"/>
  </svg>
);

const LockerMicroIcon   = () => <LockerCabinetIcon size={20} />;
const LockerMiniIcon    = () => <LockerCabinetIcon size={24} />;
const LockerMediumIcon  = () => <LockerCabinetIcon size={28} />;
const LockerBigIcon     = () => <LockerCabinetIcon size={33} />;
const LockerBiggestIcon = () => <LockerCabinetIcon size={38} />;

const CARDS_PER_PAGE = 4;

interface LockersPageProps {
  initialSearch?: string;
}

const LockersPage: React.FC<LockersPageProps> = ({ initialSearch }) => {
  // Use live data hook
  const liveData = useLiveLoadData();
  const [groupedData, setGroupedData] = useState<
    Record<string | number, Locker[]>
  >({});

  const [allCatalogue, setAllCatalogue] = useState<any[]>([]);
  const [lockerProductsMap, setLockerProductsMap] = useState<
    Record<string, any[]>
  >({});
  const [page, setPage] = useState<number>(1);
  const [lockerPages, setLockerPages] = useState<Record<string, number>>({});
  const [productsForLocker, setProductsForLocker] = useState<any[]>([]);
  const [productsDialogOpen, setProductsDialogOpen] = useState<boolean>(false);
  const [productsLockerLabel, setProductsLockerLabel] = useState<string>("");
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null
  );
  const [productSearch, setProductSearch] = useState<string>("");
  const [universalSearch, setUniversalSearch] = useState<string>(initialSearch ?? "");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLast, setEditLast] = useState<string>("");
  const [editNext, setEditNext] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  // show/hide expanded locker grid per master locker
  const [expandedMasters, setExpandedMasters] = useState<Record<string, boolean>>({});
  const toggleMasterExpanded = (mlockerId: string | number) =>
    setExpandedMasters((prev) => ({ ...prev, [mlockerId]: !prev[mlockerId] }));

  // Helper to normalize locker keys coming from API or liveData
  const normalizeLockerKey = (v: any) => {
    if (v === null || v === undefined) return "";
    if (typeof v === "number") return String(v);
    const s = String(v).trim();
    // If value includes digits, return only the digits (handles ADV00 prefixes)
    const m = s.match(/(\d+)/);
    return m ? m[0] : s;
  };

  const getProductsForLockerId = (lockerId: string | number) => {
    const k = normalizeLockerKey(lockerId);
    // direct match
    if (lockerProductsMap[k] && lockerProductsMap[k].length)
      return lockerProductsMap[k];
    // try matching by numeric value against keys
    const numeric = parseInt(k || "0", 10);
    const foundKey = Object.keys(lockerProductsMap).find((key) => {
      const keyNum = parseInt(normalizeLockerKey(key) || "0", 10);
      return !isNaN(keyNum) && keyNum === numeric;
    });
    if (foundKey) return lockerProductsMap[foundKey] || [];
    // fallback: scan raw catalogue entries for matching locker fields
    const numericTarget = parseInt(String(lockerId), 10);
    const matches = allCatalogue.filter((p: any) => {
      const cand =
        p.LockerId ??
        p.Locker_Id ??
        p.lockerId ??
        p.locker_Id ??
        p.Locker ??
        null;
      if (cand == null) return false;
      const candNum = parseInt(String(cand).replace(/\D/g, ""), 10);
      if (!isNaN(numericTarget) && !isNaN(candNum))
        return candNum === numericTarget;
      // fallback to string compare of normalized
      return normalizeLockerKey(cand) === normalizeLockerKey(lockerId);
    });
    return matches;
  };

  // Update groupedData whenever liveData changes
  useEffect(() => {
    if (!liveData) return;
    const arr = Array.isArray(liveData) ? liveData : [];
    const grouped = arr.reduce(
      (acc: { [x: string]: any[] }, item: { mlockerId: string | number }) => {
        if (!acc[item.mlockerId]) acc[item.mlockerId] = [];
        acc[item.mlockerId].push(item);
        return acc;
      },
      {}
    );
    setGroupedData(grouped);
  }, [liveData]);

  // Load catalogue and group by LockerId
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        console.log("LockersPage.tsx: fetching catalogue...");
        const data = await fetchCatalogue();
        console.log(
          "LockersPage.tsx: catalogue fetched, items:",
          Array.isArray(data) ? data.length : typeof data
        );
        if (!mounted) return;
        // group by LockerId (normalized)
        const grouped: Record<string, any[]> = {};
        (data || []).forEach((p: any) => {
          const raw =
            p.LockerId ??
            p.Locker_Id ??
            p.lockerId ??
            p.locker_Id ??
            p.Locker ??
            null;
          const lid = normalizeLockerKey(raw);
          if (!grouped[lid]) grouped[lid] = [];
          grouped[lid].push(p);
        });
        setAllCatalogue(Array.isArray(data) ? data : []);
        setLockerProductsMap(grouped);
      } catch (err) {
        console.error("Failed to load catalogue:", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Filtered and paged master lockers
  const filteredGroupedData = Object.entries(groupedData)
    .map(([mlockerId, lockers]) => {
      const searchQuery = universalSearch.toLowerCase().trim();
      
      // If no search query, show all
      if (!searchQuery) {
        return [mlockerId, lockers];
      }

      // Search across ALL products in catalogue to find matching products
      const matchingProductIds = new Set<string>();
      if (searchQuery) {
        allCatalogue.forEach((product: any) => {
          const fields = [
            product.ProductId || product.productId || product.id || "",
            product.ProductName || product.productName || product.name || "",
            product.SerialNumber || product.serialNumber || "",
            product.Category || product.category || "",
            product.Subcategory || product.subcategory || "",
          ];
          const matches = fields.some((field) => 
            String(field).toLowerCase().includes(searchQuery)
          );
          if (matches) {
            const pid = product.ProductId || product.productId || product.id || "";
            if (pid) matchingProductIds.add(String(pid));
          }
        });
      }

      const filteredLockers = lockers.filter((locker) => {
        // Search in locker IDs
        const lockerIdMatch = 
          `MADV${mlockerId}`.toLowerCase().includes(searchQuery) ||
          `ADV00${locker.locker_Id}`.toLowerCase().includes(searchQuery) ||
          mlockerId.toString().toLowerCase().includes(searchQuery) ||
          locker.locker_Id.toString().toLowerCase().includes(searchQuery);

        // Search in products for this locker - check if any product matches
        const lockerProducts = getProductsForLockerId(locker.locker_Id);
        const productMatch = lockerProducts.some((product: any) => {
          const fields = [
            product.ProductId || product.productId || product.id || "",
            product.ProductName || product.productName || product.name || "",
            product.SerialNumber || product.serialNumber || "",
            product.Category || product.category || "",
            product.Subcategory || product.subcategory || "",
          ];
          return fields.some((field) => 
            String(field).toLowerCase().includes(searchQuery)
          );
        });

        // Search in locker properties
        const lockerPropMatch = 
          (typeof locker.locker_size === "string" &&
            locker.locker_size.toLowerCase().includes(searchQuery)) ||
          (typeof locker.status === "string" &&
            locker.status.toLowerCase().includes(searchQuery)) ||
          ((locker as any).location && typeof (locker as any).location === "string" &&
            (locker as any).location.toLowerCase().includes(searchQuery)) ||
          ((locker as any).Location && typeof (locker as any).Location === "string" &&
            (locker as any).Location.toLowerCase().includes(searchQuery));

        return lockerIdMatch || productMatch || lockerPropMatch;
      });
      return filteredLockers.length > 0 ? [mlockerId, filteredLockers] : null;
    })
    .filter(Boolean) as [string | number, Locker[]][];

  // Pagination logic
  const totalPages = Math.ceil(filteredGroupedData.length / CARDS_PER_PAGE);
  const pagedData = filteredGroupedData.slice(
    (page - 1) * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE
  );

  // Locker pagination handlers
  const handleLockerPageChange = (
    mlockerId: string | number,
    newPage: number,
    total: number
  ) => {
    setLockerPages((prev) => ({
      ...prev,
      [mlockerId]: Math.max(1, Math.min(newPage, total)),
    }));
  };
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Products dialog filtered list derived from productSearch
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

  // Parse server date formats (ISO, numeric millis, and .NET /Date(...) form)
  const parseServerDate = (v: any): Date | null => {
    if (v == null) return null;
    if (v instanceof Date) return v;
    if (typeof v === "number") return new Date(v);
    if (typeof v === "string") {
      const s = v.trim();
      // Try native Date parse first (ISO-ish)
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d;
      // Match /Date(1234567890)/ (ASP.NET JSON)
      const m = s.match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
      if (m && m[1]) return new Date(Number(m[1]));
      // Last resort: find a long sequence of digits and treat as epoch millis
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
    // datetime-local expects "YYYY-MM-DDTHH:mm"
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  // Read calibration values from catalogue item using several possible keys
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

  // Write calibration values into an item using the common keys so local state matches server shape
  const setCaliOnItem = (
    item: any,
    last: string | null,
    next: string | null
  ) => {
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
      try {
        item[k] = last;
      } catch {}
    }
    for (const k of nextKeys) {
      try {
        item[k] = next;
      } catch {}
    }
    return item;
  };

  // Convert a datetime-local value (or other date string) into an ISO string
  // suitable for sending to the server; returns null when empty/invalid.
  const toIsoOrNull = (dateStr: string) => {
    // If empty, return null
    if (!dateStr) return null;
    try {
      // dateStr typically comes from an <input type="datetime-local" /> and
      // looks like "YYYY-MM-DDTHH:mm" (no timezone). Construct a Date from
      // it (treated as local time by the browser) and format a timestamp that
      // preserves the exact wall-clock date/time together with the local
      // timezone offset. This prevents accidental conversion to UTC which
      // changes the wall-clock time the user entered.
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      const pad = (n: number) => String(n).padStart(2, "0");
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      const sec = pad(d.getSeconds());

      // timezone offset in minutes (note: getTimezoneOffset returns minutes
      // *behind* UTC as negative values for positive offsets)
      const offsetMin = -d.getTimezoneOffset();
      const sign = offsetMin >= 0 ? "+" : "-";
      const absOff = Math.abs(offsetMin);
      const offH = pad(Math.floor(absOff / 60));
      const offM = pad(absOff % 60);

      // Return a local datetime string with offset, e.g. "2025-12-02T09:30:00+05:30"
      return `${yyyy}-${mm}-${dd}T${hh}:${min}:${sec}${sign}${offH}:${offM}`;
    } catch {
      return null;
    }
  };

  const LOCKER_SIZE_ID_MAP: Record<string, string> = { "1": "Micro", "2": "Mini", "3": "Medium", "4": "Big", "5": "Biggest" };

  const resolveLockerSize = (l: any): string => {
    const sizeRaw = String(
      l.locker_size ?? l.LockerSize ?? l.Locker_Size ?? l.locker_Size ?? l.locker_type ?? l.LockerType ?? l.size ?? ""
    ).toLowerCase().trim();
    if (sizeRaw.includes("biggest")) return "Biggest";
    if (sizeRaw.includes("medium")) return "Medium";
    if (sizeRaw.includes("micro")) return "Micro";
    if (sizeRaw.includes("mini")) return "Mini";
    if (sizeRaw === "big") return "Big";
    // Fall back to numeric ID lookup
    const idStr = String(
      l.locker_size_Id ?? l.LockerSizeId ?? l.locker_size_id ?? l.LockerSize_Id ?? ""
    ).trim();
    return LOCKER_SIZE_ID_MAP[idStr] ?? (LOCKER_SIZE_ID_MAP[sizeRaw] ?? "Other");
  };

  const computeMasterStats = (lockers: Locker[]) => {
    const totalLockers = lockers.length;
    let totalProducts = 0;
    const sizeCounts: Record<string, number> = { Micro: 0, Mini: 0, Medium: 0, Big: 0, Biggest: 0, Other: 0 };
    let emptyLockerCount = 0;

    for (const l of lockers) {
      const products = getProductsForLockerId(l.locker_Id);
      const pCount = Array.isArray(products) ? products.length : 0;
      totalProducts += pCount;
      if (pCount === 0) emptyLockerCount++;

      const sizeName = resolveLockerSize(l);
      if (sizeCounts[sizeName] !== undefined) sizeCounts[sizeName]++;
      else sizeCounts.Other++;
    }

    const loc = "INOXPA, Pune";

    return {
      totalLockers,
      totalProducts,
      sizeCounts,
      conditionCount: emptyLockerCount,
      location: loc,
    };
  };

  return (
    <>
      <div className="dt-root-x" style={{
        maxHeight: "calc(100vh - 80px)",
        overflowY: "auto",
        overflowX: "hidden",
      }}>
        <div className="dt-header-row-x">
          <div className="dt-title-x" style={{ fontFamily: "'Open Sans', Inter, Roboto, Arial, sans-serif", fontWeight: 700 }}>DexBox LIVE Lockers</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <SearchIcon style={{ color: "var(--muted)" }} />
            <InputBase
              placeholder="Search lockers (MADV1, MADV2...) or products (ID, name, serial...)"
              value={universalSearch}
              onChange={(e) => setUniversalSearch(e.target.value)}
              sx={{ 
                flex: 1,
                maxWidth: 400,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 4,
                padding: "4px 12px",
                "& input": {
                  color: "var(--text)",
                }
              }}
              inputProps={{ "aria-label": "universal-search" }}
            />
            {universalSearch && (
              <IconButton size="small" className="search-clear-btn" onClick={() => setUniversalSearch("")}>
                <CancelIcon sx={{ color: "inherit" }} />
              </IconButton>
            )}
          </div>
        </div>
        <div className="dt-card-row-x">
          {pagedData.length === 0 ? (
            <Card className="dt-master-card-x">
                  <CardContent
                className="dt-master-card-content-x"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  border: "2px solid var(--border)",
                   borderRadius: 8 
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "var(--muted)",
                    textAlign: "center",
                    fontStyle: "italic",
                    fontWeight: "bold",
                    width: "100%",
                  }}
                >
                  No master lockers found.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            pagedData.map(([mlockerId, lockers]) => {
              const stats = computeMasterStats(lockers);

              return (
                <Card className="dt-master-card-x" key={mlockerId} elevation={2} style={{ position: "relative" }}>
                  <div className="card-border-title">Master Locker MADV{mlockerId}</div>
                  <CardContent className="dt-master-card-content-x">
                    <div className="dt-master-title-row-x" style={{ marginBottom: 8 }}>
                      {typeof lockers[0]?.statusinfoM === "string" &&
                      lockers[0].statusinfoM.toLowerCase() === "ready" ? (
                        <CheckCircleIcon
                          className="dt-statusinfo-ready-x"
                          fontSize="medium"
                          titleAccess="Ready"
                          sx={{ color: '#22c55e' }}
                        />
                      ) : (
                        <ErrorIcon
                          className="dt-statusinfo-notready-x"
                          fontSize="medium"
                          titleAccess="Not Ready"
                          color="error"
                          sx={{ color: '#ff5252' }}
                        />
                      )}
                    </div>

                    {/* Metrics grid — responsive */}
                    <div className="dt-metrics-grid">
                      {/* Row 1 col 1 — Lockers */}
                      <div className="metric" style={{ display: "flex", alignItems: "center", gap: 7, gridColumn: 1, gridRow: 1 }}>
                        <ViewModuleIcon sx={{ fontSize: 24, color: "#60a5fa", flexShrink: 0 }} />
                        <div><div className="metric-label">Lockers</div><div className="metric-value">{stats.totalLockers}</div></div>
                      </div>

                      {/* Row 1 col 2 — Product Count */}
                      <div className="metric" style={{ display: "flex", alignItems: "center", gap: 7, gridColumn: 2, gridRow: 1 }}>
                        <ViewInArIcon sx={{ fontSize: 24, color: "#818cf8", flexShrink: 0 }} />
                        <div><div className="metric-label">Product Count</div><div className="metric-value">{stats.totalProducts}</div></div>
                      </div>

                      {/* Row 2 col 1 — Location (directly under Lockers) */}
                      <div className="metric" style={{ display: "flex", alignItems: "center", gap: 7, gridColumn: 1, gridRow: 2 }}>
                        <LocationOnIcon sx={{ fontSize: 24, color: "#60a5fa", flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div className="metric-label">Location</div>
                          <div className="metric-value" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>{stats.location}</div>
                        </div>
                      </div>

                      {/* Row 1 col 3 — Condition */}
                      <div className="metric" style={{ display: "flex", alignItems: "center", gap: 7, gridColumn: 3, gridRow: 1 }}>
                        <span style={{ color: stats.conditionCount > 0 ? "#fb923c" : "#4ade80", flexShrink: 0, lineHeight: 0 }}>
                          {stats.conditionCount > 0 ? <ConditionWarnIcon /> : <ConditionOkIcon />}
                        </span>
                        <div>
                          <div className="metric-label">Condition</div>
                          <div className="metric-value">
                            {stats.conditionCount > 0 ? stats.conditionCount : <CheckCircleIcon fontSize="small" sx={{ color: "#4ade80", verticalAlign: "middle" }} />}
                          </div>
                        </div>
                      </div>

                      {/* Row 1 cols 4–8 — Locker sizes (icon above label above count) */}
                      {([
                        { key: "Micro",   Icon: LockerMicroIcon,   color: "#4ade80", count: stats.sizeCounts.Micro,   col: 4 },
                        { key: "Mini",    Icon: LockerMiniIcon,    color: "#38bdf8", count: stats.sizeCounts.Mini,    col: 5 },
                        { key: "Medium",  Icon: LockerMediumIcon,  color: "#818cf8", count: stats.sizeCounts.Medium,  col: 6 },
                        { key: "Big",     Icon: LockerBigIcon,     color: "#e879f9", count: stats.sizeCounts.Big,     col: 7 },
                        { key: "Biggest", Icon: LockerBiggestIcon, color: "#f87171", count: stats.sizeCounts.Biggest, col: 8 },
                      ] as const).map(({ key, Icon, color, count, col }) => (
                        <div key={key} className="metric" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, gridColumn: col, gridRow: 1 }}>
                          <span style={{ color, lineHeight: 0 }}><Icon /></span>
                          <div className="metric-label" style={{ textAlign: "center" }}>{key}</div>
                          <div className="metric-value" style={{ textAlign: "center" }}>{count}</div>
                        </div>
                      ))}

                      {/* See more — row 1 col 9, spans both rows */}
                      <div style={{ gridColumn: 9, gridRow: "1 / 3", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                        <Button
                          variant="contained"
                          className="see-more-btn"
                          onClick={() => { window.location.href = `/master/MADV${mlockerId}`; }}
                          sx={{ borderRadius: 2, textTransform: "none", minWidth: 110, padding: "8px 16px" }}
                        >
                          See more
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        {totalPages > 1 && (
          <div className="dt-pagination-row-x">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
              size="large"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default LockersPage;
