import React, { useEffect, useState } from "react";
import "./App.css";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import {
  insertCategoryAndSubCategory,
  insertProduct,
  insertProductAndUpdateCatalogue,
  insertCataloguesBulk,
  fetchLoadData,
  fetchCategories,
  fetchSubCategories,
  fetchCategoriesWithIds,
  fetchSubCategoriesWithIds,
  fetchCatalogue,
} from "./APIService";

const initialCategories = ["Electronics", "Documents", "Jewelry"];
const initialSubcategoriesFlat: string[] = [
  "Laptop",
  "Mobile",
  "Tablet",
  "Passport",
  "License",
  "Certificate",
  "Ring",
  "Necklace",
  "Bracelet",
];

export default function AddItemPage() {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvSuccess, setCsvSuccess] = useState(false);
  const [csvProcessing, setCsvProcessing] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemNameForDialog, setNewItemNameForDialog] = useState("");
  const [newProductId, setNewProductId] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newSerialNumber, setNewSerialNumber] = useState("");
  const [newCategoryInDialog, setNewCategoryInDialog] = useState("");
  const [newSubcategoryInDialog, setNewSubcategoryInDialog] = useState("");
  const [newCategoryInDialogId, setNewCategoryInDialogId] = useState<
    string | number | ""
  >("");
  const [newSubcategoryInDialogId, setNewSubcategoryInDialogId] = useState<
    string | number | ""
  >("");
  const [lockers, setLockers] = useState<
    Array<{ id: string | number; label: string }>
  >([]);
  const [selectedLockerId, setSelectedLockerId] = useState<
    string | number | ""
  >("");

  // main-page locker (single dropdown for the Add Item form) and serial numbers
  const [selectedLockerMainId, setSelectedLockerMainId] = useState<
    number | string | null
  >(null);
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  // display names (one per serial / per quantity)
  const [displayNames, setDisplayNames] = useState<string[]>([]);

  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<string[]>(
    initialSubcategoriesFlat
  );
  const [categoriesList, setCategoriesList] = useState<
    Array<{ id: number | string; name: string }>
  >([]);
  const [subcategoriesList, setSubcategoriesList] = useState<
    Array<{ id: number | string; name: string }>
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | number | ""
  >("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    string | number | ""
  >("");
  const [categoryIdMap, setCategoryIdMap] = useState<{
    [name: string]: number | string | undefined;
  }>({});
  const [subcategoryIdMap, setSubcategoryIdMap] = useState<{
    [name: string]: number | string | undefined;
  }>({});

  const toNumericId = (v: unknown): number | null => {
    if (v == null) return null;
    if (typeof v === "number") return v;
    const s = String(v).trim();
    if (s === "") return null;
    const n = Number(s);
    return Number.isNaN(n) ? null : n;
  };
  const normalizeName = (s?: string) =>
    s == null ? "" : String(s).trim().toLowerCase();

  const getCategoryId = (name?: string): number | null => {
    if (!name) return null;
    const direct = categoryIdMap[name];
    if (direct !== undefined) return toNumericId(direct);
    const norm = normalizeName(name);
    // try normalized lookup
    const fromNorm = categoryIdMap[norm as unknown as string];
    if (fromNorm !== undefined) return toNumericId(fromNorm);
    // as last resort, search keys for a case-insensitive match
    for (const k of Object.keys(categoryIdMap)) {
      if (normalizeName(k) === norm) return toNumericId(categoryIdMap[k]);
    }
    return null;
  };

  const getSubcategoryId = (name?: string): number | null => {
    if (!name) return null;
    const direct = subcategoryIdMap[name];
    if (direct !== undefined) return toNumericId(direct);
    const norm = normalizeName(name);
    const fromNorm = subcategoryIdMap[norm as unknown as string];
    if (fromNorm !== undefined) return toNumericId(fromNorm);
    for (const k of Object.keys(subcategoryIdMap)) {
      if (normalizeName(k) === norm) return toNumericId(subcategoryIdMap[k]);
    }
    return null;
  };
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [itemsMap, setItemsMap] = useState<{
    [key: string]: Array<{ id?: string; name: string; serverId?: string }>;
  }>({});
  // selectedItemId now holds the ProductServerId (number when possible) for existing catalogue items,
  // or a deterministic `local:<encodedName>` string value for locally created items.
  const [selectedItemId, setSelectedItemId] = useState<string | number>("");
  // Explicit numeric server id extracted from the Item dropdown (always number or null)
  const [selectedItemServerId, setSelectedItemServerId] = useState<
    number | null
  >(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [catsRaw, subsRaw, catsWithIds, subsWithIds, catalogue] =
          await Promise.all([
            fetchCategories(),
            fetchSubCategories(),
            fetchCategoriesWithIds(),
            fetchSubCategoriesWithIds(),
            fetchCatalogue(),
          ]);

        const catsArr = Array.isArray(catsRaw)
          ? catsRaw
          : catsRaw && Array.isArray((catsRaw as any).categories)
          ? (catsRaw as any).categories
          : [];
        const subsArr = Array.isArray(subsRaw)
          ? subsRaw
          : subsRaw && Array.isArray((subsRaw as any).subcategories)
          ? (subsRaw as any).subcategories
          : [];

        const catMap: { [k: string]: number | string | undefined } = {};
        const subMap: { [k: string]: number | string | undefined } = {};

        const catsList: Array<{ id: number | string; name: string }> = [];
        for (const c of catsArr) {
          if (c == null) continue;
          if (typeof c === "string") catsList.push({ id: c, name: c });
          else
            catsList.push({
              id: c.id ?? c.CategoryId ?? c,
              name: c.name ?? c.Category ?? String(c),
            });
        }

        const subsList: Array<{ id: number | string; name: string }> = [];
        for (const s of subsArr) {
          if (s == null) continue;
          if (typeof s === "string") subsList.push({ id: s, name: s });
          else
            subsList.push({
              id: s.id ?? s.SubCategoryId ?? s,
              name: s.name ?? s.SubCategory ?? String(s),
            });
        }

        if (Array.isArray(catsWithIds)) {
          for (const c of catsWithIds) {
            const name = c
              ? (c as any).name ?? (c as any).Category ?? String(c)
              : null;
            const id = c ? (c as any).id ?? (c as any).CategoryId ?? c : null;
            if (name) {
              catMap[name] = id;
              catMap[String(name).trim().toLowerCase()] = id;
            }
          }
        }
        if (Array.isArray(subsWithIds)) {
          for (const s of subsWithIds) {
            const name = s
              ? (s as any).name ?? (s as any).SubCategory ?? String(s)
              : null;
            const id = s
              ? (s as any).id ?? (s as any).SubCategoryId ?? s
              : null;
            if (name) {
              subMap[name] = id;
              subMap[String(name).trim().toLowerCase()] = id;
            }
          }
        }

        const arr = Array.isArray(catalogue) ? catalogue : [];
        const tempItems: {
          [key: string]: Array<{
            id?: string;
            name: string;
            serverId?: string;
          }>;
        } = {};
        const seenServerIds: { [key: string]: Set<string> } = {};
        const normalize = (s?: string) =>
          s == null ? undefined : String(s).trim().toLowerCase();

        for (const entry of arr) {
          const cat = (entry?.Category ?? entry?.category ?? "") as string;
          const sub = (entry?.SubCategory ??
            entry?.subCategory ??
            entry?.Sub_Category ??
            "") as string;
          const name = (entry?.Name ??
            entry?.name ??
            entry?.ProductName ??
            "") as string;
          const rawProductId =
            entry?.ProductId ??
            entry?.productId ??
            entry?.productid ??
            entry?.qtId ??
            entry?.QtId ??
            entry?.id ??
            undefined;
          const productId =
            rawProductId != null ? String(rawProductId) : undefined;
          const rawServerId =
            entry?.ProductServerId ??
            entry?.productServerId ??
            entry?.productserverid ??
            entry?.ProductServerID ??
            entry?.serverId ??
            entry?.ServerId ??
            undefined;
          const serverId =
            rawServerId != null ? String(rawServerId) : undefined;

          if (!cat || !sub || !name || !productId || !serverId) continue;
          const key = `${cat}::${sub}`;
          if (!tempItems[key]) tempItems[key] = [];
          if (!seenServerIds[key]) seenServerIds[key] = new Set();
          const serverNorm = normalize(serverId)!;
          if (seenServerIds[key].has(serverNorm)) continue;
          seenServerIds[key].add(serverNorm);
          tempItems[key].push({ id: productId, name, serverId });
        }

        if (mounted) setItemsMap(tempItems);
        // Merge CategoryId/SubCategoryId found in catalogue entries into the
        // category/subcategory id maps so the selects use the ids that are
        // actually present on catalogue rows (GetCatalogueManager).
        for (const entry of arr) {
          try {
            const cat = (entry?.Category ?? entry?.category ?? "") as string;
            const sub = (entry?.SubCategory ??
              entry?.subCategory ??
              entry?.Sub_Category ??
              "") as string;
            // Try several common id field names that the backend might use.
            const catId =
              entry?.CategoryId ??
              entry?.Category_Id ??
              entry?.categoryId ??
              entry?.CategoryID ??
              null;
            const subId =
              entry?.SubCategoryId ??
              entry?.Sub_CategoryId ??
              entry?.SubCategory_Id ??
              entry?.subCategoryId ??
              entry?.SubCategoryID ??
              null;
            if (cat && catId != null) {
              catMap[cat] = catId;
              catMap[String(cat).trim().toLowerCase()] = catId;
            }
            if (sub && subId != null) {
              subMap[sub] = subId;
              subMap[String(sub).trim().toLowerCase()] = subId;
            }
          } catch {}
        }

        // Rebuild the categories/subcategories lists to prefer ids discovered
        // in the catalogue rows (coerce numeric ids to numbers when possible).
        const catsListFinal: Array<{ id: number | string; name: string }> = [];
        for (const n of catsList.map((c) => c.name)) {
          const rawId =
            catMap[n] ?? catMap[String(n).trim().toLowerCase()] ?? n;
          const parsed = toNumericId(rawId) ?? rawId;
          catsListFinal.push({ id: parsed, name: n });
        }
        const subsListFinal: Array<{ id: number | string; name: string }> = [];
        for (const n of subsList.map((s) => s.name)) {
          const rawId =
            subMap[n] ?? subMap[String(n).trim().toLowerCase()] ?? n;
          const parsed = toNumericId(rawId) ?? rawId;
          subsListFinal.push({ id: parsed, name: n });
        }
        if (mounted) {
          setCategoryIdMap(catMap);
          setSubcategoryIdMap(subMap);
          setCategoriesList(catsListFinal);
          setSubcategoriesList(subsListFinal);
        }
      } catch (err: unknown) {
        console.error(
          "Failed to load categories/subcategories or catalogue",
          err
        );
        const message = err instanceof Error ? err.message : String(err);
        if (mounted) setCategoriesError(message || "Unknown error");
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    })();
    // fetch lockers for the new item dialog
    (async () => {
      try {
        const ld = await fetchLoadData();
        if (!mounted) return;
        // Accept several possible shapes: array, { Lockers: [...] }, { data: [...] }, or object map
        const src = Array.isArray(ld)
          ? ld
          : ld?.LockerDetails ??
            ld?.lockerdetails ??
            ld?.lockerDetails ??
            ld?.Lockers ??
            ld?.lockers ??
            ld?.data ??
            (ld && typeof ld === "object" ? Object.values(ld) : []);
        const arr = Array.isArray(src) ? src : [];
        const lockersArr: Array<{ id: string | number; label: string }> = [];
        for (const entry of arr) {
          // Prefer the actual locker id fields returned by your GetLoadData shape
          // Common names: mlockerId, locker_Id, locker_size_Id, service (fallback)
          // Prefer the conventional locker id (locker_Id or lockerId) to show and send.
          const lockerIdVal =
            entry?.locker_Id ??
            entry?.lockerId ??
            entry?.mlockerId ??
            entry?.locker_size_Id ??
            entry?.LockerId ??
            entry?.Locker_Id ??
            entry?.Id ??
            entry?.id ??
            entry?.Locker ??
            entry?.service ??
            undefined;
          const id = lockerIdVal;
          if (id == null) continue;

          const labelBase =
            entry?.locker_size ??
            entry?.LockerSize ??
            entry?.lockerSize ??
            entry?.statusinfoM ??
            entry?.StatusInfoM ??
            entry?.statusinfo ??
            entry?.status ??
            entry?.Name ??
            entry?.LockerName ??
            entry?.name ??
            "";
          // Show a single bracket containing the LockerId: (LockerId-<id>)
          const label = labelBase
            ? `${labelBase} (Locker Number-${String(id)})`
            : `(Locker Number-${String(id)})`;
          lockersArr.push({ id, label });
        }
        if (mounted) setLockers(lockersArr);
        // set a sensible default for the main-page locker dropdown if none selected
        if (mounted && lockersArr.length && selectedLockerMainId == null) {
          const first = lockersArr[0];
          const parsed = toNumericId(first.id) ?? first.id;
          setSelectedLockerMainId(parsed);
        }
      } catch (err) {
        console.warn("fetchLoadData for lockers failed", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // keep serialNumbers array length in sync with quantity
  useEffect(() => {
    const q = Number(quantity) || 0;
    setSerialNumbers((prev) => {
      const next = [...prev];
      if (next.length < q) {
        while (next.length < q) next.push("");
      } else if (next.length > q) {
        next.splice(q);
      }
      return next;
    });
    setDisplayNames((prev) => {
      const next = [...prev];
      if (next.length < q) {
        while (next.length < q) next.push("");
      } else if (next.length > q) {
        next.splice(q);
      }
      return next;
    });
  }, [quantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      window.alert("Please enter a valid quantity (1 or greater). ");
      return;
    }
    // debug: show what id resolution yields for selected values
    // eslint-disable-next-line no-console
    console.debug(
      "handleSubmit - category, subcategory:",
      category,
      subcategory
    );
    // eslint-disable-next-line no-console
    console.debug(
      "handleSubmit - resolved CategoryId:",
      getCategoryId(category)
    );
    // eslint-disable-next-line no-console
    console.debug(
      "handleSubmit - resolved SubCategoryId:",
      getSubcategoryId(subcategory)
    );

    const rawCat =
      selectedCategoryId ??
      categoryIdMap[category] ??
      getCategoryId(category) ??
      null;
    const rawSub =
      selectedSubcategoryId ??
      subcategoryIdMap[subcategory] ??
      getSubcategoryId(subcategory) ??
      null;
    // Ensure we send integer ids only (or null). If the dropdown provided a
    // non-numeric id (GUID or string), we send null so backend receives an int or null.
    const payload = {
      category,
      subcategory,
      itemId: selectedItemId || itemName,
      // Use the dedicated numeric id state (preferred). Fall back to parsing
      // selectedItemId if needed.
      ProductServerId: selectedItemId || itemName,
      itemName,
      quantity,
      CategoryId: toNumericId(rawCat),
      SubCategoryId: toNumericId(rawSub),
      LockerId: toNumericId(selectedLockerMainId) ?? selectedLockerMainId,
      SerialNumbers: serialNumbers.slice(),
      DisplayNames: displayNames.slice(),
    };
    // eslint-disable-next-line no-console
    console.log("Add Item payload:", payload);

    // If there are serial numbers, build bulk items and post to backend
    (async () => {
      try {
        if (serialNumbers && serialNumbers.length > 0) {
          // Require the user to pick an existing catalogue item (with ProductServerId)
          // for bulk inserts so each record has a valid ProductServerId.
          if (
            !selectedItemId ||
            String(selectedItemId).trim() === "" ||
            String(selectedItemId).startsWith("local:")
          ) {
            window.alert(
              "Please select an item from the Item dropdown (existing catalogue item) so ProductServerId can be sent for each serial."
            );
            return;
          }
          // Ensure ProductServerId comes from the item dropdown; it must be set
          // (we earlier guarded against local: fallback). Compute a final server
          // id value that is never null: prefer numeric, otherwise use the raw
          // string value so the payload always contains the id the user chose.
          // Prefer the dedicated numeric id extracted from the dropdown.
          const finalServerId =
            selectedItemServerId ?? toNumericId(selectedItemId);
          if (finalServerId == null) {
            window.alert(
              "Selected item must be an existing catalogue item with a numeric ProductServerId."
            );
            return;
          }

          const itemsToSend: Array<any> = serialNumbers.map((sn, idx) => ({
            ProductServerId: finalServerId,
            SerialNumber: sn || null,
            Name: (displayNames && displayNames[idx]) || itemName || null,
            CategoryId: toNumericId(rawCat),
            SubCategoryId: toNumericId(rawSub),
            LockerId: toNumericId(selectedLockerMainId) ?? selectedLockerMainId,
          }));

          // debug: surface the selectedItemId and the compiled items
          // eslint-disable-next-line no-console
          console.debug(
            "insertCataloguesBulk - selectedItemId:",
            selectedItemId,
            "(type:",
            typeof selectedItemId,
            ")"
          );
          // eslint-disable-next-line no-console
          console.debug("insertCataloguesBulk - sending items:", itemsToSend);
          // Also show JSON that will be sent over the wire
          // eslint-disable-next-line no-console
          console.debug(
            "insertCataloguesBulk - JSON body:",
            JSON.stringify(itemsToSend)
          );

          const res = await insertCataloguesBulk(itemsToSend);
          // eslint-disable-next-line no-console
          console.debug("insertCataloguesBulk response:", res);
          if (res == null) {
            window.alert(
              "Failed to save catalogue items (bulk). Check console."
            );
            return;
          }
          // success
          setSubmitted(true);
          return;
        }

        // If no serial numbers, fallback to existing single-item create flow
        setSubmitted(true);
      } catch (err) {
        console.error("bulk insert error", err);
        window.alert("Error saving items. See console for details.");
      }
    })();
  };

  return (
    <div className="page-shell" style={{ minHeight: "calc(100vh - 72px)" }}>
      <div className="content-wrap panel" style={{ background: "var(--card-bg)", padding: "clamp(14px, 4vw, 40px)", borderRadius: 12, boxShadow: "var(--card-shadow)", minWidth: 0, maxWidth: "920px", width: "min(96vw, 920px)" }}>
        <div className="add-item-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 16 }}>
          <div>
            <h1 style={{ marginBottom: 8, fontFamily: "'Open Sans', Inter, Roboto, Arial, sans-serif", fontWeight: 700 }}>
              Add Item
            </h1>
            <h3 style={{ margin: 0, color: "var(--muted)", fontStyle: "italic" }}>
              Add a new item with category and subcategory
            </h3>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0, marginTop: 4 }}>
            <Button
              variant="contained"
              component="label"
              sx={{ minHeight: 40, px: 2, py: 0.8, background: "#b4d7ff !important", color: "#1a2744 !important", fontSize: 13, textTransform: "none", "&:hover": { background: "#b4d7ff !important" } }}
            >
              Upload Documents / CSV
              <input
                type="file"
                hidden
                multiple
                accept=".csv"
                onChange={async (e) => {
                  setCsvError(null);
                  setCsvSuccess(false);
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  const csvFile = Array.from(files).find((f) => f.name.toLowerCase().endsWith(".csv"));
                  if (!csvFile) { setCsvError("Only CSV files are allowed. Please download and use the CSV pattern template."); return; }
                  setCsvProcessing(true);
                  try {
                    const text = await csvFile.text();
                    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
                    if (lines.length < 2) { setCsvError("Incomplete CSV — file has no data rows."); setCsvProcessing(false); return; }
                    const REQUIRED_HEADERS = ["ProductServerId", "SerialNumber", "CategoryId", "SubCategoryId"];
                    const rawHeaders = lines[0].split(",").map((h) => h.trim());
                    const headerLower = rawHeaders.map((h) => h.toLowerCase());
                    const missing = REQUIRED_HEADERS.filter((rh) => !headerLower.includes(rh.toLowerCase()));
                    if (missing.length > 0) { setCsvError(`Incomplete CSV — missing required columns: ${missing.join(", ")}`); setCsvProcessing(false); return; }
                    const colIndex = (name: string) => rawHeaders.findIndex((h) => h.toLowerCase() === name.toLowerCase());
                    const idxProductServerId = colIndex("ProductServerId");
                    const idxSerialNumber    = colIndex("SerialNumber");
                    const idxName            = colIndex("Name");
                    const idxDisplayName     = colIndex("DisplayName");
                    const idxCategoryId      = colIndex("CategoryId");
                    const idxSubCategoryId   = colIndex("SubCategoryId");
                    const idxLockerId        = colIndex("LockerId");
                    const dataRows = lines.slice(1);
                    const items: any[] = [];
                    const rowErrors: string[] = [];
                    dataRows.forEach((line, i) => {
                      const cols = line.split(",").map((c) => c.trim());
                      const rowNum = i + 2;
                      const productServerId = cols[idxProductServerId] ?? "";
                      const serialNumber    = cols[idxSerialNumber] ?? "";
                      const name            = idxName >= 0 ? (cols[idxName] ?? "") : "";
                      const displayName     = idxDisplayName >= 0 ? (cols[idxDisplayName] ?? "") : "";
                      const itemName        = name || displayName;
                      const categoryId      = cols[idxCategoryId] ?? "";
                      const subCategoryId   = cols[idxSubCategoryId] ?? "";
                      const lockerId        = idxLockerId >= 0 ? (cols[idxLockerId] ?? "") : "";
                      
                      // Validate required fields
                      if (!productServerId) rowErrors.push(`Row ${rowNum}: ProductServerId is empty`);
                      if (!serialNumber)    rowErrors.push(`Row ${rowNum}: SerialNumber is empty`);
                      if (!categoryId)      rowErrors.push(`Row ${rowNum}: CategoryId is empty`);
                      if (!subCategoryId)   rowErrors.push(`Row ${rowNum}: SubCategoryId is empty`);
                      
                      const psid  = Number(productServerId);
                      const catId = Number(categoryId);
                      const subId = Number(subCategoryId);
                      
                      // Validate numeric values
                      if (productServerId && isNaN(psid))  rowErrors.push(`Row ${rowNum}: ProductServerId must be a number (got: "${productServerId}")`);
                      if (categoryId && isNaN(catId))      rowErrors.push(`Row ${rowNum}: CategoryId must be a number (got: "${categoryId}")`);
                      if (subCategoryId && isNaN(subId))   rowErrors.push(`Row ${rowNum}: SubCategoryId must be a number (got: "${subCategoryId}")`);
                      if (lockerId && isNaN(Number(lockerId))) rowErrors.push(`Row ${rowNum}: LockerId must be a number (got: "${lockerId}")`);
                      
                      // Only add if no errors for this row
                      const rowSpecificErrors = rowErrors.filter((err) => err.startsWith(`Row ${rowNum}`));
                      if (rowSpecificErrors.length === 0) {
                        items.push({
                          ProductServerId: psid,
                          SerialNumber: serialNumber || null,
                          Name: itemName || null,
                          CategoryId: isNaN(catId) ? null : catId,
                          SubCategoryId: isNaN(subId) ? null : subId,
                          LockerId: lockerId && !isNaN(Number(lockerId)) ? Number(lockerId) : null,
                        });
                      }
                    });
                    
                    if (rowErrors.length > 0) { 
                      const errorMsg = rowErrors[0] + (rowErrors.length > 1 ? ` (+${rowErrors.length - 1} more issues)` : "");
                      setCsvError("CSV validation failed — " + errorMsg); 
                      setCsvProcessing(false); 
                      // Log all errors to console for debugging
                      console.error("CSV validation errors:", rowErrors);
                      return; 
                    }
                    if (items.length === 0) { 
                      setCsvError("Incomplete CSV — no valid rows found."); 
                      setCsvProcessing(false); 
                      return; 
                    }
                    
                    // Log the payload before sending
                    console.log("CSV: Sending " + items.length + " items to server:", items);
                    
                    const res = await insertCataloguesBulk(items);
                    if (res == null) { 
                      setCsvError("CSV upload failed — server rejected the data. Check browser console for details."); 
                      setCsvProcessing(false); 
                      return; 
                    }
                    setCsvSuccess(true);
                    setTimeout(() => setCsvSuccess(false), 3000);
                  } catch (err) { console.error("CSV parse/upload error:", err); setCsvError("Failed to process CSV file."); } finally { setCsvProcessing(false); e.target.value = ""; }
                }}
              />
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                const header = "ProductServerId,SerialNumber,Name,CategoryId,SubCategoryId,LockerId";
                const sample = "1,SN-001,Digital Vernier Caliper,2,5,1";
                const csv = `${header}\n${sample}\n`;
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "add_items_template.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              sx={{ minHeight: 40, px: 2, py: 0.8, backgroundColor: "var(--accent)", color: "#fff", fontWeight: 700, fontSize: 13, border: "2px solid rgba(255,255,255,0.3)", "&:hover": { backgroundColor: "var(--accent)", opacity: 0.9 }, textTransform: "none" }}
            >
              Download CSV pattern
            </Button>
          </div>
        </div>

        {loadingCategories ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            Loading categories...
          </div>
        ) : categoriesError ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--danger)" }}>
            Failed to load categories: {categoriesError}
          </div>
        ) : (
          <form className="add-item-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 500,
                  fontStyle: "italic",
                }}
              >
                Category
              </label>
              <div className="add-item-field-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={String(selectedCategoryId ?? "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    const found = categoriesList.find(
                      (c) => String(c.id) === val
                    );
                    if (found) {
                      // coerce numeric ids to numbers, keep strings (GUIDs) as-is
                      const coerced = toNumericId(found.id) ?? found.id;
                      setSelectedCategoryId(coerced);
                      setCategory(found.name);
                    } else {
                      // fallback to value as name (string)
                      setSelectedCategoryId(val);
                      setCategory(val);
                    }
                    setSubcategory("");
                    setSelectedItemId("");
                    setItemName("");
                  }}
                  style={{
                    width: "70%",
                    padding: "8px",
                    height: 40,
                    boxSizing: "border-box",
                    marginTop: "4px",
                    borderRadius: "4px",
                    border: "1px solid var(--border)",
                    background: "var(--card-bg)",
                    color: "var(--text)",
                  }}
                  required
                >
                  <option value="">Select Category</option>
                  {categoriesList.map((cat) => (
                    <option key={String(cat.id)} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setShowNewCategoryDialog(true)}
                  sx={{ height: 40, minWidth: 140, alignSelf: "flex-start" }}
                >
                  New Category
                </Button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 500,
                  fontStyle: "italic",
                }}
              >
                Subcategory
              </label>
              <select
                value={String(selectedSubcategoryId ?? "")}
                onChange={(e) => {
                  const val = e.target.value;
                  const found = subcategoriesList.find(
                    (s) => String(s.id) === val
                  );
                  if (found) {
                    const coerced = toNumericId(found.id) ?? found.id;
                    setSelectedSubcategoryId(coerced);
                    setSubcategory(found.name);
                  } else {
                    setSelectedSubcategoryId(val);
                    setSubcategory(val);
                  }
                  setSelectedItemId("");
                  setItemName("");
                }}
                style={{
                  width: "70%",
                  padding: "8px",
                  height: 40,
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid var(--border)",
                  background: "var(--card-bg)",
                  color: "var(--text)",
                }}
                required
              >
                <option value="">Select Subcategory</option>
                {subcategoriesList.map((sub) => (
                  <option key={String(sub.id)} value={String(sub.id)}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 500,
                  fontStyle: "italic",
                }}
              >
                Item
              </label>
              <div className="add-item-field-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={String(selectedItemId || itemName)}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const val = e.target.value;
                    // Use selectedOptions[0].value to get the option's value, then
                    // coerce to number for the dedicated numeric state.
                    const opt =
                      e.target.selectedOptions && e.target.selectedOptions[0];
                    const raw = opt ? opt.value : val;
                    const numeric = toNumericId(raw);
                    setSelectedItemServerId(numeric ?? null);

                    // Still keep selectedItemId for human-readable fallback/legacy
                    const coercedVal = numeric != null ? numeric : val;
                    setSelectedItemId(coercedVal);

                    const key = `${category}::${subcategory}`;
                    const arr = itemsMap[key] || [];
                    const normalize = (s?: string) =>
                      s == null ? undefined : String(s).trim().toLowerCase();

                    // First try to match by ProductServerId (serverId)
                    const foundByServerId = arr.find(
                      (it) =>
                        it.serverId != null &&
                        normalize(String(it.serverId)) === normalize(val)
                    );
                    if (foundByServerId) {
                      setItemName(foundByServerId.name);
                      // preserve numeric ids as numbers when possible
                      const numId = toNumericId(foundByServerId.serverId);
                      setSelectedItemId(
                        numId ?? String(foundByServerId.serverId)
                      );
                      return;
                    }

                    // Support local-created items using deterministic local:<encodedName>
                    if (val.startsWith("local:")) {
                      try {
                        const decoded = decodeURIComponent(
                          val.slice("local:".length)
                        );
                        const foundByName = arr.find(
                          (it) => it.name === decoded
                        );
                        if (foundByName) {
                          setItemName(foundByName.name);
                          setSelectedItemId(
                            String(
                              foundByName.serverId ??
                                `local:${encodeURIComponent(foundByName.name)}`
                            )
                          );
                          return;
                        }
                      } catch {}
                    }

                    // Fallback: allow free-text/new local item name
                    setItemName(val);
                    setSelectedItemId(val);
                  }}
                  style={{
                    width: "70%",
                    padding: "8px",
                    height: 40,
                    boxSizing: "border-box",
                    marginTop: "4px",
                    borderRadius: "4px",
                    border: "1px solid var(--border)",
                    background: "var(--card-bg)",
                    color: "var(--text)",
                  }}
                  required
                  disabled={!category || !subcategory}
                >
                  <option value="">Select Item</option>
                  {category && subcategory
                    ? (itemsMap[`${category}::${subcategory}`] || []).map(
                        (it) => {
                          // option value is ProductServerId; display the ProductId string
                          const value =
                            it.serverId != null
                              ? String(it.serverId)
                              : `local:${encodeURIComponent(it.name)}`;
                          const label = it.id != null ? String(it.id) : it.name;
                          return (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          );
                        }
                      )
                    : null}
                </select>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    // initialize dialog category/subcategory id to current selection (or fallbacks)
                    const initCatId =
                      selectedCategoryId ||
                      (categoriesList[0] && categoriesList[0].id) ||
                      "";
                    const initSubId =
                      selectedSubcategoryId ||
                      (subcategoriesList[0] && subcategoriesList[0].id) ||
                      "";
                    setNewCategoryInDialogId(initCatId);
                    setNewSubcategoryInDialogId(initSubId);
                    // also initialize the human-readable name states so the dialog
                    // selection is reflected like the locker dropdown
                    setNewCategoryInDialog(
                      categoriesList.find(
                        (c) => String(c.id) === String(initCatId)
                      )?.name ?? ""
                    );
                    setNewSubcategoryInDialog(
                      subcategoriesList.find(
                        (s) => String(s.id) === String(initSubId)
                      )?.name ?? ""
                    );
                    setSelectedLockerId("");
                    setNewDisplayName("");
                    setNewSerialNumber("");
                    setShowNewItemDialog(true);
                  }}
                  sx={{ height: 40, minWidth: 140, alignSelf: "flex-start" }}
                >
                  New Item
                </Button>
              </div>
              <div>
                {selectedItemServerId == null ? (
                  <div
                    style={{
                      color: "var(--danger)",
                      fontSize: 12,
                      fontStyle: "italic",
                      marginTop: 8,
                    }}
                  >
                    Note: selected item has no numeric ProductServerId. Bulk
                    inserts will be blocked until an existing catalogue item
                    is chosen.
                  </div>
                ) : (
                  <div
                    style={{
                      color: "var(--info)",
                      fontSize: 12,
                      fontStyle: "italic",
                      marginTop: 8,
                    }}
                  >
                    ProductServerId: {selectedItemServerId}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 500,
                  fontStyle: "italic",
                }}
              >
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuantity(Number(e.target.value))
                }
                style={{
                  width: "70%",
                  padding: "8px",
                  height: 40,
                  boxSizing: "border-box",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid var(--border)",
                  background: "var(--card-bg)",
                  color: "var(--text)",
                }}
                required
              />
              {quantity <= 0 && (
                <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>
                  Quantity must be 1 or greater.
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 500,
                  fontStyle: "italic",
                }}
              >
                Locker (for these serial numbers)
              </label>
              <select
                value={String(selectedLockerMainId ?? "")}
                onChange={(e) => {
                  const val = e.target.value;
                  const found = lockers.find((l) => String(l.id) === val);
                  if (found) {
                    const coerced = toNumericId(found.id) ?? found.id;
                    setSelectedLockerMainId(coerced);
                  } else {
                    setSelectedLockerMainId(val || null);
                  }
                }}
                style={{
                  width: "70%",
                  padding: "8px",
                  height: 40,
                  boxSizing: "border-box",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid var(--border)",
                  background: "var(--card-bg)",
                  color: "var(--text)",
                }}
              >
                <option value="">(none)</option>
                {lockers.map((l) => (
                  <option key={String(l.id)} value={String(l.id)}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {serialNumbers && serialNumbers.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 500,
                    fontStyle: "italic",
                  }}
                >
                  Serial Numbers & Display Names
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  {serialNumbers.map((sn, idx) => (
                    <div
                      key={`row-sn-${idx}`}
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <input
                        placeholder={`Serial #${idx + 1}`}
                        value={sn}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const v = e.target.value;
                          setSerialNumbers((prev) => {
                            const next = [...prev];
                            next[idx] = v;
                            return next;
                          });
                        }}
                        style={{
                          width: "100%",
                          padding: "8px",
                          height: 40,
                          boxSizing: "border-box",
                          borderRadius: "4px",
                          border: "1px solid var(--border)",
                          background: "var(--card-bg)",
                          color: "var(--text)",
                        }}
                      />
                      <input
                        placeholder={`Display Name #${idx + 1}`}
                        value={displayNames[idx] ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const v = e.target.value;
                          setDisplayNames((prev) => {
                            const next = [...prev];
                            next[idx] = v;
                            return next;
                          });
                        }}
                        style={{
                          width: "100%",
                          padding: "8px",
                          height: 40,
                          boxSizing: "border-box",
                          borderRadius: "4px",
                          border: "1px solid var(--border)",
                          background: "var(--card-bg)",
                          color: "var(--text)",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => window.history.back()}
                sx={{ minHeight: 44, px: 3 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ minHeight: 44, px: 3 }}
                disabled={
                  !category ||
                  !subcategory ||
                  !itemName ||
                  quantity <= 0 ||
                  (serialNumbers &&
                    serialNumbers.length > 0 &&
                    selectedItemServerId == null)
                }
              >
                {serialNumbers && serialNumbers.length > 0
                  ? "Add Items (bulk)"
                  : "Add Item"}
              </Button>
            </div>

            {csvProcessing && (
              <div style={{ color: "var(--accent)", marginTop: 12, textAlign: "center", fontSize: 14 }}>
                Processing CSV...
              </div>
            )}
            {csvError && (
              <div style={{ color: "var(--danger, #ff5252)", marginTop: 12, padding: "10px 14px", background: "rgba(255,82,82,0.08)", borderRadius: 6, border: "1px solid rgba(255,82,82,0.3)", fontSize: 13 }}>
                ⚠ {csvError}
              </div>
            )}
            {csvSuccess && (
              <div style={{ color: "var(--success, #4caf50)", marginTop: 12, padding: "10px 14px", background: "rgba(76,175,80,0.08)", borderRadius: 6, border: "1px solid rgba(76,175,80,0.3)", fontSize: 13 }}>
                ✓ CSV uploaded successfully — all items added.
              </div>
            )}
            {submitted && (
              <div style={{ color: "var(--success)", marginTop: 16, textAlign: "center" }}>
                Item added successfully
              </div>
            )}
          </form>
        )}
      </div>

      <Dialog
        open={showNewCategoryDialog}
        onClose={() => setShowNewCategoryDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Product Category</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TextField
              label="Category"
              value={newCategoryName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewCategoryName(e.target.value)
              }
              fullWidth
            />
            <TextField
              label="SubCategory"
              value={newSubcategoryName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewSubcategoryName(e.target.value)
              }
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewCategoryDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              const cat = newCategoryName.trim();
              const sub = newSubcategoryName.trim();
              if (!cat) return;
              try {
                const res = await insertCategoryAndSubCategory({
                  Category: cat || null,
                  SubCategory: sub || null,
                });
                if (res == null || res === 0) {
                  window.alert(
                    "Failed to create category/subcategory on server."
                  );
                  return;
                }
                setCategories((prev) =>
                  prev.includes(cat) ? prev : [...prev, cat]
                );
                if (sub)
                  setSubcategories((prev) =>
                    prev.includes(sub) ? prev : [...prev, sub]
                  );
                setCategory(cat);
                if (sub) setSubcategory(sub);
                setNewCategoryName("");
                setNewSubcategoryName("");
                setShowNewCategoryDialog(false);
              } catch (err) {
                console.error("create category error", err);
                window.alert("Error creating category/subcategory.");
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showNewItemDialog}
        onClose={() => setShowNewItemDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Product</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                background: "var(--muted-bg)",
                border: "1px solid var(--warning)",
                padding: "8px 10px",
                borderRadius: 6,
                color: "var(--warning)",
                fontSize: 13,
              }}
            >
              Atleast one item needs to be added in the catalogue in order to
              initiate a new Product Id
            </div>
            <TextField
              label="ProductId"
              value={newProductId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewProductId(e.target.value)
              }
              helperText="Unique ProductId string (sent as @ProductId)"
              fullWidth
            />
            <TextField
              label="Product (Product)"
              value={newProductName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewProductName(e.target.value)
              }
              helperText="Product (sent as @Product)"
              fullWidth
            />
            <TextField
              label="Display Name (Name)"
              value={newDisplayName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewDisplayName(e.target.value)
              }
              helperText="Optional display name (sent as @Name)"
              fullWidth
            />
            {/* qtId removed per request */}
            <TextField
              label="SerialNumber"
              value={newSerialNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewSerialNumber(e.target.value)
              }
              helperText="Optional serial number"
              fullWidth
            />

                <div>
              <label>Category</label>
              <select
                value={String(newCategoryInDialogId ?? "")}
                onChange={(e) => {
                  const val = e.target.value;
                  const found = categoriesList.find(
                    (c) => String(c.id) === val
                  );
                  if (found) {
                    setNewCategoryInDialogId(toNumericId(found.id) ?? found.id);
                    setNewCategoryInDialog(found.name);
                  } else {
                    setNewCategoryInDialogId(toNumericId(val) ?? val);
                    setNewCategoryInDialog(val);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  height: 40,
                  boxSizing: "border-box",
                  marginTop: "4px",
                  background: "var(--card-bg)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                }}
              >
                <option value="">(none)</option>
                {categoriesList.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Subcategory</label>
              <select
                value={String(newSubcategoryInDialogId ?? "")}
                onChange={(e) => {
                  const val = e.target.value;
                  const found = subcategoriesList.find(
                    (s) => String(s.id) === val
                  );
                  if (found) {
                    setNewSubcategoryInDialogId(
                      toNumericId(found.id) ?? found.id
                    );
                    setNewSubcategoryInDialog(found.name);
                  } else {
                    setNewSubcategoryInDialogId(toNumericId(val) ?? val);
                    setNewSubcategoryInDialog(val);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  height: 40,
                  boxSizing: "border-box",
                  marginTop: "4px",
                  background: "var(--card-bg)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                }}
              >
                <option value="">(none)</option>
                {subcategoriesList.map((s) => (
                  <option key={String(s.id)} value={String(s.id)}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Locker</label>
              <select
                value={String(selectedLockerId ?? "")}
                onChange={(e) => setSelectedLockerId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  height: 40,
                  boxSizing: "border-box",
                  marginTop: "4px",
                  background: "var(--card-bg)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                }}
              >
                <option value="">(none)</option>
                {lockers.map((l) => (
                  <option key={String(l.id)} value={String(l.id)}>
                    {`${l.label} (${String(l.id)})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewItemDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              const pid = newProductId.trim();
              const pname = newProductName.trim();
              const display = newDisplayName.trim();
              if (!pid || !pname) {
                window.alert("Please provide both ProductId and Product Name.");
                return;
              }
              // choose final category/subcategory (fallbacks)
              const finalCategoryName = newCategoryInDialogId
                ? categoriesList.find(
                    (c) => String(c.id) === String(newCategoryInDialogId)
                  )?.name ?? String(newCategoryInDialogId)
                : newCategoryInDialog ||
                  category ||
                  (categoriesList[0] && categoriesList[0].name) ||
                  "Uncategorized";
              const finalSubcategoryName = newSubcategoryInDialogId
                ? subcategoriesList.find(
                    (s) => String(s.id) === String(newSubcategoryInDialogId)
                  )?.name ?? String(newSubcategoryInDialogId)
                : newSubcategoryInDialog ||
                  subcategory ||
                  (subcategoriesList[0] && subcategoriesList[0].name) ||
                  "Uncategorized";

              try {
                const rawFinalCategoryId =
                  newCategoryInDialogId ??
                  selectedCategoryId ??
                  categoryIdMap[finalCategoryName] ??
                  null;
                const rawFinalSubcategoryId =
                  newSubcategoryInDialogId ??
                  selectedSubcategoryId ??
                  subcategoryIdMap[finalSubcategoryName] ??
                  null;

                // Convert to integer ids only; if non-numeric use null so backend
                // receives an int or null value (matches your requirement).
                const finalCategoryIdInt = toNumericId(rawFinalCategoryId);
                const finalSubcategoryIdInt = toNumericId(
                  rawFinalSubcategoryId
                );

                const payload = {
                  ProductId: pid || null,
                  Product: pname || null,
                  Name: display || null,
                  SerialNumber: newSerialNumber || null,
                  CategoryId: finalCategoryIdInt,
                  SubCategoryId: finalSubcategoryIdInt,
                  LockerId: selectedLockerId ? Number(selectedLockerId) : null,
                  Category: finalCategoryName || null,
                  SubCategory: finalSubcategoryName || null,
                };

                // Strong debug: show exact payload and types before calling API
                // eslint-disable-next-line no-console
                console.debug("create payload (before API call):", payload, {
                  finalCategoryIdInt,
                  finalSubcategoryIdInt,
                  newCategoryInDialogId,
                  newSubcategoryInDialogId,
                  selectedCategoryId,
                  selectedSubcategoryId,
                });
                // debug: show resolved ids for new product create
                // eslint-disable-next-line no-console
                console.debug(
                  "create - finalCategory, finalSubcategory:",
                  finalCategoryName,
                  finalSubcategoryName
                );
                // eslint-disable-next-line no-console
                console.debug(
                  "create - resolved CategoryId:",
                  getCategoryId(finalCategoryName)
                );
                // eslint-disable-next-line no-console
                console.debug(
                  "create - resolved SubCategoryId:",
                  getSubcategoryId(finalSubcategoryName)
                );
                // eslint-disable-next-line no-console
                console.log("create payload:", payload);

                const res = await insertProductAndUpdateCatalogue(payload);
                // eslint-disable-next-line no-console
                console.debug("insertProductAndUpdateCatalogue response:", res);
                if (res == null || res === 0) {
                  console.warn(
                    "InsertProductAndUpdateCatalogue returned no rows; adding local fallback"
                  );
                }

                // update categories/subcategories lists and main form selection
                if (finalCategoryName) setCategory(finalCategoryName);
                if (finalSubcategoryName) setSubcategory(finalSubcategoryName);

                const key = `${finalCategoryName}::${finalSubcategoryName}`;
                const serverId = pid;
                const displayNameToUse = display || pname;
                setItemsMap((prev) => {
                  const prevArr = prev[key] ?? [];
                  const exists = prevArr.some(
                    (it) => it.serverId === serverId || it.id === pid
                  );
                  if (exists) return prev;
                  return {
                    ...prev,
                    [key]: [
                      ...prevArr,
                      { id: pid, name: displayNameToUse, serverId },
                    ],
                  };
                });
                setItemName(displayNameToUse);
                setSelectedItemId(serverId);
                // clear dialog fields
                setNewProductId("");
                setNewProductName("");
                setNewDisplayName("");
                setNewSerialNumber("");
                setSelectedLockerId("");
                setShowNewItemDialog(false);
              } catch (err) {
                console.error("create product error", err);
                window.alert("Error creating product on server.");
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
