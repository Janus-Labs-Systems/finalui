import React from "react";
import { Box, Typography, Avatar, Chip, Divider } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SecurityIcon from "@mui/icons-material/Security";

interface ProfilePageProps {
  userName?: string | null;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 1.5,
        px: 2,
        borderRadius: 2,
        "&:hover": { backgroundColor: "rgba(167,139,250,0.06)" },
        transition: "background-color 0.15s",
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          backgroundColor: "rgba(167,139,250,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "var(--accent)",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 14, color: "var(--text)", fontWeight: 500, mt: 0.2 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ProfilePage({ userName }: ProfilePageProps) {
  const name = userName || "Admin";
  const initials = name.charAt(0).toUpperCase();
  const email = `${name.toLowerCase()}@janussystems.xyz`;
  const joinDate = "January 2024";

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 760, mx: "auto" }}>

      {/* Header card */}
      <Box
        sx={{
          borderRadius: 3,
          background: "linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(99,102,241,0.12) 100%)",
          border: "1px solid rgba(167,139,250,0.2)",
          p: { xs: 3, md: 4 },
          display: "flex",
          alignItems: "center",
          gap: 3,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            fontSize: 32,
            fontWeight: 700,
            background: "linear-gradient(135deg, var(--accent), #6366f1)",
            boxShadow: "0 8px 24px rgba(167,139,250,0.35)",
          }}
        >
          {initials}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: 22, md: 26 },
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1.2,
            }}
          >
            {name}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "var(--muted)", mt: 0.5 }}>
            System Administrator
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
            <Chip
              label="Active"
              size="small"
              sx={{
                backgroundColor: "rgba(52,211,153,0.15)",
                color: "#34d399",
                fontWeight: 600,
                fontSize: 11,
                height: 22,
                border: "1px solid rgba(52,211,153,0.3)",
              }}
            />
            <Chip
              label="Administrator"
              size="small"
              sx={{
                backgroundColor: "rgba(167,139,250,0.15)",
                color: "var(--accent)",
                fontWeight: 600,
                fontSize: 11,
                height: 22,
                border: "1px solid rgba(167,139,250,0.3)",
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Info sections */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>

        {/* Contact info */}
        <Box
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(167,139,250,0.15)",
            backgroundColor: "var(--card-bg)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Contact Information
            </Typography>
          </Box>
          <Box sx={{ py: 0.5 }}>
            <InfoRow icon={<EmailIcon sx={{ fontSize: 18 }} />} label="Email" value={email} />
            <Divider sx={{ borderColor: "rgba(167,139,250,0.08)", mx: 2 }} />
            <InfoRow icon={<PhoneIcon sx={{ fontSize: 18 }} />} label="Phone" value="+1 (555) 000-0000" />
            <Divider sx={{ borderColor: "rgba(167,139,250,0.08)", mx: 2 }} />
            <InfoRow icon={<BusinessIcon sx={{ fontSize: 18 }} />} label="Department" value="IT Operations" />
          </Box>
        </Box>

        {/* Account details */}
        <Box
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(167,139,250,0.15)",
            backgroundColor: "var(--card-bg)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Account Details
            </Typography>
          </Box>
          <Box sx={{ py: 0.5 }}>
            <InfoRow icon={<PersonIcon sx={{ fontSize: 18 }} />} label="User ID" value={name} />
            <Divider sx={{ borderColor: "rgba(167,139,250,0.08)", mx: 2 }} />
            <InfoRow icon={<BadgeIcon sx={{ fontSize: 18 }} />} label="Role" value="System Administrator" />
            <Divider sx={{ borderColor: "rgba(167,139,250,0.08)", mx: 2 }} />
            <InfoRow icon={<CalendarTodayIcon sx={{ fontSize: 18 }} />} label="Member Since" value={joinDate} />
          </Box>
        </Box>

        {/* Security */}
        <Box
          sx={{
            gridColumn: { md: "1 / -1" },
            borderRadius: 3,
            border: "1px solid rgba(167,139,250,0.15)",
            backgroundColor: "var(--card-bg)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Security
            </Typography>
          </Box>
          <Box sx={{ py: 0.5 }}>
            <InfoRow icon={<SecurityIcon sx={{ fontSize: 18 }} />} label="Access Level" value="Full Access — All Modules" />
            <Divider sx={{ borderColor: "rgba(167,139,250,0.08)", mx: 2 }} />
            <InfoRow icon={<BadgeIcon sx={{ fontSize: 18 }} />} label="Session" value="Active (expires on logout)" />
          </Box>
        </Box>

      </Box>
    </Box>
  );
}
