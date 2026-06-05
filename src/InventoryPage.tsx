import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  TableSortLabel,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { fetchInventory, updateCatalogueCaliDates, type InventoryItem } from "./APIService";

interface InventoryPageProps {
  prefetchedData?: InventoryItem[];
  initialSearch?: string;
}

const HEADER_SX = {
  backgroundColor: "#000000",
  color: "#fff",
  fontWeight: 700,
  position: "sticky" as const,
  top: 0,
  zIndex: 10,
};

// ── Shared with Message.tsx ─────────────────────────────────────────────────
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

const toInputDate = (v: any): string => {
  const d = parseServerDate(v);
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toIsoOrNull = (dateStr: string): string | null => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const pad = (n: number) => String(n).padStart(2, "0");
    const offsetMin = -d.getTimezoneOffset();
    const sign = offsetMin >= 0 ? "+" : "-";
    const absOff = Math.abs(offsetMin);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${pad(Math.floor(absOff / 60))}:${pad(absOff % 60)}`;
  } catch {
    return null;
  }
};
// ────────────────────────────────────────────────────────────────────────────

export default function InventoryPage({ prefetchedData, initialSearch }: InventoryPageProps) {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch ?? "");

  // inline edit state — same as Message.tsx
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editLast, setEditLast] = useState<string>("");
  const [editNext, setEditNext] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [calibrationOverrides, setCalibrationOverrides] = useState<Record<string, { last: string | null; next: string | null }>>({});

  const [colVisibility, setColVisibility] = useState({ lastCalibration: true, nextCalibration: true, addCalibration: true, minReturnTime: true });

  // per-row min return time dialog state
  const [minReturnValues, setMinReturnValues] = useState<Record<string, string>>({});
  const [minReturnDialog, setMinReturnDialog] = useState<{ key: string; productId: string; productName: string } | null>(null);
  const [minReturnInput, setMinReturnInput] = useState("");
  const [minReturnError, setMinReturnError] = useState<string | null>(null);
  const [colMenuAnchor, setColMenuAnchor] = useState<null | HTMLElement>(null);
  const toggleCol = (key: keyof typeof colVisibility) =>
    setColVisibility(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        if (prefetchedData && Array.isArray(prefetchedData) && prefetchedData.length > 0) {
          setInventoryData(prefetchedData);
          setLoading(false);
          return;
        }
        const data = await fetchInventory();
        if (mounted) {
          setInventoryData(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load inventory data:", err);
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [prefetchedData]);

  type SortField = "productId" | "productName" | "serialNumber" | "lockerLocation" | "lockerId" | "quantity" | "category" | "subCategory" | "lastCalibration" | "nextCalibration";
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const q = searchTerm.trim().toLowerCase();
  const filteredData = q
    ? inventoryData.filter(row =>
        row.productName?.toLowerCase().includes(q) ||
        row.productId?.toLowerCase().includes(q) ||
        row.serialNumber?.toLowerCase().includes(q) ||
        row.category?.toLowerCase().includes(q) ||
        row.subCategory?.toLowerCase().includes(q) ||
        row.lockerId?.toLowerCase().includes(q)
      )
    : inventoryData;

  const sortedData = sortField
    ? [...filteredData].sort((a, b) => {
        let va: any = a[sortField];
        let vb: any = b[sortField];
        if (sortField === "lastCalibration" || sortField === "nextCalibration") {
          va = parseServerDate(va)?.getTime() ?? 0;
          vb = parseServerDate(vb)?.getTime() ?? 0;
          return sortDir === "asc" ? va - vb : vb - va;
        }
        if (sortField === "quantity") {
          return sortDir === "asc" ? (va ?? 0) - (vb ?? 0) : (vb ?? 0) - (va ?? 0);
        }
        const sa = String(va ?? "").toLowerCase();
        const sb = String(vb ?? "").toLowerCase();
        const cmp = sa.localeCompare(sb);
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filteredData;

  const rowKey = (row: InventoryItem) => `${row.productId}_${row.serialNumber}`;

  const openEdit = (row: InventoryItem) => {
    const key = rowKey(row);
    const override = calibrationOverrides[key];
    setEditingKey(key);
    setEditLast(toInputDate(override?.last ?? row.lastCalibration));
    setEditNext(toInputDate(override?.next ?? row.nextCalibration));
  };

  const handleSave = async (row: InventoryItem) => {
    if (!row.productId) return;
    setSavingEdit(true);
    const payload = {
      qtId: row.productId,
      CaliDateLast: toIsoOrNull(editLast),
      CaliDateUpcoming: toIsoOrNull(editNext),
    };
    try {
      await updateCatalogueCaliDates(payload as any);
      setCalibrationOverrides(prev => ({
        ...prev,
        [rowKey(row)]: { last: payload.CaliDateLast, next: payload.CaliDateUpcoming },
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setSavingEdit(false);
      setEditingKey(null);
    }
  };

  const displayDate = (raw: string | null | undefined, override: string | null | undefined): string => {
    const val = override ?? raw;
    const d = parseServerDate(val);
    return d ? d.toLocaleString() : "—";
  };

  return (
    <div style={{ padding: "24px" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Inventory</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 2, px: 1.5, py: 0.5 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter by name, serial, category…"
              style={{ background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 14, width: 240 }}
            />
            {searchTerm && (
              <button className="search-clear-btn" onClick={() => setSearchTerm("")} style={{ background: "transparent", backgroundImage: "none", border: "none", color: "#ffffff", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px", fontWeight: 700 }}>×</button>
            )}
          </Box>

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
            slotProps={{ paper: { className: "col-filter-menu", sx: { minWidth: 200, background: "var(--card-bg)", color: "var(--text)", border: "1px solid var(--border)" } } }}
          >
            {(
              [
                { key: "lastCalibration", label: "Last Calibration" },
                { key: "nextCalibration", label: "Next Calibration" },
                { key: "addCalibration",  label: "Add Calibration Date" },
                { key: "minReturnTime",   label: "Min Return Time" },
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

      {loading ? (
        <Typography>Loading inventory data...</Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxHeight: "calc(100vh - 200px)",
            overflow: "auto",
            "&::-webkit-scrollbar": { width: "8px", height: "8px" },
            "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.1)", borderRadius: "4px" },
            "&::-webkit-scrollbar-thumb": { background: "rgba(100,100,100,0.5)", borderRadius: "4px" },
          }}
        >
          <Table sx={{ width: "max-content", tableLayout: "fixed" }} aria-label="inventory table">
            <TableHead>
              <TableRow>
                {(
                  [
                    { field: "productId",       label: "Product ID",       width: 130,  visKey: null },
                    { field: "productName",      label: "Product Name",     width: 190,  visKey: null },
                    { field: "serialNumber",     label: "Serial No",        width: 300,  visKey: null },
                    { field: "lockerLocation",   label: "Locker Location",  width: 170,  visKey: null },
                    { field: "lockerId",         label: "Locker ID",        width: 90,   visKey: null },
                    { field: "quantity",         label: "Qty",              width: 70,   visKey: null },
                    { field: "category",         label: "Category",         width: 120,  visKey: null },
                    { field: "subCategory",      label: "Sub Category",     width: 140,  visKey: null },
                    { field: "lastCalibration",  label: "Last Calibration", width: 185,  visKey: "lastCalibration" },
                    { field: "nextCalibration",  label: "Next Calibration", width: 185,  visKey: "nextCalibration" },
                  ] as { field: SortField; label: string; width: number; visKey: keyof typeof colVisibility | null }[]
                ).filter(col => col.visKey === null || colVisibility[col.visKey]).map(col => (
                  <TableCell key={col.field} sx={{ ...HEADER_SX, width: col.width }}>
                    <TableSortLabel
                      active={sortField === col.field}
                      direction={sortField === col.field ? sortDir : "asc"}
                      onClick={() => handleSort(col.field)}
                      sx={{
                        color: "#fff !important",
                        "& .MuiTableSortLabel-icon": { color: "#fff !important", opacity: sortField === col.field ? 1 : 0.4 },
                        "&:hover": { color: "#fff !important" },
                        "&.Mui-active": { color: "#fff !important" },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                {colVisibility.addCalibration && <TableCell sx={{ ...HEADER_SX, width: 160 }}>Add Calibration Date</TableCell>}
                {colVisibility.minReturnTime && <TableCell sx={{ ...HEADER_SX, width: 140 }}>Min Return Time</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ padding: "32px" }}>
                    <Typography variant="body1" color="textSecondary">
                      {q ? `No results for "${searchTerm}"` : "No inventory data available"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row, index) => {
                  const key = rowKey(row);
                  const override = calibrationOverrides[key];
                  const isEditing = editingKey === key;

                  return (
                    <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 }, verticalAlign: "top" }}>
                      <TableCell sx={{ width: 130 }}>{row.productId}</TableCell>
                      <TableCell sx={{ width: 190 }}>{row.productName}</TableCell>
                      <TableCell sx={{ width: 300 }}>{row.serialNumber}</TableCell>
                      <TableCell sx={{ width: 170 }}>{row.lockerLocation}</TableCell>
                      <TableCell sx={{ width: 90 }}>
                        <Chip
                          label={row.lockerId}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(24,119,242,0.12)",
                            color: "#b4d7ff",
                            border: "1px solid rgba(24,119,242,0.35)",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            letterSpacing: "0.02em",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ width: 70 }}>{row.quantity}</TableCell>
                      <TableCell sx={{ width: 120 }}>{row.category}</TableCell>
                      <TableCell sx={{ width: 140 }}>{row.subCategory}</TableCell>

                      {/* Last Calibration — shows override if saved */}
                      {colVisibility.lastCalibration && (
                        <TableCell sx={{ width: 185 }}>
                          <Typography variant="body2" sx={{ color: override?.last ? "var(--accent)" : "inherit" }}>
                            {displayDate(row.lastCalibration, override?.last)}
                          </Typography>
                        </TableCell>
                      )}

                      {/* Next Calibration — shows override if saved */}
                      {colVisibility.nextCalibration && (
                        <TableCell sx={{ width: 185 }}>
                          <Typography variant="body2" sx={{ color: override?.next ? "var(--accent)" : "inherit" }}>
                            {displayDate(row.nextCalibration, override?.next)}
                          </Typography>
                        </TableCell>
                      )}

                      {/* Add Calibration Date — inline edit matching Message.tsx */}
                      {colVisibility.addCalibration && <TableCell sx={{ width: 160, py: 1.5 }}>
                        {isEditing ? (
                          // ── Edit mode — same layout as Message.tsx ──────────────
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <label style={{ fontWeight: 600, fontSize: 12, color: "var(--text)" }}>
                              Last Calibration
                            </label>
                            <input
                              type="datetime-local"
                              value={editLast}
                              onChange={e => setEditLast(e.target.value)}
                              style={{
                                width: "100%",
                                padding: 6,
                                borderRadius: 4,
                                border: "1px solid var(--border)",
                                background: "var(--card-bg)",
                                color: "var(--text)",
                                fontSize: 13,
                              }}
                            />
                            <label style={{ fontWeight: 600, fontSize: 12, color: "var(--text)" }}>
                              Next Calibration
                            </label>
                            <input
                              type="datetime-local"
                              value={editNext}
                              onChange={e => setEditNext(e.target.value)}
                              style={{
                                width: "100%",
                                padding: 6,
                                borderRadius: 4,
                                border: "1px solid var(--border)",
                                background: "var(--card-bg)",
                                color: "var(--text)",
                                fontSize: 13,
                              }}
                            />
                            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                              <Button size="small" disabled={savingEdit} onClick={() => handleSave(row)} className="inv-btn">Save</Button>
                              <Button size="small" disabled={savingEdit} onClick={() => setEditingKey(null)} className="inv-btn">Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          // ── View mode — Edit button ─────────────────────────────
                          <Button size="small" startIcon={<BuildIcon sx={{ fontSize: 14 }} />} onClick={() => openEdit(row)} className="inv-btn">Edit Dates</Button>
                        )}
                      </TableCell>}
                      {colVisibility.minReturnTime && (
                        <TableCell sx={{ width: 140, verticalAlign: "middle" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                            {minReturnValues[key] && (
                              <Typography variant="caption" sx={{ color: "var(--accent)", fontWeight: 600 }}>
                                {minReturnValues[key]}
                              </Typography>
                            )}
                            <Button size="small" className="inv-btn" onClick={() => { setMinReturnDialog({ key, productId: row.productId ?? "", productName: row.productName ?? "" }); setMinReturnInput(minReturnValues[key] ?? ""); setMinReturnError(null); }}>Edit</Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Per-row Min Return Time dialog */}
      <Dialog
        open={Boolean(minReturnDialog)}
        onClose={() => setMinReturnDialog(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              minWidth: { xs: "92vw", sm: 480 },
              maxWidth: { xs: "96vw", sm: 560 },
              width: "100%",
              padding: { xs: 1, sm: 2 },
              mx: { xs: 1, sm: "auto" },
            },
          },
        }}
      >
        <DialogTitle sx={{ pt: 1, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
          Edit Minimum Product Return Time
        </DialogTitle>
        <DialogContent sx={{ pt: 1, overflow: "visible" }}>
          {minReturnDialog && (
            <Typography variant="body2" sx={{ color: "var(--muted)", mb: 1.5 }}>
              {minReturnDialog.productName} ({minReturnDialog.productId})
            </Typography>
          )}
          <TextField
            label="Minimum return time (e.g. 48h or 2d)"
            value={minReturnInput}
            onChange={(e) => setMinReturnInput(e.target.value)}
            fullWidth
            error={!!minReturnError}
            helperText={minReturnError || "Enter number with unit d/h, e.g. 48h or 2d"}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mt: 0 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 }, gap: 1 }}>
          <Button className="inv-btn" onClick={() => setMinReturnDialog(null)}>Cancel</Button>
          <Button className="inv-btn"
            onClick={() => {
              const v = minReturnInput.trim().toLowerCase();
              if (!/^\d+\s*(d|h)?$/.test(v)) {
                setMinReturnError("Enter value like 48h or 2d");
                return;
              }
              if (minReturnDialog) {
                setMinReturnValues(prev => ({ ...prev, [minReturnDialog.key]: v }));
              }
              setMinReturnError(null);
              setMinReturnDialog(null);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
