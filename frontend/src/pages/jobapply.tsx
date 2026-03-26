import {
  Typography,
  Button,
  Container,
  Box,
  Chip,
  Stack,
  Avatar,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  InputBase,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import api from "../utils/tokenInstance";
import { Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import { getUserId } from "../utils/auth";
 
interface Dept {
  id: number;
  name: string;
}
 
interface Job {
  id: number;
  title: string;
  roleOverview: string;
  deptId?: number;
  minExperience?: number;
  maxExperience?: number;
  keyRequirements?: string;
  employmentType?: { id: number; name: string };
  coreRequirements?: string;
  dept?: { id: number; name: string };
  status?: string;
  publishedAt?: string
}
 
const PRIMARY = "#1a2e5a";
const ORANGE = "#f97316";
const PRIMARY_LIGHT = "#eef1f8";
 
export default function JobApply() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [depts, setDepts] = useState<Dept[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
 
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
  const [selectedEmpTypes, setSelectedEmpTypes] = useState<string[]>([]);
  const [expRange, setExpRange] = useState<[number, number]>([0, 20]);
 
  // Mobile filter drawer state
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
 
  useEffect(() => {
    fetchJobs();
    fetchDepts();
    fetchAppliedJobs();
  }, []);
 
  const fetchJobs = async () => {
    try {
      const res = await api.get("/getjob");
      setJobs(res.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };
 
  const fetchDepts = async () => {
    try {
      const res = await api.get("/getdept");
      setDepts(res.data);
    } catch (error) {
      console.error("Error fetching depts:", error);
    }
  };
 
  const getDaysAgo = (date?: string) => {
    if (!date) return "";
    const diff = Math.floor(
      (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );
 
    if (diff === 0) return "Today";
    if (diff === 1) return "1 day ago";
    return `${diff} days ago`;
  };
 
  const fetchAppliedJobs = async () => {
    try {
      const loginId = getUserId();
      if (!loginId) return;
 
      const profileRes = await api.get(`/profile/${loginId}`);
      if (!profileRes.data?.id) return;
 
      const candidateId = profileRes.data.id;
 
      const applRes = await api.get(`/getappcan/${candidateId}`);
 
      const ids = applRes.data
        .map((app: any) => app.job?.id)
        .filter(Boolean);
 
      setAppliedJobIds(ids);
    } catch (err) {
      console.error("Error fetching applied jobs:", err);
    }
  };
 
  // Derive unique employment types from jobs
  const empTypes = Array.from(
    new Set(jobs.map((j) => j.employmentType?.name).filter(Boolean))
  ) as string[];
 
  const toggleDept = (id: number) => {
    setSelectedDeptIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };
 
  const toggleEmpType = (type: string) => {
    setSelectedEmpTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };
 
  const hasActiveFilters =
    selectedDeptIds.length > 0 ||
    selectedEmpTypes.length > 0 ||
    expRange[0] !== 0 ||
    expRange[1] !== 20 ||
    searchQuery.trim() !== "";
 
  const clearFilters = () => {
    setSelectedDeptIds([]);
    setSelectedEmpTypes([]);
    setExpRange([0, 20]);
    setSearchQuery("");
  };
 
  const filteredJobs = jobs.filter((job) => {
    if (job.status !== "Posted") return false;
    if (
      searchQuery.trim() &&
      !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(job.keyRequirements ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
 
    if (selectedDeptIds.length > 0 && (!job.dept || !selectedDeptIds.includes(job.dept.id)))
      return false;
 
    if (
      selectedEmpTypes.length > 0 &&
      (!job.employmentType || !selectedEmpTypes.includes(job.employmentType.name))
    )
      return false;
 
    const minExp = job.minExperience ?? 0;
    const maxExp = job.maxExperience ?? 0;
    if (maxExp < expRange[0] || minExp > expRange[1]) return false;
 
    return true;
  });
 
  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <Typography
      variant="caption"
      sx={{
        display: "block",
        fontWeight: 700,
        color: PRIMARY,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        fontSize: 11,
        mb: 1.5,
      }}
    >
      {children}
    </Typography>
  );
 
  const filterPanelContent = () => (
    <Box sx={{ px: 2.5, py: 2.5 }}>
      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <SectionLabel>Search</SectionLabel>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1.5px solid #e2e8f0",
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            bgcolor: "#f8f9fc",
            "&:focus-within": {
              borderColor: PRIMARY,
              bgcolor: "#fff",
            },
            transition: "all 0.15s",
          }}
        >
          <SearchIcon sx={{ color: "#94a3b8", fontSize: 18, mr: 0.8 }} />
          <InputBase
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Job title or skill..."
            sx={{ fontSize: 13, flex: 1, color: "#1e293b" }}
          />
          {searchQuery && (
            <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ p: 0.3 }}>
              <CloseIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
            </IconButton>
          )}
        </Box>
      </Box>
 
      <Divider sx={{ mb: 2.5, borderColor: "#f1f5f9" }} />
 
      {/* Department */}
      {depts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <SectionLabel>Department</SectionLabel>
          <FormGroup sx={{ gap: 0.2 }}>
            {depts.map((dept) => (
              <FormControlLabel
                key={dept.id}
                control={
                  <Checkbox
                    checked={selectedDeptIds.includes(dept.id)}
                    onChange={() => toggleDept(dept.id)}
                    size="small"
                    sx={{
                      color: "#cbd5e1",
                      "&.Mui-checked": { color: PRIMARY },
                      py: 0.5,
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: "#475569", fontSize: 13 }}>
                    {dept.name}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Box>
      )}
 
      <Divider sx={{ mb: 2.5, borderColor: "#f1f5f9" }} />
 
      {/* Employment Type */}
      {empTypes.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <SectionLabel>Employment Type</SectionLabel>
          <FormGroup sx={{ gap: 0.2 }}>
            {empTypes.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={selectedEmpTypes.includes(type)}
                    onChange={() => toggleEmpType(type)}
                    size="small"
                    sx={{
                      color: "#cbd5e1",
                      "&.Mui-checked": { color: ORANGE },
                      py: 0.5,
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: "#475569", fontSize: 13 }}>
                    {type}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Box>
      )}
 
      <Divider sx={{ mb: 2.5, borderColor: "#f1f5f9" }} />
 
      {/* Experience Range */}
      <Box>
        <SectionLabel>Experience (Years)</SectionLabel>
        <Box sx={{ px: 0.5 }}>
          <Slider
            value={expRange}
            onChange={(_, val) => setExpRange(val as [number, number])}
            min={0}
            max={20}
            valueLabelDisplay="auto"
            sx={{
              color: PRIMARY,
              "& .MuiSlider-thumb": {
                width: 16,
                height: 16,
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: `0 0 0 8px rgba(26,46,90,0.12)`,
                },
              },
              "& .MuiSlider-rail": { bgcolor: "#e2e8f0" },
              "& .MuiSlider-valueLabel": {
                bgcolor: PRIMARY,
                fontSize: 11,
                fontWeight: 700,
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
              {expRange[0]} yr
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
              {expRange[1] === 20 ? "20+ yr" : `${expRange[1]} yr`}
            </Typography>
          </Box>
        </Box>
      </Box>
 
      {/* Active filter chips summary */}
      {hasActiveFilters && (
        <Box sx={{ mt: 2.5, pt: 2.5, borderTop: "1px solid #f1f5f9" }}>
          <SectionLabel>Active Filters</SectionLabel>
          <Stack direction="row" flexWrap="wrap" gap={0.7}>
            {selectedDeptIds.map((id) => {
              const dept = depts.find((d) => d.id === id);
              return dept ? (
                <Chip
                  key={id}
                  label={dept.name}
                  size="small"
                  onDelete={() => toggleDept(id)}
                  sx={{
                    bgcolor: PRIMARY_LIGHT,
                    color: PRIMARY,
                    fontWeight: 600,
                    fontSize: 11,
                    border: "1px solid #c8d3e8",
                    "& .MuiChip-deleteIcon": { color: PRIMARY, fontSize: 14 },
                  }}
                />
              ) : null;
            })}
            {selectedEmpTypes.map((type) => (
              <Chip
                key={type}
                label={type}
                size="small"
                onDelete={() => toggleEmpType(type)}
                sx={{
                  bgcolor: "#fff7ed",
                  color: ORANGE,
                  fontWeight: 600,
                  fontSize: 11,
                  border: "1px solid #fed7aa",
                  "& .MuiChip-deleteIcon": { color: ORANGE, fontSize: 14 },
                }}
              />
            ))}
            {(expRange[0] !== 0 || expRange[1] !== 20) && (
              <Chip
                label={`${expRange[0]}–${expRange[1]}yr`}
                size="small"
                onDelete={() => setExpRange([0, 20])}
                sx={{
                  bgcolor: "#f0fdf4",
                  color: "#15803d",
                  fontWeight: 600,
                  fontSize: 11,
                  border: "1px solid #bbf7d0",
                  "& .MuiChip-deleteIcon": { color: "#15803d", fontSize: 14 },
                }}
              />
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
 
  const filterHeader = ({ onClose }: { onClose?: () => void }) => (
    <Box
      sx={{
        px: 2.5,
        py: 2,
        bgcolor: PRIMARY,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <FilterListIcon sx={{ color: "#fff", fontSize: 18 }} />
        <Typography fontWeight={700} sx={{ color: "#fff", fontSize: 14 }}>
          Filters
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {hasActiveFilters && (
          <Button
            size="small"
            onClick={clearFilters}
            endIcon={<CloseIcon sx={{ fontSize: "14px !important" }} />}
            sx={{
              textTransform: "none",
              color: "#f97316",
              fontWeight: 600,
              fontSize: 12,
              minWidth: 0,
              p: "2px 6px",
              borderRadius: 1.5,
              "&:hover": { bgcolor: "rgba(245, 111, 15, 0.12)" },
            }}
          >
            Clear
          </Button>
        )}
        {onClose && (
          <IconButton size="small" onClick={onClose} sx={{ color: "#fff", p: 0.5 }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Stack>
    </Box>
  );
 
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc", py: { xs: 2, sm: 4 } }}>
      <Toaster position="top-right" richColors />
 
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Page Header */}
        <Box sx={{ mb: { xs: 2.5, sm: 4 } }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: PRIMARY,
              mb: 0.5,
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
            }}
          >
            Open Positions
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} available
            </Typography>
            {/* Mobile filter button */}
            {isMobile && (
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterDrawerOpen(true)}
                size="small"
                sx={{
                  textTransform: "none",
                  color: PRIMARY,
                  borderColor: "#e2e8f0",
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: 13,
                  px: 2,
                  "&:hover": { bgcolor: PRIMARY_LIGHT, borderColor: PRIMARY },
                  ...(hasActiveFilters && {
                    bgcolor: PRIMARY_LIGHT,
                    borderColor: PRIMARY,
                  }),
                }}
              >
                Filters
                {hasActiveFilters
                  ? ` (${selectedDeptIds.length +
                  selectedEmpTypes.length +
                  (expRange[0] !== 0 || expRange[1] !== 20 ? 1 : 0) +
                  (searchQuery ? 1 : 0)
                  })`
                  : ""}
              </Button>
            )}
          </Box>
        </Box>
 
        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
          {/* ── LEFT SIDEBAR FILTER (desktop only) ── */}
          {!isMobile && (
            <Box
              sx={{
                width: 268,
                flexShrink: 0,
                bgcolor: "#fff",
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                position: "sticky",
                top: 24,
              }}
            >
              {filterHeader({})}
              {filterPanelContent()}
            </Box>
          )}
 
          {/* ── MOBILE FILTER DRAWER ── */}
          <Drawer
            anchor="left"
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: { xs: "85vw", sm: 320 },
                bgcolor: "#fff",
                borderRadius: "0 16px 16px 0",
                overflow: "hidden",
              },
            }}
          >
            {filterHeader({ onClose: () => setFilterDrawerOpen(false) })}
            <Box sx={{ overflowY: "auto", flex: 1 }}>
              {filterPanelContent()}
            </Box>
            {/* Apply button in drawer footer */}
            <Box sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setFilterDrawerOpen(false)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: PRIMARY,
                  borderRadius: 2,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#132247", boxShadow: "none" },
                }}
              >
                Show {filteredJobs.length} Result{filteredJobs.length !== 1 ? "s" : ""}
              </Button>
            </Box>
          </Drawer>
 
          {/* ── JOB LIST ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {filteredJobs.length === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  py: { xs: 6, sm: 10 },
                  bgcolor: "#fff",
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography sx={{ color: "#94a3b8", fontSize: 16 }}>
                  No jobs match your current filters.
                </Typography>
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    sx={{
                      mt: 2,
                      textTransform: "none",
                      color: PRIMARY,
                      fontWeight: 600,
                      border: "1px solid #e2e8f0",
                      borderRadius: 2,
                      px: 3,
                      "&:hover": { bgcolor: PRIMARY_LIGHT },
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Box>
            )}
 
            {filteredJobs.map((job) => {
              const isApplied = appliedJobIds.includes(job.id);
 
              return (
 
                <Box
                  key={job.id}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  sx={{
                    mb: 2.5,
                    bgcolor: "#ffffff",
                    position: "relative",
                    borderRadius: "24px",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "stretch",
                    justifyContent: "space-between",
                    transition: "box-shadow 0.3s",
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: "0 8px 40px rgba(26,46,90,0.13)",
                    },
                    "&:hover .apply-label": {
                      bgcolor: PRIMARY,
                      color: "#fff",
                    },
                    "&:hover .apply-arrow": {
                      bgcolor: ORANGE,
                      color: "#fff",
                    },
                    "&:hover .job-icon": {
                      bgcolor: PRIMARY,
                      color: "#fff",
                      borderColor: PRIMARY,
                    },
                  }}
                >
                  {/* Left: icon + title + meta */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 1.5, sm: 2.5 },
                      px: { xs: 2, sm: 3 },
                      py: { xs: 2, sm: 2.5 },
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Avatar
                      className="job-icon"
                      sx={{
                        width: { xs: 42, sm: 52 },
                        height: { xs: 42, sm: 52 },
                        bgcolor: PRIMARY_LIGHT,
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "14px",
                        flexShrink: 0,
                        transition: "all 0.5s ease",
                      }}
                    >
                      <BusinessCenterOutlinedIcon sx={{ color: "#f97316", fontSize: { xs: 20, sm: 24 } }} />
                    </Avatar>
 
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          fontWeight={800}
                          sx={{
                            color: "#1e293b",
                            lineHeight: 1.3,
                            fontSize: { xs: "1rem", sm: "1.15rem" },
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {job.title}
                        </Typography>
                        {isApplied && (
                          <Chip
                            label="Applied"
                            size="small"
                            sx={{
                              bgcolor: "#f0fdf4",
                              color: "#16a34a",
                              fontWeight: 700,
                              fontSize: 10,
                              border: "1px solid #bbf7d0",
                            }}
                          />
                        )}
                      </Stack>
                      {job.dept?.name && (
                        <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", lineHeight: 1, display: "flex", }}>
                            {job.dept.name}
                          </Typography>
                        </Stack>
                      )}
                      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap mt={2}>
                        {job.publishedAt && (
                          <Stack direction="row" alignItems="center" spacing={0.4} sx={{ lineHeight: 1 }}>
                            <AccessTimeIcon sx={{ fontSize: 13, color: ORANGE, display: "flex", }} />
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", lineHeight: 1, display: "flex", }}>
                              Posted {getDaysAgo(job.publishedAt)}
                            </Typography>
                          </Stack>
                        )}
                        {job.employmentType?.name && (
                          <Stack direction="row" alignItems="center" spacing={0.4} sx={{ lineHeight: 1 }}>
                            <HourglassEmptyOutlinedIcon sx={{ fontSize: 13, color: ORANGE, display: "flex", }} />
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", lineHeight: 1, display: "flex", }}>
                              {job.employmentType.name}
                            </Typography>
                          </Stack>
                        )}
                        {(job.minExperience != null || job.maxExperience != null) && (
                          <Stack direction="row" alignItems="center" spacing={0.4} sx={{ lineHeight: 1 }}>
                            <WorkOutlineIcon sx={{ fontSize: 13, color: ORANGE, display: "flex", }} />
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", lineHeight: 1, display: "flex", }}>
                              {job.minExperience ?? 0}{job.maxExperience != null ? ` - ${job.maxExperience}` : ""} YRS
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  </Box>
 
                  {/* Right: split APPLY + arrow (parallelogram style) */}
                  <Box sx={{ display: "flex", alignItems: "stretch", flexShrink: 0 }}>
                    {/* APPLY label with left-skewed clip */}
                    <Box
                      className="apply-label"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 4,
                        bgcolor: "#f8fafc",
                        color: PRIMARY,
                        fontWeight: 800,
                        fontSize: 11,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        transition: "all 0.5s ease",
                        clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0% 100%)",
                        mr: "-20px",
                        zIndex: 1,
                      }}
                    >
                      view
                    </Box>
 
                    {/* Arrow box with left-skewed clip */}
                    <Box
                      className="apply-arrow"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pl: 5,
                        pr: 3,
                        bgcolor: PRIMARY,
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 20,
                        transition: "background 0.5s ease",
                        clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                      }}
                    >
                      <ArrowOutwardIcon sx={{ color: "inherit", fontSize: { xs: 20, sm: 24 } }} />
                    </Box>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}