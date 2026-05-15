import React, { useEffect, useState } from "react";import React, { useEffect, useState } from "react";import React, { useEffect, useState } from "react";

import "./App.css";

import {import "./App.css";import "./App.css";

  Button,

  Dialog,import {import {

  DialogTitle,

  DialogContent,  Button,  Button,

  DialogActions,

  TextField,  Dialog,  Dialog,

} from "@mui/material";

import {  DialogTitle,  DialogTitle,

  insertCategoryAndSubCategory,

  fetchCategories,  DialogContent,  DialogContent,

  fetchSubCategories,

  fetchCatalogue,  DialogActions,  DialogActions,

} from "./APIService";

  TextField,  TextField,

const initialCategories = ["Electronics", "Documents", "Jewelry"];

const initialSubcategoriesFlat: string[] = [} from "@mui/material";} from "@mui/material";

  "Laptop",

  "Mobile",import {import {

  "Tablet",

  "Passport",  insertCategoryAndSubCategory,  insertCategoryAndSubCategory,

  "License",

  "Certificate",  fetchCategories,  fetchCategories,

  "Ring",

  "Necklace",  fetchSubCategories,  fetchSubCategories,

  "Bracelet",

];  fetchCatalogue,  fetchCatalogue,



export default function AddItemPage() {} from "./APIService";} from "./APIService";

  const [category, setCategory] = useState("");

  const [subcategory, setSubcategory] = useState("");import "./App.css";

  const [itemName, setItemName] = useState("");

  const [submitted, setSubmitted] = useState(false);const initialCategories = ["Electronics", "Documents", "Jewelry"];import {

  const [quantity, setQuantity] = useState<number>(1);

  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);const initialSubcategoriesFlat: string[] = [  Button,

  const [newCategoryName, setNewCategoryName] = useState("");

  const [newSubcategoryName, setNewSubcategoryName] = useState("");  "Laptop",  Dialog,

  const [showNewItemDialog, setShowNewItemDialog] = useState(false);

  const [newItemNameForDialog, setNewItemNameForDialog] = useState("");  "Mobile",  DialogTitle,



  const [categories, setCategories] = useState<string[]>(initialCategories);  "Tablet",  DialogContent,

  const [subcategories, setSubcategories] = useState<string[]>(

    initialSubcategoriesFlat  "Passport",  DialogActions,

  );

  const [loadingCategories, setLoadingCategories] = useState(true);  "License",  TextField,

  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  "Certificate",} from "@mui/material";

  const [itemsMap, setItemsMap] = useState<{

    [key: string]: Array<{ id?: string; name: string; serverId?: string }>;  "Ring",import {

  }>({});

  const [selectedItemId, setSelectedItemId] = useState<string>("");  "Necklace",  insertCategoryAndSubCategory,



  useEffect(() => {  "Bracelet",  fetchCategories,

    let mounted = true;

    (async () => {];  fetchSubCategories,

      try {

        const [cats, subs, catalogue] = await Promise.all([  fetchCatalogue,

          fetchCategories(),

          fetchSubCategories(),export default function AddItemPage() {} from "./APIService";

          fetchCatalogue(),

        ]);  const [category, setCategory] = useState("");

        if (!mounted) return;

        setCategories(  const [subcategory, setSubcategory] = useState("");const initialCategories = ["Electronics", "Documents", "Jewelry"];

          Array.from(new Set(cats && cats.length ? cats : initialCategories))

        );  const [itemName, setItemName] = useState("");const initialSubcategoriesFlat: string[] = [

        setSubcategories(

          Array.from(  const [submitted, setSubmitted] = useState(false);  "Laptop",

            new Set(subs && subs.length ? subs : initialSubcategoriesFlat)

          )  const [quantity, setQuantity] = useState<number>(1);  "Mobile",

        );

  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);  "Tablet",

        const arr = Array.isArray(catalogue) ? catalogue : [];

        const tempItems: {  const [newCategoryName, setNewCategoryName] = useState("");  "Passport",

          [key: string]: Array<{ id?: string; name: string; serverId?: string }>;

        } = {};  const [newSubcategoryName, setNewSubcategoryName] = useState("");  "License",

        const seenServerIds: { [key: string]: Set<string> } = {};

        const normalize = (s?: string) =>  const [showNewItemDialog, setShowNewItemDialog] = useState(false);  "Certificate",

          s == null ? undefined : String(s).trim().toLowerCase();

  const [newItemNameForDialog, setNewItemNameForDialog] = useState("");  "Ring",

        for (const entry of arr) {

          const cat = (entry?.Category ?? entry?.category ?? "") as string;  "Necklace",

          const sub =

            (entry?.SubCategory ?? entry?.subCategory ?? entry?.Sub_Category ?? "") as string;  const [categories, setCategories] = useState<string[]>(initialCategories);  "Bracelet",

          const name =

            (entry?.Name ?? entry?.name ?? entry?.ProductName ?? "") as string;  const [subcategories, setSubcategories] = useState<string[]>(];

          const rawProductId =

            entry?.ProductId ??    initialSubcategoriesFlat

            entry?.productId ??

            entry?.productid ??  );export default function AddItemPage() {

            entry?.qtId ??

            entry?.QtId ??  const [loadingCategories, setLoadingCategories] = useState(true);  const [category, setCategory] = useState("");

            entry?.id ??

            undefined;  const [categoriesError, setCategoriesError] = useState<string | null>(null);  const [subcategory, setSubcategory] = useState("");

          const productId = rawProductId != null ? String(rawProductId) : undefined;

          const rawServerId =  const [itemName, setItemName] = useState("");

            entry?.ProductServerId ??

            entry?.productServerId ??  const [itemsMap, setItemsMap] = useState<{  const [submitted, setSubmitted] = useState(false);

            entry?.productserverid ??

            entry?.ProductServerID ??    [key: string]: Array<{ id?: string; name: string; serverId?: string }>;  const [quantity, setQuantity] = useState<number>(1);

            entry?.serverId ??

            entry?.ServerId ??  }>({});  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);

            undefined;

          const serverId = rawServerId != null ? String(rawServerId) : undefined;  const [selectedItemId, setSelectedItemId] = useState<string>("");  const [newCategoryName, setNewCategoryName] = useState("");



          if (!cat || !sub || !name || !productId || !serverId) continue;  const [newSubcategoryName, setNewSubcategoryName] = useState("");

          const key = `${cat}::${sub}`;

          if (!tempItems[key]) tempItems[key] = [];  useEffect(() => {  const [showNewItemDialog, setShowNewItemDialog] = useState(false);

          if (!seenServerIds[key]) seenServerIds[key] = new Set();

          const serverNorm = normalize(serverId)!;    let mounted = true;  const [newItemNameForDialog, setNewItemNameForDialog] = useState("");

          if (seenServerIds[key].has(serverNorm)) continue;

          seenServerIds[key].add(serverNorm);    (async () => {

          tempItems[key].push({ id: productId, name, serverId });

        }      try {  const [categories, setCategories] = useState<string[]>(initialCategories);



        if (mounted) setItemsMap(tempItems);        const [cats, subs, catalogue] = await Promise.all([  const [subcategories, setSubcategories] = useState<string[]>(

      } catch (err: unknown) {

        console.error("Failed to load categories/subcategories or catalogue", err);          fetchCategories(),    initialSubcategoriesFlat

        const message = err instanceof Error ? err.message : String(err);

        if (mounted) setCategoriesError(message || "Unknown error");          fetchSubCategories(),  );

      } finally {

        if (mounted) setLoadingCategories(false);          fetchCatalogue(),  const [loadingCategories, setLoadingCategories] = useState(true);

      }

    })();        ]);  const [categoriesError, setCategoriesError] = useState<string | null>(null);

    return () => {

      mounted = false;        if (!mounted) return;

    };

  }, []);        setCategories(  const [itemsMap, setItemsMap] = useState<{



  const handleSubmit = (e: React.FormEvent) => {          Array.from(new Set(cats && cats.length ? cats : initialCategories))    [key: string]: Array<{ id?: string; name: string; serverId?: string }>;

    e.preventDefault();

    if (!quantity || quantity <= 0) {        );  }>({});

      window.alert("Please enter a valid quantity (1 or greater). ");

      return;        setSubcategories(  const [selectedItemId, setSelectedItemId] = useState<string>("");

    }

    const payload = {          Array.from(

      category,

      subcategory,            new Set(subs && subs.length ? subs : initialSubcategoriesFlat)  useEffect(() => {

      itemId: selectedItemId || itemName,

      itemName,          )    let mounted = true;

      quantity,

    };        );    (async () => {

    console.log("Add Item payload:", payload);

    setSubmitted(true);      try {

  };

        const arr = Array.isArray(catalogue) ? catalogue : [];        const [cats, subs, catalogue] = await Promise.all([

  return (

    <div        const tempItems: {          fetchCategories(),

      style={{

        minHeight: "100vh",          [key: string]: Array<{ id?: string; name: string; serverId?: string }>;          fetchSubCategories(),

        minWidth: "100vw",

        width: "100vw",        } = {};          fetchCatalogue(),

        height: "100vh",

        background: "#f5f5f5",        const seenServerIds: { [key: string]: Set<string> } = {};        ]);

        color: "#181818",

        margin: 0,        const normalize = (s?: string) =>        if (!mounted) return;

        padding: 0,

        display: "flex",          s == null ? undefined : String(s).trim().toLowerCase();        setCategories(

        flexDirection: "column",

        alignItems: "center",          Array.from(new Set(cats && cats.length ? cats : initialCategories))

        justifyContent: "center",

        boxSizing: "border-box",        for (const entry of arr) {        );

      }}

    >          const cat = (entry?.Category ?? entry?.category ?? "") as string;        setSubcategories(

      <div

        style={{          const sub =          Array.from(

          background: "#fff",

          padding: 40,            (entry?.SubCategory ?? entry?.subCategory ?? entry?.Sub_Category ?? "") as string;            new Set(subs && subs.length ? subs : initialSubcategoriesFlat)

          borderRadius: 12,

          boxShadow: "0 6px 30px rgba(0,0,0,0.12)",          const name =          )

          minWidth: 640,

          maxWidth: "920px",            (entry?.Name ?? entry?.name ?? entry?.ProductName ?? "") as string;        );

          width: "min(92vw, 920px)",

        }}          const rawProductId =

      >

        <h1 style={{ marginBottom: 8 }}>Add Item</h1>            entry?.ProductId ??        const arr = Array.isArray(catalogue) ? catalogue : [];

        <h3 style={{ marginBottom: 24, color: "#555" }}>

          Add a new item with category and subcategory            entry?.productId ??        const tempItems: {

        </h3>

            entry?.productid ??          [key: string]: Array<{ id?: string; name: string; serverId?: string }>;

        {loadingCategories ? (

          <div style={{ padding: 24, textAlign: "center" }}>Loading categories...</div>            entry?.qtId ??        } = {};

        ) : categoriesError ? (

          <div style={{ padding: 24, textAlign: "center", color: "#b00020" }}>Failed to load categories: {categoriesError}</div>            entry?.QtId ??        const seenServerIds: { [key: string]: Set<string> } = {};

        ) : (

          <form onSubmit={handleSubmit}>            entry?.id ??        const normalize = (s?: string) =>

            <div style={{ marginBottom: 16 }}>

              <label>Category</label>            undefined;          s == null ? undefined : String(s).trim().toLowerCase();

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

                <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>          const productId = rawProductId != null ? String(rawProductId) : undefined;

                  <option value="">Select Category</option>

                  {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}          const rawServerId =        for (const entry of arr) {

                </select>

                <Button size="small" variant="outlined" onClick={() => setShowNewCategoryDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Category</Button>            entry?.ProductServerId ??          const cat = (entry?.Category ?? entry?.category ?? "") as string;

              </div>

            </div>            entry?.productServerId ??          const sub =



            <div style={{ marginBottom: 16 }}>            entry?.productserverid ??            (entry?.SubCategory ?? entry?.subCategory ?? entry?.Sub_Category ?? "") as string;

              <label>Subcategory</label>

              <select value={subcategory} onChange={(e) => { setSubcategory(e.target.value); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>            entry?.ProductServerID ??          const name =

                <option value="">Select Subcategory</option>

                {subcategories.map((sub) => (<option key={sub} value={sub}>{sub}</option>))}            entry?.serverId ??            (entry?.Name ?? entry?.name ?? entry?.ProductName ?? "") as string;

              </select>

            </div>            entry?.ServerId ??          const rawProductId =



            <div style={{ marginBottom: 16 }}>            undefined;            entry?.ProductId ??

              <label>Item</label>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>          const serverId = rawServerId != null ? String(rawServerId) : undefined;            entry?.productId ??

                <select value={String(selectedItemId || itemName)} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {

                  const val = e.target.value; const key = `${category}::${subcategory}`; const arr = itemsMap[key] || []; const normalize = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const foundById = arr.find((it) => it.id != null && normalize(String(it.id)) === normalize(val)); if (foundById) { setItemName(foundById.name); setSelectedItemId(String(foundById.id)); return; } if (val.startsWith("local:")) { try { const decoded = decodeURIComponent(val.slice("local:".length)); const foundByName = arr.find((it) => it.name === decoded); if (foundByName) { setItemName(foundByName.name); setSelectedItemId(String(foundByName.id ?? `local:${encodeURIComponent(foundByName.name)}`)); return; } } catch { } } setItemName(val); setSelectedItemId(val);            entry?.productid ??

                }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required disabled={!category || !subcategory}>

                  <option value="">Select Item</option>          if (!cat || !sub || !name || !productId || !serverId) continue;            entry?.qtId ??

                  {category && subcategory ? (itemsMap[`${category}::${subcategory}`] || []).map((it) => { const value = it.id != null ? String(it.id) : `local:${encodeURIComponent(it.name)}`; return (<option key={value} value={value}>{it.id != null ? String(it.id) : it.name}</option>); }) : null}

                </select>          const key = `${cat}::${sub}`;            entry?.QtId ??

                <Button size="small" variant="outlined" onClick={() => setShowNewItemDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Item</Button>

              </div>          if (!tempItems[key]) tempItems[key] = [];            entry?.id ??

            </div>

          if (!seenServerIds[key]) seenServerIds[key] = new Set();            undefined;

            <div style={{ marginBottom: 16 }}>

              <label>Quantity</label>          const serverNorm = normalize(serverId)!;          const productId = rawProductId != null ? String(rawProductId) : undefined;

              <input type="number" min={1} value={quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required />

            </div>          if (seenServerIds[key].has(serverNorm)) continue;          const rawServerId =



            <Button type="submit" variant="contained" color="primary" sx={{ width: "100%" }}>Add Item</Button>          seenServerIds[key].add(serverNorm);            entry?.ProductServerId ??

            {submitted && (<div style={{ color: "green", marginTop: 16, textAlign: "center" }}>Item added successfully!</div>)}

          </form>          tempItems[key].push({ id: productId, name, serverId });            entry?.productServerId ??

        )}

      </div>        }            entry?.productserverid ??



      <Dialog open={showNewCategoryDialog} onClose={() => setShowNewCategoryDialog(false)} fullWidth maxWidth="sm">            entry?.ProductServerID ??

        <DialogTitle>Create New Product Category</DialogTitle>

        <DialogContent>        if (mounted) setItemsMap(tempItems);            entry?.serverId ??

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            <TextField label="Category" value={newCategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)} fullWidth />      } catch (err: unknown) {            entry?.ServerId ??

            <TextField label="SubCategory" value={newSubcategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubcategoryName(e.target.value)} fullWidth />

          </div>        console.error("Failed to load categories/subcategories or catalogue", err);            undefined;

        </DialogContent>

        <DialogActions>        const message = err instanceof Error ? err.message : String(err);          const serverId = rawServerId != null ? String(rawServerId) : undefined;

          <Button onClick={() => setShowNewCategoryDialog(false)}>Cancel</Button>

          <Button variant="contained" onClick={async () => {        if (mounted) setCategoriesError(message || "Unknown error");

            const cat = newCategoryName.trim(); const sub = newSubcategoryName.trim(); if (!cat) return; try { const res = await insertCategoryAndSubCategory({ Category: cat || null, SubCategory: sub || null }); if (res == null || res === 0) { window.alert("Failed to create category/subcategory on server."); return; } setCategories((prev) => (prev.includes(cat) ? prev : [...prev, cat])); if (sub) setSubcategories((prev) => (prev.includes(sub) ? prev : [...prev, sub])); setCategory(cat); if (sub) setSubcategory(sub); setNewCategoryName(""); setNewSubcategoryName(""); setShowNewCategoryDialog(false); } catch (err) { console.error("create category error", err); window.alert("Error creating category/subcategory."); }

          }}>Create</Button>      } finally {          if (!cat || !sub || !name || !productId || !serverId) continue;

        </DialogActions>

      </Dialog>        if (mounted) setLoadingCategories(false);          const key = `${cat}::${sub}`;



      <Dialog open={showNewItemDialog} onClose={() => setShowNewItemDialog(false)} fullWidth maxWidth="sm">      }          if (!tempItems[key]) tempItems[key] = [];

        <DialogTitle>Create New Item</DialogTitle>

        <DialogContent>    })();          if (!seenServerIds[key]) seenServerIds[key] = new Set();

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>Category</div><div style={{ color: "#444" }}>{category || "(select category)"}</div></div>    return () => {          const serverNorm = normalize(serverId)!;

            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>SubCategory</div><div style={{ color: "#444" }}>{subcategory || "(select subcategory)"}</div></div>

            <TextField label="Item Name" value={newItemNameForDialog} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemNameForDialog(e.target.value)} fullWidth />      mounted = false;          if (seenServerIds[key].has(serverNorm)) continue;

          </div>

        </DialogContent>    };          seenServerIds[key].add(serverNorm);

        <DialogActions>

          <Button onClick={() => setShowNewItemDialog(false)}>Cancel</Button>  }, []);          tempItems[key].push({ id: productId, name, serverId });

          <Button variant="contained" onClick={() => {

            const item = newItemNameForDialog.trim(); if (!item) return; if (!category || !subcategory) { window.alert("Please select Category and SubCategory before creating an item."); return; } const key = `${category}::${subcategory}`; const localId = `local:${encodeURIComponent(item)}`; setItemsMap((prev) => { const prevArr = prev[key] ?? []; const normalizeString = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const exists = prevArr.some((it) => (it.id != null ? normalizeString(String(it.id)) === normalizeString(localId) : it.name === item)); if (exists) return prev; return { ...prev, [key]: [...prevArr, { id: localId, name: item }] }; }); setItemName(item); setSelectedItemId(localId); setNewItemNameForDialog(""); setShowNewItemDialog(false);        }

          }}>Create</Button>

        </DialogActions>  const handleSubmit = (e: React.FormEvent) => {

      </Dialog>

    </div>    e.preventDefault();        if (mounted) setItemsMap(tempItems);

  );

}    if (!quantity || quantity <= 0) {      } catch (err: unknown) {


      window.alert("Please enter a valid quantity (1 or greater). ");        console.error("Failed to load categories/subcategories or catalogue", err);

      return;        const message = err instanceof Error ? err.message : String(err);

    }        if (mounted) setCategoriesError(message || "Unknown error");

    const payload = {      } finally {

      category,        if (mounted) setLoadingCategories(false);

      subcategory,      }

      itemId: selectedItemId || itemName,    })();

      itemName,    return () => {

      quantity,      mounted = false;

    };    };

    console.log("Add Item payload:", payload);  }, []);

    setSubmitted(true);

  };  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

  return (    if (!quantity || quantity <= 0) {

    <div      window.alert("Please enter a valid quantity (1 or greater). ");

      style={{      return;

        minHeight: "100vh",    }

        minWidth: "100vw",    const payload = {

        width: "100vw",      category,

        height: "100vh",      subcategory,

        background: "#f5f5f5",      itemId: selectedItemId || itemName,

        color: "#181818",      itemName,

        margin: 0,      quantity,

        padding: 0,    };

        display: "flex",    console.log("Add Item payload:", payload);

        flexDirection: "column",    setSubmitted(true);

        alignItems: "center",  };

        justifyContent: "center",

        boxSizing: "border-box",  return (

      }}    <div

    >      style={{

      <div        minHeight: "100vh",

        style={{        minWidth: "100vw",

          background: "#fff",        width: "100vw",

          padding: 40,        height: "100vh",

          borderRadius: 12,        background: "#f5f5f5",

          boxShadow: "0 6px 30px rgba(0,0,0,0.12)",        color: "#181818",

          minWidth: 640,        margin: 0,

          maxWidth: "920px",        padding: 0,

          width: "min(92vw, 920px)",        display: "flex",

        }}        flexDirection: "column",

      >        alignItems: "center",

        <h1 style={{ marginBottom: 8 }}>Add Item</h1>        justifyContent: "center",

        <h3 style={{ marginBottom: 24, color: "#555" }}>        boxSizing: "border-box",

          Add a new item with category and subcategory      }}

        </h3>    >

      <div

        {loadingCategories ? (        style={{

          <div style={{ padding: 24, textAlign: "center" }}>Loading categories...</div>          background: "#fff",

        ) : categoriesError ? (          padding: 40,

          <div style={{ padding: 24, textAlign: "center", color: "#b00020" }}>Failed to load categories: {categoriesError}</div>          borderRadius: 12,

        ) : (          boxShadow: "0 6px 30px rgba(0,0,0,0.12)",

          <form onSubmit={handleSubmit}>          minWidth: 640,

            <div style={{ marginBottom: 16 }}>          maxWidth: "920px",

              <label>Category</label>          width: "min(92vw, 920px)",

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>        }}

                <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>      >

                  <option value="">Select Category</option>        <h1 style={{ marginBottom: 8 }}>Add Item</h1>

                  {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}        <h3 style={{ marginBottom: 24, color: "#555" }}>

                </select>          Add a new item with category and subcategory

                <Button size="small" variant="outlined" onClick={() => setShowNewCategoryDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Category</Button>        </h3>

              </div>

            </div>        {loadingCategories ? (

          <div style={{ padding: 24, textAlign: "center" }}>Loading categories...</div>

            <div style={{ marginBottom: 16 }}>        ) : categoriesError ? (

              <label>Subcategory</label>          <div style={{ padding: 24, textAlign: "center", color: "#b00020" }}>Failed to load categories: {categoriesError}</div>

              <select value={subcategory} onChange={(e) => { setSubcategory(e.target.value); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>        ) : (

                <option value="">Select Subcategory</option>          <form onSubmit={handleSubmit}>

                {subcategories.map((sub) => (<option key={sub} value={sub}>{sub}</option>))}            <div style={{ marginBottom: 16 }}>

              </select>              <label>Category</label>

            </div>              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

                <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>

            <div style={{ marginBottom: 16 }}>                  <option value="">Select Category</option>

              <label>Item</label>                  {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>                </select>

                <select value={String(selectedItemId || itemName)} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {                <Button size="small" variant="outlined" onClick={() => setShowNewCategoryDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Category</Button>

                  const val = e.target.value; const key = `${category}::${subcategory}`; const arr = itemsMap[key] || []; const normalize = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const foundById = arr.find((it) => it.id != null && normalize(String(it.id)) === normalize(val)); if (foundById) { setItemName(foundById.name); setSelectedItemId(String(foundById.id)); return; } if (val.startsWith("local:")) { try { const decoded = decodeURIComponent(val.slice("local:".length)); const foundByName = arr.find((it) => it.name === decoded); if (foundByName) { setItemName(foundByName.name); setSelectedItemId(String(foundByName.id ?? `local:${encodeURIComponent(foundByName.name)}`)); return; } } catch { } } setItemName(val); setSelectedItemId(val);              </div>

                }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required disabled={!category || !subcategory}>            </div>

                  <option value="">Select Item</option>

                  {category && subcategory ? (itemsMap[`${category}::${subcategory}`] || []).map((it) => { const value = it.id != null ? String(it.id) : `local:${encodeURIComponent(it.name)}`; return (<option key={value} value={value}>{it.id != null ? String(it.id) : it.name}</option>); }) : null}            <div style={{ marginBottom: 16 }}>

                </select>              <label>Subcategory</label>

                <Button size="small" variant="outlined" onClick={() => setShowNewItemDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Item</Button>              <select value={subcategory} onChange={(e) => { setSubcategory(e.target.value); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>

              </div>                <option value="">Select Subcategory</option>

            </div>                {subcategories.map((sub) => (<option key={sub} value={sub}>{sub}</option>))}

              </select>

            <div style={{ marginBottom: 16 }}>            </div>

              <label>Quantity</label>

              <input type="number" min={1} value={quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required />            <div style={{ marginBottom: 16 }}>

            </div>              <label>Item</label>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

            <Button type="submit" variant="contained" color="primary" sx={{ width: "100%" }}>Add Item</Button>                <select value={String(selectedItemId || itemName)} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {

            {submitted && (<div style={{ color: "green", marginTop: 16, textAlign: "center" }}>Item added successfully!</div>)}                  const val = e.target.value; const key = `${category}::${subcategory}`; const arr = itemsMap[key] || []; const normalize = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const foundById = arr.find((it) => it.id != null && normalize(String(it.id)) === normalize(val)); if (foundById) { setItemName(foundById.name); setSelectedItemId(String(foundById.id)); return; } if (val.startsWith("local:")) { try { const decoded = decodeURIComponent(val.slice("local:".length)); const foundByName = arr.find((it) => it.name === decoded); if (foundByName) { setItemName(foundByName.name); setSelectedItemId(String(foundByName.id ?? `local:${encodeURIComponent(foundByName.name)}`)); return; } } catch { } } setItemName(val); setSelectedItemId(val);

          </form>                }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required disabled={!category || !subcategory}>

        )}                  <option value="">Select Item</option>

      </div>                  {category && subcategory ? (itemsMap[`${category}::${subcategory}`] || []).map((it) => { const value = it.id != null ? String(it.id) : `local:${encodeURIComponent(it.name)}`; return (<option key={value} value={value}>{it.id != null ? String(it.id) : it.name}</option>); }) : null}

                </select>

      <Dialog open={showNewCategoryDialog} onClose={() => setShowNewCategoryDialog(false)} fullWidth maxWidth="sm">                <Button size="small" variant="outlined" onClick={() => setShowNewItemDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Item</Button>

        <DialogTitle>Create New Product Category</DialogTitle>              </div>

        <DialogContent>            </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            <TextField label="Category" value={newCategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)} fullWidth />            <div style={{ marginBottom: 16 }}>

            <TextField label="SubCategory" value={newSubcategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubcategoryName(e.target.value)} fullWidth />              <label>Quantity</label>

          </div>              <input type="number" min={1} value={quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required />

        </DialogContent>            </div>

        <DialogActions>

          <Button onClick={() => setShowNewCategoryDialog(false)}>Cancel</Button>            <Button type="submit" variant="contained" color="primary" sx={{ width: "100%" }}>Add Item</Button>

          <Button variant="contained" onClick={async () => {            {submitted && (<div style={{ color: "green", marginTop: 16, textAlign: "center" }}>Item added successfully!</div>)}

            const cat = newCategoryName.trim(); const sub = newSubcategoryName.trim(); if (!cat) return; try { const res = await insertCategoryAndSubCategory({ Category: cat || null, SubCategory: sub || null }); if (res == null || res === 0) { window.alert("Failed to create category/subcategory on server."); return; } setCategories((prev) => (prev.includes(cat) ? prev : [...prev, cat])); if (sub) setSubcategories((prev) => (prev.includes(sub) ? prev : [...prev, sub])); setCategory(cat); if (sub) setSubcategory(sub); setNewCategoryName(""); setNewSubcategoryName(""); setShowNewCategoryDialog(false); } catch (err) { console.error("create category error", err); window.alert("Error creating category/subcategory."); }          </form>

          }}>Create</Button>        )}

        </DialogActions>      </div>

      </Dialog>

      <Dialog open={showNewCategoryDialog} onClose={() => setShowNewCategoryDialog(false)} fullWidth maxWidth="sm">

      <Dialog open={showNewItemDialog} onClose={() => setShowNewItemDialog(false)} fullWidth maxWidth="sm">        <DialogTitle>Create New Product Category</DialogTitle>

        <DialogTitle>Create New Item</DialogTitle>        <DialogContent>

        <DialogContent>          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>            <TextField label="Category" value={newCategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)} fullWidth />

            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>Category</div><div style={{ color: "#444" }}>{category || "(select category)"}</div></div>            <TextField label="SubCategory" value={newSubcategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubcategoryName(e.target.value)} fullWidth />

            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>SubCategory</div><div style={{ color: "#444" }}>{subcategory || "(select subcategory)"}</div></div>          </div>

            <TextField label="Item Name" value={newItemNameForDialog} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemNameForDialog(e.target.value)} fullWidth />        </DialogContent>

          </div>        <DialogActions>

        </DialogContent>          <Button onClick={() => setShowNewCategoryDialog(false)}>Cancel</Button>

        <DialogActions>          <Button variant="contained" onClick={async () => {

          <Button onClick={() => setShowNewItemDialog(false)}>Cancel</Button>            const cat = newCategoryName.trim(); const sub = newSubcategoryName.trim(); if (!cat) return; try { const res = await insertCategoryAndSubCategory({ Category: cat || null, SubCategory: sub || null }); if (res == null || res === 0) { window.alert("Failed to create category/subcategory on server."); return; } setCategories((prev) => (prev.includes(cat) ? prev : [...prev, cat])); if (sub) setSubcategories((prev) => (prev.includes(sub) ? prev : [...prev, sub])); setCategory(cat); if (sub) setSubcategory(sub); setNewCategoryName(""); setNewSubcategoryName(""); setShowNewCategoryDialog(false); } catch (err) { console.error("create category error", err); window.alert("Error creating category/subcategory."); }

          <Button variant="contained" onClick={() => {          }}>Create</Button>

            const item = newItemNameForDialog.trim(); if (!item) return; if (!category || !subcategory) { window.alert("Please select Category and SubCategory before creating an item."); return; } const key = `${category}::${subcategory}`; const localId = `local:${encodeURIComponent(item)}`; setItemsMap((prev) => { const prevArr = prev[key] ?? []; const normalizeString = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const exists = prevArr.some((it) => (it.id != null ? normalizeString(String(it.id)) === normalizeString(localId) : it.name === item)); if (exists) return prev; return { ...prev, [key]: [...prevArr, { id: localId, name: item }] }; }); setItemName(item); setSelectedItemId(localId); setNewItemNameForDialog(""); setShowNewItemDialog(false);        </DialogActions>

          }}>Create</Button>      </Dialog>

        </DialogActions>

      </Dialog>      <Dialog open={showNewItemDialog} onClose={() => setShowNewItemDialog(false)} fullWidth maxWidth="sm">

    </div>        <DialogTitle>Create New Item</DialogTitle>

  );        <DialogContent>

}          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>Category</div><div style={{ color: "#444" }}>{category || "(select category)"}</div></div>
            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>SubCategory</div><div style={{ color: "#444" }}>{subcategory || "(select subcategory)"}</div></div>
            <TextField label="Item Name" value={newItemNameForDialog} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemNameForDialog(e.target.value)} fullWidth />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewItemDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            const item = newItemNameForDialog.trim(); if (!item) return; if (!category || !subcategory) { window.alert("Please select Category and SubCategory before creating an item."); return; } const key = `${category}::${subcategory}`; const localId = `local:${encodeURIComponent(item)}`; setItemsMap((prev) => { const prevArr = prev[key] ?? []; const normalizeString = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const exists = prevArr.some((it) => (it.id != null ? normalizeString(String(it.id)) === normalizeString(localId) : it.name === item)); if (exists) return prev; return { ...prev, [key]: [...prevArr, { id: localId, name: item }] }; }); setItemName(item); setSelectedItemId(localId); setNewItemNameForDialog(""); setShowNewItemDialog(false);
          }}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
  } from "@mui/material";
  import {
    insertCategoryAndSubCategory,
    fetchCategories,
    fetchSubCategories,
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
    const [quantity, setQuantity] = useState<number>(1);
    const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newSubcategoryName, setNewSubcategoryName] = useState("");
    const [showNewItemDialog, setShowNewItemDialog] = useState(false);
    const [newItemNameForDialog, setNewItemNameForDialog] = useState("");

    const [categories, setCategories] = useState<string[]>(initialCategories);
    const [subcategories, setSubcategories] = useState<string[]>(
      initialSubcategoriesFlat
    );
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);

    // itemsMap keyed by "Category::SubCategory" -> array of { id?: ProductId|string, name, serverId }
    const [itemsMap, setItemsMap] = useState<{
      [key: string]: Array<{ id?: string; name: string; serverId?: string }>;
    }>({});
    // selectedItemId holds the ProductId string or a local:<encodedName> string
    const [selectedItemId, setSelectedItemId] = useState<string>("");

    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          const [cats, subs, catalogue] = await Promise.all([
            fetchCategories(),
            fetchSubCategories(),
            fetchCatalogue(),
          ]);
          if (!mounted) return;
          setCategories(
            Array.from(new Set(cats && cats.length ? cats : initialCategories))
          );
          setSubcategories(
            Array.from(
              new Set(subs && subs.length ? subs : initialSubcategoriesFlat)
            )
          );

          // Build items map from catalogue: group by Category::SubCategory and *dedupe by ProductServerId*
          const arr = Array.isArray(catalogue) ? catalogue : [];
          const tempItems: {
            [key: string]: Array<{ id?: string; name: string; serverId?: string }>;
          } = {};
          const seenServerIds: { [key: string]: Set<string> } = {};
          const normalize = (s?: string) =>
            (s == null ? undefined : String(s).trim().toLowerCase());

          for (const entry of arr) {
            const cat = (entry?.Category ?? entry?.category ?? "") as string;
            const sub =
              (entry?.SubCategory ?? entry?.subCategory ?? entry?.Sub_Category ?? "") as string;
            const name =
              (entry?.Name ?? entry?.name ?? entry?.ProductName ?? "") as string;
            const rawProductId =
              entry?.ProductId ??
              entry?.productId ??
              entry?.productid ??
              entry?.qtId ??
              entry?.QtId ??
              entry?.id ??
              undefined;
            const productId = rawProductId != null ? String(rawProductId) : undefined;
            const rawServerId =
              entry?.ProductServerId ??
              entry?.productServerId ??
              entry?.productserverid ??
              entry?.ProductServerID ??
              entry?.serverId ??
              entry?.ServerId ??
              undefined;
            const serverId = rawServerId != null ? String(rawServerId) : undefined;

            if (!cat || !sub || !name || !productId || !serverId) continue;
            const key = `${cat}::${sub}`;
            if (!tempItems[key]) tempItems[key] = [];
            if (!seenServerIds[key]) seenServerIds[key] = new Set();
            const serverNorm = normalize(serverId)!;
            if (seenServerIds[key].has(serverNorm)) continue;
            seenServerIds[key].add(serverNorm);
            // Use ProductId string as the id value for dropdown
            tempItems[key].push({ id: productId, name, serverId });
          }

          if (mounted) setItemsMap(tempItems);
        } catch (err: unknown) {
          console.error("Failed to load categories/subcategories or catalogue", err);
          const message = err instanceof Error ? err.message : String(err);
          if (mounted) setCategoriesError(message || "Unknown error");
        } finally {
          if (mounted) setLoadingCategories(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!quantity || quantity <= 0) {
        window.alert("Please enter a valid quantity (1 or greater). ");
        return;
      }
      const payload = {
        category,
        subcategory,
        itemId: selectedItemId || itemName,
        itemName,
        quantity,
      };
      console.log("Add Item payload:", payload);
      setSubmitted(true);
    };

    return (
      <div
        style={{
          minHeight: "100vh",
          minWidth: "100vw",
          width: "100vw",
          height: "100vh",
          background: "#f5f5f5",
          color: "#181818",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 40,
            borderRadius: 12,
            boxShadow: "0 6px 30px rgba(0,0,0,0.12)",
            minWidth: 640,
            maxWidth: "920px",
            width: "min(92vw, 920px)",
          }}
        >
          <h1 style={{ marginBottom: 8 }}>Add Item</h1>
          <h3 style={{ marginBottom: 24, color: "#555" }}>
            Add a new item with category and subcategory
          </h3>

          {loadingCategories ? (
            <div style={{ padding: 24, textAlign: "center" }}>Loading categories...</div>
          ) : categoriesError ? (
            <div style={{ padding: 24, textAlign: "center", color: "#b00020" }}>Failed to load categories: {categoriesError}</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label>Category</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                    <option value="">Select Category</option>
                    {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                  <Button size="small" variant="outlined" onClick={() => setShowNewCategoryDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Category</Button>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label>Subcategory</label>
                <select value={subcategory} onChange={(e) => { setSubcategory(e.target.value); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                  <option value="">Select Subcategory</option>
                  {subcategories.map((sub) => (<option key={sub} value={sub}>{sub}</option>))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label>Item</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select value={String(selectedItemId || itemName)} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const val = e.target.value; const key = `${category}::${subcategory}`; const arr = itemsMap[key] || []; const normalize = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const foundById = arr.find((it) => it.id != null && normalize(String(it.id)) === normalize(val)); if (foundById) { setItemName(foundById.name); setSelectedItemId(String(foundById.id)); return; } if (val.startsWith("local:")) { try { const decoded = decodeURIComponent(val.slice("local:".length)); const foundByName = arr.find((it) => it.name === decoded); if (foundByName) { setItemName(foundByName.name); setSelectedItemId(String(foundByName.id ?? `local:${encodeURIComponent(foundByName.name)}`)); return; } } catch { } } setItemName(val); setSelectedItemId(val);
                  }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required disabled={!category || !subcategory}>
                    <option value="">Select Item</option>
                    {category && subcategory ? (itemsMap[`${category}::${subcategory}`] || []).map((it) => { const value = it.id != null ? String(it.id) : `local:${encodeURIComponent(it.name)}`; return (<option key={value} value={value}>{it.id != null ? String(it.id) : it.name}</option>); }) : null}
                  </select>
                  <Button size="small" variant="outlined" onClick={() => setShowNewItemDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Item</Button>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label>Quantity</label>
                <input type="number" min={1} value={quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required />
              </div>

              <Button type="submit" variant="contained" color="primary" sx={{ width: "100%" }}>Add Item</Button>
              {submitted && (<div style={{ color: "green", marginTop: 16, textAlign: "center" }}>Item added successfully!</div>)}
            </form>
          )}
        </div>

        <Dialog open={showNewCategoryDialog} onClose={() => setShowNewCategoryDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Create New Product Category</DialogTitle>
          <DialogContent>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TextField label="Category" value={newCategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)} fullWidth />
              <TextField label="SubCategory" value={newSubcategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubcategoryName(e.target.value)} fullWidth />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNewCategoryDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={async () => {
              const cat = newCategoryName.trim(); const sub = newSubcategoryName.trim(); if (!cat) return; try { const res = await insertCategoryAndSubCategory({ Category: cat || null, SubCategory: sub || null }); if (res == null || res === 0) { window.alert("Failed to create category/subcategory on server."); return; } setCategories((prev) => (prev.includes(cat) ? prev : [...prev, cat])); if (sub) setSubcategories((prev) => (prev.includes(sub) ? prev : [...prev, sub])); setCategory(cat); if (sub) setSubcategory(sub); setNewCategoryName(""); setNewSubcategoryName(""); setShowNewCategoryDialog(false); } catch (err) { console.error("create category error", err); window.alert("Error creating category/subcategory."); }
            }}>Create</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={showNewItemDialog} onClose={() => setShowNewItemDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Create New Item</DialogTitle>
          <DialogContent>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><div style={{ marginBottom: 6, fontWeight: 600 }}>Category</div><div style={{ color: "#444" }}>{category || "(select category)"}</div></div>
              <div><div style={{ marginBottom: 6, fontWeight: 600 }}>SubCategory</div><div style={{ color: "#444" }}>{subcategory || "(select subcategory)"}</div></div>
              <TextField label="Item Name" value={newItemNameForDialog} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemNameForDialog(e.target.value)} fullWidth />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNewItemDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              const item = newItemNameForDialog.trim(); if (!item) return; if (!category || !subcategory) { window.alert("Please select Category and SubCategory before creating an item."); return; } const key = `${category}::${subcategory}`; const localId = `local:${encodeURIComponent(item)}`; setItemsMap((prev) => { const prevArr = prev[key] ?? []; const normalizeString = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const exists = prevArr.some((it) => (it.id != null ? normalizeString(String(it.id)) === normalizeString(localId) : it.name === item)); if (exists) return prev; return { ...prev, [key]: [...prevArr, { id: localId, name: item }] }; }); setItemName(item); setSelectedItemId(localId); setNewItemNameForDialog(""); setShowNewItemDialog(false);
            }}>Create</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemNameForDialog, setNewItemNameForDialog] = useState("");

  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<string[]>(
    initialSubcategoriesFlat
  );
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [itemsMap, setItemsMap] = useState<{
    [key: string]: Array<{ id?: string; name: string; serverId?: string }>;
  }>({});
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, subs, catalogue] = await Promise.all([
          fetchCategories(),
          fetchSubCategories(),
          fetchCatalogue(),
        ]);
        if (!mounted) return;
        setCategories(
          Array.from(new Set(cats && cats.length ? cats : initialCategories))
        );
        setSubcategories(
          Array.from(
            new Set(subs && subs.length ? subs : initialSubcategoriesFlat)
          )
        );

        const arr = Array.isArray(catalogue) ? catalogue : [];
        const tempItems: {
          [key: string]: Array<{ id?: string; name: string; serverId?: string }>;
        } = {};
        const seenServerIds: { [key: string]: Set<string> } = {};
        const normalize = (s?: string) =>
          (s == null ? undefined : String(s).trim().toLowerCase());

        for (const entry of arr) {
          const cat = (entry?.Category ?? entry?.category ?? "") as string;
          const sub =
            (entry?.SubCategory ?? entry?.subCategory ?? entry?.Sub_Category ?? "") as string;
          const name =
            (entry?.Name ?? entry?.name ?? entry?.ProductName ?? "") as string;
          const rawProductId =
            entry?.ProductId ??
            entry?.productId ??
            entry?.productid ??
            entry?.qtId ??
            entry?.QtId ??
            entry?.id ??
            undefined;
          const productId = rawProductId != null ? String(rawProductId) : undefined;
          const rawServerId =
            entry?.ProductServerId ??
            entry?.productServerId ??
            entry?.productserverid ??
            entry?.ProductServerID ??
            entry?.serverId ??
            entry?.ServerId ??
            undefined;
          const serverId = rawServerId != null ? String(rawServerId) : undefined;

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
      } catch (err: unknown) {
        console.error("Failed to load categories/subcategories or catalogue", err);
        const message = err instanceof Error ? err.message : String(err);
        if (mounted) setCategoriesError(message || "Unknown error");
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      window.alert("Please enter a valid quantity (1 or greater). ");
      return;
    }
    const payload = {
      category,
      subcategory,
      itemId: selectedItemId || itemName,
      itemName,
      quantity,
    };
    console.log("Add Item payload:", payload);
    setSubmitted(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        width: "100vw",
        height: "100vh",
        background: "#f5f5f5",
        color: "#181818",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 6px 30px rgba(0,0,0,0.12)",
          minWidth: 640,
          maxWidth: "920px",
          width: "min(92vw, 920px)",
        }}
      >
        <h1 style={{ marginBottom: 8 }}>Add Item</h1>
        <h3 style={{ marginBottom: 24, color: "#555" }}>
          Add a new item with category and subcategory
        </h3>

        {loadingCategories ? (
          <div style={{ padding: 24, textAlign: "center" }}>Loading categories...</div>
        ) : categoriesError ? (
          <div style={{ padding: 24, textAlign: "center", color: "#b00020" }}>Failed to load categories: {categoriesError}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label>Category</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                  <option value="">Select Category</option>
                  {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
                <Button size="small" variant="outlined" onClick={() => setShowNewCategoryDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Category</Button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Subcategory</label>
              <select value={subcategory} onChange={(e) => { setSubcategory(e.target.value); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (<option key={sub} value={sub}>{sub}</option>))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Item</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={String(selectedItemId || itemName)} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const val = e.target.value; const key = `${category}::${subcategory}`; const arr = itemsMap[key] || []; const normalize = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const foundById = arr.find((it) => it.id != null && normalize(String(it.id)) === normalize(val)); if (foundById) { setItemName(foundById.name); setSelectedItemId(String(foundById.id)); return; } if (val.startsWith("local:")) { try { const decoded = decodeURIComponent(val.slice("local:".length)); const foundByName = arr.find((it) => it.name === decoded); if (foundByName) { setItemName(foundByName.name); setSelectedItemId(String(foundByName.id ?? `local:${encodeURIComponent(foundByName.name)}`)); return; } } catch { } } setItemName(val); setSelectedItemId(val);
                }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required disabled={!category || !subcategory}>
                  <option value="">Select Item</option>
                  {category && subcategory ? (itemsMap[`${category}::${subcategory}`] || []).map((it) => { const value = it.id != null ? String(it.id) : `local:${encodeURIComponent(it.name)}`; return (<option key={value} value={value}>{it.id != null ? String(it.id) : it.name}</option>); }) : null}
                </select>
                <Button size="small" variant="outlined" onClick={() => setShowNewItemDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Item</Button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Quantity</label>
              <input type="number" min={1} value={quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required />
            </div>

            <Button type="submit" variant="contained" color="primary" sx={{ width: "100%" }}>Add Item</Button>
            {submitted && (<div style={{ color: "green", marginTop: 16, textAlign: "center" }}>Item added successfully!</div>)}
          </form>
        )}
      </div>

      <Dialog open={showNewCategoryDialog} onClose={() => setShowNewCategoryDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Product Category</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TextField label="Category" value={newCategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)} fullWidth />
            <TextField label="SubCategory" value={newSubcategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubcategoryName(e.target.value)} fullWidth />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewCategoryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            const cat = newCategoryName.trim(); const sub = newSubcategoryName.trim(); if (!cat) return; try { const res = await insertCategoryAndSubCategory({ Category: cat || null, SubCategory: sub || null }); if (res == null || res === 0) { window.alert("Failed to create category/subcategory on server."); return; } setCategories((prev) => (prev.includes(cat) ? prev : [...prev, cat])); if (sub) setSubcategories((prev) => (prev.includes(sub) ? prev : [...prev, sub])); setCategory(cat); if (sub) setSubcategory(sub); setNewCategoryName(""); setNewSubcategoryName(""); setShowNewCategoryDialog(false); } catch (err) { console.error("create category error", err); window.alert("Error creating category/subcategory."); }
          }}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showNewItemDialog} onClose={() => setShowNewItemDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Item</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>Category</div><div style={{ color: "#444" }}>{category || "(select category)"}</div></div>
            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>SubCategory</div><div style={{ color: "#444" }}>{subcategory || "(select subcategory)"}</div></div>
            <TextField label="Item Name" value={newItemNameForDialog} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemNameForDialog(e.target.value)} fullWidth />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewItemDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            const item = newItemNameForDialog.trim(); if (!item) return; if (!category || !subcategory) { window.alert("Please select Category and SubCategory before creating an item."); return; } const key = `${category}::${subcategory}`; const localId = `local:${encodeURIComponent(item)}`; setItemsMap((prev) => { const prevArr = prev[key] ?? []; const normalizeString = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const exists = prevArr.some((it) => (it.id != null ? normalizeString(String(it.id)) === normalizeString(localId) : it.name === item)); if (exists) return prev; return { ...prev, [key]: [...prevArr, { id: localId, name: item }] }; }); setItemName(item); setSelectedItemId(localId); setNewItemNameForDialog(""); setShowNewItemDialog(false);
          }}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
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
  fetchCategories,
  fetchSubCategories,
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
  const [quantity, setQuantity] = useState<number>(1);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemNameForDialog, setNewItemNameForDialog] = useState("");

  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<string[]>(
    initialSubcategoriesFlat
  );
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [itemsMap, setItemsMap] = useState<{
    [key: string]: Array<{ id?: string; name: string; serverId?: string }>;
  }>({});
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, subs, catalogue] = await Promise.all([
          fetchCategories(),
          fetchSubCategories(),
          fetchCatalogue(),
        ]);
        if (!mounted) return;
        setCategories(
          Array.from(new Set(cats && cats.length ? cats : initialCategories))
        );
        setSubcategories(
          Array.from(
            new Set(subs && subs.length ? subs : initialSubcategoriesFlat)
          )
        );

        const arr = Array.isArray(catalogue) ? catalogue : [];
        const tempItems: {
          [key: string]: Array<{ id?: string; name: string; serverId?: string }>;
        } = {};
        const seenServerIds: { [key: string]: Set<string> } = {};
        const normalize = (s?: string) =>
          (s == null ? undefined : String(s).trim().toLowerCase());

        for (const entry of arr) {
          const cat = (entry?.Category ?? entry?.category ?? "") as string;
          const sub =
            (entry?.SubCategory ?? entry?.subCategory ?? entry?.Sub_Category ?? "") as string;
          const name =
            (entry?.Name ?? entry?.name ?? entry?.ProductName ?? "") as string;
          const rawProductId =
            entry?.ProductId ??
            entry?.productId ??
            entry?.productid ??
            entry?.qtId ??
            entry?.QtId ??
            entry?.id ??
            undefined;
          const productId = rawProductId != null ? String(rawProductId) : undefined;
          const rawServerId =
            entry?.ProductServerId ??
            entry?.productServerId ??
            entry?.productserverid ??
            entry?.ProductServerID ??
            entry?.serverId ??
            entry?.ServerId ??
            undefined;
          const serverId = rawServerId != null ? String(rawServerId) : undefined;

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
      } catch (err: unknown) {
        console.error("Failed to load categories/subcategories or catalogue", err);
        const message = err instanceof Error ? err.message : String(err);
        if (mounted) setCategoriesError(message || "Unknown error");
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      window.alert("Please enter a valid quantity (1 or greater). ");
      return;
    }
    const payload = {
      category,
      subcategory,
      itemId: selectedItemId || itemName,
      itemName,
      quantity,
    };
    console.log("Add Item payload:", payload);
    setSubmitted(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        width: "100vw",
        height: "100vh",
        background: "#f5f5f5",
        color: "#181818",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 6px 30px rgba(0,0,0,0.12)",
          minWidth: 640,
          maxWidth: "920px",
          width: "min(92vw, 920px)",
        }}
      >
        <h1 style={{ marginBottom: 8 }}>Add Item</h1>
        <h3 style={{ marginBottom: 24, color: "#555" }}>
          Add a new item with category and subcategory
        </h3>

        {loadingCategories ? (
          <div style={{ padding: 24, textAlign: "center" }}>Loading categories...</div>
        ) : categoriesError ? (
          <div style={{ padding: 24, textAlign: "center", color: "#b00020" }}>Failed to load categories: {categoriesError}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label>Category</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                  <option value="">Select Category</option>
                  {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
                <Button size="small" variant="outlined" onClick={() => setShowNewCategoryDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Category</Button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Subcategory</label>
              <select value={subcategory} onChange={(e) => { setSubcategory(e.target.value); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (<option key={sub} value={sub}>{sub}</option>))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Item</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={String(selectedItemId || itemName)} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const val = e.target.value; const key = `${category}::${subcategory}`; const arr = itemsMap[key] || []; const normalize = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const foundById = arr.find((it) => it.id != null && normalize(String(it.id)) === normalize(val)); if (foundById) { setItemName(foundById.name); setSelectedItemId(String(foundById.id)); return; } if (val.startsWith("local:")) { try { const decoded = decodeURIComponent(val.slice("local:".length)); const foundByName = arr.find((it) => it.name === decoded); if (foundByName) { setItemName(foundByName.name); setSelectedItemId(String(foundByName.id ?? `local:${encodeURIComponent(foundByName.name)}`)); return; } } catch { } } setItemName(val); setSelectedItemId(val);
                }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required disabled={!category || !subcategory}>
                  <option value="">Select Item</option>
                  {category && subcategory ? (itemsMap[`${category}::${subcategory}`] || []).map((it) => { const value = it.id != null ? String(it.id) : `local:${encodeURIComponent(it.name)}`; return (<option key={value} value={value}>{it.id != null ? String(it.id) : it.name}</option>); }) : null}
                </select>
                <Button size="small" variant="outlined" onClick={() => setShowNewItemDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Item</Button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Quantity</label>
              <input type="number" min={1} value={quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required />
            </div>

            <Button type="submit" variant="contained" color="primary" sx={{ width: "100%" }}>Add Item</Button>
            {submitted && (<div style={{ color: "green", marginTop: 16, textAlign: "center" }}>Item added successfully!</div>)}
          </form>
        )}
      </div>

      <Dialog open={showNewCategoryDialog} onClose={() => setShowNewCategoryDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Product Category</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TextField label="Category" value={newCategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)} fullWidth />
            <TextField label="SubCategory" value={newSubcategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubcategoryName(e.target.value)} fullWidth />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewCategoryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            const cat = newCategoryName.trim(); const sub = newSubcategoryName.trim(); if (!cat) return; try { const res = await insertCategoryAndSubCategory({ Category: cat || null, SubCategory: sub || null }); if (res == null || res === 0) { window.alert("Failed to create category/subcategory on server."); return; } setCategories((prev) => (prev.includes(cat) ? prev : [...prev, cat])); if (sub) setSubcategories((prev) => (prev.includes(sub) ? prev : [...prev, sub])); setCategory(cat); if (sub) setSubcategory(sub); setNewCategoryName(""); setNewSubcategoryName(""); setShowNewCategoryDialog(false); } catch (err) { console.error("create category error", err); window.alert("Error creating category/subcategory."); }
          }}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showNewItemDialog} onClose={() => setShowNewItemDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Item</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>Category</div><div style={{ color: "#444" }}>{category || "(select category)"}</div></div>
            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>SubCategory</div><div style={{ color: "#444" }}>{subcategory || "(select subcategory)"}</div></div>
            <TextField label="Item Name" value={newItemNameForDialog} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemNameForDialog(e.target.value)} fullWidth />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewItemDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            const item = newItemNameForDialog.trim(); if (!item) return; if (!category || !subcategory) { window.alert("Please select Category and SubCategory before creating an item."); return; } const key = `${category}::${subcategory}`; const localId = `local:${encodeURIComponent(item)}`; setItemsMap((prev) => { const prevArr = prev[key] ?? []; const normalizeString = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const exists = prevArr.some((it) => (it.id != null ? normalizeString(String(it.id)) === normalizeString(localId) : it.name === item)); if (exists) return prev; return { ...prev, [key]: [...prevArr, { id: localId, name: item }] }; }); setItemName(item); setSelectedItemId(localId); setNewItemNameForDialog(""); setShowNewItemDialog(false);
          }}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
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
  fetchCategories,
  fetchSubCategories,
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
  const [quantity, setQuantity] = useState<number>(1);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemNameForDialog, setNewItemNameForDialog] = useState("");

  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<string[]>(
    initialSubcategoriesFlat
  );
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [itemsMap, setItemsMap] = useState<{
    [key: string]: Array<{ id?: string; name: string; serverId?: string }>;
  }>({});
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, subs, catalogue] = await Promise.all([
          fetchCategories(),
          fetchSubCategories(),
          fetchCatalogue(),
        ]);
        if (!mounted) return;
        setCategories(
          Array.from(new Set(cats && cats.length ? cats : initialCategories))
        );
        setSubcategories(
          Array.from(
            new Set(subs && subs.length ? subs : initialSubcategoriesFlat)
          )
        );

        const arr = Array.isArray(catalogue) ? catalogue : [];
        const tempItems: {
          [key: string]: Array<{ id?: string; name: string; serverId?: string }>;
        } = {};
        const seenServerIds: { [key: string]: Set<string> } = {};
        const normalize = (s?: string) =>
          s == null ? undefined : String(s).trim().toLowerCase();

        for (const entry of arr) {
          const cat = (entry?.Category ?? entry?.category ?? "") as string;
          const sub =
            (entry?.SubCategory ?? entry?.subCategory ?? entry?.Sub_Category ?? "") as string;
          const name =
            (entry?.Name ?? entry?.name ?? entry?.ProductName ?? "") as string;
          const rawProductId =
            entry?.ProductId ??
            entry?.productId ??
            entry?.productid ??
            entry?.qtId ??
            entry?.QtId ??
            entry?.id ??
            undefined;
          const productId = rawProductId != null ? String(rawProductId) : undefined;
          const rawServerId =
            entry?.ProductServerId ??
            entry?.productServerId ??
            entry?.productserverid ??
            entry?.ProductServerID ??
            entry?.serverId ??
            entry?.ServerId ??
            undefined;
          const serverId = rawServerId != null ? String(rawServerId) : undefined;

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
      } catch (err: unknown) {
        console.error("Failed to load categories/subcategories or catalogue", err);
        const message = err instanceof Error ? err.message : String(err);
        if (mounted) setCategoriesError(message || "Unknown error");
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      window.alert("Please enter a valid quantity (1 or greater). ");
      return;
    }
    const payload = {
      category,
      subcategory,
      itemId: selectedItemId || itemName,
      itemName,
      quantity,
    };
    console.log("Add Item payload:", payload);
    setSubmitted(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        width: "100vw",
        height: "100vh",
        background: "#f5f5f5",
        color: "#181818",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 6px 30px rgba(0,0,0,0.12)",
          minWidth: 640,
          maxWidth: "920px",
          width: "min(92vw, 920px)",
        }}
      >
        <h1 style={{ marginBottom: 8 }}>Add Item</h1>
        <h3 style={{ marginBottom: 24, color: "#555" }}>
          Add a new item with category and subcategory
        </h3>

        {loadingCategories ? (
          <div style={{ padding: 24, textAlign: "center" }}>Loading categories...</div>
        ) : categoriesError ? (
          <div style={{ padding: 24, textAlign: "center", color: "#b00020" }}>Failed to load categories: {categoriesError}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label>Category</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                  <option value="">Select Category</option>
                  {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
                <Button size="small" variant="outlined" onClick={() => setShowNewCategoryDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Category</Button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Subcategory</label>
              <select value={subcategory} onChange={(e) => { setSubcategory(e.target.value); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (<option key={sub} value={sub}>{sub}</option>))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Item</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={String(selectedItemId || itemName)} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const val = e.target.value; const key = `${category}::${subcategory}`; const arr = itemsMap[key] || []; const normalize = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const foundById = arr.find((it) => it.id != null && normalize(String(it.id)) === normalize(val)); if (foundById) { setItemName(foundById.name); setSelectedItemId(String(foundById.id)); return; } if (val.startsWith("local:")) { try { const decoded = decodeURIComponent(val.slice("local:".length)); const foundByName = arr.find((it) => it.name === decoded); if (foundByName) { setItemName(foundByName.name); setSelectedItemId(String(foundByName.id ?? `local:${encodeURIComponent(foundByName.name)}`)); return; } } catch { } } setItemName(val); setSelectedItemId(val);
                }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required disabled={!category || !subcategory}>
                  <option value="">Select Item</option>
                  {category && subcategory ? (itemsMap[`${category}::${subcategory}`] || []).map((it) => { const value = it.id != null ? String(it.id) : `local:${encodeURIComponent(it.name)}`; return (<option key={value} value={value}>{it.id != null ? String(it.id) : it.name}</option>); }) : null}
                </select>
                <Button size="small" variant="outlined" onClick={() => setShowNewItemDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Item</Button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Quantity</label>
              <input type="number" min={1} value={quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required />
            </div>

            <Button type="submit" variant="contained" color="primary" sx={{ width: "100%" }}>Add Item</Button>
            {submitted && (<div style={{ color: "green", marginTop: 16, textAlign: "center" }}>Item added successfully!</div>)}
          </form>
        )}
      </div>

      <Dialog open={showNewCategoryDialog} onClose={() => setShowNewCategoryDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Product Category</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TextField label="Category" value={newCategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)} fullWidth />
            <TextField label="SubCategory" value={newSubcategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubcategoryName(e.target.value)} fullWidth />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewCategoryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            const cat = newCategoryName.trim(); const sub = newSubcategoryName.trim(); if (!cat) return; try { const res = await insertCategoryAndSubCategory({ Category: cat || null, SubCategory: sub || null }); if (res == null || res === 0) { window.alert("Failed to create category/subcategory on server."); return; } setCategories((prev) => (prev.includes(cat) ? prev : [...prev, cat])); if (sub) setSubcategories((prev) => (prev.includes(sub) ? prev : [...prev, sub])); setCategory(cat); if (sub) setSubcategory(sub); setNewCategoryName(""); setNewSubcategoryName(""); setShowNewCategoryDialog(false); } catch (err) { console.error("create category error", err); window.alert("Error creating category/subcategory."); }
          }}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showNewItemDialog} onClose={() => setShowNewItemDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Item</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>Category</div><div style={{ color: "#444" }}>{category || "(select category)"}</div></div>
            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>SubCategory</div><div style={{ color: "#444" }}>{subcategory || "(select subcategory)"}</div></div>
            <TextField label="Item Name" value={newItemNameForDialog} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemNameForDialog(e.target.value)} fullWidth />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewItemDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            const item = newItemNameForDialog.trim(); if (!item) return; if (!category || !subcategory) { window.alert("Please select Category and SubCategory before creating an item."); return; } const key = `${category}::${subcategory}`; const localId = `local:${encodeURIComponent(item)}`; setItemsMap((prev) => { const prevArr = prev[key] ?? []; const normalizeString = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const exists = prevArr.some((it) => (it.id != null ? normalizeString(String(it.id)) === normalizeString(localId) : it.name === item)); if (exists) return prev; return { ...prev, [key]: [...prevArr, { id: localId, name: item }] }; }); setItemName(item); setSelectedItemId(localId); setNewItemNameForDialog(""); setShowNewItemDialog(false);
          }}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
} from "@mui/material";
import {
  insertCategoryAndSubCategory,
  fetchCategories,
  fetchSubCategories,
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
  const [quantity, setQuantity] = useState<number>(1);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemNameForDialog, setNewItemNameForDialog] = useState("");
