import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Typography, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Divider,
  CircularProgress, InputAdornment, TextField,
  Select, MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import api from "../utils/tokenInstance";
import { toast, Toaster } from "sonner";
import ScheduleInterviewDialog from "./Scheduleinterviewdialog";

type ApplicationRow = {
  id:          number;
  status:      string;
  candidateId: number;
  jobId:       number;
  candidate?:  { id: number; name: string; email: string };
  job?:        { id: number; title: string };
};

type AIReport = {
  matchScore:     number;
  remarks:        string;
  advantages:     string;
  disadvantages:  string;
  recommendation: string;
};

const paginationModel = { page: 0, pageSize: 10 };
const NAVY         = "#1a2e5a";
const NAVY_TEXT    = "#0c1a3a";
const ORANGE       = "#f97316";
const BORDER_COLOR = "#d5dbe6";
const BG           = "#f8f9fc";

function getScoreColor(score: number) {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#d97706";
  return "#dc2626";
}

function parseAIReport(raw: string): AIReport | null {
  try { return JSON.parse(raw.replace(/^```json\n/, "").replace(/\n```$/, "")); }
  catch { return null; }
}

const searchFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px", background: "#fff", fontSize: 13, height: 36,
    "& fieldset": { borderColor: BORDER_COLOR },
    "&:hover fieldset": { borderColor: "#a0aec0" },
    "&.Mui-focused fieldset": { borderColor: NAVY, borderWidth: "1.5px" },
  },
  "& .MuiInputBase-input": { py: "7px", px: 1, fontSize: 13, color: "#334155" },
  "& .MuiInputAdornment-root svg": { fontSize: 16, color: "#94a3b8" },
};

