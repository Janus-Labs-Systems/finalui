import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { fetchNotificationsFromApi } from "./APIService.tsx";

interface Notification {
  locker_Id: number;
  impact: string;
  notifications: string;
}

interface NotificationCardProps {
  notifications?: Notification[];
  token?: string;
}

const staticNotification: Notification = {
  locker_Id: 0,
  impact: "No Issues",
  notifications: '"No Notifications, All Systems Operational"',
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  notifications = [],
  token,
}) => {
  // If there are API notifications, show only those. If none, show only the static notification.
  const displayNotifications =
    notifications.length > 0 ? notifications : [staticNotification];

  // Track dismissed notification indexes
  const [dismissedIndexes, setDismissedIndexes] = React.useState<number[]>([]);

  const [open, setOpen] = React.useState(false);
  const [dialogMessage, setDialogMessage] = React.useState<string>("");

  const handleDismiss = (idx: number) => {
    setDismissedIndexes((prev) => [...prev, idx]);
  };

  const handleLearnMore = (message: string) => {
    setDialogMessage(message);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDialogMessage("");
  };

  // Only show notifications that are not dismissed
  const visibleNotifications = displayNotifications
    .map((n: Notification, idx: number) => ({ ...n, idx }))
    .filter((n: any) => !dismissedIndexes.includes(n.idx));

  return (
    <>
      <Box sx={{ width: "100%", pb: 1, overflowX: "auto" }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ flexWrap: "nowrap", alignItems: "flex-start", pr: 1 }}
        >
          {visibleNotifications.map((notification: any) => (
            <Card
              key={notification.idx}
              sx={{
                minWidth: 260,
                maxWidth: 360,
                flex: "0 0 auto",
                borderRadius: 2,
                boxShadow: 2,
                overflow: "hidden",
                minHeight: 160,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    sx={{
                      bgcolor: "primary.light",
                      width: 44,
                      height: 44,
                      mt: 0.5,
                    }}
                  >
                    {String(notification.locker_Id ?? "#").slice(0, 2)}
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          textAlign: "left",
                          fontStyle: "italic",
                        }}
                      >
                        {notification.impact || "Info"}
                      </Typography>
                      <Chip label={notification.time || "now"} size="small" />
                    </div>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        color: "text.secondary",
                        fontStyle: "italic",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        textAlign: "left",
                      }}
                    >
                      {notification.notifications}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        color: "text.secondary",
                        textAlign: "left",
                      }}
                    >
                      Locker: {notification.locker_Id ?? "N/A"}
                    </Typography>
                  </div>
                </Stack>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  onClick={() => handleLearnMore(notification.notifications)}
                >
                  Learn More
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDismiss(notification.idx)}
                >
                  Dismiss
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      </Box>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Notification Details</DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ whiteSpace: "pre-wrap", fontStyle: "italic" }}
          >
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

interface OutlinedCardProps {
  token: string;
}

export default function OutlinedCard({ token }: OutlinedCardProps) {
  const [apiNotifications, setApiNotifications] = React.useState<
    Notification[]
  >([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!loaded) {
      fetchNotificationsFromApi().then((data) =>
        setApiNotifications(data as unknown as Notification[])
      );
      setLoaded(true);
    }
  }, [loaded, token]);

  return (
    <Box sx={{ width: "100%" }}>
      <Card variant="outlined">
        {/* Title area for the notifications section */}
        <div
          className="notifications-header"
          style={{ padding: "12px 16px 0 16px", textAlign: "left" }}
        >
          <Typography component="h3" className="notifications-title">
            Notifications
          </Typography>
        </div>
        <NotificationCard notifications={apiNotifications} token={token} />
      </Card>
    </Box>
  );
}
