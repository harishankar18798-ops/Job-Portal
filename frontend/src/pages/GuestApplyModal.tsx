import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Resolver, SubmitHandler } from "react-hook-form";
import { useState, useRef } from "react";
import api from "../utils/tokenInstance";
import { toast } from "sonner";

// ─── Constants ───────────────────────────────────────────────────────────────
const PRIMARY = "#1a2e5a";
const ORANGE = "#f97316";
const PRIMARY_LIGHT = "#eef1f8";

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": { borderColor: PRIMARY },
    borderRadius: "10px",
    bgcolor: "#ffffff",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: PRIMARY },
};

// ─── Schemas ─────────────────────────────────────────────────────────────────
const slide1Schema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().min(1, "Email required").email("Invalid email"),
  phone: z
    .string()
    .min(1, "Phone required")
    .regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth required"),
  totalExperience: z.preprocess((val) => {
    if (val === "" || val === undefined) return val;
    if (typeof val === "string") {
      const n = Number(val);
      return Number.isNaN(n) ? val : n;
    }
    return val;
  }, z.number({ message: "Enter a valid number" }).nonnegative("Must be 0 or more")),
  skills: z.string().min(1, "Skills required"),
});

const educationItemSchema = z.object({
  degree: z.string().min(1, "Degree required"),
  institution: z.string().min(1, "Institution required"),
  cgpa: z.string().min(1, "CGPA required"),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.union([z.string().min(1, "End date required"), z.literal("")]),
  isCurrent: z.boolean(),
});

const experienceItemSchema = z.object({
  company: z.string().min(1, "Company required"),
  role: z.string().min(1, "Role required"),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.union([z.string().min(1, "End date required"), z.literal("")]),
  isCurrent: z.boolean(),
});

type Slide1Data = z.infer<typeof slide1Schema>;