import React, { useEffect, useState } from "react";
import "./App.css";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { insertCategoryAndSubCategory, fetchCategories, fetchSubCategories, fetchCatalogue } from "./APIService";

const initialCategories = ["Electronics", "Documents", "Jewelry"];
const initialSubcategoriesFlat: string[] = ["Laptop", "Mobile", "Tablet", "Passport", "License", "Certificate", "Ring", "Necklace", "Bracelet"];

export default function AddItemPage() {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemNameForDialog, setNewItemNameForDialog] = useState("");

  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<string[]>(
    initialSubcategoriesFlat
  );
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [itemsMap, setItemsMap] = useState<{
    [key: string]: Array<{ id?: string; name: string; serverId?: string }>;
  }>({});
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, subs, catalogue] = await Promise.all([
          fetchCategories(),
          fetchSubCategories(),
          fetchCatalogue(),
        ]);
        if (!mounted) return;
        setCategories(
          Array.from(new Set(cats && cats.length ? cats : initialCategories))
        );
        setSubcategories(
          Array.from(
            new Set(subs && subs.length ? subs : initialSubcategoriesFlat)
          )
        );

        const arr = Array.isArray(catalogue) ? catalogue : [];
        const tempItems: {
          [key: string]: Array<{ id?: string; name: string; serverId?: string }>;
        } = {};
        const seenServerIds: { [key: string]: Set<string> } = {};
        const normalize = (s?: string) =>
          (s == null ? undefined : String(s).trim().toLowerCase());

        for (const entry of arr) {
          const cat = (entry?.Category ?? entry?.category ?? "") as string;
          const sub =
            (entry?.SubCategory ?? entry?.subCategory ?? entry?.Sub_Category ?? "") as string;
          const name =
            (entry?.Name ?? entry?.name ?? entry?.ProductName ?? "") as string;
          const rawProductId =
            entry?.ProductId ??
            entry?.productId ??
            entry?.productid ??
            entry?.qtId ??
            entry?.QtId ??
            entry?.id ??
            undefined;
          const productId = rawProductId != null ? String(rawProductId) : undefined;
          const rawServerId =
            entry?.ProductServerId ??
            entry?.productServerId ??
            entry?.productserverid ??
            entry?.ProductServerID ??
            entry?.serverId ??
            entry?.ServerId ??
            undefined;
          const serverId = rawServerId != null ? String(rawServerId) : undefined;

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
      } catch (err: unknown) {
        console.error("Failed to load categories/subcategories or catalogue", err);
        const message = err instanceof Error ? err.message : String(err);
        if (mounted) setCategoriesError(message || "Unknown error");
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      window.alert("Please enter a valid quantity (1 or greater). ");
      return;
    }
    const payload = {
      category,
      subcategory,
      itemId: selectedItemId || itemName,
      itemName,
      quantity,
    };
    console.log("Add Item payload:", payload);
    setSubmitted(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        width: "100vw",
        height: "100vh",
        background: "#f5f5f5",
        color: "#181818",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 6px 30px rgba(0,0,0,0.12)",
          minWidth: 640,
          maxWidth: "920px",
          width: "min(92vw, 920px)",
        }}
      >
        <h1 style={{ marginBottom: 8 }}>Add Item</h1>
        <h3 style={{ marginBottom: 24, color: "#555" }}>
          Add a new item with category and subcategory
        </h3>

        {loadingCategories ? (
          <div style={{ padding: 24, textAlign: "center" }}>Loading categories...</div>
        ) : categoriesError ? (
          <div style={{ padding: 24, textAlign: "center", color: "#b00020" }}>Failed to load categories: {categoriesError}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label>Category</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                  <option value="">Select Category</option>
                  {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
                <Button size="small" variant="outlined" onClick={() => setShowNewCategoryDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Category</Button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Subcategory</label>
              <select value={subcategory} onChange={(e) => { setSubcategory(e.target.value); setSelectedItemId(""); setItemName(""); }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (<option key={sub} value={sub}>{sub}</option>))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Item</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={String(selectedItemId || itemName)} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const val = e.target.value; const key = `${category}::${subcategory}`; const arr = itemsMap[key] || []; const normalize = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const foundById = arr.find((it) => it.id != null && normalize(String(it.id)) === normalize(val)); if (foundById) { setItemName(foundById.name); setSelectedItemId(String(foundById.id)); return; } if (val.startsWith("local:")) { try { const decoded = decodeURIComponent(val.slice("local:".length)); const foundByName = arr.find((it) => it.name === decoded); if (foundByName) { setItemName(foundByName.name); setSelectedItemId(String(foundByName.id ?? `local:${encodeURIComponent(foundByName.name)}`)); return; } } catch { } } setItemName(val); setSelectedItemId(val);
                }} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required disabled={!category || !subcategory}>
                  <option value="">Select Item</option>
                  {category && subcategory ? (itemsMap[`${category}::${subcategory}`] || []).map((it) => { const value = it.id != null ? String(it.id) : `local:${encodeURIComponent(it.name)}`; return (<option key={value} value={value}>{it.id != null ? String(it.id) : it.name}</option>); }) : null}
                </select>
                <Button size="small" variant="outlined" onClick={() => setShowNewItemDialog(true)} sx={{ height: 40, alignSelf: "flex-start" }}>New Item</Button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Quantity</label>
              <input type="number" min={1} value={quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }} required />
            </div>

            <Button type="submit" variant="contained" color="primary" sx={{ width: "100%" }}>Add Item</Button>
            {submitted && (<div style={{ color: "green", marginTop: 16, textAlign: "center" }}>Item added successfully!</div>)}
          </form>
        )}
      </div>

      <Dialog open={showNewCategoryDialog} onClose={() => setShowNewCategoryDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Product Category</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TextField label="Category" value={newCategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)} fullWidth />
            <TextField label="SubCategory" value={newSubcategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubcategoryName(e.target.value)} fullWidth />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewCategoryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            const cat = newCategoryName.trim(); const sub = newSubcategoryName.trim(); if (!cat) return; try { const res = await insertCategoryAndSubCategory({ Category: cat || null, SubCategory: sub || null }); if (res == null || res === 0) { window.alert("Failed to create category/subcategory on server."); return; } setCategories((prev) => (prev.includes(cat) ? prev : [...prev, cat])); if (sub) setSubcategories((prev) => (prev.includes(sub) ? prev : [...prev, sub])); setCategory(cat); if (sub) setSubcategory(sub); setNewCategoryName(""); setNewSubcategoryName(""); setShowNewCategoryDialog(false); } catch (err) { console.error("create category error", err); window.alert("Error creating category/subcategory."); }
          }}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showNewItemDialog} onClose={() => setShowNewItemDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Item</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>Category</div><div style={{ color: "#444" }}>{category || "(select category)"}</div></div>
            <div><div style={{ marginBottom: 6, fontWeight: 600 }}>SubCategory</div><div style={{ color: "#444" }}>{subcategory || "(select subcategory)"}</div></div>
            <TextField label="Item Name" value={newItemNameForDialog} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemNameForDialog(e.target.value)} fullWidth />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewItemDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            const item = newItemNameForDialog.trim(); if (!item) return; if (!category || !subcategory) { window.alert("Please select Category and SubCategory before creating an item."); return; } const key = `${category}::${subcategory}`; const localId = `local:${encodeURIComponent(item)}`; setItemsMap((prev) => { const prevArr = prev[key] ?? []; const normalizeString = (s?: string) => (s == null ? undefined : String(s).trim().toLowerCase()); const exists = prevArr.some((it) => (it.id != null ? normalizeString(String(it.id)) === normalizeString(localId) : it.name === item)); if (exists) return prev; return { ...prev, [key]: [...prevArr, { id: localId, name: item }] }; }); setItemName(item); setSelectedItemId(localId); setNewItemNameForDialog(""); setShowNewItemDialog(false);
          }}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
