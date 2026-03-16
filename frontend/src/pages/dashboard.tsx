import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import api from "../utils/tokenInstance";

type JobRow = {
  id: number;
  title: string;
  description: string;
  deptId: number;
  employmentType?: { id: number; name: string };
  dept?: { id: number; name: string };
};

type ApplicationRow = {
  id: number;
  status: string;
  candidateId: number;
  jobId: number;
  candidate?: { id: number; name: string; email: string };
  job?: { id: number; title: string };
};

type DeptRow = {
  id: number;
  name: string;
};

type DeptSegment = { name: string; count: number; color: string };
type PipelineStat = { label: string; value: number; color: string; bg: string; border: string };
type StatCardProps = { icon: React.ReactNode; label: string; value: number; accent: string; loading: boolean };
type DonutChartProps = { data: DeptSegment[]; total: number };

const PRIMARY   = "#1a2e5a";
const NAVY_DARK = "#0c1a3a";
const ORANGE    = "#f97316";
const BORDER    = "#e5e7eb";
const BG        = "#f8f9fc";
const DEPT_COLORS = [PRIMARY, "#2459a3", ORANGE, "#fb923c", "#64748b", "#0ea5e9", "#7c3aed", "#059669"];

function normalizeStatus(raw: string): string {
  const s = raw?.trim() ?? "";
  if (s.toLowerCase().startsWith("interview")) return "Interviewed";
  return s;
}

const STATUS_META: Record<string, { bg: string; color: string; border: string }> = {
  Pending:     { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  Interviewed: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  Hired:       { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  Rejected:    { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
};

function getStatusMeta(raw: string) {
  const norm = normalizeStatus(raw);
  return STATUS_META[norm] ?? { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };
}

function StatCard({ icon, label, value, accent, loading }: StatCardProps) {
  const iconBg =
    accent === ORANGE  ? "#fff7ed" :
    accent === PRIMARY ? "#eef1f8" : "#eef6ff";
  return (
    <Paper elevation={0} sx={{
      border: `1px solid ${BORDER}`, borderRadius: 3,
      p: "20px 22px", display: "flex", alignItems: "center", gap: 2,
      bgcolor: "#ffffff", position: "relative", overflow: "hidden",
      transition: "box-shadow 0.2s",
      "&:hover": { boxShadow: "0 4px 16px rgba(26,46,90,0.10)" },
    }}>
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, bgcolor: accent, borderRadius: "12px 12px 0 0" }} />
      <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: accent }}>
        {icon}
      </Box>
      <Box>
        {loading
          ? <Box sx={{ width: 44, height: 24, bgcolor: "#f1f5f9", borderRadius: 1.5, mb: 0.5 }} />
          : <Typography sx={{ fontSize: 28, fontWeight: 800, color: NAVY_DARK, lineHeight: 1 }}>{value}</Typography>
        }
        <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.4, fontWeight: 500 }}>{label}</Typography>
      </Box>
    </Paper>
  );
}