type EducationItem = {
  degree: string;
  institution: string;
  cgpa: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

type ExperienceItem = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

// ── Slides reordered: Resume is now first ──────────────────────────────────
const SLIDES = [
  { label: "Resume", icon: UploadFileIcon },
  { label: "Basic Info", icon: PersonIcon },
  { label: "Education", icon: SchoolIcon },
  { label: "Experience", icon: WorkIcon },
];

interface GuestApplyModalProps {
  open: boolean;
  onClose: () => void;
  jobId: number | null;
  jobTitle?: string;
  onSuccess?: () => void;
}

export default function GuestApplyModal({
  open,
  onClose,
  jobId,
  onSuccess,
}: GuestApplyModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [currentSlide, setCurrentSlide] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Education state
  const [educationList, setEducationList] = useState<EducationItem[]>([
    { degree: "", institution: "", cgpa: "", startDate: "", endDate: "", isCurrent: false },
  ]);
  const [eduErrors, setEduErrors] = useState<string[]>([]);

  // Experience state
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);
  const [expErrors, setExpErrors] = useState<string[]>([]);

  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Slide 1 form (Basic Info)
  const {
    register,
    trigger,
    getValues,
    reset: resetForm,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Slide1Data>({
    resolver: zodResolver(slide1Schema) as unknown as Resolver<Slide1Data>,
    mode: "onBlur",
  });

  const errMsg = (e: any) =>
    typeof e === "string" ? e : e?.message ? String(e.message) : "";

  // ── Resume auto-fill ───────────────────────────────────────────────────────
  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setResumeFile(file);
    setResumeError("");

    try {
      setIsParsing(true);
      const formData = new FormData();
      formData.append("resume", file);

      const res = await api.post("/parse-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;

      // Auto-fill basic info fields
      if (data.name) setValue("name", data.name);
      if (data.email) setValue("email", data.email);
      if (data.phone) setValue("phone", data.phone);
      if (data.skills) setValue("skills", data.skills);
      if (data.totalExperience) setValue("totalExperience", data.totalExperience);
      if (data.dateOfBirth) setValue("dateOfBirth", data.dateOfBirth);

      // Auto-fill education and experience
      if (data.educationDetails?.length) setEducationList(data.educationDetails);
      if (data.experienceDetails?.length) setExperienceList(data.experienceDetails);

      toast.success("Form auto-filled from resume!");
    } catch (err) {
      console.error(err);
      toast.error("Could not auto-fill — please fill manually");
    } finally {
      setIsParsing(false);
      e.target.value = "";
    }
  };

  // ── Education helpers ──────────────────────────────────────────────────────
  const handleEduChange = (index: number, field: string, value: string | boolean) => {
    const updated = [...educationList];
    (updated[index] as any)[field] = value;
    if (field === "isCurrent" && value === true) updated[index].endDate = "";
    setEducationList(updated);
  };

  const addEducation = () =>
    setEducationList([
      ...educationList,
      { degree: "", institution: "", cgpa: "", startDate: "", endDate: "", isCurrent: false },
    ]);

  const removeEducation = (i: number) =>
    setEducationList(educationList.filter((_, idx) => idx !== i));

  // ── Experience helpers ─────────────────────────────────────────────────────
  const handleExpChange = (index: number, field: string, value: string | boolean) => {
    const updated = [...experienceList];
    (updated[index] as any)[field] = value;
    if (field === "isCurrent" && value === true) updated[index].endDate = "";
    setExperienceList(updated);
  };

  const addExperience = () =>
    setExperienceList([
      ...experienceList,
      { company: "", role: "", startDate: "", endDate: "", isCurrent: false },
    ]);

  const removeExperience = (i: number) =>
    setExperienceList(experienceList.filter((_, idx) => idx !== i));

  // ── Per-slide validation ───────────────────────────────────────────────────
  const validateSlide = async (): Promise<boolean> => {
    // Slide 0: Resume (now first)
    if (currentSlide === 0) {
      if (!resumeFile) {
        setResumeError("Resume is required to apply");
        return false;
      }
      setResumeError("");
      return true;
    }

    // Slide 1: Basic Info
    if (currentSlide === 1) {
      return await trigger();
    }

    // Slide 2: Education
    if (currentSlide === 2) {
      if (educationList.length === 0) {
        setEduErrors(["At least one education entry is required."]);
        return false;
      }
      const errs: string[] = [];
      let valid = true;
      educationList.forEach((edu, i) => {
        const result = educationItemSchema.safeParse(edu);
        if (!result.success) {
          errs[i] = result.error.issues[0]?.message || "Invalid entry";
          valid = false;
        } else {
          errs[i] = "";
        }
      });
      setEduErrors(errs);
      return valid;
    }

    // Slide 3: Experience (optional)
    if (currentSlide === 3) {
      if (experienceList.length === 0) return true;
      const errs: string[] = [];
      let valid = true;
      experienceList.forEach((exp, i) => {
        const result = experienceItemSchema.safeParse(exp);
        if (!result.success) {
          errs[i] = result.error.issues[0]?.message || "Invalid entry";
          valid = false;
        } else {
          errs[i] = "";
        }
      });
      setExpErrors(errs);
      return valid;
    }

    return true;
  };

  const handleNext = async () => {
    const valid = await validateSlide();
    if (valid) setCurrentSlide((s) => s + 1);
  };

  const handleBack = () => setCurrentSlide((s) => s - 1);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleApply: SubmitHandler<Slide1Data> = async () => {
    const valid = await validateSlide();
    if (!valid) return;
    if (!jobId) return;

    setSubmitting(true);
    try {
      const slide1Data = getValues();

      const loginRes = await api.post("/guest-login", { email: slide1Data.email });
      const loginId = loginRes.data.id;

      const formData = new FormData();
      formData.append("name", slide1Data.name);
      formData.append("email", slide1Data.email);
      formData.append("phone", slide1Data.phone);
      formData.append("dateOfBirth", slide1Data.dateOfBirth);
      formData.append("totalExperience", String(slide1Data.totalExperience));
      formData.append("skills", slide1Data.skills);
      formData.append("educationDetails", JSON.stringify(educationList));
      formData.append("experienceDetails", JSON.stringify(experienceList));
      formData.append("loginId", String(loginId));
      if (resumeFile) formData.append("resume", resumeFile);

      const candidateRes = await api.post("/apply", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const candidateId = candidateRes.data.id;

      await api.post("/createappl", { candidateId, jobId });

      toast.success("Applied successfully!");
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Close / Reset ──────────────────────────────────────────────────────────
  const handleClose = () => {
    setCurrentSlide(0);
    resetForm();
    setEducationList([{ degree: "", institution: "", cgpa: "", startDate: "", endDate: "", isCurrent: false }]);
    setExperienceList([]);
    setEduErrors([]);
    setExpErrors([]);
    setResumeFile(null);
    setResumeError("");
    onClose();
  };

  const progress = (currentSlide / (SLIDES.length - 1)) * 100;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
          border: isMobile ? "none" : "1px solid #e2e8f0",
          boxShadow: "0 16px 48px rgba(26,46,90,0.14)",
          overflow: "hidden",
          mx: { xs: 0, sm: "auto" },
          display: "flex",
          flexDirection: "column",
          height: isMobile ? "100%" : "auto",
          maxHeight: isMobile ? "100%" : "90vh",
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 3 },
          pb: { xs: 1.5, sm: 2 },
          bgcolor: PRIMARY,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: { xs: 10, sm: 12 },
            right: { xs: 10, sm: 12 },
            color: "rgba(255,255,255,0.7)",
            "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Typography
          sx={{
            color: "#fff",
            fontWeight: 700,
            fontSize: { xs: 15, sm: 18 },
            mb: { xs: 1.5, sm: 2 },
            pr: 4,
          }}
        >
          Quick Apply
        </Typography>

        {/* Step indicators */}
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, mb: 1 }}>
          {SLIDES.map((slide, i) => {
            const Icon = slide.icon;
            const done = i < currentSlide;
            const active = i === currentSlide;
            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: { xs: 28, sm: 34 },
                    height: { xs: 28, sm: 34 },
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: done ? ORANGE : active ? "#fff" : "rgba(255,255,255,0.15)",
                    border: active ? `2px solid ${ORANGE}` : "2px solid transparent",
                    transition: "all 0.25s",
                    flexShrink: 0,
                  }}
                >
                  {done ? (
                    <CheckCircleIcon sx={{ fontSize: { xs: 14, sm: 18 }, color: "#fff" }} />
                  ) : (
                    <Icon
                      sx={{
                        fontSize: { xs: 13, sm: 16 },
                        color: active ? PRIMARY : "rgba(255,255,255,0.55)",
                      }}
                    />
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: 9, sm: 10 },
                    fontWeight: active ? 700 : 500,
                    color: active ? "#fff" : done ? ORANGE : "rgba(255,255,255,0.5)",
                    display: "block",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {slide.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mt: 1,
            height: 3,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.15)",
            "& .MuiLinearProgress-bar": { bgcolor: ORANGE, borderRadius: 2 },
          }}
        />
      </Box>

      {/* ── Scrollable content area ── */}
      <DialogContent
        sx={{
          p: 0,
          bgcolor: "#f8f9fc",
          flex: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#e2e8f0", borderRadius: 3 },
        }}
      >
        <Box sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>

          {/* ── Slide 0: Resume (now first) ── */}
          {currentSlide === 0 && (
            <Box>
              {!resumeFile ? (
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: `2px dashed ${resumeError ? "#ef4444" : "#e2e8f0"}`,
                    borderRadius: 3,
                    p: { xs: 3, sm: 5 },
                    textAlign: "center",
                    cursor: "pointer",
                    bgcolor: "#fff",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: ORANGE, bgcolor: "#fff7ed" },
                    "&:active": { borderColor: ORANGE, bgcolor: "#fff7ed" },
                  }}
                >
                  <UploadFileIcon
                    sx={{
                      fontSize: { xs: 36, sm: 44 },
                      color: resumeError ? "#ef4444" : "#cbd5e1",
                      mb: 1,
                    }}
                  />
                  <Typography
                    sx={{ fontWeight: 600, color: PRIMARY, fontSize: { xs: 13, sm: 15 }, mb: 0.5 }}
                  >
                    Click to upload resume
                  </Typography>
                  <Typography sx={{ color: "#94a3b8", fontSize: { xs: 11, sm: 12 } }}>
                    PDF, DOC, DOCX supported
                  </Typography>
                  {resumeError && (
                    <Typography sx={{ color: "#ef4444", fontSize: 12, mt: 1 }}>
                      {resumeError}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box>
                  {/* File card */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: { xs: 1.5, sm: 2 },
                      border: "1px solid #e2e8f0",
                      borderRadius: 3,
                      bgcolor: "#fff",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 1, sm: 1.5 },
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: PRIMARY_LIGHT,
                          width: { xs: 34, sm: 40 },
                          height: { xs: 34, sm: 40 },
                          flexShrink: 0,
                        }}
                      >
                        <UploadFileIcon sx={{ color: PRIMARY, fontSize: { xs: 16, sm: 20 } }} />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: 12, sm: 13 },
                            color: PRIMARY,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: { xs: 160, sm: 260 },
                          }}
                        >
                          {resumeFile.name}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                          {(resumeFile.size / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small" color="error" onClick={() => setResumeFile(null)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Parsing indicator */}
                  {isParsing && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: { xs: 1.5, sm: 2 },
                        border: "1px solid #e2e8f0",
                        borderRadius: 3,
                        bgcolor: "#fff",
                        mb: 2,
                      }}
                    >
                      <CircularProgress size={18} sx={{ color: PRIMARY }} />
                      <Typography sx={{ fontSize: 13, color: PRIMARY, fontWeight: 500 }}>
                        Parsing resume and auto-filling your details...
                      </Typography>
                    </Box>
                  )}

                  {/* Auto-fill success nudge */}
                  {!isParsing && (
                    <Box
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 3,
                        bgcolor: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      <Typography sx={{ fontSize: { xs: 12, sm: 13 }, fontWeight: 600, color: "#166534", mb: 0.3 }}>
                        ✅ Resume uploaded
                      </Typography>
                      <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: "#15803d" }}>
                        Your details have been auto-filled. You can review and edit them in the next steps.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
              />

              {/* Register nudge */}
              <Box
                sx={{
                  mt: { xs: 2, sm: 3 },
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 3,
                  bgcolor: PRIMARY_LIGHT,
                  border: `1px solid #c8d3e8`,
                }}
              >
                <Typography
                  sx={{ fontSize: { xs: 12, sm: 13 }, fontWeight: 600, color: PRIMARY, mb: 0.3 }}
                >
                  💡 Track your application status
                </Typography>
                <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: "#64748b" }}>
                  Create a free account after applying to track your application status, save your
                  profile, and apply faster next time.
                </Typography>
              </Box>
            </Box>
          )}

          {/* ── Slide 1: Basic Info ── */}
          {currentSlide === 1 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              <TextField
                label="Full Name"
                fullWidth
                size="small"
                {...register("name")}
                slotProps={{ inputLabel: { shrink: !!watch("name") } }}
                error={!!errors.name}
                helperText={errMsg(errors.name?.message)}
                sx={fieldStyle}
              />
              <TextField
                label="Email"
                fullWidth
                size="small"
                {...register("email")}
                slotProps={{ inputLabel: { shrink: !!watch("email") } }}
                error={!!errors.email}
                helperText={errMsg(errors.email?.message)}
                sx={fieldStyle}
              />
              <TextField
                label="Phone"
                fullWidth
                size="small"
                {...register("phone")}
                slotProps={{ inputLabel: { shrink: !!watch("phone") } }}
                error={!!errors.phone}
                helperText={errMsg(errors.phone?.message)}
                sx={fieldStyle}
              />
              <TextField
                label="Date of Birth"
                type="date"
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("dateOfBirth")}
                error={!!errors.dateOfBirth}
                helperText={errMsg(errors.dateOfBirth?.message)}
                sx={fieldStyle}
              />
              <TextField
                label="Total Experience (Years)"
                type="number"
                fullWidth
                size="small"
                {...register("totalExperience")}
                slotProps={{ inputLabel: { shrink: watch("totalExperience") !== undefined && watch("totalExperience") !== null } }}
                error={!!errors.totalExperience}
                helperText={errMsg(errors.totalExperience?.message)}
                sx={fieldStyle}
              />
              <TextField
                label="Skills (comma separated)"
                fullWidth
                size="small"
                {...register("skills")}
                slotProps={{ inputLabel: { shrink: !!watch("skills") } }}
                error={!!errors.skills}
                helperText={errMsg(errors.skills?.message)}
                sx={fieldStyle}
              />
            </Box>
          )}

          {/* ── Slide 2: Education ── */}
          {currentSlide === 2 && (
            <Box>
              {educationList.map((edu, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    p: { xs: 1.5, sm: 2 },
                    border: eduErrors[index] ? "1px solid #ef4444" : "1px solid #e2e8f0",
                    borderRadius: 3,
                    bgcolor: "#fff",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1.5,
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 13, color: PRIMARY }}>
                      Education #{index + 1}
                    </Typography>
                    {educationList.length > 1 && (
                      <Button
                        color="error"
                        size="small"
                        onClick={() => removeEducation(index)}
                        sx={{ textTransform: "none", fontSize: 12, minWidth: "auto", px: 1 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                  {eduErrors[index] && (
                    <Typography sx={{ color: "#ef4444", fontSize: 12, mb: 1 }}>
                      {eduErrors[index]}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: { xs: 1.5, sm: 2 },
                    }}
                  >
                    <TextField
                      label="Degree"
                      fullWidth
                      size="small"
                      value={edu.degree}
                      onChange={(e) => handleEduChange(index, "degree", e.target.value)}
                      sx={fieldStyle}
                    />
                    <TextField
                      label="Institution"
                      fullWidth
                      size="small"
                      value={edu.institution}
                      onChange={(e) => handleEduChange(index, "institution", e.target.value)}
                      sx={fieldStyle}
                    />
                    <TextField
                      label="CGPA"
                      fullWidth
                      size="small"
                      value={edu.cgpa}
                      onChange={(e) => handleEduChange(index, "cgpa", e.target.value)}
                      sx={fieldStyle}
                    />
                    <TextField
                      label="Start Date"
                      type="date"
                      fullWidth
                      size="small"
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={edu.startDate}
                      onChange={(e) => handleEduChange(index, "startDate", e.target.value)}
                      sx={fieldStyle}
                    />
                    {!edu.isCurrent ? (
                      <TextField
                        label="End Date"
                        type="date"
                        fullWidth
                        size="small"
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={edu.endDate}
                        onChange={(e) => handleEduChange(index, "endDate", e.target.value)}
                        sx={fieldStyle}
                      />
                    ) : (
                      <TextField
                        label="End Date"
                        fullWidth
                        size="small"
                        value="Present"
                        disabled
                        sx={fieldStyle}
                      />
                    )}
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={edu.isCurrent}
                        onChange={(e) => handleEduChange(index, "isCurrent", e.target.checked)}
                        size="small"
                        sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 13, color: "#475569" }}>
                        Currently Studying
                      </Typography>
                    }
                    sx={{ mt: 1 }}
                  />
                </Box>
              ))}
              <Button
                variant="outlined"
                size="small"
                onClick={addEducation}
                sx={{
                  borderColor: ORANGE,
                  color: ORANGE,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: { xs: 12, sm: 13 },
                  "&:hover": { bgcolor: "#fff7ed" },
                }}
              >
                + Add Education
              </Button>
            </Box>
          )}

          {/* ── Slide 3: Experience (Optional) ── */}
          {currentSlide === 3 && (
            <Box>
              {experienceList.length === 0 && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: { xs: 3, sm: 4 },
                    border: "1.5px dashed #e2e8f0",
                    borderRadius: 3,
                    mb: 2,
                    bgcolor: "#fff",
                    px: 2,
                  }}
                >
                  <WorkIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: "#cbd5e1", mb: 1 }} />
                  <Typography sx={{ color: "#94a3b8", fontSize: { xs: 12, sm: 13 } }}>
                    No experience added yet
                  </Typography>
                  <Typography sx={{ color: "#cbd5e1", fontSize: { xs: 11, sm: 12 } }}>
                    You can skip this step if you're a fresher
                  </Typography>
                </Box>
              )}
              {experienceList.map((exp, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    p: { xs: 1.5, sm: 2 },
                    border: expErrors[index] ? "1px solid #ef4444" : "1px solid #e2e8f0",
                    borderRadius: 3,
                    bgcolor: "#fff",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1.5,
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 13, color: PRIMARY }}>
                      Experience #{index + 1}
                    </Typography>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => removeExperience(index)}
                      sx={{ textTransform: "none", fontSize: 12, minWidth: "auto", px: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                  {expErrors[index] && (
                    <Typography sx={{ color: "#ef4444", fontSize: 12, mb: 1 }}>
                      {expErrors[index]}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: { xs: 1.5, sm: 2 },
                    }}
                  >
                    <TextField
                      label="Company"
                      fullWidth
                      size="small"
                      value={exp.company}
                      onChange={(e) => handleExpChange(index, "company", e.target.value)}
                      sx={fieldStyle}
                    />
                    <TextField
                      label="Role"
                      fullWidth
                      size="small"
                      value={exp.role}
                      onChange={(e) => handleExpChange(index, "role", e.target.value)}
                      sx={fieldStyle}
                    />
                    <TextField
                      label="Start Date"
                      type="date"
                      fullWidth
                      size="small"
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={exp.startDate}
                      onChange={(e) => handleExpChange(index, "startDate", e.target.value)}
                      sx={fieldStyle}
                    />
                    {!exp.isCurrent ? (
                      <TextField
                        label="End Date"
                        type="date"
                        fullWidth
                        size="small"
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={exp.endDate}
                        onChange={(e) => handleExpChange(index, "endDate", e.target.value)}
                        sx={fieldStyle}
                      />
                    ) : (
                      <TextField
                        label="End Date"
                        fullWidth
                        size="small"
                        value="Present"
                        disabled
                        sx={fieldStyle}
                      />
                    )}
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={exp.isCurrent}
                        onChange={(e) => handleExpChange(index, "isCurrent", e.target.checked)}
                        size="small"
                        sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 13, color: "#475569" }}>
                        Currently Working
                      </Typography>
                    }
                    sx={{ mt: 1 }}
                  />
                </Box>
              ))}
              <Button
                variant="outlined"
                size="small"
                onClick={addExperience}
                sx={{
                  borderColor: ORANGE,
                  color: ORANGE,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: { xs: 12, sm: 13 },
                  "&:hover": { bgcolor: "#fff7ed" },
                }}
              >
                + Add Experience
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* ── Footer Navigation ── */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          bgcolor: "#fff",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          disabled={currentSlide === 0}
          size={isMobile ? "small" : "medium"}
          sx={{
            textTransform: "none",
            borderColor: "#e2e8f0",
            color: "#64748b",
            borderRadius: 2,
            fontWeight: 600,
            fontSize: { xs: 12, sm: 14 },
            px: { xs: 1.5, sm: 2 },
            "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: PRIMARY_LIGHT },
            "&.Mui-disabled": { borderColor: "#f1f5f9", color: "#cbd5e1" },
          }}
        >
          Previous
        </Button>

        <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: "#94a3b8", fontWeight: 500 }}>
          {currentSlide + 1} / {SLIDES.length}
        </Typography>

        {currentSlide < SLIDES.length - 1 ? (
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleNext}
            disabled={isParsing}
            size={isMobile ? "small" : "medium"}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: PRIMARY,
              borderRadius: 2,
              boxShadow: "none",
              fontSize: { xs: 12, sm: 14 },
              px: { xs: 1.5, sm: 2 },
              "&:hover": { bgcolor: "#132247", boxShadow: "none" },
            }}
          >
            {isParsing ? "Parsing..." : "Next"}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleApply as any}
            disabled={submitting}
            size={isMobile ? "small" : "medium"}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: ORANGE,
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              boxShadow: "none",
              fontSize: { xs: 12, sm: 14 },
              "&:hover": { bgcolor: "#ea6c0a", boxShadow: "none" },
              "&.Mui-disabled": { bgcolor: "#fed7aa", color: "#fff" },
            }}
          >
            {submitting ? "Applying..." : "Apply Now"}
          </Button>
        )}
      </Box>
    </Dialog>
  );
}