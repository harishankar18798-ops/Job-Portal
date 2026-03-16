import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/tokenInstance";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Typography,
  Paper,
  FormHelperText,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const jobSchema = z
  .object({
    title: z.string().min(1, "Job title is required"),
    description: z.string().min(1, "Job description is required"),
    deptId: z
      .number({ message: "Department is required" })
      .min(1, "Department is required"),
    minExperience: z
      .number({ message: "Min experience must be a number" })
      .min(0, "Min experience cannot be negative"),
    maxExperience: z
      .number({ message: "Max experience must be a number" })
      .min(0, "Max experience cannot be negative"),
    skillsRequired: z.string().min(1, "Skills required field is required"),
    employmentTypeId: z
      .number({ message: "Employment type is required" })
      .min(1, "Employment type is required"),
    educationRequired: z.string().min(1, "Education required field is required"),
  })
  .refine((data) => data.maxExperience >= data.minExperience, {
    message: "Max experience must be ≥ min experience",
    path: ["maxExperience"],
  });

type JobForm = z.infer<typeof jobSchema>;

// ── Types ──────────────────────────────────────────────────────────────────────
type Dept = { id: number; name: string };
type EmploymentType = { id: number; name: string };

type JobRow = {
  id: number;
  title: string;
  description: string;
  deptId: number;
  minExperience?: number;
  maxExperience?: number;
  skillsRequired?: string;
  employmentTypeId?: number;
  educationRequired?: string;
};

// ── Constants ──────────────────────────────────────────────────────────────────
const NAVY = "#1a2e5a";
const NAVY_TEXT = "#0c1a3a";
const ORANGE = "#f97316";
const BORDER_COLOR = "#e2e8f0";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    background: "#fff",
    "&:hover fieldset": { borderColor: ORANGE },
    "&.Mui-focused fieldset": { borderColor: ORANGE, borderWidth: "2px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: ORANGE },
};

