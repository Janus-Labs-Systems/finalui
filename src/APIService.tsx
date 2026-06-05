import axios from "axios";

const API_BASE_URL =
  "https://dexbox-api-e6bzexe9ezdjgfh9.centralindia-01.azurewebsites.net/api";

// Notification type
interface Notification {
  locker_Id: number;
  impact: string;
  notifications: string;
}

// Interface for inventory data
export interface InventoryItem {
  productId: string;
  productName: string;
  serialNumber: string;
  lockerLocation: string;
  lockerId: string;
  quantity: number;
  category: string;
  subCategory: string;
  lastCalibration: string;
  nextCalibration: string;
  purchaseDate: string;
}

// Helper to get token from sessionStorage
function getSessionToken(): string | null {
  return sessionStorage.getItem("token");
}

export const fetchLoadData = async () => {
  const token = getSessionToken();
  console.log("fetchLoadData token:", token);
  try {
    const response = await axios.get(`${API_BASE_URL}/GetLoadData`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export async function loginApi(userId: string, password: string): Promise<any> {
  // Use axios to simplify handling of 204/no-content and to surface status
  try {
    console.log("loginApi: calling", API_BASE_URL + "/PostLoginData", {
      userId,
    });

    // Post a tolerant payload including several common field names the backend
    // might expect (UserID, AppUserId, userId) and for password (Password, password)
    // This helps when the backend naming changed or differs between environments.
    const payload = {
      // common variants
      userId,
      UserID: userId,
      AppUserId: userId,
      password,
      Password: password,
    };

    const resp = await axios.post(`${API_BASE_URL}/PostLoginData`, payload, {
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
    });

    // resp.status may be 204 (No Content) or 200 with JSON
    const status = resp.status;
    const data = resp.data;
    console.log("loginApi response status:", status, "data:", data);

    // If server returned JSON with token (check multiple possible property names), store it
    const tokenFromBody =
      data?.token ||
      data?.Token ||
      data?.access_token ||
      data?.AccessToken ||
      null;
    if (status === 200 && tokenFromBody) {
      sessionStorage.setItem("token", tokenFromBody);
      // If backend returns a canonical user id, prefer that; otherwise use supplied
      const returnedUser =
        data?.userId || data?.UserID || data?.AppUserId || userId;
      if (returnedUser) sessionStorage.setItem("userId", returnedUser);
      return { status, token: tokenFromBody, body: data };
    }

    // Handle 204 No Content — return status so caller can show message
    if (status === 204) {
      return { status, token: null, body: null };
    }

    // Other statuses: attempt to return body if present
    return {
      status,
      token: data && data.token ? data.token : null,
      body: data,
    };
  } catch (err) {
    console.error("loginApi error:", err);
    throw err;
  }
}

// New: fetch request approvals for the logged in user
export async function fetchRequestApprovals(userId: string): Promise<any[]> {
  const token = getSessionToken();
  try {
    const resp = await axios.get(`${API_BASE_URL}/GetRequestApproval`, {
      params: { UserID: userId },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    // Expecting server to return an array of objects like in your C# repo mapping
    return Array.isArray(resp.data) ? resp.data : [];
  } catch (err) {
    console.error("fetchRequestApprovals error:", err);
    return [];
  }
}

// Post locker occupy data when a locker is approved/occupied
export async function postLockerOccupy(data: any): Promise<number | null> {
  const token = getSessionToken();
  try {
    const resp = await axios.post(
      `${API_BASE_URL}/PostLockerOccupyData`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        validateStatus: () => true,
      },
    );
    // Expect the API to return a numeric result in the body or as JSON { result: n }
    if (resp && resp.data) {
      if (typeof resp.data === "number") return resp.data;
      if (resp.data.result != null) return resp.data.result;
    }
    return null;
  } catch (err) {
    console.error("postLockerOccupy error:", err);
    return null;
  }
}

// Clear locker occupy record when duration/extend time expires.
// NOTE: This assumes a backend endpoint exists at /ClearLockerOccupy that accepts { Locker_Id }
// If your API has a different endpoint or payload, update this function accordingly.
export async function clearLockerOccupy(lockerId: number): Promise<boolean> {
  const token = getSessionToken();
  try {
    const resp = await axios.post(
      `${API_BASE_URL}/ClearLockerOccupy`,
      { Locker_Id: lockerId },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        validateStatus: () => true,
      },
    );
    return resp.status >= 200 && resp.status < 300;
  } catch (err) {
    console.error("clearLockerOccupy error:", err);
    return false;
  }
}

// Update calibration dates for a catalogue item by qtId
export async function updateCatalogueCaliDates(data: {
  qtId: number | string;
  CaliDateLast?: string | null;
  CaliDateUpcoming?: string | null;
}): Promise<number | null> {
  const token = getSessionToken();
  try {
    const resp = await axios.post(
      `${API_BASE_URL}/UpdateCatalogueCaliDates`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        validateStatus: () => true,
      },
    );
    if (resp && resp.data) {
      // backend returns an int result or { Result: int }
      if (typeof resp.data === "number") return resp.data;
      if (resp.data.Result != null) return resp.data.Result;
      if (resp.data.result != null) return resp.data.result;
    }
    return null;
  } catch (err) {
    console.error("updateCatalogueCaliDates error:", err);
    return null;
  }
}

// Insert a category and optional subcategory. Matches backend SP InsertCategoryAndSubCategory
export async function insertCategoryAndSubCategory(data: {
  Category?: string | null;
  SubCategory?: string | null;
}): Promise<number | null> {
  const token = getSessionToken();
  try {
    const resp = await axios.post(
      `${API_BASE_URL}/CreateCategorySubCategory`,
      {
        Category: data.Category ?? null,
        SubCategory: data.SubCategory ?? null,
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        validateStatus: () => true,
      },
    );
    if (resp && resp.data) {
      if (typeof resp.data === "number") return resp.data;
      if (resp.data.Result != null) return resp.data.Result;
      if (resp.data.result != null) return resp.data.result;
      // Some APIs return scalar in property 'rows' or 'Rows'
      if (resp.data.rows != null) return resp.data.rows;
    }
    // If status is 200 and no data, treat as success with 1
    if (resp && resp.status >= 200 && resp.status < 300) return 1;
    return null;
  } catch (err) {
    console.error("insertCategoryAndSubCategory error:", err);
    return null;
  }
}

// Insert a new product. Matches backend SP InsertProductSP which expects
// @ProductId and @Product (product name).
export async function insertProduct(data: {
  ProductId?: string | null;
  Product?: string | null;
}): Promise<number | null> {
  const token = getSessionToken();
  try {
    const resp = await axios.post(`${API_BASE_URL}/PostProduct`, data, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      validateStatus: () => true,
    });
    if (resp && resp.data) {
      if (typeof resp.data === "number") return resp.data;
      if (resp.data.Result != null) return resp.data.Result;
      if (resp.data.result != null) return resp.data.result;
    }
    // If status is 200 and no data, treat as success with 1
    if (resp && resp.status >= 200 && resp.status < 300) return 1;
    return null;
  } catch (err) {
    console.error("insertProduct error:", err);
    return null;
  }
}

// Insert product and update catalogue in one call. Matches backend SP InsertProductAndUpdateCatalogueSP
export async function insertProductAndUpdateCatalogue(data: {
  ProductId?: string | null;
  Product?: string | null;
  qtId?: number | null;
  Name?: string | null;
  SerialNumber?: string | null;
  CategoryId?: number | string | null;
  SubCategoryId?: number | string | null;
  LockerId?: number | null;
  // optional string names if available
  Category?: string | null;
  SubCategory?: string | null;
}): Promise<number | null> {
  const token = getSessionToken();
  try {
    const resp = await axios.post(
      `${API_BASE_URL}/PostProductWithCatalogue`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        validateStatus: () => true,
      },
    );
    if (resp && resp.data) {
      if (typeof resp.data === "number") return resp.data;
      if (resp.data.Result != null) return resp.data.Result;
      if (resp.data.result != null) return resp.data.result;
    }
    if (resp && resp.status >= 200 && resp.status < 300) return 1;
    return null;
  } catch (err) {
    console.error("insertProductAndUpdateCatalogue error:", err);
    return null;
  }
}

