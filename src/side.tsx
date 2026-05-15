import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TwitterIcon from "@mui/icons-material/Twitter";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import type { Locker } from "./Locker.tsx";

interface SideProps {
  selectedLocker?: Locker;
}

const Side: React.FC<SideProps> = ({ selectedLocker }) => {
  const [open, setOpen] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const handleLearnMore = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleShare = () => setShareOpen(true);
  const handleShareClose = () => setShareOpen(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  if (!selectedLocker) {
    return (
      <Card sx={{ maxWidth: 240 }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Locker Details
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Please click a locker to view details.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Example share link (could be customized per locker)
  const shareLink = `${window.location.origin}/locker/${selectedLocker.locker_Id}`;

  return (
    <>
      <Card sx={{ maxWidth: 240 }}>
        <CardMedia
          component="img"
          alt="Locker"
          height="140"
          image="src/locks.png"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Locker Details
          </Typography>
          <Typography
            variant="body2"
            sx={{ textAlign: "left", color: "text.secondary" }}
          >
            <strong>Master Locker No.</strong> MADV{selectedLocker.mlockerId}
          </Typography>
          <Typography
            variant="body2"
            sx={{ textAlign: "left", color: "text.secondary" }}
          >
            <strong>Locker No.</strong> ADV00{selectedLocker.locker_Id}
          </Typography>
          <Typography
            variant="body2"
            sx={{ textAlign: "left", color: "text.secondary" }}
          >
            <strong>Size</strong> {selectedLocker.locker_size}
          </Typography>
          <Typography
            variant="body2"
            sx={{ textAlign: "left", color: "text.secondary" }}
          >
            <strong>Status</strong> {selectedLocker.status}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={handleShare}>
            Share
          </Button>
          <Button size="small" onClick={handleLearnMore}>
            Learn More
          </Button>
        </CardActions>
      </Card>
      {/* Learn More Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Locker Full Details</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Master Locker No. </strong> MADV{selectedLocker.mlockerId}
            <br />
            <strong>Master Locker Run Status </strong>
            {selectedLocker.statusinfoM}
            <br />
            <strong>Locker No. </strong> ADV00{selectedLocker.locker_Id}
            <br />
            <strong>Size </strong> {selectedLocker.locker_size}
            <br />
            <strong>Status</strong> {selectedLocker.status}
            <br />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* Share Dialog */}
      <Dialog
        open={shareOpen}
        onClose={handleShareClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Share Locker</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Share this locker using the link below:
          </Typography>
          <TextField
            value={shareLink}
            fullWidth
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton onClick={handleCopy}>
                  <ContentCopyIcon />
                </IconButton>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <IconButton
              color="primary"
              component="a"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareLink
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              color="success"
              component="a"
              href={`https://wa.me/?text=${encodeURIComponent(shareLink)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
            </IconButton>
            <IconButton
              color="info"
              component="a"
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                shareLink
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterIcon />
            </IconButton>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShareClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message="Link copied!"
      />
    </>
  );
};

export default Side;
