import { useEffect, useState } from "react";

interface ApprovalRequestsPageProps {
  prefetchedData?: any[];
  initialFilter?: string;
}
import { Box, MenuItem, Select, InputLabel, FormControl, Checkbox, Menu, IconButton, ListItemText, TableSortLabel } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
} from "@mui/material";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { fetchRequestApprovals, postLockerOccupy } from "./APIService";
import "./App.css";

function ApprovalRequestsPage({ prefetchedData, initialFilter }: ApprovalRequestsPageProps) {
  type Request = {
    number: string;
    description: string;
    status: string;
    date: string;
    locker: string;
    productId: string;
    name: string;
    qtId?: number | null;
    appUserId?: string | number | null;
    requestedDuration?: string;
    requestedDurationRaw?: any;
    lockerId?: number | null;
    approved: boolean | null; // null = not acted, true = accepted, false = declined
  };

  const [requests, setRequests] = useState<Request[]>([]);
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Request | null>(null);

  // helper to parse/format dates coming from API
  const formatApiDate = (raw: any): string => {
    if (raw === null || raw === undefined) return "-";
    // handle MS JSON /Date(1234567890)/ form
    if (typeof raw === "string") {
      const msMatch = raw.match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
      if (msMatch) {
        return new Date(parseInt(msMatch[1], 10)).toLocaleString();
      }
      const parsed = Date.parse(raw);
      if (!isNaN(parsed)) return new Date(parsed).toLocaleString();
      return raw;
    }
    if (typeof raw === "number") {
      return new Date(raw).toLocaleString();
    }
    try {
      return new Date(raw).toLocaleString();
    } catch {
      return String(raw);
    }
  };

  // parse API date into a Date object (or null) - supports ISO, epoch millis and MS JSON /Date(...)/
  const parseApiDate = (raw: any): Date | null => {
    if (raw === null || raw === undefined) return null;
    try {
      if (raw instanceof Date) return raw;
      if (typeof raw === "number") return new Date(raw);
      if (typeof raw === "string") {
        const msMatch = raw.match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
        if (msMatch) return new Date(parseInt(msMatch[1], 10));
        const parsed = Date.parse(raw);
        if (!isNaN(parsed)) return new Date(parsed);
        return null;
      }
      return new Date(raw);
    } catch {
      return null;
    }
  };

  const [statusFilter, setStatusFilter] = useState<string>(initialFilter ?? "All");

  const [colVisibility, setColVisibility] = useState({ date: true, duration: true, productNumber: true, lockerNumber: true });
  const [colMenuAnchor, setColMenuAnchor] = useState<null | HTMLElement>(null);
  const toggleCol = (key: keyof typeof colVisibility) =>
    setColVisibility(prev => ({ ...prev, [key]: !prev[key] }));

  type SortField = "number" | "description" | "status" | "date" | "duration" | "productNumber" | "lockerNumber";
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Filtered requests by status
  const filteredRequests =
    statusFilter === "All"
      ? requests
      : requests.filter((r) => {
          const raw = (r.status ?? "").toString().trim().toLowerCase();
          const norm = raw.replace(/[^a-z0-9]/g, "");
          if (statusFilter === "Approved")
            return norm.startsWith("approved") || raw.startsWith("approved");
          if (statusFilter === "Declined")
            return norm.includes("declined") || raw.includes("declined");
          if (statusFilter === "Pending")
            return norm === "pending" || raw === "pending";
          if (statusFilter === "Return Init.")
            return (
              norm.includes("returninit") ||
              raw.includes("return init") ||
              raw.includes("returninit")
            );
          if (statusFilter === "Returned")
            return norm.includes("returned") || raw.includes("returned");
          return true;
        });

  const sortedRequests = sortField === null ? filteredRequests : [...filteredRequests].sort((a, b) => {
    let cmp = 0;
    if (sortField === "number")        cmp = (a.number ?? "").localeCompare(b.number ?? "");
    else if (sortField === "description") cmp = (a.description ?? "").localeCompare(b.description ?? "");
    else if (sortField === "status")   cmp = (a.status ?? "").localeCompare(b.status ?? "");
    else if (sortField === "date") {
      const da = parseApiDate(a.date)?.getTime() ?? 0;
      const db = parseApiDate(b.date)?.getTime() ?? 0;
      cmp = da - db;
    }
    else if (sortField === "duration") cmp = (a.requestedDuration ?? "").localeCompare(b.requestedDuration ?? "");
    else if (sortField === "productNumber") cmp = ((a.qtId ?? 0) as number) - ((b.qtId ?? 0) as number);
    else if (sortField === "lockerNumber")  cmp = (a.locker ?? "").localeCompare(b.locker ?? "");
    return sortDir === "asc" ? cmp : -cmp;
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = prefetchedData;

        // Only fetch from API if no prefetched data is available
        if (!data || !Array.isArray(data) || data.length === 0) {
          const userId = sessionStorage.getItem("userId") ?? "";
          data = await fetchRequestApprovals(userId);
        }
        console.log("fetchRequestApprovals (raw):", data);
        if (!mounted) return;
        setRawData(data);

        const mapped: Request[] = (Array.isArray(data) ? data : []).map(
          (r: any, idx: number) => {
            // API returns camelCase keys per your sample
            // Map server schema (supports PascalCase or camelCase)
            const requestNumber = r.RequestNumber ?? r.requestNumber ?? null;
            const requestDescription =
              r.RequestDescription ??
              r.requestDescription ??
              r.RequestDesc ??
              r.Request_Description ??
              r.request_desc ??
              r.Description ??
              "";
            const status = r.Status ?? r.status ?? "";
            const lockerNumber = r.LockerNumber ?? r.lockerNumber ?? null;
            const productId = r.ProductId ?? r.productId ?? "";
            const name = r.Name ?? r.name ?? "";
            const qtId = r.qtId ?? r.QtId ?? null;
            const appUserId =
              r.AppUserId ??
              r.appUserId ??
              r.AppUserID ??
              r.appUserID ??
              r.AppUser ??
              r.appUser ??
              null;

            // Date from API (DateTime) - this is treated as the request start time
            const rawDate = r.Date ?? r.date ?? null;
            const dateFormatted = formatApiDate(rawDate);

            // RequestedDuration is actually the requested end time (DateTime)
            const rawRequestedEnd =
              r.RequestedDuration ??
              r.requestedDuration ??
              r.RequestDuration ??
              null;
            let durationFormatted = "-";
            let requestedEndIso: string | null = null;
            if (rawRequestedEnd) {
              const requestedEndDate = parseApiDate(rawRequestedEnd);
              const requestStartDate = parseApiDate(rawDate) || new Date();
              if (requestedEndDate) {
                requestedEndIso = requestedEndDate.toISOString();
                const diffMs =
                  requestedEndDate.getTime() - requestStartDate.getTime();
                if (diffMs > 0) {
                  const total = Math.floor(diffMs / 1000);
                  const h = Math.floor(total / 3600);
                  const m = Math.floor((total % 3600) / 60);
                  const s = total % 60;
                  const out: string[] = [];
                  if (h) out.push(`${h}h`);
                  if (m) out.push(`${m}m`);
                  if (s && !h) out.push(`${s}s`);
                  durationFormatted = out.length ? out.join(" ") : "0s";
                } else {
                  durationFormatted = "Expired";
                }
              }
            }

            // suffix requirements:
            const numberWithSuffix =
              requestNumber != null ? `REQ${requestNumber}` : `REQrow-${idx}`;
            const lockerWithSuffix =
              lockerNumber != null ? `ADV00${lockerNumber}` : "";

            return {
              number: numberWithSuffix,
              description: requestDescription,
              status,
              date: dateFormatted,
              locker: lockerWithSuffix,
              productId,
              name,
              qtId,
              appUserId,
              requestedDuration: durationFormatted,
              requestedDurationRaw: requestedEndIso,
              lockerId: lockerNumber,
              approved: null,
            };
          }
        );

        console.log("fetchRequestApprovals (mapped):", mapped);
        console.log("mapped length:", mapped.length);
        setRequests(mapped);
      } catch (err) {
        console.error("ApprovalRequestsPage load error", err);
        setError("Failed to load requests (see console).");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const openDetails = (req: Request) => {
    setSelected(req);
    setOpen(true);
  };

  const closeDetails = () => {
    setOpen(false);
    setSelected(null);
  };

  const applyDecision = (decision: boolean) => {
    if (!selected) return;
    console.log("applyDecision called", { decision, selected });

    const doApply = async () => {
      const userId = sessionStorage.getItem("userId") ?? null;
      const lockerId = selected.lockerId ?? null;

      if (decision) {
        // build payload and call API immediately; update UI after server response
        try {
          const start = new Date();
          const startIso = start.toISOString();
          // ExtendTime is always 24 hours from now
          const extendTime = new Date(
            start.getTime() + 24 * 60 * 60 * 1000
          ).toISOString();
          // Determine PickUpTime from session (editable in the main App "Edit Min Return Time" dialog)
          const minReturnRaw = (
            sessionStorage.getItem("minReturnTime") || "24h"
          )
            .trim()
            .toLowerCase();
          let pickupMs = 24 * 60 * 60 * 1000; // fallback 24 hours
          try {
            const m = minReturnRaw.match(/^(\d+)\s*(d|h)?$/);
            if (m) {
              const val = parseInt(m[1], 10);
              const unit = m[2] || "h";
              if (unit === "d") pickupMs = val * 24 * 60 * 60 * 1000;
              else pickupMs = val * 60 * 60 * 1000;
            }
          } catch (e) {
            // ignore and use fallback
          }
          const pickUpTime = new Date(start.getTime() + pickupMs).toISOString();
          // Duration is always the requested end time (from requestedDurationRaw)
          const durationIso = selected.requestedDurationRaw || startIso;

          // build payload matching server SP parameters
          // Align payload property names with backend SP parameters
          const payload: any = {
            // API model expects these exact properties. Prefer AppUserID from the request when provided.
            Locker_Id: lockerId ?? 0,
            AppUserID: selected.appUserId ?? userId ?? "",
            StartTime: startIso,
            ExtendTime: extendTime,
            PickUpTime: pickUpTime,
            Duration: durationIso,
            Password: "",
            qtId: selected.qtId ?? 0,
            Status: "Approved-Pick Up Init.",
          };

          console.log("postLockerOccupy payload:", payload);
          const result = await postLockerOccupy(payload);
          console.log("postLockerOccupy result:", result);

          // update UI based on server result (treat >0 as success)
          const success = typeof result === "number" ? result > 0 : !!result;
          setRequests((prev) =>
            prev.map((r) =>
              r.number === selected.number ? { ...r, approved: success } : r
            )
          );
        } catch (err) {
          console.error("applyDecision (accept) error:", err);
          // mark as failed (declined) visually
          setRequests((prev) =>
            prev.map((r) =>
              r.number === selected.number ? { ...r, approved: false } : r
            )
          );
        }
      } else {
        // declined - no occupy call for now; mark declined
        setRequests((prev) =>
          prev.map((r) =>
            r.number === selected.number ? { ...r, approved: false } : r
          )
        );
      }

      closeDetails();
    };

    doApply();
  };

  const bgColor = 'var(--bg)';
  const paperBg = 'var(--card-bg)';
  const textColor = 'var(--text)';
  const cellPadding = "16px 20px";
  // larger cell padding for more readable table
  const largeCellPadding = "20px 24px";

  return (
    <Box className="page-shell"
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: bgColor,
        color: textColor,
        m: 0,
        p: 0,
        boxSizing: "border-box",
        position: "relative",
        paddingTop: 0,
        fontFamily: "'Open Sans', Inter, Roboto, 'Segoe UI', Arial, sans-serif",
        overflowX: "hidden",
        overflowY: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Box className="content-wrap" sx={{ width: "100%", maxWidth: "100%", px: { xs: 1, sm: 2 } }}>
      {/* Header with title, subtitle, and filter */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          px: 0,
          pt: 3,
          pb: 1,
          gap: 2,
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
        }}
      >
        <Box>
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: 800,
              letterSpacing: "-1px",
              color: "var(--text)",
              transition:
                "transform var(--motion-medium) var(--easing-smooth), box-shadow var(--motion-medium) var(--easing-smooth)",
              WebkitTransition:
                "transform var(--motion-medium) var(--easing-smooth), box-shadow var(--motion-medium) var(--easing-smooth)",
            }}
          >
            Approval Requests
          </h1>
          <div
            style={{
              margin: "6px 0 0 0",
              fontWeight: 400,
              color: "var(--muted)",
              fontSize: "1.1rem",
              fontStyle: "italic",
            }}
          >
            Review and manage item/locker approval requests below.
          </div>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControl
            size="small"
            sx={{ minWidth: 180, background: "var(--muted-bg)", borderRadius: 2 }}
          >
            <InputLabel id="status-filter-label">Filter by Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ fontWeight: 600 }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Declined">Declined</MenuItem>
              <MenuItem value="Return Init.">Return Init.</MenuItem>
              <MenuItem value="Returned">Returned</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Show/hide columns">
            <IconButton
              size="small"
              className="col-filter-btn"
              onClick={(e) => setColMenuAnchor(e.currentTarget)}
              sx={{
                border: "1px solid #b4d7ff",
                borderRadius: 1,
                p: 0.8,
                color: "#b4d7ff",
                "&:hover": { backgroundColor: "rgba(24,119,242,0.08)" },
              }}
            >
              <ViewColumnIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={colMenuAnchor}
            open={Boolean(colMenuAnchor)}
            onClose={() => setColMenuAnchor(null)}
            slotProps={{ paper: { className: "col-filter-menu", sx: { minWidth: 190, background: "var(--card-bg)", color: "var(--text)", border: "1px solid var(--border)" } } }}
          >
            {(
              [
                { key: "date",          label: "Date" },
                { key: "duration",      label: "Duration" },
                { key: "productNumber", label: "Product Number" },
                { key: "lockerNumber",  label: "Locker Number" },
              ] as { key: keyof typeof colVisibility; label: string }[]
            ).map(({ key, label }) => (
              <MenuItem key={key} onClick={() => toggleCol(key)} dense sx={{ gap: 0.5, color: "var(--text)", "&:hover": { background: "rgba(24,119,242,0.08)" } }}>
                <Checkbox checked={colVisibility[key]} size="small" sx={{ p: 0.5, color: "#b4d7ff" }} />
                <ListItemText primary={label} />
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          px: { xs: 1, sm: 2 },
          mt: 2,
          pb: 2,
          display: "block",
          margin: "0 auto",
          overflowX: "auto",
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            maxHeight: "calc(100vh - 260px)",
            boxSizing: "border-box",
            m: 0,
            borderRadius: 3,
            background: paperBg,
            overflowX: "auto",
            overflowY: "auto",
            p: 0,
            boxShadow: 'var(--card-shadow)',
            "&::-webkit-scrollbar": { width: "8px", height: "8px" },
            "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.1)", borderRadius: "4px" },
            "&::-webkit-scrollbar-thumb": { background: "rgba(167,139,250,0.4)", borderRadius: "4px" },
            "&::-webkit-scrollbar-thumb:hover": { background: "rgba(167,139,250,0.7)" },
          }}
        >
          {loading ? (
            <div style={{ padding: "24px 16px", color: textColor }}>
              Loading requests...
            </div>
          ) : error ? (
            <div style={{ padding: "24px 16px", color: "var(--danger)" }}>
              {error}
            </div>
          ) : requests.length === 0 ? (
            <Box
              sx={{
                p: 4,
                color: textColor,
                textAlign: "center",
                fontSize: "1.1rem",
              }}
            >
              No requests available.
              {rawData && (
                <pre
                    style={{
                    marginTop: 12,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    color: "var(--muted)",
                    maxHeight: 300,
                    overflow: "auto",
                    background: "var(--muted-bg)",
                    padding: 12,
                    borderRadius: 6,
                  }}
                >
                  {JSON.stringify(rawData, null, 2)}
                </pre>
              )}
            </Box>
          ) : filteredRequests.length === 0 ? (
            <Box
              sx={{
                p: 4,
                color: textColor,
                textAlign: "center",
                fontSize: "1.1rem",
              }}
            >
              No requests match the selected filter.
            </Box>
          ) : (
            <Table
              sx={{
                width: "100%",
                minWidth: "100%",
                tableLayout: "auto",
                fontSize: "1.22rem",
                wordBreak: "break-word",
                whiteSpace: "nowrap",
              }}
            >
                <TableHead sx={{
                  "& .MuiTableCell-root": {
                    position: "sticky",
                    top: 0,
                    zIndex: 4,
                    backgroundColor: "#1a1f2e",
                    backgroundImage: "none",
                    borderBottom: "2px solid rgba(167,139,250,0.3)",
                  }
                }}>
                <TableRow>
                  {([
                    { field: "number"      as SortField, label: "Request Number",      width: "12%" },
                    { field: "description" as SortField, label: "Request Description", width: "32%" },
                    { field: "status"      as SortField, label: "Status",              width: "10%" },
                  ]).map(col => (
                    <TableCell key={col.field} sx={{ padding: largeCellPadding, width: col.width }}>
                      <TableSortLabel
                        active={sortField === col.field}
                        direction={sortField === col.field ? sortDir : "asc"}
                        onClick={() => handleSort(col.field)}
                        sx={{ color: "inherit", "& .MuiTableSortLabel-icon": { color: "inherit !important" } }}
                      >
                        {col.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  {colVisibility.date && (
                    <TableCell sx={{ padding: largeCellPadding, width: "12%" }}>
                      <TableSortLabel active={sortField === "date"} direction={sortField === "date" ? sortDir : "asc"} onClick={() => handleSort("date")} sx={{ color: "inherit", "& .MuiTableSortLabel-icon": { color: "inherit !important" } }}>Date</TableSortLabel>
                    </TableCell>
                  )}
                  {colVisibility.duration && (
                    <TableCell sx={{ padding: largeCellPadding, width: "8%" }}>
                      <TableSortLabel active={sortField === "duration"} direction={sortField === "duration" ? sortDir : "asc"} onClick={() => handleSort("duration")} sx={{ color: "inherit", "& .MuiTableSortLabel-icon": { color: "inherit !important" } }}>Duration</TableSortLabel>
                    </TableCell>
                  )}
                  {colVisibility.productNumber && (
                    <TableCell sx={{ padding: largeCellPadding, width: "8%" }}>
                      <TableSortLabel active={sortField === "productNumber"} direction={sortField === "productNumber" ? sortDir : "asc"} onClick={() => handleSort("productNumber")} sx={{ color: "inherit", "& .MuiTableSortLabel-icon": { color: "inherit !important" } }}>Product Number</TableSortLabel>
                    </TableCell>
                  )}
                  {colVisibility.lockerNumber && (
                    <TableCell sx={{ padding: largeCellPadding, width: "10%" }}>
                      <TableSortLabel active={sortField === "lockerNumber"} direction={sortField === "lockerNumber" ? sortDir : "asc"} onClick={() => handleSort("lockerNumber")} sx={{ color: "inherit", "& .MuiTableSortLabel-icon": { color: "inherit !important" } }}>Locker Number</TableSortLabel>
                    </TableCell>
                  )}
                  <TableCell sx={{ padding: largeCellPadding, width: "8%", textAlign: "center" }}>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedRequests.map((req, i) => (
                  <TableRow
                    key={`${req.number}-${i}`}
                    sx={{
                      borderTop: `1px solid var(--border)`,
                      background: paperBg,
                      transition:
                        "transform var(--motion-medium) var(--easing-smooth), box-shadow var(--motion-medium) var(--easing-smooth)",
                      WebkitTransition:
                        "transform var(--motion-medium) var(--easing-smooth), box-shadow var(--motion-medium) var(--easing-smooth)",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 'var(--card-shadow)',
                        zIndex: 1,
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        padding: largeCellPadding,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: 700,
                        color: "var(--accent)",
                        fontSize: "1.12rem",
                      }}
                    >
                      {req.number}
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: largeCellPadding,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Tooltip title={req.description || ""} arrow>
                        <div
                          style={{
                            maxWidth: 720,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontStyle: "italic",
                          }}
                        >
                          {req.description}
                        </div>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ padding: largeCellPadding }}>
                      {(() => {
                        const s = (req.status ?? "").toString().toLowerCase();
                        if (s.startsWith("approved"))
                          return (
                            <Chip
                              label={req.status}
                              color="success"
                              sx={{ fontWeight: 700 }}
                            />
                          );
                        if (req.approved === false || s.includes("declined"))
                          return (
                            <Chip
                              label={req.status}
                              color="error"
                              sx={{ fontWeight: 700 }}
                            />
                          );
                        if (s === "pending")
                          return (
                            <Chip
                              label={req.status}
                              color="warning"
                              sx={{ fontWeight: 700 }}
                            />
                          );
                        return (
                          <Chip
                            label={req.status}
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        );
                      })()}
                    </TableCell>
                    {colVisibility.date          && <TableCell sx={{ padding: cellPadding }}>{req.date}</TableCell>}
                    {colVisibility.duration      && <TableCell sx={{ padding: cellPadding }}>{req.requestedDuration ?? "-"}</TableCell>}
                    {colVisibility.productNumber && <TableCell sx={{ padding: cellPadding }}>{req.qtId != null ? String(req.qtId) : "-"}</TableCell>}
                    {colVisibility.lockerNumber  && <TableCell sx={{ padding: cellPadding }}>{req.locker}</TableCell>}
                    <TableCell
                      sx={{
                        padding: cellPadding,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {req.approved === null ? (
                        // Show Approve button only when status is strictly "Pending"
                        (req.status ?? "").toString().trim() === "Pending" ? (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => openDetails(req)}
                            sx={{
                              backgroundColor: 'var(--accent)',
                              color: "var(--white)",
                              fontWeight: 700,
                              borderRadius: 2,
                              border: "2px solid rgba(255,255,255,0.6)",
                              boxShadow: 'var(--card-shadow)',
                              px: { xs: 1, sm: 1.5 },
                              py: { xs: 0.75, sm: 0.5 },
                              minWidth: { xs: "100%", sm: 72 },
                              fontSize: "0.95rem",
                              textTransform: "none",
                              whiteSpace: "nowrap",
                              boxSizing: "border-box",
                              "&:hover": { backgroundColor: "var(--accent)", border: "2px solid #fff" },
                            }}
                          >
                            Approve
                          </Button>
                        ) : // if not Pending and server says Approved, show Approved badge; otherwise show status text
                        (req.status ?? "")
                            .toString()
                            .toLowerCase()
                            .startsWith("approved") ? (
                            <span
                              style={{
                                color: "var(--success)",
                                fontWeight: 700,
                                fontSize: "1.05rem",
                              }}
                            >
                              Approved
                            </span>
                        ) : (
                          <span style={{ fontWeight: 600 }}>{req.status}</span>
                        )
                      ) : (
                        <span
                          style={{
                              color: req.approved ? "var(--success)" : "var(--danger)",
                              fontWeight: 700,
                              fontSize: "1.05rem",
                            }}
                        >
                          {req.approved ? "Approved" : "Declined"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Box>

      {/* Dialog - show request details, do NOT show appUserID / mEmailID / mUserID */}
      <Dialog
        open={open}
        onClose={closeDetails}
        slotProps={{
          paper: {
            style: {
            background: paperBg,
            color: textColor,
            minWidth: 340,
            borderRadius: 12,
            boxShadow: 'var(--card-shadow)',
          },
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.5px" }}
        >
          Request Details
        </DialogTitle>
        <DialogContent dividers sx={{ fontSize: "1.05rem" }}>
          {selected && (
            <div style={{ minWidth: 320 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>Request Number:</strong> {selected?.number}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Description:</strong>{" "}
                <span style={{ fontStyle: "italic" }}>
                  {selected?.description}
                </span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Status:</strong> {selected?.status}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Date:</strong> {selected?.date}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Locker Number:</strong> {selected?.locker}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>ProductId:</strong> {selected?.productId}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Requested Duration:</strong>{" "}
                {selected?.requestedDuration}
              </div>
              {selected?.qtId != null && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Product Number:</strong> {selected?.qtId}
                </div>
              )}
              <div style={{ marginBottom: 8 }}>
                <strong>Name:</strong> {selected?.name}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ gap: 1.5, p: 2 }}>
          <Button
            onClick={() => applyDecision(true)}
            color="success"
            variant="contained"
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            Accept
          </Button>
          <Button
            onClick={() => applyDecision(false)}
            color="error"
            variant="contained"
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            Decline
          </Button>
          <Button
            onClick={closeDetails}
            variant="outlined"
            sx={{ fontWeight: 600, px: 2.5, borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  </Box>
  );
}

export default ApprovalRequestsPage;