function DonutChart({ data, total }: DonutChartProps) {
  const r = 52, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  let cumulative = 0;
  const segments = data.map((d) => {
    const pct = total > 0 ? d.count / total : 0;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start };
  });
  return (
    <Box sx={{
      display: "flex",
      alignItems: "center",
      gap: 3,
      flexDirection: { xs: "column", sm: "row" },  // stack on mobile
    }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
        {total === 0
          ? <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="22" />
          : segments.map((seg, i) => {
              const dash = seg.pct * circ;
              const offset = -seg.start * circ;
              return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
                strokeWidth="22" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={offset} />;
            })
        }
        <circle cx={cx} cy={cy} r={36} fill="#fff" />
        <text x={cx} y={cy - 5} textAnchor="middle" fill={NAVY_DARK} fontSize="17" fontWeight="800">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#9ca3af" fontSize="8.5" fontWeight="600" letterSpacing="0.5">TOTAL JOBS</text>
      </svg>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.9, flex: 1, width: { xs: "100%", sm: "auto" } }}>
        {segments.map((seg, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 9, height: 9, borderRadius: 0.75, bgcolor: seg.color, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12, color: "#6b7280", fontWeight: 500, flex: 1 }}>{seg.name}</Typography>
            <Typography sx={{ fontSize: 12, color: NAVY_DARK, fontWeight: 700 }}>{seg.count}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [departments, setDepartments] = useState<DeptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [jobsRes, applRes, deptRes] = await Promise.all([
          api.get("/getjob"),
          api.get("/getappl"),
          api.get("/getdept"),
        ]);
        setJobs(jobsRes.data ?? []);
        setApplications(applRes.data ?? []);
        setDepartments(deptRes.data ?? []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const pipelineStats = useMemo((): PipelineStat[] => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => {
      const norm = normalizeStatus(a.status);
      counts[norm] = (counts[norm] ?? 0) + 1;
    });
    const order = ["Pending", "Interviewed", "Hired", "Rejected"];
    const meta: Record<string, { color: string; bg: string; border: string }> = {
      Pending:     { color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
      Interviewed: { color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
      Hired:       { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
      Rejected:    { color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
    };
    const allStatuses = [
      ...order.filter((s) => counts[s]),
      ...Object.keys(counts).filter((s) => !order.includes(s)),
    ];
    return allStatuses.map((label) => ({
      label, value: counts[label] ?? 0,
      color: meta[label]?.color ?? "#64748b",
      bg:    meta[label]?.bg    ?? "#f8fafc",
      border:meta[label]?.border?? "#e2e8f0",
    }));
  }, [applications]);

  const pipelineTotal = applications.length;

  const deptJobData = useMemo((): DeptSegment[] => {
    const map: Record<string, number> = {};
    jobs.forEach((j) => { const name = j.dept?.name ?? "Other"; map[name] = (map[name] ?? 0) + 1; });
    return Object.entries(map).map(([name, count], i) => ({ name, count, color: DEPT_COLORS[i % DEPT_COLORS.length] }));
  }, [jobs]);

  const recentApplications = useMemo(() => applications.slice(-6).reverse(), [applications]);

  const applicantsPerJob = useMemo((): Record<number, number> => {
    const map: Record<number, number> = {};
    applications.forEach((a) => { if (a.jobId) map[a.jobId] = (map[a.jobId] ?? 0) + 1; });
    return map;
  }, [applications]);

  const maxApplicants = Math.max(...jobs.map((j) => applicantsPerJob[j.id] ?? 0), 1);

  return (
    <Box sx={{ bgcolor: BG, minHeight: "100%", fontFamily: "'Segoe UI', sans-serif", px: { xs: 1.5, sm: 2, md: 0 } }}>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: NAVY_DARK, letterSpacing: -0.3, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
          Dashboard
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#9ca3af", mt: 0.4 }}>
          Overview of your hiring pipeline and team activity
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { icon: <WorkOutlineIcon sx={{ fontSize: 24 }} />,      label: "Total Jobs",    value: jobs.length,         accent: PRIMARY   },
          { icon: <AssignmentOutlinedIcon sx={{ fontSize: 24 }} />, label: "Applications", value: applications.length, accent: ORANGE    },
          { icon: <BusinessOutlinedIcon sx={{ fontSize: 24 }} />, label: "Departments",   value: departments.length,  accent: "#2459a3" },
        ].map((card) => (
          <Grid size={{ xs: 12, sm: 4 }} key={card.label}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>

        {/* Recent Applications */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: "#ffffff", overflow: "hidden", height: "100%" }}>
            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${BORDER}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: NAVY_DARK }}>Recent Applications</Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress sx={{ color: PRIMARY }} size={30} /></Box>
            ) : recentApplications.length === 0 ? (
              <Box sx={{ py: 5, textAlign: "center" }}><Typography sx={{ color: "#9ca3af", fontSize: 13 }}>No applications yet.</Typography></Box>
            ) : (
              recentApplications.map((app, i) => {
                const sc = getStatusMeta(app.status);
                const initials = app.candidate?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";
                return (
                  <Box key={app.id} sx={{
                    px: { xs: 1.5, sm: 2.5 },
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1.2, sm: 1.8 },
                    borderBottom: i < recentApplications.length - 1 ? `1px solid ${BORDER}` : "none",
                    "&:hover": { bgcolor: BG }, transition: "background 0.15s",
                    flexWrap: { xs: "wrap", sm: "nowrap" },  // allow wrapping on very small screens
                  }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: PRIMARY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                      {initials}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: NAVY_DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {app.candidate?.name ?? "Unknown"}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "#9ca3af", mt: 0.2 }}>
                        {app.job?.title ?? `Job #${app.jobId}`}
                      </Typography>
                    </Box>
                    <Chip label={normalizeStatus(app.status)} size="small"
                      sx={{ fontSize: 11, fontWeight: 700, bgcolor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: "20px", height: 22 }} />
                  </Box>
                );
              })
            )}
          </Paper>
        </Grid>

        {/* Right column */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* Donut */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: "#ffffff", overflow: "hidden" }}>
              <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${BORDER}` }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: NAVY_DARK }}>Jobs by Department</Typography>
              </Box>
              <Box sx={{ p: 2.5 }}>
                {loading
                  ? <Box sx={{ width: "100%", height: 120, bgcolor: BG, borderRadius: 2 }} />
                  : deptJobData.length === 0
                    ? <Typography sx={{ color: "#9ca3af", fontSize: 13 }}>No data available.</Typography>
                    : <DonutChart data={deptJobData} total={jobs.length} />
                }
              </Box>
            </Paper>

            {/* Pipeline */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: "#ffffff", overflow: "hidden" }}>
              <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${BORDER}` }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: NAVY_DARK }}>Application Pipeline</Typography>
              </Box>
              <Box sx={{ p: 2.5 }}>
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}><CircularProgress sx={{ color: PRIMARY }} size={26} /></Box>
                ) : pipelineStats.length === 0 ? (
                  <Typography sx={{ color: "#9ca3af", fontSize: 13 }}>No applications yet.</Typography>
                ) : (
                  <Grid container spacing={1.5}>
                    {pipelineStats.map((p) => (
                      <Grid size={{ xs: 6 }} key={p.label}>
                        <Box sx={{ bgcolor: p.bg, borderRadius: 2.5, p: "14px 16px", border: `1px solid ${p.border}` }}>
                          <Typography sx={{ fontSize: 24, fontWeight: 800, color: p.color, lineHeight: 1 }}>{p.value}</Typography>
                          <Typography sx={{ fontSize: 12, color: p.color, fontWeight: 600, mt: 0.3, opacity: 0.9 }}>{p.label}</Typography>
                          <Box sx={{ mt: 1.2, height: 4, bgcolor: p.color + "25", borderRadius: 1, overflow: "hidden" }}>
                            <Box sx={{ height: "100%", width: `${pipelineTotal > 0 ? (p.value / pipelineTotal) * 100 : 0}%`, bgcolor: p.color, borderRadius: 1 }} />
                          </Box>
                          <Typography sx={{ fontSize: 10, color: p.color, mt: 0.5, fontWeight: 600, opacity: 0.7 }}>
                            {pipelineTotal > 0 ? Math.round((p.value / pipelineTotal) * 100) : 0}%
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* Jobs Table */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: "#ffffff", overflow: "hidden" }}>
            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: NAVY_DARK }}>Job Listings</Typography>
              <Box sx={{ fontSize: 11, fontWeight: 600, color: "#6b7280", bgcolor: "#f3f4f6", px: 1.2, py: 0.35, borderRadius: "20px", lineHeight: 1.6 }}>
                {jobs.length} jobs
              </Box>
            </Box>

            {/* Scrollable wrapper for table on small screens */}
            <Box sx={{ overflowX: "auto" }}>
              {/* Table header */}
              <Box sx={{
                display: "grid",
                gridTemplateColumns: "0.3fr 1.4fr 1fr 1fr 1fr",
                px: 2.5, py: 1.25,
                bgcolor: PRIMARY,
                minWidth: 480,   // prevent header from collapsing below readable width
              }}>
                {["#", "Title", "Department", "Type", "Applicants"].map((h) => (
                  <Typography key={h} sx={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: 0.6, textTransform: "uppercase" }}>{h}</Typography>
                ))}
              </Box>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress sx={{ color: PRIMARY }} size={30} /></Box>
              ) : jobs.length === 0 ? (
                <Box sx={{ py: 5, textAlign: "center" }}><Typography sx={{ color: "#9ca3af", fontSize: 13 }}>No jobs found.</Typography></Box>
              ) : (
                jobs.map((job, i) => {
                  const count = applicantsPerJob[job.id] ?? 0;
                  type EmpKey = "Full-time" | "Contract" | "Part-time";
                  const typeName = job.employmentType?.name;
                  const typeColors: Record<EmpKey, { bg: string; color: string }> = {
                    "Full-time": { bg: "#f0fdf4", color: "#15803d" },
                    "Contract":  { bg: "#eff6ff", color: "#1d4ed8" },
                    "Part-time": { bg: "#fff7ed", color: "#c2410c" },
                  };
                  const tc = typeColors[typeName as EmpKey] ?? { bg: "#f3f4f6", color: "#6b7280" };
                  return (
                    <Box key={job.id} sx={{
                      display: "grid",
                      gridTemplateColumns: "0.3fr 1.4fr 1fr 1fr 1fr",
                      px: 2.5, py: 1.6,
                      borderBottom: i < jobs.length - 1 ? `1px solid ${BORDER}` : "none",
                      alignItems: "center",
                      minWidth: 480,   // match header min-width so columns stay aligned
                      "&:hover": { bgcolor: BG }, transition: "background 0.15s",
                    }}>
                      <Typography sx={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{i + 1}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: NAVY_DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", pr: 1 }}>
                        {job.title}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6b7280" }}>{job.dept?.name ?? `Dept #${job.deptId}`}</Typography>
                      <Chip label={job.employmentType?.name ?? "—"} size="small"
                        sx={{ fontSize: 11, fontWeight: 700, bgcolor: tc.bg, color: tc.color, borderRadius: "20px", height: 22, width: "fit-content" }} />
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Box sx={{ height: 5, flex: 1, bgcolor: "#e5e7eb", borderRadius: 1, overflow: "hidden" }}>
                          <Box sx={{ height: "100%", width: `${(count / maxApplicants) * 100}%`, bgcolor: ORANGE, borderRadius: 1 }} />
                        </Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: NAVY_DARK, minWidth: 18 }}>{count}</Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}