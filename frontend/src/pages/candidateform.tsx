import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Tab,
  Tabs,
  Divider,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useForm } from "react-hook-form";
import api from "../utils/tokenInstance";
import { getUserId, getUserRole } from "../utils/auth";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import DocumentViewer from "./DocumentViewer";
import { toast, Toaster } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver, SubmitHandler } from "react-hook-form";

type ExperienceItem = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

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

const candidateSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().min(1, "Email required").email("Invalid email"),
  phone: z.string().min(1, "Phone required").regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  resume: z.any().optional(),
  skills: z.string().min(1, "Skills required"),
  totalExperience: z.preprocess((val) => {
    if (val === "" || val === undefined) return val;
    if (typeof val === "string") {
      const n = Number(val);
      return Number.isNaN(n) ? val : n;
    }
    return val;
  }, z.number().nonnegative()),
  dateOfBirth: z.string().min(1, "Date of birth required"),
});

type FormData = z.infer<typeof candidateSchema>;

const PRIMARY = "#1a2e5a";
const ORANGE = "#f97316";
const PRIMARY_LIGHT = "#eef1f8";

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": { borderColor: PRIMARY },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: PRIMARY },
};

export default function CandidateForm() {
  const {
    register,
    handleSubmit,
    watch,
    resetField,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(candidateSchema) as unknown as Resolver<FormData>,
    mode: "onBlur",
  });

  const loginId = getUserId();
  const { id } = useParams();
  const userRole = getUserRole();
  const isAdmin = userRole === "admin";

  const [existingResume, setExistingResume] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(() => !isAdmin);
  const [isParsing, setIsParsing] = useState(false);

  // ── Withdraw dialog state ─────────────────────────────────────────────────
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAppId, setWithdrawAppId] = useState<number | null>(null);
  const [withdrawJobTitle, setWithdrawJobTitle] = useState<string>("");

  const [educationList, setEducationList] = useState([
    { degree: "", institution: "", cgpa: "", startDate: "", endDate: "", isCurrent: false },
  ]);
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);

  const savedFormData = useRef<Partial<FormData>>({});
  const savedEducation = useRef<typeof educationList>([]);
  const savedExperience = useRef<ExperienceItem[]>([]);
  const savedExistingResume = useRef<string | null>(null);

  // ── Single source of truth for the selected file ──────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const watchedName = watch("name");
  const watchedSkills = watch("skills");
  const watchedExperience = watch("totalExperience");

  const removeFile = () => {
    resetField("resume");
    setSelectedFile(null);
  };

  // ── FIX: copy the File object out BEFORE reset() runs ────────────────────
  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFile = e.target.files?.[0];
    if (!chosenFile) return;

    // Store the actual File object immediately — stable, not affected by reset()
    setSelectedFile(chosenFile);

    try {
      setIsParsing(true);
      const formData = new FormData();
      formData.append("resume", chosenFile);

      const res = await api.post("/parse-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;

      // reset() may clear the file input — that's fine, selectedFile state is our source of truth
      reset({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        skills: data.skills || "",
        totalExperience: data.totalExperience || 0,
        dateOfBirth: data.dateOfBirth || "",
      });

      // Do NOT call setValue("resume", ...) — selectedFile state owns the file reference

      if (data.educationDetails?.length) setEducationList(data.educationDetails);
      if (data.experienceDetails?.length) setExperienceList(data.experienceDetails);

      toast.success("Form auto-filled from resume!");
    } catch (err) {
      console.error(err);
      toast.error("Could not auto-fill from resume");
    } finally {
      setIsParsing(false);
    }
  };

  const displayRole = editMode
    ? (savedExperience.current[0]?.role || "Role")
    : (experienceList[0]?.role || "Role");

  const handleEducationChange = (index: number, field: string, value: string | boolean) => {
    const updated = [...educationList];
    (updated[index] as any)[field] = value;
    if (field === "isCurrent" && value === true) {
      updated[index].endDate = "";
    }
    setEducationList(updated);
  };

  const addEducation = () => {
    setEducationList([...educationList, { degree: "", institution: "", cgpa: "", startDate: "", endDate: "", isCurrent: false }]);
  };

  const removeEducation = (index: number) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index: number, field: string, value: string | boolean) => {
    const updated = [...experienceList];
    (updated[index] as any)[field] = value;
    if (field === "isCurrent" && value === true) {
      updated[index].endDate = "";
    }
    setExperienceList(updated);
  };

  const addExperience = () => {
    setExperienceList([...experienceList, { company: "", role: "", startDate: "", endDate: "", isCurrent: false }]);
  };

  const removeExperience = (index: number) => {
    setExperienceList(experienceList.filter((_, i) => i !== index));
  };

  const handleEditClick = () => {
    savedFormData.current = {
      name: watch("name"),
      email: watch("email"),
      phone: watch("phone"),
      skills: watch("skills"),
      totalExperience: watch("totalExperience"),
      dateOfBirth: watch("dateOfBirth"),
    };
    savedEducation.current = JSON.parse(JSON.stringify(educationList));
    savedExperience.current = JSON.parse(JSON.stringify(experienceList));
    savedExistingResume.current = existingResume;
    setEditMode(true);
  };

  const handleCancel = () => {
    reset({
      name: savedFormData.current.name || "",
      email: savedFormData.current.email || "",
      phone: savedFormData.current.phone || "",
      skills: savedFormData.current.skills || "",
      totalExperience: savedFormData.current.totalExperience ?? 0,
      dateOfBirth: savedFormData.current.dateOfBirth || "",
    });
    setEducationList(
      savedEducation.current.length > 0
        ? savedEducation.current
        : [{ degree: "", institution: "", cgpa: "", startDate: "", endDate: "", isCurrent: false }]
    );
    setExperienceList(savedExperience.current);
    resetField("resume");
    setSelectedFile(null);
    setExistingResume(savedExistingResume.current);
    setEditMode(false);
  };

  const validateArraysBeforeSubmit = (): string | null => {
    if (!educationList || educationList.length === 0) return "At least one education entry is required.";
    for (let i = 0; i < educationList.length; i++) {
      const parse = educationItemSchema.safeParse(educationList[i]);
      if (!parse.success) {
        const firstMsg = parse.error.issues?.[0]?.message || "Invalid education entry";
        return `Education #${i + 1}: ${firstMsg}`;
      }
    }
    if (!experienceList || experienceList.length === 0) return null;
    for (let i = 0; i < experienceList.length; i++) {
      const parse = experienceItemSchema.safeParse(experienceList[i]);
      if (!parse.success) {
        const firstMsg = parse.error.issues?.[0]?.message || "Invalid experience entry";
        return `Experience #${i + 1}: ${firstMsg}`;
      }
    }
    return null;
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // ── FIX: single source of truth — only check selectedFile ────────────
      if (!existingResume && !selectedFile) {
        toast.error("Resume is required");
        return;
      }

      const arrErr = validateArraysBeforeSubmit();
      if (arrErr) { toast.error(arrErr); return; }

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("skills", data.skills || "");
      formData.append("totalExperience", String(data.totalExperience || ""));
      formData.append("dateOfBirth", data.dateOfBirth || "");
      formData.append("educationDetails", JSON.stringify(educationList));
      formData.append("experienceDetails", JSON.stringify(experienceList));

      // ── FIX: use only selectedFile — no FileList ref ambiguity ───────────
      if (selectedFile) {
        formData.append("resume", selectedFile);
      }
      // If no selectedFile, backend keeps the existing resume (no append needed)

      if (loginId) formData.append("loginId", String(loginId));

      if (candidateId) {
        await api.put(`/updateprofile/${candidateId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Profile Updated Successfully");
        await fetchCandidate();
      } else {
        const res = await api.post("/apply", formData, { headers: { "Content-Type": "multipart/form-data" } });
        setCandidateId(res.data.id);
        toast.success("Application Submitted Successfully");
        await fetchCandidate();
      }
      setEditMode(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit");
    }
  };

  // ── Withdraw handlers ─────────────────────────────────────────────────────
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
        prev.map((app) => app.id === withdrawAppId ? { ...app, status: "Withdrawn" } : app)
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

  const fetchCandidate = async () => {
    try {
      let res;
      if (id) { res = await api.get(`/idprofile/${id}`); }
      else if (loginId) { res = await api.get(`/profile/${loginId}`); }
      if (!res) return;
      const data = res.data;
      setExistingResume(data.resume);
      savedExistingResume.current = data.resume;
      setCandidateId(data.id);
      const formVals = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        skills: data.skills || "",
        totalExperience: data.totalExperience || 0,
        dateOfBirth: data.dateOfBirth || "",
      };
      reset(formVals);
      savedFormData.current = formVals;
      const fetchedEducation = (data.educationDetails || []).map((e: any) => ({ ...e, isCurrent: e.isCurrent ?? false }));
      const fetchedExperience = (data.experienceDetails || []).map((e: any) => ({ ...e, isCurrent: e.isCurrent ?? false }));
      setEducationList(fetchedEducation.length > 0 ? fetchedEducation : [{ degree: "", institution: "", cgpa: "", startDate: "", endDate: "", isCurrent: false }]);
      setExperienceList(fetchedExperience);
      savedEducation.current = fetchedEducation.length > 0 ? JSON.parse(JSON.stringify(fetchedEducation)) : [{ degree: "", institution: "", cgpa: "", startDate: "", endDate: "", isCurrent: false }];
      savedExperience.current = JSON.parse(JSON.stringify(fetchedExperience));
      const applRes = await api.get(`/getappcan/${data.id}`);
      setApplications(applRes.data);
      setEditMode(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCandidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loginId]);

  const skillsArray = watchedSkills
    ? watchedSkills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const initials = watchedName
    ? watchedName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const errMsg = (e: any) => (typeof e === "string" ? e : e?.message ? String(e.message) : "");

  return (
    <Box sx={{ bgcolor: "#f8f9fc", py: { xs: 1.5, sm: 2 } }}>
      <Toaster position="top-right" richColors />
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>

        <Box sx={{ display: "flex", gap: { xs: 2, md: 3 }, alignItems: "flex-start", flexDirection: { xs: "column", md: "row" } }}>

          {/* ── LEFT PANEL ── */}
          <Paper
            elevation={0}
            sx={{
              width: { xs: "100%", md: 280 },
              flexShrink: 0,
              borderRadius: 4,
              p: { xs: 2, sm: 3 },
              textAlign: "center",
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              position: "relative",
            }}
          >
            {!editMode && userRole === "user" && (
              <IconButton
                size="small"
                onClick={handleEditClick}
                sx={{
                  position: "absolute", top: 12, right: 12,
                  bgcolor: PRIMARY_LIGHT, color: PRIMARY,
                  "&:hover": { bgcolor: PRIMARY, color: "#fff" },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}

            <Box sx={{ display: "inline-block", mb: 2 }}>
              <Avatar
                sx={{
                  width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 },
                  fontSize: { xs: 28, sm: 36 }, bgcolor: PRIMARY,
                  border: `3px solid ${ORANGE}`, boxShadow: `0 0 0 4px ${PRIMARY_LIGHT}`,
                }}
              >
                {initials}
              </Avatar>
            </Box>

            <Typography sx={{ fontWeight: 700, fontSize: { xs: 15, sm: 18 }, color: PRIMARY }}>
              {watchedName || "Your Name"}
            </Typography>
            <Typography sx={{ color: "#64748b", fontSize: { xs: 12, sm: 13 }, mb: 0.5 }}>
              {displayRole}
            </Typography>
            <Typography sx={{ color: "#94a3b8", fontSize: { xs: 12, sm: 13 }, mb: 2 }}>
              {watchedExperience ? `${watchedExperience} yrs experience` : ""}
            </Typography>

            {skillsArray.length > 0 && (
              <Box sx={{ textAlign: "left", mt: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 1, color: PRIMARY }}>Skills:</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                  {skillsArray.map((skill, i) => (
                    <Chip
                      key={i} label={skill} size="small"
                      sx={{
                        bgcolor: "#fff", border: `1px solid #e2e8f0`, color: "#475569",
                        fontSize: 12, fontWeight: 500, borderRadius: 2,
                        "&:hover": { bgcolor: PRIMARY_LIGHT, borderColor: PRIMARY, color: PRIMARY },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ mt: 3, textAlign: "left" }}>
              {!editMode && existingResume && (
                <Button size="small" fullWidth onClick={() => setViewerOpen(true)} variant="outlined"
                  sx={{ borderColor: ORANGE, color: ORANGE, borderRadius: 2, textTransform: "none", "&:hover": { bgcolor: "#fff7ed", borderColor: ORANGE } }}>
                  View Resume
                </Button>
              )}
              {editMode && (
                <>
                  <Button variant="outlined" component="label" fullWidth size="small"
                    sx={{ borderColor: ORANGE, color: ORANGE, borderRadius: 2, textTransform: "none", mb: 1, "&:hover": { bgcolor: "#fff7ed", borderColor: ORANGE } }}>
                    {isParsing ? "Parsing..." : existingResume ? "Replace Resume" : "Upload Resume"}
                    <input type="file" hidden {...register("resume")} onChange={handleResumeChange} />
                  </Button>
                  {errMsg(errors.resume?.message) && !existingResume && (
                    <Typography sx={{ color: "error.main", fontSize: 12, mb: 1 }}>
                      {errMsg(errors.resume?.message)}
                    </Typography>
                  )}
                  {!selectedFile && existingResume && (
                    <Button size="small" fullWidth onClick={() => setViewerOpen(true)}
                      sx={{ textTransform: "none", color: PRIMARY, fontSize: 12 }}>
                      View Current Resume
                    </Button>
                  )}
                  {selectedFile && (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1, border: "1px solid #e2e8f0", borderRadius: 2 }}>
                      <Typography sx={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: { xs: 140, sm: 160 } }}>
                        {selectedFile.name}
                      </Typography>
                      <IconButton size="small" color="error" onClick={removeFile}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </>
              )}
            </Box>

            <DocumentViewer
              open={viewerOpen}
              onClose={() => setViewerOpen(false)}
              fileUrl={`http://localhost:5000/uploads/${existingResume}`}
              fileName={existingResume || ""}
            />
          </Paper>

          {/* ── RIGHT PANEL ── */}
          <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>

            {/* Basic Info Card */}
            <Paper elevation={0} sx={{ borderRadius: 4, p: { xs: 2, sm: 3 }, mb: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", gap: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: 14, sm: 16 }, color: PRIMARY }}>
                  Basic Information
                </Typography>
                {editMode && (
                  <Box sx={{ display: "inline-block", px: 1.5, py: 0.3, bgcolor: "#fff7ed", border: `1px solid ${ORANGE}`, borderRadius: 2 }}>
                    <Typography sx={{ fontSize: 12, color: ORANGE, fontWeight: 600 }}>Editing</Typography>
                  </Box>
                )}
              </Box>

              {editMode ? (
                <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    <TextField label="Full Name" fullWidth size="small" {...register("name")}
                      slotProps={{ inputLabel: { shrink: !!watch("name") } }}
                      error={!!errors.name} helperText={errMsg(errors.name?.message)} sx={fieldStyle} />
                    <TextField label="Email" fullWidth size="small" {...register("email")}
                      slotProps={{ inputLabel: { shrink: !!watch("email") } }}
                      error={!!errors.email} helperText={errMsg(errors.email?.message)} sx={fieldStyle} />
                    <TextField label="Phone" fullWidth size="small" {...register("phone")}
                      slotProps={{ inputLabel: { shrink: !!watch("phone") } }}
                      error={!!errors.phone} helperText={errMsg(errors.phone?.message)} sx={fieldStyle} />
                    <TextField label="Date of Birth" type="date" fullWidth size="small"
                      slotProps={{ inputLabel: { shrink: true } }}
                      {...register("dateOfBirth")} error={!!errors.dateOfBirth} helperText={errMsg(errors.dateOfBirth?.message)} sx={fieldStyle} />
                    <TextField label="Total Experience (Years)" type="number" fullWidth size="small"
                      {...register("totalExperience")}
                      slotProps={{ inputLabel: { shrink: watch("totalExperience") !== undefined && watch("totalExperience") !== null } }}
                      error={!!errors.totalExperience} helperText={errMsg(errors.totalExperience?.message)} sx={fieldStyle} />
                    <TextField label="Skills (comma separated)" fullWidth size="small"
                      {...register("skills")}
                      slotProps={{ inputLabel: { shrink: !!watch("skills") } }}
                      error={!!errors.skills} helperText={errMsg(errors.skills?.message)} sx={fieldStyle} />
                  </Box>
                  <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                    <Button type="submit" form="profile-form" variant="contained" fullWidth
                      sx={{ bgcolor: PRIMARY, borderRadius: 2, textTransform: "none", px: { xs: 2, sm: 4 }, fontWeight: 600, "&:hover": { bgcolor: "#0f1e3d" } }}>
                      Save Profile
                    </Button>
                    <Button variant="outlined" onClick={handleCancel} fullWidth
                      sx={{ borderColor: ORANGE, color: ORANGE, borderRadius: 2, textTransform: "none", "&:hover": { bgcolor: "#fff7ed" } }}>
                      Cancel
                    </Button>
                  </Box>
                </form>
              ) : (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: { xs: 2, sm: 2.5 } }}>
                  {[
                    { label: "Email", value: watch("email") },
                    { label: "Phone", value: watch("phone") },
                    { label: "Years of Experience", value: watchedExperience ? `${watchedExperience} Years` : "—" },
                    { label: "Date of Birth", value: watch("dateOfBirth") || "—" },
                  ].map(({ label, value }) => (
                    <Box key={label}>
                      <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: "#94a3b8", mb: 0.3 }}>{label}:</Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: { xs: 13, sm: 14 }, color: PRIMARY, wordBreak: "break-word" }}>{value || "—"}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>

            {/* Tabs Card */}
            <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #e2e8f0", overflow: "hidden", bgcolor: "#ffffff" }}>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  px: { xs: 1, sm: 3 },
                  borderBottom: "1px solid #e2e8f0",
                  "& .MuiTab-root": {
                    textTransform: "none", fontWeight: 600,
                    fontSize: { xs: 12, sm: 14 }, color: "#94a3b8",
                    minWidth: { xs: 90, sm: 120 },
                  },
                  "& .Mui-selected": { color: PRIMARY },
                  "& .MuiTabs-indicator": { bgcolor: ORANGE, height: 3, borderRadius: 2 },
                  "& .MuiTabs-scrollButtons": {
                    display: { md: "none" },
                  },
                }}
              >
                <Tab icon={<SchoolIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />} iconPosition="start" label="Education" />
                <Tab icon={<WorkIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />} iconPosition="start" label="Experience" />
                <Tab icon={<EmojiEventsIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />} iconPosition="start" label="Applications" />
              </Tabs>

              <Box sx={{ p: { xs: 2, sm: 3 } }}>

                {/* Education Tab */}
                {activeTab === 0 && (
                  <Box>
                    {educationList.map((edu, index) => (
                      <Box key={index}>
                        {editMode ? (
                          <Box sx={{ mb: 2, p: { xs: 1.5, sm: 2 }, border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "#ffffff" }}>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                              <TextField label="Degree" fullWidth size="small" value={edu.degree}
                                onChange={(e) => handleEducationChange(index, "degree", e.target.value)} sx={fieldStyle} />
                              <TextField label="Institution" fullWidth size="small" value={edu.institution}
                                onChange={(e) => handleEducationChange(index, "institution", e.target.value)} sx={fieldStyle} />
                              <TextField label="CGPA" fullWidth size="small" value={edu.cgpa}
                                onChange={(e) => handleEducationChange(index, "cgpa", e.target.value)} sx={fieldStyle} />
                              <TextField label="Start Date" type="date" fullWidth size="small"
                                slotProps={{ inputLabel: { shrink: true } }} value={edu.startDate}
                                onChange={(e) => handleEducationChange(index, "startDate", e.target.value)} sx={fieldStyle} />
                              {!edu.isCurrent && (
                                <TextField label="End Date" type="date" fullWidth size="small"
                                  slotProps={{ inputLabel: { shrink: true } }} value={edu.endDate}
                                  onChange={(e) => handleEducationChange(index, "endDate", e.target.value)} sx={fieldStyle} />
                              )}
                              {edu.isCurrent && (
                                <TextField label="End Date" fullWidth size="small" value="Present"
                                  disabled sx={{ ...fieldStyle, gridColumn: { sm: "auto" } }} />
                              )}
                            </Box>
                            <FormControlLabel
                              control={
                                <Checkbox checked={edu.isCurrent}
                                  onChange={(e) => handleEducationChange(index, "isCurrent", e.target.checked)}
                                  size="small" sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }} />
                              }
                              label={<Typography sx={{ fontSize: 13, color: "#475569" }}>Currently Studying</Typography>}
                              sx={{ mt: 1 }}
                            />
                            <Box>
                              <Button color="error" size="small" onClick={() => removeEducation(index)} sx={{ textTransform: "none" }}>
                                Remove
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Box>
                            <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: 1.5, sm: 2 }, py: 1.5 }}>
                              <Avatar sx={{ bgcolor: "#fff7ed", color: ORANGE, width: { xs: 36, sm: 44 }, height: { xs: 36, sm: 44 }, flexShrink: 0 }}>
                                <SchoolIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 14 }, color: PRIMARY }}>{edu.degree || "Degree"}</Typography>
                                <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: "#64748b" }}>{edu.institution || "Institution"}</Typography>
                                <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: "#94a3b8" }}>
                                  {edu.startDate} {edu.startDate && "–"} {edu.isCurrent ? "Present" : edu.endDate}
                                  {edu.cgpa && ` | CGPA: ${edu.cgpa}`}
                                </Typography>
                              </Box>
                            </Box>
                            {index < educationList.length - 1 && <Divider sx={{ my: 0.5 }} />}
                          </Box>
                        )}
                      </Box>
                    ))}
                    {editMode && (
                      <Button variant="outlined" size="small" onClick={addEducation}
                        sx={{ mt: 1, borderColor: ORANGE, color: ORANGE, borderRadius: 2, textTransform: "none", "&:hover": { bgcolor: "#fff7ed" } }}>
                        + Add Education
                      </Button>
                    )}
                  </Box>
                )}

                {/* Experience Tab */}
                {activeTab === 1 && (
                  <Box>
                    {experienceList.map((exp, index) => (
                      <Box key={index}>
                        {editMode ? (
                          <Box sx={{ mb: 2, p: { xs: 1.5, sm: 2 }, border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "#ffffff" }}>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                              <TextField label="Company" fullWidth size="small" value={exp.company}
                                onChange={(e) => handleExperienceChange(index, "company", e.target.value)} sx={fieldStyle} />
                              <TextField label="Role" fullWidth size="small" value={exp.role}
                                onChange={(e) => handleExperienceChange(index, "role", e.target.value)} sx={fieldStyle} />
                              <TextField label="Start Date" type="date" fullWidth size="small"
                                slotProps={{ inputLabel: { shrink: true } }} value={exp.startDate}
                                onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)} sx={fieldStyle} />
                              {!exp.isCurrent && (
                                <TextField label="End Date" type="date" fullWidth size="small"
                                  slotProps={{ inputLabel: { shrink: true } }} value={exp.endDate}
                                  onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)} sx={fieldStyle} />
                              )}
                              {exp.isCurrent && (
                                <TextField label="End Date" fullWidth size="small" value="Present"
                                  disabled sx={fieldStyle} />
                              )}
                            </Box>
                            <FormControlLabel
                              control={
                                <Checkbox checked={exp.isCurrent}
                                  onChange={(e) => handleExperienceChange(index, "isCurrent", e.target.checked)}
                                  size="small" sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }} />
                              }
                              label={<Typography sx={{ fontSize: 13, color: "#475569" }}>Currently Working</Typography>}
                              sx={{ mt: 1 }}
                            />
                            <Box>
                              <Button color="error" size="small" onClick={() => removeExperience(index)} sx={{ textTransform: "none" }}>
                                Remove
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Box>
                            <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: 1.5, sm: 2 }, py: 1.5 }}>
                              <Avatar sx={{ bgcolor: PRIMARY_LIGHT, color: PRIMARY, width: { xs: 36, sm: 44 }, height: { xs: 36, sm: 44 }, fontWeight: 700, fontSize: { xs: 12, sm: 14 }, flexShrink: 0 }}>
                                {exp.company?.[0] || "C"}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 14 }, color: PRIMARY }}>{exp.company || "Company"}</Typography>
                                <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: "#64748b" }}>{exp.role || "Role"}</Typography>
                                <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: "#94a3b8" }}>
                                  {exp.startDate} {exp.startDate && "–"} {exp.isCurrent ? "Present" : exp.endDate}
                                </Typography>
                              </Box>
                            </Box>
                            {index < experienceList.length - 1 && <Divider sx={{ my: 0.5 }} />}
                          </Box>
                        )}
                      </Box>
                    ))}
                    {editMode && (
                      <Button variant="outlined" size="small" onClick={addExperience}
                        sx={{ mt: 1, borderColor: ORANGE, color: ORANGE, borderRadius: 2, textTransform: "none", "&:hover": { bgcolor: "#fff7ed" } }}>
                        + Add Experience
                      </Button>
                    )}
                  </Box>
                )}

                {/* Applications Tab */}
                {activeTab === 2 && (
                  <Box>
                    {applications.length === 0 ? (
                      <Typography sx={{ color: "#94a3b8", fontSize: 14, textAlign: "center", py: 3 }}>
                        No applications yet.
                      </Typography>
                    ) : (
                      <Box>
                        {applications.map((app) => (
                          <Box key={app.id}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, py: 1.5, gap: 1, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 600, fontSize: { xs: 13, sm: 14 }, color: PRIMARY }}>{app.job?.title}</Typography>
                                <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: "#94a3b8" }}>Job ID: {app.job?.id}</Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                                <Chip
                                  label={app.status} size="small"
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
                                    fontWeight: 600, fontSize: 12, borderRadius: 2,
                                  }}
                                />
                                {app.status !== "Withdrawn" && !isAdmin && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleWithdrawClick(app.id, app.job?.title)}
                                    sx={{
                                      borderColor: "#dc2626", color: "#dc2626",
                                      borderRadius: 2, textTransform: "none",
                                      fontSize: 11, px: 1.2, py: 0.3,
                                      "&:hover": { bgcolor: "#fef2f2", borderColor: "#dc2626" },
                                    }}
                                  >
                                    Withdraw
                                  </Button>
                                )}
                              </Box>
                            </Box>
                            <Divider sx={{ my: 0.5 }} />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* ── Withdraw Confirm Dialog ───────────────────────────────────────── */}
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