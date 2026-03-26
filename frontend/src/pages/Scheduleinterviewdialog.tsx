import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, TextField, Select, MenuItem,
  CircularProgress, Chip, Divider,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon    from "@mui/icons-material/AccessTime";
import EmailIcon         from "@mui/icons-material/Email";
import VideocamIcon      from "@mui/icons-material/Videocam";
import PeopleIcon        from "@mui/icons-material/People";
import { toast }         from "sonner";
import api               from "../utils/tokenInstance";

// ── Constants (same as ApplicationsTable) ─────────────────────────────────────
const NAVY        = "#1a2e5a";
const NAVY_TEXT   = "#0c1a3a";
const ORANGE      = "#f97316";
const BORDER      = "#d5dbe6";
const BG          = "#f8f9fc";

// ── Types ─────────────────────────────────────────────────────────────────────
type Mode = "online" | "offline";

type ExistingSchedule = {
  id:             number;
  scheduledDate:  string;
  scheduledTime:  string;
  mode:           Mode;
  meetLink:       string | null;
  recruiterEmail: string;
  status:         string;
};

type Props = {
  open:          boolean;
  onClose:       () => void;
  applicationId: number;
  candidateName: string;
  jobTitle:      string;
  onScheduled:   (applicationId: number) => void;
};

// ── Label styles ──────────────────────────────────────────────────────────────
const labelSx = {
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase" as const,
  letterSpacing: 0.5,
  mb: 0.5,
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    background: "#fff",
    fontSize: 13,
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: "#a0aec0" },
    "&.Mui-focused fieldset": { borderColor: NAVY, borderWidth: "1.5px" },
  },
  "& .MuiInputBase-input": { color: "#334155", fontSize: 13 },
};

