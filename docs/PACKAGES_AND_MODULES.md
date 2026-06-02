# DexBox Admin UI — Packages, Modules & Technology Stack

> **Project:** AdvLockerUiMain3  
> **Application:** DexBox Admin — Smart Locker Management Dashboard  
> **Document:** Dependency Reference Guide

---

## Table of Contents

1. [Core Version Summary](#1-core-version-summary)
2. [Runtime Dependencies](#2-runtime-dependencies)
   - [React](#21-react--v1910)
   - [React DOM](#22-react-dom--v1910)
   - [MUI Material](#23-mui-material--v731)
   - [MUI Icons Material](#24-mui-icons-material--v731)
   - [Emotion React](#25-emotionreact--v11140)
   - [Emotion Styled](#26-emotionstyle--v11141)
   - [Axios](#27-axios--v1110)
   - [React Router DOM](#28-react-router-dom--v7151)
   - [React Tabulator](#29-react-tabulator--v0210)
   - [Tabulator Tables](#210-tabulator-tables--v631)
3. [Dev Dependencies](#3-dev-dependencies)
   - [Vite](#31-vite--v704)
   - [Vite Plugin React](#32-vitejsplugin-react--v460)
   - [TypeScript](#33-typescript--v583)
   - [Type Definitions](#34-type-definitions)
   - [ESLint & Plugins](#35-eslint--plugins)
4. [NPM Scripts](#4-npm-scripts)
5. [TypeScript Configuration](#5-typescript-configuration)
6. [Complete Dependency Map](#6-complete-dependency-map)
7. [Packages Not Used & Why](#7-packages-not-used--why)
8. [MUI Components Reference](#8-mui-components-reference)
9. [MUI Icons Reference](#9-mui-icons-reference)

---

## 1. Core Version Summary

| Technology | Version | Role |
|---|---|---|
| **React** | `19.1.0` | Core UI library |
| **React DOM** | `19.1.0` | Browser DOM renderer |
| **TypeScript** | `5.8.3` | Static type checking |
| **Vite** | `7.0.4` | Build tool & dev server |
| **MUI Material** | `7.3.1` | UI component library |
| **MUI Icons** | `7.3.1` | SVG icon set |
| **Emotion React** | `11.14.0` | CSS-in-JS engine |
| **Node Module Type** | `"module"` | ES Module system |
| **JSX Transform** | `react-jsx` | No manual React import needed |
| **JS Target** | `ES2022` | Modern browser output |

---

## 2. Runtime Dependencies

> Packages shipped to the browser in the final build.

---

### 2.1 `react` — v19.1.0

**Category:** Core Framework

**What it is:**  
The core React library. Contains the component model, all hooks, the Virtual DOM reconciler, and the React event system.

**Why used:**  
Foundation of the entire application. Every `.tsx` component file depends on React.

**React 19 Features Available:**

| Feature | Status in Project |
|---|---|
| Automatic Batching of state updates | ✅ Active (all `setState` calls are batched) |
| Concurrent Rendering | ✅ Active via `createRoot` |
| React Compiler | ⬜ Not yet enabled |
| `useOptimistic` hook | ⬜ Not yet used |
| Actions API | ⬜ Not yet used |
| Improved Server Components | ⬜ Not applicable (CSR only) |

**Used in every component:**
```tsx
import React, { useState, useEffect, useRef } from "react";
```

---

### 2.2 `react-dom` — v19.1.0

**Category:** Core Framework

**What it is:**  
The DOM-specific renderer for React. Bridges React's Virtual DOM to the actual browser DOM.

**Why used:**  
Required to mount the React application into the HTML page.

```tsx
// src/main.tsx
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Also provides:** `createPortal` — used internally by MUI for `Dialog`, `Drawer`, `Popper`, and `Menu` components to render outside the normal DOM tree.

---

### 2.3 `@mui/material` — v7.3.1

**Category:** UI Component Library

**What it is:**  
Material UI — a comprehensive React component library implementing Google's Material Design specification.

**Why used:**  
Provides production-ready, accessible, and themeable UI components so no custom primitives need to be built from scratch. Every interactive element in the app uses an MUI component.

**The `sx` Prop:**  
MUI's shorthand for CSS-in-JS with responsive breakpoint support:
```tsx
<Box
  sx={{
    display: "flex",
    gap: 2,                      // → 16px (2 × MUI spacing unit of 8px)
    p: { xs: 1, sm: 2 },         // → 8px on mobile, 16px on sm+
    color: "var(--text)",        // → CSS custom property
    backgroundColor: "#1a1f2e",
  }}
/>
```

**Components Used in This Project:**

| Component | Used In | Purpose |
|---|---|---|
| `Box` | All pages | Flexible layout container with `sx` prop |
| `Button` | All pages | Styled click actions |
| `Card` / `CardContent` | AddUser, AddItem | Panel containers |
| `TextField` | Login, AddUser, Dialogs | Controlled text input with floating label |
| `Typography` | All pages | Consistent text rendering |
| `Table` | Inventory, Approvals | Data table root |
| `TableHead` | Inventory, Approvals | Column header section |
| `TableBody` | Inventory, Approvals | Row data section |
| `TableRow` | Inventory, Approvals | Single table row |
| `TableCell` | Inventory, Approvals | Individual cell (header or data) |
| `TableSortLabel` | Inventory, Approvals | Sortable header with directional arrow |
| `TableContainer` | Inventory, Approvals | Scrollable table wrapper |
| `Paper` | Table containers | Elevated card background |
| `Chip` | Inventory (Locker ID), Approvals (Status) | Tag / badge pill |
| `Dialog` | Approvals, EditReturnTime, MinReturnTime | Modal popup |
| `DialogTitle` | All dialogs | Dialog heading |
| `DialogContent` | All dialogs | Dialog body |
| `DialogActions` | All dialogs | Dialog button row |
| `Drawer` | Sidebar (mobile) | Slide-in navigation panel |
| `Menu` | Column filter, Avatar menu | Dropdown menu |
| `MenuItem` | All menus | Individual menu option |
| `Checkbox` | Column visibility filter | Boolean toggle |
| `ListItemText` | Filter menu | Text label inside menu item |
| `Select` | Approvals status filter | Dropdown select input |
| `InputLabel` | Approvals filter | Floating label for Select |
| `FormControl` | Approvals filter | Wraps Select + Label |
| `Avatar` | Sidebar, TopBar | Circular initial avatar |
| `IconButton` | TopBar, filters, Sidebar | Clickable icon wrapper |
| `Tooltip` | Icons, table descriptions | Hover hint text |
| `Badge` | Notifications bell, Approvals | Count bubble on icon |
| `Popover` | Alerts & Notifications panel | Anchored floating popup |
| `Popper` | Search results dropdown | Lightweight anchor-relative float |
| `Divider` | Sidebar, Alerts panel | Horizontal separator |
| `List` | Sidebar navigation | Semantic list container |
| `ListItem` | Sidebar nav items | Individual list entry |
| `ListItemButton` | Sidebar nav items | Clickable list entry |
| `ListItemIcon` | Sidebar nav items | Icon slot inside list entry |
| `Switch` | Dark mode toggle | On/off toggle input |
| `Pagination` | LockersPage | Page number navigation |
| `Fade` | Search Popper | Fade-in/out transition |

---

### 2.4 `@mui/icons-material` — v7.3.1

**Category:** Icon Library

**What it is:**  
2,000+ Material Design SVG icons packaged as individual React components.

**Why used:**  
Provides scalable vector icons that respect MUI's `sx` styling, render crisp at any size, and maintain visual consistency throughout the application.

**Icons Used in This Project:**

| Import | Icon | Used In |
|---|---|---|
| `Dashboard` | ⊟ | Sidebar — Dashboard nav item |
| `Lock` | 🔒 | Sidebar — Lockers nav item |
| `Inventory` | 📦 | Sidebar — Inventory nav item |
| `CheckCircle` | ✅ | Sidebar — Approvals nav item |
| `Settings` | ⚙️ | Sidebar — Settings expandable |
| `AddBox` | ➕ | Sidebar — Add Item sub-item |
| `PersonAdd` | 👤 | Sidebar — Add User sub-item |
| `AccessTime` | ⏱ | Sidebar — Edit Min Pickup Time |
| `Logout` | ↩ | Sidebar — Logout button |
| `Close` | ✕ | Sidebar — Mobile close button |
| `Menu` | ☰ | TopBar — Mobile hamburger |
| `Search` | 🔍 | TopBar — Search bar icon |
| `Notifications` | 🔔 | TopBar — Alerts bell |
| `AssignmentTurnedIn` | 📋 | TopBar — Approvals button |
| `Warning` | ⚠️ | Alerts panel — severity icon |
| `ExpandMore` | ˅ | Alerts panel — collapse indicator |
| `ExpandLess` | ˄ | Alerts panel — expand indicator |
| `LocationOn` | 📍 | Dashboard — Locations stat card |
| `HourglassBottom` | ⏳ | Dashboard — Pending Approvals card |
| `Build` | 🔧 | Inventory — Edit Dates button |
| `ViewColumn` | ⊞ | Inventory, Approvals — Column filter |
| `Error` | ❗ | LockersPage — Condition indicator |
| `Person` | 👤 | ProfilePage — User ID row |
| `Email` | ✉️ | ProfilePage — Email row |
| `Phone` | 📞 | ProfilePage — Phone row |
| `Badge` | 🪪 | ProfilePage — Role row |
| `Business` | 🏢 | ProfilePage — Department row |
| `CalendarToday` | 📅 | ProfilePage — Join date row |
| `Security` | 🛡️ | ProfilePage — Access level row |

---

### 2.5 `@emotion/react` — v11.14.0

**Category:** CSS-in-JS Engine (MUI dependency)

**What it is:**  
A CSS-in-JS library that generates scoped CSS class names at runtime from JavaScript style objects.

**Why used:**  
Required by MUI — not imported directly in project code. MUI's `sx` prop uses Emotion internally to convert style objects into real CSS class names injected into `<style>` tags in the document `<head>`.

**How it works internally:**

```
Developer writes:   sx={{ color: "red", fontSize: 14 }}
                            ↓
Emotion generates:  .css-abc123 { color: red; font-size: 14px; }
                            ↓
Browser applies:    <div class="css-abc123">
```

---

### 2.6 `@emotion/styled` — v11.14.1

**Category:** CSS-in-JS Styled API (MUI dependency)

**What it is:**  
Emotion's `styled()` API for creating styled React components.

**Why used:**  
Required by MUI internally. All MUI base components (Button, TextField, etc.) are built using `styled()`.

```tsx
// How MUI uses it internally:
const StyledButton = styled("button")`
  background: blue;
  padding: 8px 16px;
  border-radius: 4px;
`;
```

---

### 2.7 `axios` — v1.11.0

**Category:** HTTP Client

**What it is:**  
A Promise-based HTTP client for browser and Node.js. More feature-rich than the native `fetch` API.

**Status in project:** ⚠️ Installed but not actively used — all HTTP calls in `APIService.tsx` use native `fetch()`.

**Comparison — fetch vs axios:**

| Feature | `fetch` (currently used) | `axios` (installed, available) |
|---|---|---|
| JSON parsing | Manual `.json()` call | Automatic |
| Request interceptors | Not available | ✅ Built-in |
| Response interceptors | Not available | ✅ Built-in |
| Timeout configuration | Not built-in | ✅ Built-in |
| Error on 4xx / 5xx | Must check manually | ✅ Throws automatically |
| Upload progress | Not available | ✅ Built-in |
| Request cancellation | AbortController | ✅ CancelToken |

---

### 2.8 `react-router-dom` — v7.15.1

**Category:** URL Routing

**What it is:**  
The standard URL-based routing library for React. Enables navigation via URL paths.

**Status in project:** ⚠️ Installed but not actively used — the app uses **state-based navigation** (boolean flags in `App.tsx`) with `window.history.pushState` for browser back/forward support.

**What it would provide if activated:**
```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

<BrowserRouter>
  <Routes>
    <Route path="/"           element={<Dashboard />} />
    <Route path="/inventory"  element={<InventoryPage />} />
    <Route path="/approvals"  element={<ApprovalRequestsPage />} />
    <Route path="/lockers"    element={<LockersPage />} />
  </Routes>
</BrowserRouter>
```

---

### 2.9 `react-tabulator` — v0.21.0

**Category:** Advanced Data Grid

**What it is:**  
React wrapper for the Tabulator.js table library. Provides advanced data grid features beyond a basic HTML table.

**Status in project:** ⚠️ Installed but not actively used — the app uses MUI `Table` for data display.

**Features available if used:**
- Virtual DOM row rendering (handles 100,000+ rows smoothly)
- Built-in CSV / JSON / PDF export
- Inline cell editing
- Row grouping and aggregation
- Column resizing and reordering
- Frozen rows and columns

---

### 2.10 `tabulator-tables` — v6.3.1

**Category:** Advanced Data Grid (core library)

**What it is:**  
The underlying Tabulator.js library that `react-tabulator` wraps.

**Why installed:**  
Required peer dependency of `react-tabulator`.

---

## 3. Dev Dependencies

> Build tools and type definitions — **NOT shipped to the browser.**

---

### 3.1 `vite` — v7.0.4

**Category:** Build Tool & Dev Server

**What it is:**  
Ultra-fast frontend build tool. Replaces the older Create React App / Webpack setup.

**Why used:**

| Mode | Command | What it does |
|---|---|---|
| Development | `npm run dev` | Starts dev server at `localhost:5173` with instant HMR |
| Production | `npm run build` | Bundles + minifies everything into `dist/` folder |
| Preview | `npm run preview` | Serves the `dist/` folder locally for final testing |

**Performance advantages over Webpack:**
- Dev server starts in `<500ms` (no bundling — uses native ES Modules)
- Hot Module Replacement updates in `<50ms` (only sends changed module)
- Production build uses Rollup (faster than Webpack)

---

### 3.2 `@vitejs/plugin-react` — v4.6.0

**Category:** Vite Plugin

**What it is:**  
Official Vite plugin that adds React support to the build pipeline.

**What it does:**

```
✅ Transforms JSX → JavaScript using Babel
✅ Enables React Fast Refresh (HMR that preserves component state)
✅ Injects automatic React import (no "import React" needed in every file)
✅ Handles .tsx / .ts file processing
✅ Optimises development build speed
```

**Configuration in `vite.config.ts`:**
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

---

### 3.3 `typescript` — v5.8.3

**Category:** Type System

**What it is:**  
Microsoft's statically typed superset of JavaScript. Adds compile-time type checking.

**Why used:**  
Catches type errors before code reaches the browser.

```tsx
// Without TypeScript — runtime crash in production
row.prouctName  // typo goes unnoticed

// With TypeScript — compile-time error, never ships
row.prouctName
// TS Error: Property 'prouctName' does not exist on type 'InventoryItem'.
//           Did you mean 'productName'?
```

**Type safety examples from this project:**
```tsx
// Typed state
const [requests, setRequests] = useState<Request[]>([]);

// Typed props interface
interface AddUserProps {
  onDone?: () => void;
}

// Union type for sort fields
type SortField =
  | "productId" | "productName" | "serialNumber"
  | "category"  | "subCategory" | "lockerId";

// Typed event handler
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
};
```

---

### 3.4 Type Definitions

#### `@types/react` — v19.1.8

TypeScript type definitions for the React library.  
Provides types for `useState`, `useEffect`, `useRef`, `React.FC`, `React.ReactNode`, `React.FormEvent`, etc.

```tsx
// These types come from @types/react:
const [items, setItems] = useState<InventoryItem[]>([]);
interface Props { children: React.ReactNode; }
const fn = (e: React.FormEvent) => { e.preventDefault(); };
```

#### `@types/react-dom` — v19.1.6

TypeScript type definitions for `react-dom`.  
Provides types for `ReactDOM.createRoot()`, `createPortal()`, etc.

#### `@types/tabulator-tables` — v6.2.9

TypeScript type definitions for Tabulator.js.  
Enables type-safe column definitions, options, and event handlers if Tabulator is used.

---

### 3.5 ESLint & Plugins

#### `eslint` — v9.30.1

JavaScript/TypeScript linter. Finds code quality problems and enforces consistent style rules.

```bash
npm run lint  →  eslint .   # scans all src/ files
```

#### `@eslint/js` — v9.30.1

Core ESLint JavaScript rules package (required by ESLint v9's flat config system).

#### `eslint-plugin-react-hooks` — v5.2.0

ESLint rules specifically for React Hooks.

| Rule | What it checks |
|---|---|
| `rules-of-hooks` | Hooks must be at top level — not inside loops, conditions, or nested functions |
| `exhaustive-deps` | `useEffect` / `useCallback` dependency arrays must include all referenced variables |

```tsx
// Flagged by rules-of-hooks:
if (condition) {
  useState(); // ❌ Hook called conditionally
}

// Flagged by exhaustive-deps:
useEffect(() => {
  setData(token); // token used but missing from deps
}, []); // ❌ Warning: 'token' missing from dependency array
```

#### `eslint-plugin-react-refresh` — v0.4.20

ESLint rules for Vite's React Fast Refresh compatibility.  
Warns when a file exports both a component and a non-component value (which breaks HMR).

#### `typescript-eslint` — v8.35.1

ESLint integration for TypeScript. Enables ESLint to parse and understand `.tsx` / `.ts` syntax and type information.

#### `globals` — v16.3.0

Provides predefined global variable lists for ESLint environments.

```
browser globals:  window, document, localStorage, sessionStorage, fetch, URL, ...
es2022 globals:   Promise, Map, Set, WeakRef, structuredClone, ...
```

Without this, ESLint would flag `sessionStorage.getItem("token")` as an undefined variable.

---

## 4. NPM Scripts

```
┌─────────────────┬──────────────────────────────────────────────────────┐
│ Script          │ What it does                                         │
├─────────────────┼──────────────────────────────────────────────────────┤
│ npm run dev     │ Starts Vite dev server at http://localhost:5173       │
│                 │ Hot Module Replacement — changes reflect in <50ms    │
│                 │ No build step needed during development              │
├─────────────────┼──────────────────────────────────────────────────────┤
│ npm run build   │ Step 1: tsc -b → TypeScript type-checks ALL files    │
│                 │         Fails immediately if any type errors exist   │
│                 │ Step 2: vite build → bundles + minifies → dist/      │
│                 │         Tree-shakes unused exports                   │
│                 │         Splits vendor and app chunks                 │
├─────────────────┼──────────────────────────────────────────────────────┤
│ npm run lint    │ Runs ESLint on entire project                        │
│                 │ Reports hook violations, type issues, unused imports │
├─────────────────┼──────────────────────────────────────────────────────┤
│ npm run preview │ Serves the dist/ folder locally                      │
│                 │ Tests production build before deploying              │
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 5. TypeScript Configuration

**File:** `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "exclude": ["src/AddItem.tsx"]
}
```

**Key settings explained:**

| Setting | Value | Meaning |
|---|---|---|
| `target` | `ES2022` | Compile to modern JS — `async/await`, optional chaining native |
| `lib` | `["ES2022", "DOM"]` | Includes browser APIs (`fetch`, `document`, `localStorage`) |
| `jsx` | `react-jsx` | Auto React import — no `import React` needed in every file |
| `moduleResolution` | `"bundler"` | Vite-optimized module resolution strategy |
| `strict` | `true` | All strict type checks enabled (no implicit `any`, null checks, etc.) |
| `noEmit` | `true` | TypeScript only type-checks — Vite handles the actual compilation |
| `skipLibCheck` | `true` | Skip type-checking of `node_modules` (faster builds) |
| `noFallthroughCasesInSwitch` | `true` | Every switch case must have a `break` or `return` |
| `exclude` | `["src/AddItem.tsx"]` | Old file excluded from compilation |

---

## 6. Complete Dependency Map

```
SHIPPED TO BROWSER (dependencies)
══════════════════════════════════════════════════════════════════

  react@19.1.0
  └── react-dom@19.1.0
        └── mounts into <div id="root"> in index.html

  @mui/material@7.3.1
  ├── @emotion/react@11.14.0     CSS-in-JS engine — powers sx prop
  └── @emotion/styled@11.14.1   styled() API for MUI component internals

  @mui/icons-material@7.3.1
  └── (peer depends on @mui/material)

  axios@1.11.0                   ⚠ installed, not actively used
  react-router-dom@7.15.1        ⚠ installed, not actively used
  react-tabulator@0.21.0         ⚠ installed, not actively used
  └── tabulator-tables@6.3.1

══════════════════════════════════════════════════════════════════
BUILD / DEV TOOLS ONLY (devDependencies — never in browser)
══════════════════════════════════════════════════════════════════

  vite@7.0.4
  └── @vitejs/plugin-react@4.6.0   JSX transform + React Fast Refresh

  typescript@5.8.3
  ├── @types/react@19.1.8
  ├── @types/react-dom@19.1.6
  └── @types/tabulator-tables@6.2.9

  eslint@9.30.1
  ├── @eslint/js@9.30.1
  ├── eslint-plugin-react-hooks@5.2.0
  ├── eslint-plugin-react-refresh@0.4.20
  ├── typescript-eslint@8.35.1
  └── globals@16.3.0
```

---

## 7. Packages Not Used & Why

| Package | Not Used | Reason |
|---|---|---|
| **Redux / Zustand** | No global state manager | All state lives in `App.tsx` — app is small enough |
| **React Query / SWR** | No data-fetching library | Manual `fetch` in `APIService.tsx` + `useEffect` |
| **React Hook Form** | No form library | Manual `useState` per field — forms have few fields |
| **Styled Components** | Not needed | Emotion (via MUI) already provides CSS-in-JS |
| **Jest / Vitest** | No test runner | No automated tests written yet |
| **i18n / react-intl** | No translation layer | English-only application |
| **date-fns / dayjs** | No date library | Native `Date` object with manual formatting utilities |
| **Lodash** | No utility library | Native JS (`Array.filter`, `Array.map`, `Object.keys`) used directly |
| **Formik / Yup** | No form + validation | Manual validation inside `handleSubmit` functions |

---

## 8. MUI Components Reference

### Import Pattern

```tsx
// Single import — all from @mui/material
import {
  Box, Button, Card, CardContent, TextField, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TableSortLabel, Paper, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Drawer, Menu, MenuItem,
  Checkbox, ListItemText, Select, InputLabel, FormControl,
  Avatar, IconButton, Tooltip, Badge, Popover, Popper,
  Divider, List, ListItem, ListItemButton, ListItemIcon,
  Switch, Pagination, Fade, useMediaQuery,
} from "@mui/material";
```

### Responsive `sx` Breakpoints

```tsx
// MUI breakpoint system used in this project:
//  xs: 0px+    (mobile)
//  sm: 600px+  (small tablet)
//  md: 900px+  (tablet/small desktop)
//  lg: 1200px+ (desktop)

sx={{
  display: { xs: "none", md: "flex" },  // hidden on mobile, flex on desktop
  fontSize: { xs: "1rem", sm: "1.25rem" },
  px: { xs: 1.5, sm: 2 },
  minWidth: { xs: "92vw", sm: 480 },
}}
```

---

## 9. MUI Icons Reference

### Import Pattern

```tsx
// Each icon is a separate import — tree-shakeable
import DashboardIcon      from "@mui/icons-material/Dashboard";
import LockIcon           from "@mui/icons-material/Lock";
import InventoryIcon      from "@mui/icons-material/Inventory";
import MenuIcon           from "@mui/icons-material/Menu";
import NotificationsIcon  from "@mui/icons-material/Notifications";
import SearchIcon         from "@mui/icons-material/Search";
import BuildIcon          from "@mui/icons-material/Build";
import ViewColumnIcon     from "@mui/icons-material/ViewColumn";
```

### Usage Pattern

```tsx
// Size controlled via fontSize prop or sx
<DashboardIcon sx={{ fontSize: 20 }} />
<MenuIcon fontSize="small" />
<NotificationsIcon sx={{ fontSize: 26, color: "#fff" }} />
```

---

*Document generated from project source — `AdvLockerUiMain3` / `src/` directory*  
*Reflects package versions as of `package.json` at time of writing*