const statusStyles: Record<string, { bg: string; color: string; border: string }> = {
  applied:     { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
  shortlisted: { bg: "#fefce8", color: "#a16207", border: "#fde68a" },
  interview:   { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" },
  selected:    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  rejected:    { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  withdrawn:   { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" },
};

function StatusSelect({ id, status, onUpdate }: { id: number; status: string; onUpdate: (id: number, status: string) => void }) {
  const style = statusStyles[status?.toLowerCase()] ?? { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
  return (
    <Select
      value={status ?? ""}
      size="small"
      onChange={(e) => onUpdate(id, e.target.value)}
      onClick={(e) => e.stopPropagation()}
      sx={{
        height: 26, width: 118, fontSize: 12, fontWeight: 700,
        background: style.bg, color: style.color, border: `1px solid ${style.border}`,
        borderRadius: "16px",
        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
        "& .MuiSelect-select": { py: "2px", pl: "10px", pr: "24px !important" },
        "& .MuiSelect-icon": { color: style.color, fontSize: 16, right: 4 },
      }}
    >
      {["Applied", "Shortlisted", "Interview", "Selected", "Rejected", "Withdrawn"].map((s) => {
        const st = statusStyles[s.toLowerCase()];
        return (
          <MenuItem key={s} value={s} sx={{ fontSize: 12, fontWeight: 700, color: st?.color }}>
            {s}
          </MenuItem>
        );
      })}
    </Select>
  );
}

export default function ApplicationsTable() {
  const navigate = useNavigate();

  const [allRows,      setAllRows]      = useState<ApplicationRow[]>([]);
  const [searchName,   setSearchName]   = useState("");
  const [searchTitle,  setSearchTitle]  = useState("");
  const [searchJobId,  setSearchJobId]  = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const [aiReportOpen, setAiReportOpen] = useState(false);
  const [aiReport,     setAiReport]     = useState<AIReport | null>(null);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [aiError,      setAiError]      = useState<string | null>(null);

  // ── Schedule dialog state ──────────────────────────────────────────────────
  const [scheduleOpen,     setScheduleOpen]     = useState(false);
  const [scheduleRow,      setScheduleRow]      = useState<ApplicationRow | null>(null);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get("/getappl");
      setAllRows(res.data);
    } catch (err) { console.error("Error fetching applications:", err); }
  };

  const handleUpdate = async (id: number, status: string) => {
    try {
      await api.put(`/status/${id}`, { status });
      setAllRows(prev => prev.map(row => row.id === id ? { ...row, status } : row));
      toast.success("Application status updated successfully");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update application status");
      fetchApplications();
    }
  };

  const handleAIReport = async (id: number) => {
    setAiReportOpen(true);
    setAiLoading(true);
    setAiReport(null);
    setAiError(null);
    try {
      const res  = await api.get(`/applications/${id}/ai-report`);
      const data = res.data?.data;
      if (data?.raw) {
        const parsed = parseAIReport(data.raw);
        if (parsed) setAiReport(parsed);
        else setAiError("Failed to parse AI report.");
      } else if (data?.matchScore !== undefined) {
        setAiReport(data as AIReport);
      } else {
        setAiError("Failed to parse AI report.");
      }
    } catch (err) {
      console.error(err);
      setAiError("Failed to fetch AI report. Please try again.");
    } finally { setAiLoading(false); }
  };

  // ── Open schedule dialog ───────────────────────────────────────────────────
  const handleOpenSchedule = (row: ApplicationRow) => {
    setScheduleRow(row);
    setScheduleOpen(true);
  };

  // Called when schedule is successfully created — update row status in UI
  const handleScheduled = (applicationId: number) => {
    setAllRows(prev =>
      prev.map(row => row.id === applicationId ? { ...row, status: "Interview" } : row)
    );
  };

  const filteredRows = useMemo(() => allRows.filter(row => {
    const name   = row.candidate?.name?.toLowerCase()  ?? "";
    const title  = row.job?.title?.toLowerCase()        ?? "";
    const jobId  = String(row.jobId ?? "");
    const status = row.status?.toLowerCase()            ?? "";
    return (
      name.includes(searchName.toLowerCase())    &&
      title.includes(searchTitle.toLowerCase())  &&
      jobId.includes(searchJobId)                &&
      status.includes(searchStatus.toLowerCase())
    );
  }), [allRows, searchName, searchTitle, searchJobId, searchStatus]);

  const columns: GridColDef[] = [
    {
      field: "sno", headerName: "S.No", flex: 0.3, minWidth: 55, sortable: false,
      renderCell: (params) => params.api.getRowIndexRelativeToVisibleRows(params.row.id) + 1,
    },
    {
      field: "candidateName", headerName: "Candidate Name", flex: 1, minWidth: 130,
      renderCell: (params) => params.row.candidate?.name,
    },
    {
      field: "jobTitle", headerName: "Job Title", flex: 1, minWidth: 120,
      renderCell: (params) => params.row.job?.title,
    },
    { field: "jobId", headerName: "Job ID", flex: 0.6, minWidth: 70 },
    {
      field: "status", headerName: "Status", flex: 1.2, minWidth: 145, sortable: false,
      renderCell: (params) => (
        <StatusSelect id={params.row.id} status={params.value} onUpdate={handleUpdate} />
      ),
    },
    {
      field: "profile", headerName: "Profile", flex: 0.8, minWidth: 85,
      renderCell: (params) => (
        <Button variant="outlined" size="small"
          onClick={() => navigate(`/profile/${params.row.candidate?.id}`)}
          sx={{ borderColor: ORANGE, color: ORANGE, fontWeight: 700, textTransform: "none", borderRadius: "7px", fontSize: 12, px: 1.5, "&:hover": { borderColor: "#ea6c00", background: "#fff3e6" } }}>
          View
        </Button>
      ),
    },
    {
      field: "aiReport", headerName: "AI Report", flex: 0.8, minWidth: 95,
      renderCell: (params) => (
        <Button variant="contained" size="small"
          onClick={() => handleAIReport(params.row.id)}
          sx={{ background: "#2459a3", textTransform: "none", fontWeight: 600, borderRadius: "6px", fontSize: 12, "&:hover": { background: "#1a3f7a" } }}>
          AI Report
        </Button>
      ),
    },
    {
      field: "schedule", headerName: "Schedule", flex: 0.9, minWidth: 100, sortable: false,
      renderCell: (params) => (
        <Button variant="contained" size="small"
          onClick={() => handleOpenSchedule(params.row)}
          sx={{ background: "#16a34a", textTransform: "none", fontWeight: 600, borderRadius: "6px", fontSize: 12, "&:hover": { background: "#15803d" } }}>
          Schedule
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", background: BG, px: { xs: 1, sm: 2, md: 0 } }}>
      <Toaster position="top-right" richColors />
      <Paper elevation={0} sx={{ borderRadius: { xs: "10px", sm: "14px" }, border: `1px solid ${BORDER_COLOR}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <Box sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 1.5, sm: 2 }, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderBottom: `1px solid ${BORDER_COLOR}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: 15, sm: 18 }, color: NAVY_TEXT }}>
            All Applications ({filteredRows.length})
          </Typography>
        </Box>

        {/* Filters */}
        <Box sx={{
          px: { xs: 1.5, sm: 3 }, py: 1.5,
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr", md: "1fr 1fr 0.6fr 1fr" },
          gap: 1.5,
          flexShrink: 0, borderBottom: `1px solid ${BORDER_COLOR}`, background: "#fff",
        }}>
          {[
            { placeholder: "Filter candidate name…",  value: searchName,   set: setSearchName },
            { placeholder: "Filter job title…",        value: searchTitle,  set: setSearchTitle },
            { placeholder: "Job ID…",                  value: searchJobId,  set: setSearchJobId },
            { placeholder: "Filter status…",           value: searchStatus, set: setSearchStatus },
          ].map(({ placeholder, value, set }) => (
            <TextField key={placeholder} placeholder={placeholder} value={value}
              onChange={(e) => set(e.target.value)} size="small" sx={searchFieldSx}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          ))}
        </Box>

        {/* DataGrid */}
        <Box sx={{ overflowX: { xs: "auto", sm: "hidden" } }}>
          <Box sx={{ minWidth: { xs: 860, sm: "100%" } }}>
            <DataGrid
              autoHeight
              rows={filteredRows}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10, 20]}
              disableColumnMenu
              disableRowSelectionOnClick
              slots={{
                noRowsOverlay: () => (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <Typography sx={{ color: "#94a3b8", fontSize: 14 }}>No applications found.</Typography>
                  </Box>
                ),
              }}
              sx={{
                width: "100%", border: 0,
                "& .MuiDataGrid-columnHeaders": { background: NAVY, borderRadius: 0 },
                "& .MuiDataGrid-columnHeader": { background: NAVY, "&:focus, &:focus-within": { outline: "none" } },
                "& .MuiDataGrid-columnHeaderTitle": { color: "#fff", fontWeight: 700, fontSize: { xs: 11, sm: 14 }, letterSpacing: 0.3 },
                "& .MuiDataGrid-sortIcon": { color: "#fff" },
                "& .MuiDataGrid-menuIconButton": { color: "#fff" },
                "& .MuiDataGrid-columnSeparator": { display: "none" },
                "& .MuiDataGrid-virtualScroller": { overflowX: "hidden !important", overflowY: "auto" },
                "& .MuiDataGrid-scrollbar--horizontal": { display: "none !important" },
                "& .MuiDataGrid-scrollbar--vertical": { display: "none !important" },
                "& .MuiDataGrid-row": { "&:hover": { background: "#f8fafc" } },
                "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9", color: "#334155", fontSize: { xs: 12, sm: 13 }, display: "flex", alignItems: "center" },
                "& .MuiDataGrid-footerContainer": { borderTop: `1px solid ${BORDER_COLOR}` },
                "& .MuiSelect-select:focus": { backgroundColor: "#fff3e6 !important" },
                "& .MuiTablePagination-select:focus": { backgroundColor: "#fff3e6 !important" },
                "& .MuiIconButton-root:hover": { backgroundColor: "transparent" },
                "& .MuiTablePagination-root": { fontSize: { xs: 12, sm: 14 } },
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* AI Report Dialog */}
      <Dialog open={aiReportOpen} onClose={() => setAiReportOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", mx: { xs: 1.5, sm: "auto" } } }}>
        <DialogTitle sx={{ background: NAVY, color: "#fff", px: 3, py: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: 15, sm: 17 } }}>AI Candidate Report</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
          {aiLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: "#2459a3" }} />
            </Box>
          )}
          {aiError && (
            <Typography sx={{ color: "#dc2626", textAlign: "center", py: 4 }}>{aiError}</Typography>
          )}
          {aiReport && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, background: "#f8f9fc", border: `1px solid ${BORDER_COLOR}`, borderRadius: "10px", px: 2.5, py: 2 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: "50%", border: `4px solid ${getScoreColor(aiReport.matchScore)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 20, color: getScoreColor(aiReport.matchScore), lineHeight: 1 }}>
                    {aiReport.matchScore}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: NAVY_TEXT }}>Match Score</Typography>
                  <Typography sx={{ fontSize: 12, color: "#64748b" }}>out of 100</Typography>
                </Box>
                <Chip
                  label={aiReport.matchScore >= 80 ? "Strong Match" : aiReport.matchScore >= 60 ? "Moderate Match" : "Weak Match"}
                  size="small"
                  sx={{ ml: "auto", background: getScoreColor(aiReport.matchScore) + "20", color: getScoreColor(aiReport.matchScore), fontWeight: 700, fontSize: 12, border: `1px solid ${getScoreColor(aiReport.matchScore)}40` }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: NAVY_TEXT, mb: 0.5 }}>Remarks</Typography>
                <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>{aiReport.remarks}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#16a34a", mb: 0.5 }}>Advantages</Typography>
                <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>{aiReport.advantages}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#dc2626", mb: 0.5 }}>Disadvantages</Typography>
                <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>{aiReport.disadvantages}</Typography>
              </Box>
              <Divider />
              <Box sx={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", px: 2.5, py: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#1d4ed8", mb: 0.5 }}>Recommendation</Typography>
                <Typography sx={{ fontSize: 13, color: "#1e40af", lineHeight: 1.7 }}>{aiReport.recommendation}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${BORDER_COLOR}` }}>
          <Button onClick={() => setAiReportOpen(false)} variant="contained"
            sx={{ background: NAVY, textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 3, "&:hover": { background: "#0c1a3a" } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Interview Dialog */}
      {scheduleRow && (
        <ScheduleInterviewDialog
          open={scheduleOpen}
          onClose={() => setScheduleOpen(false)}
          applicationId={scheduleRow.id}
          candidateName={scheduleRow.candidate?.name ?? ""}
          jobTitle={scheduleRow.job?.title ?? ""}
          onScheduled={handleScheduled}
        />
      )}
    </Box>
  );
}