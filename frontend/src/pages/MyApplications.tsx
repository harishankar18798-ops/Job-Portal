import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useState, useEffect } from "react";
import api from "../utils/tokenInstance";
import { getUserId } from "../utils/auth";
import { toast, Toaster } from "sonner";

const PRIMARY = "#1a2e5a";
const ORANGE = "#f97316";
const PRIMARY_LIGHT = "#eef1f8";

export default function MyApplications() {
  const loginId = getUserId();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAppId, setWithdrawAppId] = useState<number | null>(null);
  const [withdrawJobTitle, setWithdrawJobTitle] = useState<string>("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get(`/profile/${loginId}`);
      const candidateId = profileRes.data.id;
      const applRes = await api.get(`/getappcan/${candidateId}`);
      setApplications(applRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loginId) fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginId]);

  const handleWithdrawClick = (appId: number, jobTitle: string) => {
    setWithdrawAppId(appId);
    setWithdrawJobTitle(jobTitle);
    setWithdrawDialogOpen(true);
  };

  const handleWithdrawConfirm = async () => {
    if (!withdrawAppId) return;
    try {
      await api.put(`/status/${withdrawAppId}`, { status: "Withdrawn" });
      setApplications((prev) =>
        prev.map((app) =>
          app.id === withdrawAppId ? { ...app, status: "Withdrawn" } : app
        )
      );
      toast.success("Application withdrawn successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to withdraw application");
    } finally {
      setWithdrawDialogOpen(false);
      setWithdrawAppId(null);
      setWithdrawJobTitle("");
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8f9fc", minHeight: "100vh", py: { xs: 2, sm: 3 } }}>
      <Toaster position="top-right" richColors />
      <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Box sx={{ bgcolor: "#fff7ed", borderRadius: 2, p: 1, display: "flex" }}>
            <EmojiEventsIcon sx={{ color: ORANGE, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 20 }, color: PRIMARY }}>
              My Applications
            </Typography>
            <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: "#94a3b8" }}>
              Track and manage your job applications
            </Typography>
          </Box>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #e2e8f0", bgcolor: "#ffffff", overflow: "hidden" }}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {loading ? (
              <Typography sx={{ color: "#94a3b8", fontSize: 14, textAlign: "center", py: 4 }}>
                Loading applications...
              </Typography>
            ) : applications.length === 0 ? (
              <Typography sx={{ color: "#94a3b8", fontSize: 14, textAlign: "center", py: 4 }}>
                No applications yet.
              </Typography>
            ) : (
              <Box>
                {applications.map((app, index) => (
                  <Box key={app.id}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        py: 1.5,
                        gap: 1,
                        flexWrap: { xs: "wrap", sm: "nowrap" },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: { xs: 13, sm: 14 }, color: PRIMARY }}>
                          {app.job?.title}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: "#94a3b8" }}>
                          Job ID: {app.job?.id}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                        <Chip
                          label={app.status}
                          size="small"
                          sx={{
                            bgcolor:
                              app.status === "accepted" ? "#e8f5e9"
                              : app.status === "rejected" ? "#fce4ec"
                              : app.status === "Withdrawn" ? "#f1f5f9"
                              : PRIMARY_LIGHT,
                            color:
                              app.status === "accepted" ? "#2e7d32"
                              : app.status === "rejected" ? "#c62828"
                              : app.status === "Withdrawn" ? "#64748b"
                              : PRIMARY,
                            fontWeight: 600,
                            fontSize: 12,
                            borderRadius: 2,
                          }}
                        />
                        {app.status !== "Withdrawn" && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleWithdrawClick(app.id, app.job?.title)}
                            sx={{
                              borderColor: "#dc2626",
                              color: "#dc2626",
                              borderRadius: 2,
                              textTransform: "none",
                              fontSize: 11,
                              px: 1.2,
                              py: 0.3,
                              "&:hover": { bgcolor: "#fef2f2", borderColor: "#dc2626" },
                            }}
                          >
                            Withdraw
                          </Button>
                        )}
                      </Box>
                    </Box>
                    {index < applications.length - 1 && <Divider sx={{ my: 0.5 }} />}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Withdraw Confirm Dialog */}
      <Dialog
        open={withdrawDialogOpen}
        onClose={() => setWithdrawDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "14px" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16, color: PRIMARY, pb: 1 }}>
          Withdraw Application
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: "#475569" }}>
            Are you sure you want to withdraw your application for{" "}
            <strong>{withdrawJobTitle}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setWithdrawDialogOpen(false)}
            variant="outlined"
            sx={{ borderColor: "#cbd5e1", color: "#64748b", borderRadius: 2, textTransform: "none", "&:hover": { bgcolor: "#f8fafc" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleWithdrawConfirm}
            variant="contained"
            sx={{ bgcolor: "#dc2626", borderRadius: 2, textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#b91c1c" } }}
          >
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}