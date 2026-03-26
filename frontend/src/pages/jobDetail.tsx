import {
  Typography,
  Button,
  Container,
  Box,
  Chip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  Paper,
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward"; // similar to ArrowUpRight
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/tokenInstance";
import { getUserId } from "../utils/auth";
import { toast, Toaster } from "sonner";
 
interface Job {
  id: number;
  title: string;
  roleOverview: string;
  minExperience?: number;
  maxExperience?: number;
  keyRequirements?: string;
  employmentType?: { id: number; name: string };
  coreRequirements?: string;
  dept?: { id: number; name: string };
}
 
const PRIMARY = "#1a2e5a";
const ORANGE = "#f97316";
const BORDER_COLOR = "#e2e8f0";
 
export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
 
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
 
  useEffect(() => {
    fetchJob();
    checkIfApplied();
  }, [id]);
 
  const fetchJob = async () => {
    try {
      const res = await api.get("/getjob");
      const found = res.data.find((j: Job) => j.id === Number(id));
      if (found) {
        setJob(found);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };
 
  const checkIfApplied = async () => {
    try {
      const loginId = getUserId();
      if (!loginId) return;
      const profileRes = await api.get(`/profile/${loginId}`);
      if (!profileRes.data?.id) return;
      const candidateId = profileRes.data.id;
      const applRes = await api.get(`/getappcan/${candidateId}`);
      const ids = applRes.data.map((app: any) => app.job?.id).filter(Boolean);
      if (ids.includes(Number(id))) setApplied(true);
    } catch {
      // not logged in or no profile — silently ignore
    }
  };
 
  const handleApplyClick = async () => {
    const loginId = getUserId();
    if (!loginId) {
      toast.error("Please log in to apply");
      setTimeout(() => navigate("/"), 1500);
      return;
    }
    try {
      const profileRes = await api.get(`/profile/${loginId}`);
      if (!profileRes.data || !profileRes.data.id) {
        toast.error("Please fill your profile first");
        setTimeout(() => navigate("/profile"), 1500);
        return;
      }
      setConfirmOpen(true);
    } catch {
      toast.error("Please fill your profile first");
      setTimeout(() => navigate("/profile"), 1500);
    }
  };
 
  const confirmApply = async () => {
    try {
      setApplying(true);
      const loginId = getUserId();
      const profileRes = await api.get(`/profile/${loginId}`);
      const candidateId = profileRes.data.id;
      await api.post("/createappl", { candidateId, jobId: Number(id) });
      toast.success("Applied Successfully!");
      setApplied(true);
      setConfirmOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply. Please try again.");
    } finally {
      setApplying(false);
    }
  };
 
  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: { xs: 2, sm: 4 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
          <Skeleton variant="rectangular" height={36} width={100} sx={{ mb: 3, borderRadius: 2 }} />
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Box sx={{ width: { xs: "100%", md: "35%" } }}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 3 }} />
            </Box>
            <Box sx={{ width: { xs: "100%", md: "65%" } }}>
              <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 3 }} />
            </Box>
          </Stack>
        </Container>
      </Box>
    );
  }
 
  if (!job) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#94a3b8", fontSize: 18, mb: 2 }}>Job not found.</Typography>
          <Button
            onClick={() => navigate("/jobapply")}
            sx={{ textTransform: "none", color: PRIMARY, fontWeight: 600, border: `1px solid ${BORDER_COLOR}`, borderRadius: 2, px: 3 }}
          >
            Back to Jobs
          </Button>
        </Box>
      </Box>
    );
  }
 
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", fontFamily: '"Inter", sans-serif' }}>
      <Toaster position="top-right" richColors />
 
      <Box sx={{ bgcolor: PRIMARY, borderBottom: `1px solid ${BORDER_COLOR}`, py: 4 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/jobapply")}
            sx={{
              mb: 2,
              textTransform: "none",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              px: 2,
              py: 0.8,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.1)",
              border: `1px solid rgba(255,255,255,0.2)`,
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            Back to Jobs
          </Button>
          <Typography
            variant="h3"
            sx={{
              color: "#fff",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            {job.title}
          </Typography>
          {job.dept?.name && (
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 500, mt: 1, fontSize: { xs: 14, sm: 16 } }}>
              {job.dept.name}
            </Typography>
          )}
        </Container>
      </Box>
 
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: 4 }}>
 
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Box sx={{ width: { xs: "100%", md: "35%" } }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                border: `1px solid ${BORDER_COLOR}`,
                bgcolor: "#fff",
                position: { md: "sticky" },
                top: { md: 24 },
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)",
                },
              }}
            >
              <Typography
                variant="h6"
                fontWeight={900}
                sx={{ color: PRIMARY, mb: 2, fontSize: { xs: 16, sm: 18 }, letterSpacing: "-0.01em" }}
              >
                Job Summary
              </Typography>
              <Stack spacing={2} sx={{ mb: 3 }}>
                {(job.minExperience != null || job.maxExperience != null) && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <WorkOutlineIcon sx={{ fontSize: 14, color: ORANGE }} /> EXPERIENCE
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: "#334155", mt: 0.5 }}>
                      {job.minExperience ?? 0} – {job.maxExperience ?? 0} years
                    </Typography>
                  </Box>
                )}
                {job.employmentType?.name && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 14, color: ORANGE }} /> TYPE
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: "#334155", mt: 0.5 }}>
                      {job.employmentType.name}
                    </Typography>
                  </Box>
                )}
       
              </Stack>
 
              {applied ? (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.8}
                  sx={{
                    bgcolor: "#f0fdf4",
                    border: "1.5px solid #bbf7d0",
                    borderRadius: 2.5,
                    px: 2,
                    py: 1,
                    display: "inline-flex",
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: 18 }} />
                  <Typography fontWeight={700} sx={{ color: "#16a34a", fontSize: 14, textTransform: "uppercase" }}>
                    Applied
                  </Typography>
                </Stack>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleApplyClick}
                  endIcon={<ArrowOutwardIcon />}
                  sx={{
                    fontWeight: 900,
                    borderRadius: 2.5,
                    bgcolor: ORANGE,
                    color: "#fff",
                    py: 1.5,
                    textTransform: "uppercase",
                    fontSize: 14,
                    letterSpacing: "0.05em",
                    boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                    transition: "all 0.3s",
                    "&:hover": {
                      bgcolor: "#ea6c0a",
                      boxShadow: "0 6px 20px rgba(249,115,22,0.45)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Apply for Position
                </Button>
              )}
            </Paper>
          </Box>
          <Box sx={{ width: { xs: "100%", md: "65%" } }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 4 },
                borderRadius: 3,
                border: `1px solid ${BORDER_COLOR}`,
                bgcolor: "#fff",
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)",
                },
              }}
            >
 
              {job.roleOverview && (
                <>
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{ color: PRIMARY, mb: 1.5, fontSize: { xs: 16, sm: 18 }, letterSpacing: "-0.01em" }}
                  >
                    ROLE OVERVIEW
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#475569", lineHeight: 1.85, fontSize: { xs: 13.5, sm: 14.5 }, whiteSpace: "pre-line" }}
                  >
                    {job.roleOverview}
                  </Typography>
                </>
              )}
 
              {job.keyRequirements && (
                <>
                  <Divider sx={{ my: { xs: 2.5, sm: 3 }, borderColor: BORDER_COLOR }} />
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{ color: PRIMARY, mb: 1.5, fontSize: { xs: 16, sm: 18 }, letterSpacing: "-0.01em" }}
                  >
                    KEY REQUIREMENTS
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                    {job.keyRequirements.split(",").map((skill, i) => (
                      <Chip
                        key={i}
                        label={skill.trim()}
                        sx={{
                          bgcolor: "#fff",
                          border: `1.5px solid ${BORDER_COLOR}`,
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: { xs: 12, sm: 13 },
                          borderRadius: 2,
                          transition: "all 0.2s",
                          "&:hover": { borderColor: PRIMARY, bgcolor: "#f8fafc" },
                        }}
                      />
                    ))}
                  </Stack>
                </>
              )}
 
              {job.coreRequirements && (
                <>
                  <Divider sx={{ my: { xs: 2.5, sm: 3 }, borderColor: BORDER_COLOR }} />
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{ color: PRIMARY, mb: 1.5, fontSize: { xs: 16, sm: 18 }, letterSpacing: "-0.01em" }}
                  >
                    CORE RESPONSIBILITIES
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#475569", lineHeight: 1.85, fontSize: { xs: 13.5, sm: 14.5 } }}
                  >
                    {job.coreRequirements}
                  </Typography>
                </>
              )}
 
              {!job.roleOverview && !job.keyRequirements && !job.coreRequirements && (
                <Typography sx={{ color: "#94a3b8", textAlign: "center", py: 4 }}>
                  No detailed information provided for this position.
                </Typography>
              )}
            </Paper>
          </Box>
        </Stack>
      </Container>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${BORDER_COLOR}`,
            boxShadow: "0 8px 32px rgba(0,77,84,0.12)",
            mx: { xs: 2, sm: "auto" },
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 900, color: PRIMARY, borderBottom: `1px solid ${BORDER_COLOR}`, pb: 2, textTransform: "uppercase", letterSpacing: "0.02em" }}
        >
          Confirm Application
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <DialogContentText sx={{ color: "#64748b", lineHeight: 1.7 }}>
            Are you sure you want to apply for{" "}
            <Box component="span" sx={{ fontWeight: 700, color: PRIMARY }}>
              {job.title}
            </Box>
            ?
            <br />
            <br />
            Please make sure your profile information and resume are updated before applying.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: { xs: "wrap", sm: "nowrap" } }}
        >
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={applying}
            sx={{
              textTransform: "none",
              color: "#64748b",
              borderRadius: 2,
              border: `1px solid ${BORDER_COLOR}`,
              px: 2.5,
              "&:hover": { bgcolor: "#f8f9fc" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmApply}
            disabled={applying}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: ORANGE,
              borderRadius: 2,
              px: 3,
              boxShadow: "none",
              "&:hover": { bgcolor: "#ea6c0a", boxShadow: "none" },
            }}
          >
            {applying ? "Applying…" : "Yes, Apply"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
 