// Custom hook to fetch load data every second
import { useEffect, useRef, useState } from "react";

export function useLiveLoadData() {
  const [data, setData] = useState<any>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const result = await fetchLoadData();
        // Normalize to array — API may wrap the list in a property
        const arr = Array.isArray(result)
          ? result
          : (result?.LockerDetails ??
            result?.lockerdetails ??
            result?.lockerDetails ??
            result?.Lockers ??
            result?.lockers ??
            result?.data ??
            (result && typeof result === "object"
              ? Object.values(result)
              : []));
        if (isMounted) setData(Array.isArray(arr) ? arr : []);
      } catch {
        // Optionally handle error
      }
    };

    fetchData();
    intervalRef.current = setInterval(fetchData, 1000);

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return data;
}

export async function fetchNotificationsFromApi(): Promise<Notification[]> {
  const token = getSessionToken();
  console.log("fetchNotificationsFromApi token:", token);
  const response = await fetch(`${API_BASE_URL}/GetNotifications`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// Alert shape returned by GetAlerts stored procedure
export type AlertRepo = {
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
};

// Fetch alerts from backend and normalize to AlertRepo[]
export async function fetchAlertsFromApi(): Promise<AlertRepo[]> {
  const token = getSessionToken();
  try {
    const resp = await fetch(`${API_BASE_URL}/GetAlerts`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    if (!Array.isArray(data)) return [];
    const safeNumber = (v: any) => {
      if (v == null) return 0;
      const n = Number(v);
      return Number.isNaN(n) ? 0 : n;
    };
    const safeString = (v: any) => (v == null ? "" : String(v));
    const safeBool = (v: any) => {
      if (v == null) return false;
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v !== 0;
      if (typeof v === "string") {
        const s = v.toLowerCase().trim();
        return s === "true" || s === "1" || s === "yes";
      }
      return false;
    };

    return data.map((it: any) => {
      const created = it.CreatedAt ?? it.createdAt ?? null;
      const resolved = it.ResolvedAt ?? it.resolvedAt ?? null;
      return {
        AlertId: safeNumber(it.AlertId ?? it.alertId ?? it.AlertID),
        qtId: safeNumber(it.qtId ?? it.QtId ?? it.qtID),
        AlertDescription: safeString(
          it.AlertDescription ?? it.alertDescription ?? it.Description,
        ),
        AppUserID: safeString(it.AppUserID ?? it.appUserID),
        MUserID: safeString(it.MUserID ?? it.mUserID),
        Severity: safeString(it.Severity ?? it.severity),
        IsResolved: safeBool(it.IsResolved ?? it.isResolved),
        CreatedAt: created == null ? null : String(created),
        ResolvedAt: resolved == null ? null : String(resolved),
        Name: safeString(it.Name ?? it.name),
        SerialNumber: safeString(it.SerialNumber ?? it.serialNumber),
      } as AlertRepo;
    });
  } catch (err) {
    console.error("fetchAlertsFromApi error:", err);
    return [];
  }
}

// Fetch the product catalogue which maps products to lockers
export async function fetchCatalogue(): Promise<any[]> {
  const token = getSessionToken();
  try {
    // Use the manager-specific endpoint name. It returns the same shape as GetCatalogue.
    console.log(
      "fetchCatalogue: calling",
      `${API_BASE_URL}/GetCatalogueManager`,
    );
    const resp = await axios.get(`${API_BASE_URL}/GetCatalogueManager`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    console.log("fetchCatalogue: response status", resp.status);
    if (resp && resp.data) return Array.isArray(resp.data) ? resp.data : [];
    // fallback to fetch in case axios returned unexpected shape
    console.warn(
      "fetchCatalogue: axios returned no data, attempting fetch fallback",
    );
    const fallback = await fetch(`${API_BASE_URL}/GetCatalogueManager`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!fallback.ok) {
      console.error(
        "fetchCatalogue fallback failed",
        fallback.status,
        fallback.statusText,
      );
      return [];
    }
    const j = await fallback.json();
    return Array.isArray(j) ? j : [];
  } catch (err) {
    console.error("fetchCatalogue error:", err);
    return [];
  }
}

// Fetch categories and subcategories for use in forms
export async function fetchCategoriesAndSubCategories(): Promise<{
  categories?: string[];
  subcategories?: { [key: string]: string[] };
}> {
  const token = getSessionToken();
  try {
    const resp = await axios.get(
      `${API_BASE_URL}/GetCategoriesAndSubCategories`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        validateStatus: () => true,
      },
    );
    if (resp && resp.data) {
      // Try to normalize several possible shapes
      const d = resp.data;
      // If server returns { Categories: [...], SubCategories: { ... } }
      if (d.Categories || d.categories || d.SubCategories || d.subcategories) {
        return {
          categories: d.Categories || d.categories || [],
          subcategories: d.SubCategories || d.subcategories || {},
        };
      }
      // If server returns an array of { Category, SubCategory[] }
      if (Array.isArray(d)) {
        const cats: string[] = [];
        const subs: { [k: string]: string[] } = {};
        for (const entry of d) {
          const cat = entry.Category || entry.category;
          const sarr =
            entry.SubCategory ||
            entry.SubCategories ||
            entry.subCategories ||
            entry.subcategories ||
            [];
          if (cat && !cats.includes(cat)) cats.push(cat);
          if (cat) subs[cat] = Array.isArray(sarr) ? sarr : [];
        }
        return { categories: cats, subcategories: subs };
      }
      // Fallback: try to interpret resp.data as the subcategory map
      if (typeof d === "object") {
        const keys = Object.keys(d || {});
        // if values are arrays, treat as map
        const maybeMap = keys.every((k) => Array.isArray(d[k]));
        if (maybeMap) {
          return { categories: keys, subcategories: d };
        }
      }
    }
    return { categories: [], subcategories: {} };
  } catch (err) {
    console.error("fetchCategoriesAndSubCategories error:", err);
    return { categories: [], subcategories: {} };
  }
}

// Fetch categories only (uses backend endpoint GetCategories)
export async function fetchCategories(): Promise<string[]> {
  const token = getSessionToken();
  try {
    const resp = await axios.get(`${API_BASE_URL}/GetCategories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      validateStatus: () => true,
    });
    if (resp && resp.data) {
      const d = resp.data;
      if (Array.isArray(d)) {
        // array of strings or objects
        if (d.length === 0) return [];
        if (typeof d[0] === "string") return d as string[];
        // objects: try to pick common keys safely
        return d
          .map((it: unknown) => {
            if (typeof it === "string") return it;
            if (typeof it === "object" && it !== null) {
              const obj = it as Record<string, unknown>;
              const v = obj["Category"] ?? obj["Name"] ?? obj["category"];
              if (typeof v === "string") return v;
            }
            try {
              return JSON.stringify(it);
            } catch {
              return undefined;
            }
          })
          .filter(Boolean) as string[];
      }
    }
    return [];
  } catch (err) {
    console.error("fetchCategories error:", err);
    return [];
  }
}

// Fetch subcategories only (uses backend endpoint GetSubCategories)
export async function fetchSubCategories(): Promise<string[]> {
  const token = getSessionToken();
  try {
    const resp = await axios.get(`${API_BASE_URL}/GetSubCategories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      validateStatus: () => true,
    });
    if (resp && resp.data && Array.isArray(resp.data)) {
      const d = resp.data;
      if (d.length === 0) return [];
      if (typeof d[0] === "string") return d as string[];
      return d
        .map((it: any) => {
          if (typeof it === "string") return it;
          if (typeof it === "object" && it !== null) {
            return (
              it.SubCategory ??
              it.Name ??
              it.subCategory ??
              it.subcategory ??
              String(it.SubCategoryId ?? it.Id ?? it.id ?? "")
            );
          }
          return String(it);
        })
        .filter(Boolean) as string[];
    }
    return [];
  } catch (err) {
    console.error("fetchSubCategories error:", err);
    return [];
  }
}

// Fetch categories preserving ids when server returns objects like { CategoryId, Category }
export async function fetchCategoriesWithIds(): Promise<
  Array<{ id: number | string; name: string }>
> {
  const token = getSessionToken();
  try {
    const resp = await axios.get(`${API_BASE_URL}/GetCategories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      validateStatus: () => true,
    });
    if (resp && resp.data && Array.isArray(resp.data)) {
      const d = resp.data;
      return d.map((it: any) => {
        if (typeof it === "string") return { id: it, name: it };
        const id = it.CategoryId ?? it.Id ?? it.id ?? it.ID ?? null;
        const name = it.Category ?? it.Name ?? it.category ?? String(id ?? "");
        return { id: id ?? name, name };
      });
    }
    return [];
  } catch (err) {
    console.error("fetchCategoriesWithIds error:", err);
    return [];
  }
}

// Fetch subcategories preserving ids when server returns objects like { SubCategoryId, SubCategory }
export async function fetchSubCategoriesWithIds(): Promise<
  Array<{ id: number | string; name: string }>
> {
  const token = getSessionToken();
  try {
    const resp = await axios.get(`${API_BASE_URL}/GetSubCategories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      validateStatus: () => true,
    });
    if (resp && resp.data && Array.isArray(resp.data)) {
      const d = resp.data;
      return d.map((it: any) => {
        if (typeof it === "string") return { id: it, name: it };
        const id = it.SubCategoryId ?? it.Id ?? it.id ?? it.ID ?? null;
        const name =
          it.SubCategory ??
          it.Name ??
          it.subCategory ??
          it.subcategory ??
          String(id ?? "");
        return { id: id ?? name, name };
      });
    }
    return [];
  } catch (err) {
    console.error("fetchSubCategoriesWithIds error:", err);
    return [];
  }
}

// Insert multiple catalogue items in bulk. Matches backend method InsertCataloguesBulk
export async function insertCataloguesBulk(
  items: Array<any>,
): Promise<number[] | null> {
  const token = getSessionToken();
  try {
    // Transform items to match backend expectations
    // The backend may expect different field names, so normalize them
    const transformedItems = items.map((item) => {
      // Create a normalized object that handles multiple possible field name conventions
      const normalized: any = {};

      // Send ProductServerId only — that is the field the backend expects
      const productServerId =
        item.ProductServerId ??
        item.productServerId ??
        item.qtId ??
        item.ProductId ??
        item.productId ??
        null;
      if (productServerId != null) normalized.ProductServerId = productServerId;

      // SerialNumber
      const serialNumber = item.SerialNumber ?? item.serialNumber ?? null;
      if (serialNumber != null) normalized.SerialNumber = serialNumber;

      // Name/Product
      const name =
        item.Name ?? item.name ?? item.Product ?? item.product ?? null;
      if (name != null) normalized.Name = name;

      // CategoryId
      const categoryId =
        item.CategoryId ?? item.categoryId ?? item.Category_Id ?? null;
      if (categoryId != null) normalized.CategoryId = categoryId;

      // SubCategoryId
      const subCategoryId =
        item.SubCategoryId ?? item.subCategoryId ?? item.SubCategory_Id ?? null;
      if (subCategoryId != null) normalized.SubCategoryId = subCategoryId;

      // LockerId
      const lockerId = item.LockerId ?? item.lockerId ?? item.Locker_Id ?? null;
      if (lockerId != null) normalized.LockerId = lockerId;

      // DisplayName (if present in CSV)
      const displayName = item.DisplayName ?? item.displayName ?? null;
      if (displayName != null) normalized.DisplayName = displayName;

      return normalized;
    });

    // Log the exact JSON body we're about to send for easier debugging
    try {
      // eslint-disable-next-line no-console
      console.debug(
        "insertCataloguesBulk - original items:",
        JSON.stringify(items),
      );
      // eslint-disable-next-line no-console
      console.debug(
        "insertCataloguesBulk - transformed items:",
        JSON.stringify(transformedItems),
      );
    } catch {}

    const body = JSON.stringify(transformedItems);
    // eslint-disable-next-line no-console
    console.debug("insertCataloguesBulk - fetch body:", body);

    try {
      const fetchResp = await fetch(`${API_BASE_URL}/PostCataloguesBulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
      });

      const text = await fetchResp.text();
      // eslint-disable-next-line no-console
      console.debug(
        "insertCataloguesBulk - fetch response status:",
        fetchResp.status,
      );
      // eslint-disable-next-line no-console
      console.debug("insertCataloguesBulk - fetch response text:", text);

      // Log response details for debugging 500 errors
      if (fetchResp.status >= 400) {
        // eslint-disable-next-line no-console
        console.error("insertCataloguesBulk - server error response:", {
          status: fetchResp.status,
          statusText: fetchResp.statusText,
          body: text,
          requestBody: body,
        });
      }

      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (data) {
        if (Array.isArray(data)) return data as number[];
        if (data.Result && Array.isArray(data.Result)) return data.Result;
        if (data.result && Array.isArray(data.result)) return data.result;
      }

      if (fetchResp && fetchResp.ok) return [];
      return null;
    } catch (err) {
      console.error("insertCataloguesBulk fetch error:", err);
      return null;
    }
  } catch (err) {
    console.error("insertCataloguesBulk error:", err);
    return null;
  }
}

// AddAppUser - insert a new application user. Matches backend InsertAppUserSP
export async function addAppUser(data: {
  AppUserId: string;
  Password?: string | null;
  UserName?: string | null;
  EmailID?: string | null;
  Phone?: number | null;
  MEmailId?: string | null;
  MUserID?: string | null;
}): Promise<number | null> {
  const token = getSessionToken();
  try {
    const resp = await axios.post(`${API_BASE_URL}/AddAppUser`, data, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      validateStatus: () => true,
    });
    if (resp && resp.data != null) {
      // server may return scalar int or object with Result/result
      if (typeof resp.data === "number") return resp.data;
      if (resp.data.Result != null) return resp.data.Result;
      if (resp.data.result != null) return resp.data.result;
    }
    if (resp && resp.status >= 200 && resp.status < 300) return 1;
    return null;
  } catch (err) {
    console.error("addAppUser error:", err);
    return null;
  }
}

// Fetch all application users
export async function fetchAppUsers(): Promise<any[]> {
  const token = getSessionToken();
  // Use the session-stored username as the manager id payload
  const sessionUser = sessionStorage.getItem("userId") || "";
  const mUserId = sessionUser;

  // Primary: call the server's GET endpoint which expects a query param `mUserId`
  const getUrl = `${API_BASE_URL}/GetAppUserForManager`;
  try {
    console.debug("fetchAppUsers: calling GET", getUrl, {
      mUserId,
      tokenPresent: !!token,
    });
    const resp = await axios.get(getUrl, {
      // controller expects query param named `mUserId`
      params: { mUserId: sessionUser },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      validateStatus: () => true,
    });

    console.debug("fetchAppUsers: GET response", {
      url: getUrl,
      status: resp.status,
      data: resp.data,
    });
    if (
      resp &&
      resp.status >= 200 &&
      resp.status < 300 &&
      resp.data &&
      Array.isArray(resp.data)
    ) {
      return resp.data;
    }
    if (resp && resp.status === 204) return [];
  } catch (err) {
    console.warn("fetchAppUsers: GET failed", err);
  }

  // Fallback: older POST-based endpoint
  const postUrl = `${API_BASE_URL}/GetAppuserformamanger`;
  try {
    console.debug("fetchAppUsers: falling back to POST", postUrl, {
      mUserId,
      tokenPresent: !!token,
    });
    const resp = await axios.post(
      postUrl,
      // include both common property names so server receives manager id regardless of casing
      { MUserID: sessionUser, mUserId: sessionUser },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        validateStatus: () => true,
      },
    );
    console.debug("fetchAppUsers: POST fallback response", {
      url: postUrl,
      status: resp.status,
      data: resp.data,
    });
    if (
      resp &&
      resp.status >= 200 &&
      resp.status < 300 &&
      resp.data &&
      Array.isArray(resp.data)
    )
      return resp.data;
    if (resp && resp.status === 204) return [];
  } catch (err) {
    console.error("fetchAppUsers fallback POST failed:", err);
  }

  console.error(
    "fetchAppUsers: no data returned from GetAppUserForManager or fallback endpoints",
  );
  return [];
}

// Fetch inventory data from GetCatalogueManager endpoint
export async function fetchInventory(): Promise<InventoryItem[]> {
  const token = getSessionToken();
  try {
    // Fetch all inventory data from GetCatalogueManager endpoint
    const resp = await axios.get(`${API_BASE_URL}/GetCatalogueManager`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = Array.isArray(resp.data) ? resp.data : [];

    // Helper to get calibration value with multiple possible field names
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
        "lastCalibration",
        "lastcalibration",
      ];
      const nextKeys = [
        "CaliDateUpcoming",
        "Cali_DateUpcoming",
        "CaliDate_Upcoming",
        "caliDateUpcoming",
        "NextCalibration",
        "NextCali",
        "CaliUpcoming",
        "nextCalibration",
        "nextcalibration",
      ];
      const keys = which === "last" ? lastKeys : nextKeys;

      // First try exact matches
      for (const k of keys) {
        if (item[k] !== undefined && item[k] !== null) return item[k];
      }

      // If no exact match, try to find any key containing the keyword
      const keyword = which === "last" ? "last" : "next";
      for (const key of Object.keys(item)) {
        if (
          key.toLowerCase().includes(keyword) &&
          key.toLowerCase().includes("cali") &&
          item[key] !== undefined &&
          item[key] !== null &&
          item[key] !== ""
        ) {
          return item[key];
        }
      }

      return null;
    };

    // Helper to get subcategory with multiple possible field names
    const getSubcategory = (item: any) => {
      if (!item) return "N/A";
      const keys = [
        "Subcategory",
        "Sub_Category",
        "SubCategory",
        "subcategory",
        "sub_category",
        "subCategory",
      ];

      // First try exact matches
      for (const k of keys) {
        if (item[k] !== undefined && item[k] !== null && item[k] !== "")
          return item[k];
      }

      // If no exact match, try to find any key containing "sub"
      for (const key of Object.keys(item)) {
        if (
          key.toLowerCase().includes("sub") &&
          key.toLowerCase().includes("cat") &&
          item[key] !== undefined &&
          item[key] !== null &&
          item[key] !== ""
        ) {
          return item[key];
        }
      }

      return "N/A";
    };

    // Normalize locker key helper
    const normalizeLockerKey = (raw: any): string => {
      if (!raw) return "";
      const str = String(raw);
      const num = str.replace(/\D/g, "");
      return num || str;
    };

    const records: InventoryItem[] = [];

    // Process data from GetCatalogueManager endpoint
    data.forEach((item: any) => {
      const lastCal = getCaliValue(item, "last");
      const nextCal = getCaliValue(item, "upcoming");
      const subCat = getSubcategory(item);
      const lockerId = normalizeLockerKey(
        item.LockerId ||
          item.lockerId ||
          item.Locker_Id ||
          item.locker_Id ||
          "",
      );
      const location = item.Location || item.location || "INOXPA, Pune";

      records.push({
        productId: item.ProductId || item.productId || item.id || "N/A",
        productName: item.ProductName || item.productName || item.name || "N/A",
        serialNumber: item.SerialNumber || item.serialNumber || "N/A",
        lockerLocation: location,
        lockerId: lockerId,
        quantity: item.Quantity || item.quantity || 1,
        category: item.Category || item.category || "N/A",
        subCategory: subCat,
        lastCalibration: lastCal || "N/A",
        nextCalibration: nextCal || "N/A",
        purchaseDate: item.PurchaseDate || item.purchaseDate || "N/A",
      });
    });

    return records;
  } catch (err) {
    console.error("fetchInventory error:", err);
    return [];
  }
}
