import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { addAppUser, fetchAppUsers } from "./APIService";

interface AddUserProps {
  onDone?: () => void;
}

export default function AddUser({ onDone }: AddUserProps) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [appUsers, setAppUsers] = useState<Array<any>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [expandedUserIndex, setExpandedUserIndex] = useState<number | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (
      !username ||
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      !managerEmail
    ) {
      setError("Please fill all required fields (including manager email).");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // validate Indian phone number: require exactly 10 digits, then normalize to +91XXXXXXXXXX
    const digits = (phone || "").replace(/[^0-9]/g, "");
    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    const normalizedPhone = `+91${digits}`;

    // validate manager email (required)
    if (!/^\S+@\S+\.\S+$/.test(managerEmail)) {
      setError("Please enter a valid manager email address.");
      return;
    }
    // Build payload matching InsertAppUserSP parameter names
    // reuse digits computed above
    let phoneValue: number | null = null;
    if (digits.length === 10) phoneValue = Number("91" + digits);
    else if (digits.length === 11 && digits.startsWith("0"))
      phoneValue = Number("91" + digits.slice(1));
    else if (digits.length === 12 && digits.startsWith("91"))
      phoneValue = Number(digits);

    const apiPayload: any = {
      AppUserId: username.trim(),
      Password: password ? password.trim() : null,
      UserName: name ? name.trim() : null,
      EmailID: email ? email.trim() : null,
      Phone: phoneValue,
      MEmailId: managerEmail ? managerEmail.trim() : null,
      MUserID: sessionStorage.getItem("userId") || null,
    };

    // Call API
    try {
      const res = await addAppUser(apiPayload);
      console.log("addAppUser result:", res);
      if (res == null || res === 0) {
        setError("Failed to create user on server (see console).");
        return;
      }
      // success
      // refresh list
      await loadUsers();
      // clear form
      setUsername("");
      setName("");
      setEmail("");
      setPhone("");
      setManagerEmail("");
      setPassword("");
      setConfirmPassword("");
      if (onDone) onDone();
    } catch (err) {
      console.error("AddUser submit error:", err);
      setError("Error creating user. See console for details.");
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await fetchAppUsers();
      setAppUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("loadUsers error:", err);
      setAppUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // precompute rendered user cards to keep JSX simpler
  const userCards = appUsers.map((u: any, idx: number) => {
    const phoneRaw = u.Phone ?? u.phone ?? null;
    let phoneDisplay = "";
    if (phoneRaw != null) {
      const s = String(phoneRaw);
      if (s.startsWith("91") && s.length === 12)
        phoneDisplay = `+91 ${s.slice(2)}`;
      else if (s.length === 10) phoneDisplay = s;
      else phoneDisplay = s;
    }

    const managerEmailDisplay =
      u.MEmailId ?? u.mEmailId ?? u.ManagerEmail ?? null;
    const managerUserDisplay =
      u.MUserID ?? u.mUserID ?? u.mUserId ?? u.MUserId ?? null;
    const createdAt = u.CreatedAt ?? u.createdAt ?? u.Created ?? null;
    const isActive =
      u.IsActive ?? u.isActive ?? u.Active ?? u.IsEnabled ?? null;
    const role = u.Role ?? u.role ?? u.UserRole ?? null;

    // compute primary display name: prefer explicit name, otherwise fall back to appUserId/username
    const primaryName =
      u.userName ??
      u.UserName ??
      u.name ??
      u.Name ??
      u.appUserId ??
      u.AppUserId ??
      u.AppUserID ??
      null;

    const isExpanded = expandedUserIndex === idx;

    return (
      <Card key={idx} variant="outlined" sx={{ p: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ fontWeight: 700 }}>{primaryName ?? "-"}</div>
            <div style={{ fontSize: 12, color: "var(--text)" }}>
              {u.EmailID ?? u.email ?? u.Email ?? u.EmailId}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
              Username:{" "}
              {u.appUserId ?? u.AppUserId ?? u.appUserId ?? u.AppUserID ?? "-"}
              {phoneDisplay ? ` • ${phoneDisplay}` : ""}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
              {managerEmailDisplay
                ? `Manager Email: ${managerEmailDisplay}`
                : ""}
              {managerUserDisplay
                ? ` ${
                    managerUserDisplay
                      ? ` • Manager ID: ${managerUserDisplay}`
                      : ""
                  }`
                : ""}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
              {role ? `Role: ${role}` : ""}
              {isActive != null
                ? ` ${isActive ? "• Active" : "• Inactive"}`
                : ""}
              {createdAt ? ` • Created: ${String(createdAt).slice(0, 19)}` : ""}
            </div>
          </div>

          <div style={{ marginLeft: 12, textAlign: "right" }}>
            <Button
              size="small"
              onClick={() => setExpandedUserIndex(isExpanded ? null : idx)}
            >
              {isExpanded ? "Hide" : "Details"}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <Box sx={{ mt: 1 }}>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.4 }}>
              <div>
                <strong>Username:</strong>{" "}
                {u.appUserId ??
                  u.AppUserId ??
                  u.AppUserID ??
                  u.AppUser ??
                  u.AppUserId ??
                  u.userName ??
                  u.UserName ??
                  u.User ??
                  u.name ??
                  "-"}
              </div>
              <div>
                <strong>Name:</strong>{" "}
                {u.userName ?? u.UserName ?? u.name ?? u.Name ?? ""}
              </div>
              <div>
                <strong>Email:</strong>{" "}
                {u.emailID ?? u.EmailID ?? u.Email ?? u.EmailId ?? ""}
              </div>
              <div>
                <strong>Phone:</strong> {phoneDisplay ?? ""}
              </div>
            </div>
          </Box>
        )}
      </Card>
    );
  });

  return (
    <div className="page-shell" style={{ minHeight: "calc(100vh - 72px)" }}>
      <div className="content-wrap panel" style={{ background: "var(--card-bg)", padding: "clamp(12px, 3vw, 24px)", borderRadius: 12, boxShadow: "var(--card-shadow)", minWidth: 0, maxWidth: "920px", width: "min(96vw, 920px)" }}>
        <div className="add-user-two-col" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {/* Left: form card */}
          <Card sx={{ flex: 1, minWidth: 0 }}>
            <CardContent>
              <h1
                style={{
                  marginBottom: 8,
                  fontFamily: "'Open Sans', Inter, Roboto, Arial, sans-serif",
                  fontWeight: 700 
                }}
              >
                Add User
              </h1>
              <h3 style={{ marginBottom: 18, color: "var(--muted)" }}>
                Add a new application user
              </h3>

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "grid", gap: 2 }}
              >
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Phone (India)"
                  placeholder="e.g. 9876543210 or +919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  helperText="Indian phone number — 10 digits or +91 prefix"
                  required
                  fullWidth
                />
                <TextField
                  label="Manager Email"
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  helperText="Manager's email id (required)"
                  required
                  fullWidth
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                />
                {error && (
                  <Typography color="error" variant="body2">
                    {error}
                  </Typography>
                )}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                    marginTop: 1,
                  }}
                >
                  <Button variant="outlined" onClick={() => onDone && onDone()}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    Create User
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Right: users list card */}
          <Card className="add-user-list-card" sx={{ width: 340, minWidth: 0 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Users under your management
              </Typography>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {loadingUsers ? (
                  <div>Loading users...</div>
                ) : appUsers.length === 0 ? (
                  <div style={{ color: "var(--muted)" }}>No users found.</div>
                ) : (
                  userCards
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