const sectionCardSx = {
  border: `1px solid ${BORDER_COLOR}`,
  borderRadius: "12px",
  p: 2,
  background: "#fff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function CreateJob() {
  const navigate = useNavigate();
  const location = useLocation();
  const editRow: JobRow | undefined = location.state?.editRow;
  const isEdit = !!editRow;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [depts, setDepts] = useState<Dept[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: isEdit
      ? {
          title: editRow.title,
          description: editRow.description,
          deptId: editRow.deptId,
          minExperience: editRow.minExperience ?? 0,
          maxExperience: editRow.maxExperience ?? 0,
          skillsRequired: editRow.skillsRequired ?? "",
          employmentTypeId: editRow.employmentTypeId ?? 0,
          educationRequired: editRow.educationRequired ?? "",
        }
      : {
          title: "",
          description: "",
          deptId: 0,
          minExperience: 0,
          maxExperience: 0,
          skillsRequired: "",
          employmentTypeId: 0,
          educationRequired: "",
        },
  });

  const descriptionValue = useWatch({ control, name: "description" });

  useEffect(() => {
    fetchDepts();
    fetchEmploymentTypes();
  }, []);

  const fetchDepts = async () => {
    try {
      const res = await api.get<Dept[]>("/getdept");
      setDepts(res.data);
    } catch {
      toast.error("Failed to load departments. Please try again.");
    }
  };

  const fetchEmploymentTypes = async () => {
    try {
      const res = await api.get<EmploymentType[]>("/employment-types");
      setEmploymentTypes(res.data);
    } catch {
      toast.error("Failed to load employment types. Please try again.");
    }
  };

  const onSubmit = async (data: JobForm) => {
    try {
      if (isEdit) {
        await api.put(`/updatejob/${editRow.id}`, data);
        toast.success("Job updated successfully.");
      } else {
        await api.post("/createjob", data);
        toast.success("Job created successfully.");
      }
      reset();
      navigate(-1);
    } catch {
      toast.error(
        isEdit
          ? "Failed to update job. Please try again."
          : "Failed to create job. Please try again."
      );
    }
  };

  const stripMarkdown = (text: string): string => {
    return text
      .replace(/#{1,6}\s?/g, "")
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
      .replace(/\*+/g, "")
      .replace(/^--+\s?/gm, "")
      .replace(/^-{3,}/gm, "")
      .replace(/^\s*[-•]\s/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const handleGenerateJD = async () => {
    setIsGenerating(true);
    try {
      const formData = getValues();
      const res = await api.post("/ai/generate-jd", { ...formData });
      const cleaned = stripMarkdown(res.data.jd);
      setValue("description", cleaned, { shouldValidate: true });
      toast.success("AI Job Description generated");
    } catch {
      toast.error("Failed to generate JD");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box
      sx={{
        // On mobile: allow natural scroll. On desktop: fixed full-height layout.
        height: { xs: "auto", md: "100vh" },
        minHeight: { xs: "100vh", md: "unset" },
        display: "flex",
        flexDirection: "column",
        overflow: { xs: "auto", md: "hidden" },
        background: "#f1f5f9",
      }}
    >
      <Toaster position="top-right" richColors />

      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 1.5, md: 2 },
          borderBottom: `1px solid ${BORDER_COLOR}`,
          background: "#fff",
          flexShrink: 0,
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1.5, sm: 0 },
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 17, md: 20 }, color: NAVY_TEXT, lineHeight: 1.2 }}>
            {isEdit ? "Edit Job" : "Post a New Job"}
          </Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: 12.5, mt: 0.2 }}>
            {isEdit ? "Update the job details below." : "Fill in the details below to create a new job listing."}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, width: { xs: "100%", sm: "auto" } }}>
          <Button
            onClick={() => navigate(-1)}
            sx={{
              color: "#64748b",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "8px",
              px: { xs: 2, md: 2.5 },
              flex: { xs: 1, sm: "unset" },
              border: `1px solid ${BORDER_COLOR}`,
              background: "#fff",
              "&:hover": { background: "#f8fafc", borderColor: "#cbd5e1" },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-job-form"
            variant="contained"
            sx={{
              background: ORANGE,
              borderRadius: "8px",
              fontWeight: 700,
              textTransform: "none",
              px: { xs: 2, md: 3 },
              flex: { xs: 1, sm: "unset" },
              boxShadow: "none",
              "&:hover": { background: "#ea6c00", boxShadow: "none" },
            }}
          >
            {isEdit ? "Update Job" : "Create Job"}
          </Button>
        </Box>
      </Box>

      {/* Body */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          // Stack vertically on mobile, side-by-side on desktop
          flexDirection: { xs: "column", md: "row" },
          overflow: { xs: "visible", md: "hidden" },
        }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          id="create-job-form"
          style={{ display: "flex", width: "100%", height: "100%" }}
        >
          {/* Responsive form wrapper — column on mobile, row on desktop */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              width: "100%",
              height: { xs: "auto", md: "100%" },
              overflow: { xs: "visible", md: "hidden" },
            }}
          >
            {/* LEFT PANEL */}
            <Box
              sx={{
                width: { xs: "100%", md: "65%" },
                height: { xs: "auto", md: "100%" },
                overflowY: { xs: "visible", md: "auto" },
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 2, md: 2 },
                background: "#f1f5f9",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {/* Card 1: Basic Info */}
              <Paper elevation={0} sx={sectionCardSx}>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: NAVY, mb: 1.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Basic Info
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    autoFocus
                    label="Job Title"
                    fullWidth
                    size="small"
                    sx={fieldSx}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    {...register("title")}
                  />
                  <Controller
                    name="deptId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" sx={fieldSx} error={!!errors.deptId}>
                        <InputLabel>Department</InputLabel>
                        <Select
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          input={<OutlinedInput label="Department" />}
                        >
                          <MenuItem value={0} disabled>Select department</MenuItem>
                          {depts.map((d) => (
                            <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                          ))}
                        </Select>
                        {errors.deptId && <FormHelperText>{errors.deptId.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </Box>
              </Paper>

              {/* Card 2: Experience & Skills */}
              <Paper elevation={0} sx={sectionCardSx}>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: NAVY, mb: 1.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Experience &amp; Skills
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    <TextField
                      label="Min Experience (Years)"
                      type="number"
                      fullWidth
                      size="small"
                      sx={fieldSx}
                      error={!!errors.minExperience}
                      helperText={errors.minExperience?.message}
                      {...register("minExperience", { valueAsNumber: true })}
                    />
                    <TextField
                      label="Max Experience (Years)"
                      type="number"
                      fullWidth
                      size="small"
                      sx={fieldSx}
                      error={!!errors.maxExperience}
                      helperText={errors.maxExperience?.message}
                      {...register("maxExperience", { valueAsNumber: true })}
                    />
                  </Box>
                  <TextField
                    label="Skills Required"
                    fullWidth
                    size="small"
                    placeholder="e.g. React, Node.js, SQL"
                    sx={fieldSx}
                    error={!!errors.skillsRequired}
                    helperText={errors.skillsRequired?.message}
                    {...register("skillsRequired")}
                  />
                </Box>
              </Paper>

              {/* Card 3: Employment Details */}
              <Paper elevation={0} sx={sectionCardSx}>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: NAVY, mb: 1.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Employment Details
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <Controller
                    name="employmentTypeId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" sx={fieldSx} error={!!errors.employmentTypeId}>
                        <InputLabel>Employment Type</InputLabel>
                        <Select
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          input={<OutlinedInput label="Employment Type" />}
                        >
                          <MenuItem value={0} disabled>Select employment type</MenuItem>
                          {employmentTypes.map((et) => (
                            <MenuItem key={et.id} value={et.id}>{et.name}</MenuItem>
                          ))}
                        </Select>
                        {errors.employmentTypeId && <FormHelperText>{errors.employmentTypeId.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                  <TextField
                    label="Education Required"
                    fullWidth
                    size="small"
                    placeholder="e.g. Bachelor's, Master's"
                    sx={fieldSx}
                    error={!!errors.educationRequired}
                    helperText={errors.educationRequired?.message}
                    {...register("educationRequired")}
                  />
                </Box>
              </Paper>
            </Box>

            {/* Vertical separator — only on desktop */}
            <Box sx={{ display: { xs: "none", md: "block" }, width: "1px", background: BORDER_COLOR, flexShrink: 0 }} />

            {/* Horizontal separator — only on mobile */}
            <Box sx={{ display: { xs: "block", md: "none" }, height: "1px", background: BORDER_COLOR, mx: 2 }} />

            {/* RIGHT PANEL */}
            <Box
              sx={{
                width: { xs: "100%", md: "35%" },
                height: { xs: "auto", md: "100%" },
                overflowY: { xs: "visible", md: "auto" },
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 2, md: 3 },
                background: "#fff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Panel header row */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: NAVY, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Job Description
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  disabled={isGenerating}
                  onClick={handleGenerateJD}
                  startIcon={
                    isGenerating
                      ? <CircularProgress size={14} sx={{ color: "#fff" }} />
                      : <AutoAwesomeIcon sx={{ fontSize: "15px !important" }} />
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${NAVY} 0%, #2a4a8a 100%)`,
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 12,
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 1.8,
                    py: 0.6,
                    boxShadow: "0 2px 6px rgba(26,46,90,0.25)",
                    letterSpacing: 0.2,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      background: `linear-gradient(135deg, #0c1a3a 0%, ${NAVY} 100%)`,
                      boxShadow: "0 4px 10px rgba(26,46,90,0.35)",
                    },
                    "&.Mui-disabled": { background: "#94a3b8", color: "#fff" },
                  }}
                >
                  {isGenerating ? "Generating…" : isMobile ? "Generate" : "Generate with AI"}
                </Button>
              </Box>

              {/* Description textarea */}
              <Box
                sx={{
                  // On mobile: fixed height textarea. On desktop: flex-grow to fill panel.
                  flex: { xs: "unset", md: 1 },
                  height: { xs: 260, md: "unset" },
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  // Bottom padding on mobile so last field isn't cut off
                  pb: { xs: 3, md: 0 },
                }}
              >
                <TextField
                  label={isGenerating ? "" : "Job Description"}
                  fullWidth
                  size="small"
                  multiline
                  placeholder={isGenerating ? "" : "Describe the role, responsibilities, and what makes this opportunity unique..."}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  InputLabelProps={{ shrink: !!descriptionValue }}
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      background: "#f8fafc",
                      height: "100%",
                      alignItems: "flex-start",
                      "&:hover fieldset": { borderColor: ORANGE },
                      "&.Mui-focused fieldset": { borderColor: ORANGE, borderWidth: "2px" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: ORANGE },
                    "& .MuiInputBase-inputMultiline": {
                      height: "100% !important",
                      overflow: "auto !important",
                      resize: "none",
                    },
                    "& .MuiOutlinedInput-root.MuiInputBase-multiline": {
                      height: { xs: "240px", md: "calc(100% - 8px)" },
                    },
                  }}
                  {...register("description")}
                />

                {/* Loading overlay */}
                {isGenerating && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "8px",
                      background: "rgba(248,250,252,0.82)",
                      backdropFilter: "blur(2px)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1.5,
                      zIndex: 2,
                    }}
                  >
                    <CircularProgress size={36} thickness={4} sx={{ color: NAVY }} />
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: NAVY, letterSpacing: 0.2 }}>
                      Generating job description…
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  );
}