import {
  Typography,
  Button,
  Container,
  Box,
  Chip,
  Stack,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/tokenInstance";
import { getUserId } from "../utils/auth";
import { toast, Toaster } from "sonner";

interface Job {
  id: number;
  title: string;
  description: string;
  minExperience?: number;
  maxExperience?: number;
  skillsRequired?: string;
  employmentType?: { id: number; name: string };
  educationRequired?: string;
  dept?: { id: number; name: string };
}

const PRIMARY = "#1a2e5a";
const ORANGE = "#f97316";
const PRIMARY_LIGHT = "#eef1f8";

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

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc", py: { xs: 2, sm: 4 } }}>
        <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
          <Skeleton variant="rectangular" height={36} width={100} sx={{ mb: 3, borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3, mb: 2.5 }} />
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3, mb: 2.5 }} />
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
        </Container>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#94a3b8", fontSize: 18, mb: 2 }}>Job not found.</Typography>
          <Button
            onClick={() => navigate("/jobapply")}
            sx={{ textTransform: "none", color: PRIMARY, fontWeight: 600, border: "1px solid #e2e8f0", borderRadius: 2, px: 3 }}
          >
            Back to Jobs
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc", py: { xs: 2, sm: 4 } }}>
      <Toaster position="top-right" richColors />

      <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>

        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/jobapply")}
          sx={{
            mb: 3,
            textTransform: "none",
            color: PRIMARY,
            fontWeight: 600,
            fontSize: 14,
            px: 2,
            py: 0.8,
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            bgcolor: "#fff",
            "&:hover": { bgcolor: PRIMARY_LIGHT, borderColor: PRIMARY },
          }}
        >
          Back to Jobs
        </Button>

        {/* ── Hero Card ── */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            mb: 2.5,
            boxShadow: "0 2px 12px rgba(26,46,90,0.06)",
          }}
        >
          {/* Colored top bar */}
          <Box sx={{ height: 6, background: `linear-gradient(90deg, ${PRIMARY} 0%, #2e4f9a 60%, ${ORANGE} 100%)` }} />

          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 2.5, sm: 3.5 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: { xs: 2, sm: 3 },
                flexWrap: { xs: "wrap", sm: "nowrap" },
              }}
            >
              {/* Left: icon + title */}
              <Stack direction="row" spacing={{ xs: 2, sm: 2.5 }} alignItems="center">
                <Avatar
                  sx={{
                    width: { xs: 52, sm: 64 },
                    height: { xs: 52, sm: 64 },
                    bgcolor: PRIMARY_LIGHT,
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 3,
                    flexShrink: 0,
                  }}
                >
                  <BusinessCenterOutlinedIcon sx={{ color: PRIMARY, fontSize: { xs: 26, sm: 32 } }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{
                      color: PRIMARY,
                      lineHeight: 1.25,
                      fontSize: { xs: "1.15rem", sm: "1.5rem" },
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {job.title}
                  </Typography>
                  {job.dept?.name && (
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748b", fontWeight: 500, mt: 0.3 }}
                    >
                      {job.dept.name}
                    </Typography>
                  )}
                </Box>
              </Stack>

              {/* Apply button */}
              {applied ? (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.8}
                  sx={{
                    bgcolor: "#f0fdf4",
                    border: "1.5px solid #bbf7d0",
                    borderRadius: 2.5,
                    px: { xs: 2, sm: 2.5 },
                    py: { xs: 0.8, sm: 1 },
                    flexShrink: 0,
                    alignSelf: { xs: "flex-start", sm: "center" },
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: 18 }} />
                  <Typography fontWeight={700} sx={{ color: "#16a34a", fontSize: { xs: 13, sm: 14 } }}>
                    Applied
                  </Typography>
                </Stack>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleApplyClick}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2.5,
                    bgcolor: ORANGE,
                    color: "#fff",
                    px: { xs: 3, sm: 4 },
                    py: { xs: 1, sm: 1.3 },
                    textTransform: "none",
                    flexShrink: 0,
                    boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                    fontSize: { xs: 14, sm: 15 },
                    alignSelf: { xs: "flex-start", sm: "center" },
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "#ea6c0a",
                      boxShadow: "0 6px 20px rgba(249,115,22,0.45)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Apply Now
                </Button>
              )}
            </Box>

            {/* Meta chips */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={2.5}>
              {(job.minExperience != null || job.maxExperience != null) && (
                <Chip
                  icon={<WorkOutlineIcon sx={{ fontSize: 14, color: `${PRIMARY} !important` }} />}
                  label={`${job.minExperience ?? 0} – ${job.maxExperience ?? 0} yrs exp`}
                  size="small"
                  sx={{
                    bgcolor: PRIMARY_LIGHT,
                    color: PRIMARY,
                    fontWeight: 600,
                    border: "1px solid #c8d3e8",
                    fontSize: { xs: 11, sm: 12 },
                  }}
                />
              )}
              {job.employmentType?.name && (
                <Chip
                  icon={<AccessTimeIcon sx={{ fontSize: 14, color: `${ORANGE} !important` }} />}
                  label={job.employmentType.name}
                  size="small"
                  sx={{
                    bgcolor: "#fff7ed",
                    color: ORANGE,
                    fontWeight: 600,
                    border: "1px solid #fed7aa",
                    fontSize: { xs: 11, sm: 12 },
                  }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        {/* ── Details Card ── */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            mb: 2.5,
            boxShadow: "0 2px 12px rgba(26,46,90,0.06)",
          }}
        >
          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 2.5, sm: 3.5 } }}>

            {/* Job Description */}
            {job.description && (
              <>
                <SectionHeading>Job Description</SectionHeading>
                <Typography
                  variant="body2"
                  sx={{ color: "#475569", lineHeight: 1.85, fontSize: { xs: 13.5, sm: 14.5 }, whiteSpace: "pre-line" }}
                >
                  {job.description}
                </Typography>
              </>
            )}

            {/* Skills Required */}
            {job.skillsRequired && (
              <>
                <Divider sx={{ my: { xs: 2.5, sm: 3 }, borderColor: "#f1f5f9" }} />
                <SectionHeading icon={<StarOutlineIcon sx={{ fontSize: 17, color: ORANGE }} />}>
                  Skills Required
                </SectionHeading>
                <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                  {job.skillsRequired.split(",").map((skill, i) => (
                    <Chip
                      key={i}
                      label={skill.trim()}
                      sx={{
                        bgcolor: "#fff",
                        border: "1.5px solid #e2e8f0",
                        color: "#1e293b",
                        fontWeight: 600,
                        fontSize: { xs: 12, sm: 13 },
                        borderRadius: 2,
                        transition: "all 0.15s",
                        "&:hover": { borderColor: PRIMARY, bgcolor: PRIMARY_LIGHT, color: PRIMARY },
                      }}
                    />
                  ))}
                </Stack>
              </>
            )}

            {/* Education Required */}
            {job.educationRequired && (
              <>
                <Divider sx={{ my: { xs: 2.5, sm: 3 }, borderColor: "#f1f5f9" }} />
                <SectionHeading icon={<SchoolOutlinedIcon sx={{ fontSize: 17, color: PRIMARY }} />}>
                  Education Required
                </SectionHeading>
                <Typography
                  variant="body2"
                  sx={{ color: "#475569", lineHeight: 1.85, fontSize: { xs: 13.5, sm: 14.5 } }}
                >
                  {job.educationRequired}
                </Typography>
              </>
            )}
          </Box>
        </Box>

        {/* ── Bottom Apply CTA ── */}
        {!applied && (
          <Box
            sx={{
              bgcolor: PRIMARY,
              borderRadius: 3,
              px: { xs: 2.5, sm: 4 },
              py: { xs: 2.5, sm: 3 },
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexWrap: { xs: "wrap", sm: "nowrap" },
              boxShadow: "0 4px 20px rgba(26,46,90,0.18)",
            }}
          >
            <Box>
              <Typography fontWeight={700} sx={{ color: "#fff", fontSize: { xs: 15, sm: 17 } }}>
                Interested in this role?
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)", mt: 0.3, fontSize: { xs: 12.5, sm: 13.5 } }}>
                Make sure your profile and resume are up to date before applying.
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleApplyClick}
              sx={{
                fontWeight: 700,
                borderRadius: 2.5,
                bgcolor: ORANGE,
                color: "#fff",
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.3 },
                textTransform: "none",
                flexShrink: 0,
                boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                fontSize: { xs: 14, sm: 15 },
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "#ea6c0a",
                  boxShadow: "0 6px 20px rgba(249,115,22,0.50)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Apply Now
            </Button>
          </Box>
        )}

        {/* Already applied banner */}
        {applied && (
          <Box
            sx={{
              bgcolor: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              borderRadius: 3,
              px: { xs: 2.5, sm: 4 },
              py: { xs: 2, sm: 2.5 },
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: 24, flexShrink: 0 }} />
            <Box>
              <Typography fontWeight={700} sx={{ color: "#15803d", fontSize: { xs: 14, sm: 15 } }}>
                You've already applied for this position
              </Typography>
              <Typography variant="body2" sx={{ color: "#4ade80", fontSize: { xs: 12, sm: 13 } }}>
                We'll be in touch if your profile is a good match.
              </Typography>
            </Box>
          </Box>
        )}

      </Container>

      {/* ── Confirm Dialog ── */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            boxShadow: "0 8px 32px rgba(26,46,90,0.12)",
            mx: { xs: 2, sm: "auto" },
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, color: PRIMARY, borderBottom: "1px solid #e2e8f0", pb: 2 }}
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
              border: "1px solid #e2e8f0",
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

// ── Small helper sub-component ───────────────────────────────────────────────
function SectionHeading({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.8} mb={1.2}>
      {icon}
      <Typography
        variant="body1"
        fontWeight={700}
        sx={{ color: "#1a2e5a", fontSize: { xs: 14, sm: 15 } }}
      >
        {children}
      </Typography>
    </Stack>
  );
}