// ── Status chip ───────────────────────────────────────────────────────────────
const statusStyle: Record<string, { bg: string; color: string; border: string }> = {
  scheduled:  { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  completed:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  cancelled:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ScheduleInterviewDialog({
  open, onClose, applicationId, candidateName, jobTitle, onScheduled,
}: Props) {

  const [existing,       setExisting]       = useState<ExistingSchedule | null>(null);
  const [loadingFetch,   setLoadingFetch]   = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const [date,           setDate]           = useState("");
  const [time,           setTime]           = useState("");
  const [mode,           setMode]           = useState<Mode>("online");
  const [recruiterEmail, setRecruiterEmail] = useState("");

  // Fetch existing schedule when dialog opens
  useEffect(() => {
    if (!open) return;
    setIsRescheduling(false);
    setLoadingFetch(true);
    api.get(`/get-schedule-interview/${applicationId}`)
      .then(res => setExisting(res.data.data))
      .catch(() => setExisting(null))
      .finally(() => setLoadingFetch(false));
  }, [open, applicationId]);

  // Pre-fill form if rescheduling
  useEffect(() => {
    if (isRescheduling && existing) {
      setDate(existing.scheduledDate);
      setTime(existing.scheduledTime);
      setMode(existing.mode);
      setRecruiterEmail(existing.recruiterEmail);
    } else if (!existing) {
      setDate("");
      setTime("");
      setMode("online");
      setRecruiterEmail("");
    }
  }, [isRescheduling, existing]);

  const handleSubmit = async () => {
    if (!date || !time || !recruiterEmail) {
      toast.error("Please fill all fields.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/schedule-interview/${applicationId}`, {
        scheduledDate: date,
        scheduledTime: time,
        mode,
        recruiterEmail,
      });
      toast.success("Interview scheduled! Emails sent to candidate and recruiter.");
      onScheduled(applicationId);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to schedule interview.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  // ── Render: existing schedule (read-only) ──────────────────────────────────
  const renderExisting = () => {
    if (!existing) return null;
    const st = statusStyle[existing.status] ?? statusStyle.scheduled;
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

        {/* Status + heading */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: NAVY_TEXT }}>
            Scheduled Interview
          </Typography>
          <Chip
            label={existing.status.charAt(0).toUpperCase() + existing.status.slice(1)}
            size="small"
            sx={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontWeight: 700, fontSize: 12 }}
          />
        </Box>

        <Divider />

        {/* Details grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Typography sx={labelSx}>Date</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <CalendarMonthIcon sx={{ fontSize: 15, color: NAVY }} />
              <Typography sx={{ fontSize: 13, color: "#334155" }}>{existing.scheduledDate}</Typography>
            </Box>
          </Box>
          <Box>
            <Typography sx={labelSx}>Time</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <AccessTimeIcon sx={{ fontSize: 15, color: NAVY }} />
              <Typography sx={{ fontSize: 13, color: "#334155" }}>{existing.scheduledTime}</Typography>
            </Box>
          </Box>
          <Box>
            <Typography sx={labelSx}>Mode</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              {existing.mode === "online"
                ? <VideocamIcon sx={{ fontSize: 15, color: "#2563eb" }} />
                : <PeopleIcon   sx={{ fontSize: 15, color: "#7c3aed" }} />
              }
              <Typography sx={{ fontSize: 13, color: "#334155" }}>
                {existing.mode === "online" ? "Online (Google Meet)" : "In-Person (Offline)"}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography sx={labelSx}>Recruiter Email</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <EmailIcon sx={{ fontSize: 15, color: NAVY }} />
              <Typography sx={{ fontSize: 13, color: "#334155", wordBreak: "break-all" }}>
                {existing.recruiterEmail}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Meet link */}
        {existing.mode === "online" && existing.meetLink && (
          <Box sx={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", px: 2, py: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 12, color: "#1d4ed8", mb: 0.5 }}>Google Meet Link</Typography>
            <a href={existing.meetLink} target="_blank" rel="noreferrer"
              style={{ fontSize: 13, color: "#2563eb", wordBreak: "break-all" }}>
              {existing.meetLink}
            </a>
          </Box>
        )}

        <Button variant="outlined" size="small"
          onClick={() => setIsRescheduling(true)}
          sx={{ alignSelf: "flex-start", borderColor: ORANGE, color: ORANGE, fontWeight: 700, textTransform: "none", borderRadius: "7px", fontSize: 12 }}>
          Reschedule
        </Button>
      </Box>
    );
  };

  // ── Render: schedule form ──────────────────────────────────────────────────
  const renderForm = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

      {/* Candidate info */}
      <Box sx={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "10px", px: 2.5, py: 1.5 }}>
        <Typography sx={{ fontSize: 12, color: "#64748b" }}>Scheduling for</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: NAVY_TEXT }}>{candidateName}</Typography>
        <Typography sx={{ fontSize: 12, color: "#64748b" }}>{jobTitle}</Typography>
      </Box>

      {/* Date */}
      <Box>
        <Typography sx={labelSx}>Interview Date</Typography>
        <TextField fullWidth size="small" type="date" value={date}
          onChange={e => setDate(e.target.value)}
          inputProps={{ min: new Date().toISOString().split("T")[0] }}
          sx={inputSx} />
      </Box>

      {/* Time */}
      <Box>
        <Typography sx={labelSx}>Interview Time</Typography>
        <TextField fullWidth size="small" type="time" value={time}
          onChange={e => setTime(e.target.value)}
          sx={inputSx} />
      </Box>

      {/* Mode */}
      <Box>
        <Typography sx={labelSx}>Mode</Typography>
        <Select fullWidth size="small" value={mode}
          onChange={e => setMode(e.target.value as Mode)}
          sx={{
            borderRadius: "8px", fontSize: 13, background: "#fff",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#a0aec0" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: NAVY },
          }}>
          <MenuItem value="online" sx={{ fontSize: 13 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <VideocamIcon sx={{ fontSize: 16, color: "#2563eb" }} /> Online (Google Meet)
            </Box>
          </MenuItem>
          <MenuItem value="offline" sx={{ fontSize: 13 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PeopleIcon sx={{ fontSize: 16, color: "#7c3aed" }} /> In-Person (Offline)
            </Box>
          </MenuItem>
        </Select>
      </Box>

      {/* Recruiter email */}
      <Box>
        <Typography sx={labelSx}>Recruiter Email</Typography>
        <TextField fullWidth size="small" type="email"
          placeholder="recruiter@company.com"
          value={recruiterEmail}
          onChange={e => setRecruiterEmail(e.target.value)}
          sx={inputSx} />
      </Box>

      {/* Online note */}
      {mode === "online" && (
        <Box sx={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: 12, color: "#1d4ed8" }}>
            A Google Meet link will be auto-generated and included in the emails sent to both the candidate and recruiter.
          </Typography>
        </Box>
      )}
    </Box>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  const showForm = !existing || isRescheduling;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", mx: { xs: 1.5, sm: "auto" } } }}>

      <DialogTitle sx={{ background: NAVY, color: "#fff", px: 3, py: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: 15, sm: 17 } }}>
          {showForm ? (isRescheduling ? "Reschedule Interview" : "Schedule Interview") : "Interview Details"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
        {loadingFetch ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: NAVY }} />
          </Box>
        ) : showForm ? renderForm() : renderExisting()}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${BORDER}`, gap: 1 }}>
        <Button onClick={handleClose} disabled={submitting}
          sx={{ textTransform: "none", fontWeight: 600, color: "#64748b", fontSize: 13 }}>
          Cancel
        </Button>
        {showForm && (
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}
            sx={{ background: NAVY, textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 3, "&:hover": { background: "#0c1a3a" } }}>
            {submitting
              ? <CircularProgress size={16} sx={{ color: "#fff" }} />
              : isRescheduling ? "Reschedule" : "Schedule & Send Emails"
            }
          </Button>
        )}
        {!showForm && (
          <Button onClick={handleClose} variant="contained"
            sx={{ background: NAVY, textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 3, "&:hover": { background: "#0c1a3a" } }}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}