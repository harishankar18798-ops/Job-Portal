import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Container,
  Box,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import api from "../utils/tokenInstance";
import { getUserId } from "../utils/auth";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import GuestApplyModal from "./GuestApplyModal";

interface Dept {
  id: number;
  name: string;
}

interface Job {
  id: number;
  title: string;
  description: string;
  deptId?: number;
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

export default function JobApply() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [depts, setDepts] = useState<Dept[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);

  // Guest modal state
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestJobId, setGuestJobId] = useState<number | null>(null);
  const [guestJobTitle, setGuestJobTitle] = useState<string>("");

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

  const fetchAppliedJobs = async () => {
    try {
      const loginId = getUserId();
      if (!loginId) return;
      const profileRes = await api.get(`/profile/${loginId}`);
      if (!profileRes.data?.id) return;
      const candidateId = profileRes.data.id;
      const applRes = await api.get(`/getappcan/${candidateId}`);
      const ids = applRes.data.map((app: any) => app.job?.id).filter(Boolean);
      setAppliedJobIds(ids);
    } catch {
      // not logged in or no profile yet — silently ignore
    }
  };

  // ── Apply click handler (guest-aware) ──────────────────────────────────────
  const handleApplyClick = async (jobId: number, jobTitle: string) => {
    const loginId = getUserId();

    // Guest flow — open multi-slide modal
    if (!loginId) {
      setGuestJobId(jobId);
      setGuestJobTitle(jobTitle);
      setGuestModalOpen(true);
      return;
    }

    // Logged-in flow — existing confirm dialog
    try {
      const profileRes = await api.get(`/profile/${loginId}`);
      if (!profileRes.data || !profileRes.data.id) {
        toast.error("Please fill your profile first");
        return;
      }
      setSelectedJobId(jobId);
      setConfirmOpen(true);
    } catch {
      toast.error("Please fill your profile first");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    }
  };

  const confirmApply = async () => {
    try {
      if (!selectedJobId) return;
      const loginId = getUserId();
      const profileRes = await api.get(`/profile/${loginId}`);
      const candidateId = profileRes.data.id;
      await api.post("/createappl", { candidateId, jobId: selectedJobId });
      toast.success("Applied Successfully");
      setAppliedJobIds((prev) => [...prev, selectedJobId]);
      setConfirmOpen(false);
      setSelectedJobId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply");
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
    if (
      searchQuery.trim() &&
      !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(job.skillsRequired ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    if (selectedDeptIds.length > 0 && (!job.dept || !selectedDeptIds.includes(job.dept.id)))
      return false;

    if (selectedEmpTypes.length > 0 && (!job.employmentType || !selectedEmpTypes.includes(job.employmentType.name)))
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

  // ── Changed from component declarations to plain functions called inline ──
  // This prevents React from treating them as new component types on each render,
  // which was causing focus loss (remount) on every keystroke / slider change.

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
              "&:hover": { bgcolor: "rgba(249,115,22,0.12)" },
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
            sx={{ color: PRIMARY, mb: 0.5, fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
          >
            Open Positions
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
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
                Filters{hasActiveFilters ? ` (${selectedDeptIds.length + selectedEmpTypes.length + (expRange[0] !== 0 || expRange[1] !== 20 ? 1 : 0) + (searchQuery ? 1 : 0)})` : ""}
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

            {filteredJobs.map((job) => (
              <Box
                key={job.id}
                sx={{
                  mb: 2.5,
                  bgcolor: "#ffffff",
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 4px 20px rgba(26,46,90,0.10)" },
                }}
              >
                {/* Card Header */}
                <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: { xs: "flex-start", sm: "flex-start" },
                      justifyContent: "space-between",
                      gap: { xs: 1.5, sm: 2 },
                      flexWrap: { xs: "wrap", sm: "nowrap" },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2 }}>
                      <Avatar
                        sx={{
                          width: { xs: 42, sm: 52 },
                          height: { xs: 42, sm: 52 },
                          bgcolor: PRIMARY_LIGHT,
                          border: `1.5px solid #e2e8f0`,
                          borderRadius: 2.5,
                          flexShrink: 0,
                        }}
                      >
                        <BusinessCenterOutlinedIcon sx={{ color: PRIMARY, fontSize: { xs: 20, sm: 26 } }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{ color: PRIMARY, lineHeight: 1.3, fontSize: { xs: "1rem", sm: "1.25rem" } }}
                        >
                          {job.title}
                        </Typography>
                        {job.dept?.name && (
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                            {job.dept.name}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    {(() => {
                      const isApplied = appliedJobIds.includes(job.id);
                      return (
                        <Button
                          variant="contained"
                          onClick={() => !isApplied && handleApplyClick(job.id, job.title)}
                          disabled={isApplied}
                          sx={{
                            fontWeight: 600,
                            borderRadius: 2,
                            bgcolor: isApplied ? "#e2e8f0" : ORANGE,
                            color: isApplied ? "#94a3b8" : "#fff",
                            px: { xs: 2, sm: 3 },
                            py: { xs: 0.8, sm: 1 },
                            textTransform: "none",
                            flexShrink: 0,
                            boxShadow: "none",
                            fontSize: { xs: 13, sm: 14 },
                            alignSelf: { xs: "flex-start", sm: "center" },
                            "&:hover": { bgcolor: isApplied ? "#e2e8f0" : "#ea6c0a", boxShadow: "none" },
                            "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
                          }}
                        >
                          {isApplied ? "Applied" : "Apply"}
                        </Button>
                      );
                    })()}
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={2}>
                    {job.minExperience !== undefined && job.maxExperience !== undefined && (
                      <Chip
                        icon={<WorkOutlineIcon sx={{ fontSize: 14, color: PRIMARY + " !important" }} />}
                        label={`${job.minExperience} – ${job.maxExperience} yrs exp`}
                        size="small"
                        sx={{
                          bgcolor: PRIMARY_LIGHT,
                          color: PRIMARY,
                          fontWeight: 600,
                          border: `1px solid #c8d3e8`,
                          fontSize: { xs: 11, sm: 12 },
                        }}
                      />
                    )}
                    {job.employmentType?.name && (
                      <Chip
                        label={job.employmentType.name}
                        size="small"
                        sx={{
                          bgcolor: "#fff7ed",
                          color: ORANGE,
                          fontWeight: 600,
                          border: `1px solid #fed7aa`,
                          fontSize: { xs: 11, sm: 12 },
                        }}
                      />
                    )}
                  </Stack>
                </Box>

                {/* Accordion */}
                <Accordion
                  disableGutters
                  elevation={0}
                  sx={{
                    bgcolor: "transparent",
                    "&:before": { display: "none" },
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: ORANGE }} />}
                    sx={{
                      px: { xs: 2, sm: 3 },
                      minHeight: 44,
                      "&.Mui-expanded": { minHeight: 44 },
                      "& .MuiAccordionSummary-content": { my: 1 },
                    }}
                  >
                    <Typography variant="body2" sx={{ color: PRIMARY, fontWeight: 600 }}>
                      View Details
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pt: 0, pb: 3, bgcolor: "#fafbfd" }}>
                    {job.description && (
                      <Box mb={2.5}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY, mb: 0.5 }}>
                          Job Description
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.7 }}>
                          {job.description}
                        </Typography>
                      </Box>
                    )}

                    {job.skillsRequired && (
                      <Box mb={2.5}>
                        <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                          <StarOutlineIcon sx={{ fontSize: 16, color: ORANGE }} />
                          <Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }}>
                            Skills Required
                          </Typography>
                        </Stack>
                        <Stack direction="row" flexWrap="wrap" gap={0.8} mt={0.5}>
                          {job.skillsRequired.split(",").map((skill, i) => (
                            <Chip
                              key={i}
                              label={skill.trim()}
                              size="small"
                              sx={{
                                bgcolor: "#fff",
                                border: "1px solid #e2e8f0",
                                color: "#475569",
                                fontWeight: 500,
                                fontSize: 12,
                                borderRadius: 2,
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {job.educationRequired && (
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                          <SchoolOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />
                          <Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }}>
                            Education Required
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.7 }}>
                          {job.educationRequired}
                        </Typography>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      {/* ── Logged-in Confirm Dialog ── */}
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
        <DialogTitle sx={{ fontWeight: 700, color: PRIMARY, borderBottom: "1px solid #e2e8f0", pb: 2 }}>
          Confirm Application
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <DialogContentText sx={{ color: "#64748b", lineHeight: 1.7 }}>
            Are you sure you want to apply for this job?
            <br /><br />
            Please make sure your profile information and resume are updated before applying.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
          <Button
            onClick={() => setConfirmOpen(false)}
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
            Yes, Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Guest Apply Modal ── */}
      <GuestApplyModal
        open={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        jobId={guestJobId}
        jobTitle={guestJobTitle}
        onSuccess={() => {
          if (guestJobId) setAppliedJobIds((prev) => [...prev, guestJobId]);
          setGuestModalOpen(false);
        }}
      />
    </Box>
  );
}