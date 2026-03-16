import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";

// ── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = "#1a2e5a";
const ORANGE = "#f97316";
const PRIMARY_LIGHT = "#eef1f8";
const RECAPTCHA_SITE_KEY = "6LeUJYwsAAAAAOqg-cuXi0QMm9EWwjvbtaAxsAYW";

// ── Zod Schema ───────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  otp: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type ParsedCandidateData = {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string;
  totalExperience?: number;
  dateOfBirth?: string;
  educationDetails?: any[];
  experienceDetails?: any[];
};

// ── Field style ──────────────────────────────────────────────────────────────
const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    bgcolor: "#f8fafc",
    fontSize: 14,
    transition: "all 0.2s ease",
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused": {
      bgcolor: "#fff",
      "& fieldset": { borderColor: PRIMARY, borderWidth: 2 },
    },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: PRIMARY },
  "& .MuiFormHelperText-root": { fontSize: 11, mt: 0.4 },
};

// ── Step indicator ────────────────────────────────────────────────────────────
const steps = ["Basic Info", "Resume", "Verification", "OTP"];

function StepIndicator({ currentStep }: { currentStep: number }) {
  const progress = (currentStep / (steps.length - 1)) * 100;
  return (
    <Box sx={{ mb: 3.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        {steps.map((label, i) => (
          <Box key={label} sx={{ display: "flex", flexDirection: "column", alignItems: i === 0 ? "flex-start" : i === steps.length - 1 ? "flex-end" : "center" }}>
            <Box
              sx={{
                width: 24, height: 24, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                bgcolor: i < currentStep ? ORANGE : i === currentStep ? PRIMARY : "#e2e8f0",
                mb: 0.5,
                transition: "all 0.3s ease",
                boxShadow: i === currentStep ? `0 0 0 4px ${PRIMARY_LIGHT}` : "none",
              }}
            >
              {i < currentStep ? (
                <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#fff" }} />
              ) : (
                <Typography sx={{ fontSize: 10, fontWeight: 800, color: i === currentStep ? "#fff" : "#94a3b8" }}>
                  {i + 1}
                </Typography>
              )}
            </Box>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: i <= currentStep ? 700 : 400,
                color: i <= currentStep ? PRIMARY : "#94a3b8",
                transition: "all 0.3s ease",
                letterSpacing: 0.3,
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 3,
          borderRadius: 2,
          bgcolor: "#e2e8f0",
          mt: 0.5,
          "& .MuiLinearProgress-bar": {
            background: `linear-gradient(90deg, ${PRIMARY}, ${ORANGE})`,
            borderRadius: 2,
            transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
          },
        }}
      />
    </Box>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function SectionBox({
  label,
  stepNumber,
  done,
  children,
}: {
  label: string;
  stepNumber: number;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        border: `1.5px solid ${done ? "#bbf7d0" : "#e8edf5"}`,
        borderRadius: "14px",
        overflow: "hidden",
        transition: "all 0.3s ease",
        boxShadow: done ? "none" : "0 2px 8px rgba(26,46,90,0.04)",
      }}
    >
      {/* Section header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 1.5,
          bgcolor: done ? "#f0fdf4" : "#f8fafc",
          borderBottom: done ? "none" : "1px solid #e8edf5",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 22, height: 22, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              bgcolor: done ? "#16a34a" : PRIMARY,
              flexShrink: 0,
            }}
          >
            {done ? (
              <CheckCircleOutlineIcon sx={{ fontSize: 13, color: "#fff" }} />
            ) : (
              <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>
                {stepNumber}
              </Typography>
            )}
          </Box>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: done ? "#16a34a" : PRIMARY,
            }}
          >
            {label}
          </Typography>
        </Box>
        {done && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography sx={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>Completed</Typography>
          </Box>
        )}
      </Box>

      {/* Section content */}
      {!done && (
        <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

// ── Field label ───────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ mb: 0.6, fontWeight: 600, fontSize: 13, color: "#374151", letterSpacing: 0.1 }}>
      {children}
    </Typography>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isForgotMode = params.get("mode") === "forgot";

  const [step, setStep] = useState(0);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCandidateData | null>(null);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [showOtpInput, setShowOtpInput] = useState(false);
  const [verified, setVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const nameVal = watch("name");
  const phoneVal = watch("phone");
  const emailVal = watch("email");
  const passwordVal = watch("password");

  const basicInfoComplete =
    !!nameVal && !!phoneVal && !!emailVal && !!passwordVal &&
    !errors.name && !errors.phone && !errors.email && !errors.password;

  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);

  // ── Resume handler ────────────────────────────────────────────────────────
  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setParsedData(null);
    try {
      setIsParsing(true);
      const fd = new FormData();
      fd.append("resume", file);
      const res = await axios.post("http://localhost:5000/api/parse-resume", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setParsedData(res.data);
      toast.success("Resume uploaded successfully");
      setStep(2);
    } catch {
      toast.error("Could not parse resume — profile details will be empty");
      setStep(2);
    } finally {
      setIsParsing(false);
    }
  };

  const removeResume = () => {
    setSelectedFile(null);
    setParsedData(null);
    setStep(1);
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
  };

  // ── OTP handlers ─────────────────────────────────────────────────────────
  const sendOtp = async () => {
    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA first");
      return;
    }
    try {
      setIsSendingOtp(true);
      await axios.post("http://localhost:5000/api/send-otp", {
        email: emailVal,
        captchaToken,
      });
      setShowOtpInput(true);
      setStep(3);
      toast.success("OTP sent to your email");
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    try {
      const otp = watch("otp");
      await axios.post("http://localhost:5000/api/verify-otp", { email: emailVal, otp });
      setVerified(true);
    } catch {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const resendOtp = () => {
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
    setStep(2);
    setShowOtpInput(false);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    if (!verified) { toast.error("Please verify your email first"); return; }
    if (!selectedFile) { toast.error("Resume is required"); return; }

    try {
      const signupRes = await axios.post("http://localhost:5000/api/signup", {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
      });

      const loginId = signupRes.data?.id || signupRes.data?.loginId;

      if (loginId) {
        const profileForm = new FormData();
        profileForm.append("resume", selectedFile);
        profileForm.append("loginId", String(loginId));
        profileForm.append("name", data.name);
        profileForm.append("phone", data.phone);
        profileForm.append("email", data.email);
        profileForm.append("skills", parsedData?.skills || "");
        profileForm.append("totalExperience", String(parsedData?.totalExperience || 0));
        profileForm.append("dateOfBirth", parsedData?.dateOfBirth || "");
        profileForm.append("educationDetails", JSON.stringify(parsedData?.educationDetails || []));
        profileForm.append("experienceDetails", JSON.stringify(parsedData?.experienceDetails || []));

        await axios.post("http://localhost:5000/api/apply", profileForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("Account created successfully!");
      navigate("/");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      <Toaster position="top-right" richColors />

      {/* ── LEFT PANEL ── */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          width: "46%",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          p: "48px 52px",
          background: `linear-gradient(145deg, #0a1628 0%, ${PRIMARY} 45%, #1e3a72 100%)`,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background texture dots */}
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              borderRadius: "50%",
              border: "1px solid rgba(249,115,22,0.12)",
              width: 80 + i * 80,
              height: 80 + i * 80,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Top: Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              width: 38, height: 38, borderRadius: "10px",
              background: `linear-gradient(135deg, ${ORANGE}, #ea580c)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(249,115,22,0.4)",
            }}
          >
            <WorkOutlineRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>
            TalentHub
          </Typography>
        </Box>

        {/* Middle: Main content */}
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 380 }}>
          <Box
            sx={{
              display: "inline-block", px: 1.5, py: 0.5, mb: 3,
              bgcolor: "rgba(249,115,22,0.15)",
              border: "1px solid rgba(249,115,22,0.3)",
              borderRadius: "20px",
            }}
          >
            <Typography sx={{ fontSize: 12, color: ORANGE, fontWeight: 600, letterSpacing: 0.5 }}>
              {isForgotMode ? "Account Recovery" : "Join TalentHub Today"}
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: 36, fontWeight: 800, lineHeight: 1.15,
              letterSpacing: -1, mb: 2,
            }}
          >
            {isForgotMode ? (
              "Recover your account access"
            ) : (
              <>
                Your next opportunity<br />
                <Box component="span" sx={{ color: ORANGE }}>starts here.</Box>
              </>
            )}
          </Typography>

          <Typography sx={{ opacity: 0.6, lineHeight: 1.8, fontSize: 14, mb: 4 }}>
            {isForgotMode
              ? "Enter your details below to reset your password securely."
              : "Create your profile, upload your resume, and connect with top companies hiring right now."}
          </Typography>

          {/* Stats */}
          {!isForgotMode && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { icon: <PeopleAltOutlinedIcon sx={{ fontSize: 16 }} />, stat: "10,000+", label: "Active Candidates" },
                { icon: <BusinessOutlinedIcon sx={{ fontSize: 16 }} />, stat: "500+", label: "Partner Companies" },
                { icon: <TrendingUpOutlinedIcon sx={{ fontSize: 16 }} />, stat: "95%", label: "Placement Rate" },
              ].map(({ icon, stat, label }) => (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 36, height: 36, borderRadius: "10px",
                      bgcolor: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: ORANGE,
                    }}
                  >
                    {icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1 }}>{stat}</Typography>
                    <Typography sx={{ opacity: 0.5, fontSize: 12 }}>{label}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Bottom: Footer note */}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography sx={{ fontSize: 12, opacity: 0.35 }}>
            © 2025 TalentHub · Trusted by professionals
          </Typography>
        </Box>
      </Box>

      {/* ── RIGHT PANEL ── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3, md: 4 },
          background: "#f1f5f9",
          overflowY: "auto",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 500, py: 2 }}>

          {/* Top label */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography sx={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
              {isForgotMode ? "Remember your password?" : "Already have an account?"}{" "}
              <Link to="/" style={{ color: ORANGE, fontWeight: 700, textDecoration: "none" }}>
                {isForgotMode ? "Sign In" : "Log in"}
              </Link>
            </Typography>
          </Box>

          <Card
            elevation={0}
            sx={{
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 24px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
              overflow: "visible",
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: "32px 36px" } }}>

              {/* Header */}
              <Box mb={3.5}>
                <Typography
                  sx={{
                    fontSize: 24, fontWeight: 800, color: PRIMARY,
                    letterSpacing: -0.8, mb: 0.5, lineHeight: 1.2,
                  }}
                >
                  {isForgotMode ? "Reset your password" : "Create your account"}
                </Typography>
                <Typography sx={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6 }}>
                  {isForgotMode
                    ? "Enter your email and set a new password below."
                    : "Fill in your details step by step to get started."}
                </Typography>
              </Box>

              {/* Step indicator */}
              {!isForgotMode && (
                <StepIndicator currentStep={verified ? 3 : step} />
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>

                  {/* ── SECTION 1: Basic Info ── */}
                  <SectionBox label="Basic Information" stepNumber={1} done={step > 0 && basicInfoComplete}>
                    <Stack spacing={2}>
                      <Box>
                        <FieldLabel>Full Name</FieldLabel>
                        <TextField
                          fullWidth size="small"
                          placeholder="John Doe"
                          {...register("name")}
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonOutlineIcon sx={{ fontSize: 17, color: "#94a3b8" }} />
                                </InputAdornment>
                              ),
                              sx: { height: 44 },
                            },
                          }}
                          sx={fieldStyle}
                        />
                      </Box>

                      <Box>
                        <FieldLabel>Phone Number</FieldLabel>
                        <TextField
                          fullWidth size="small"
                          placeholder="10-digit mobile number"
                          {...register("phone")}
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneOutlinedIcon sx={{ fontSize: 17, color: "#94a3b8" }} />
                                </InputAdornment>
                              ),
                              sx: { height: 44 },
                            },
                          }}
                          sx={fieldStyle}
                        />
                      </Box>

                      <Box>
                        <FieldLabel>Email Address</FieldLabel>
                        <TextField
                          fullWidth size="small"
                          placeholder="you@example.com"
                          {...register("email")}
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailOutlinedIcon sx={{ fontSize: 17, color: "#94a3b8" }} />
                                </InputAdornment>
                              ),
                              sx: { height: 44 },
                            },
                          }}
                          sx={fieldStyle}
                        />
                      </Box>

                      <Box>
                        <FieldLabel>{isForgotMode ? "New Password" : "Password"}</FieldLabel>
                        <TextField
                          type="password"
                          fullWidth size="small"
                          placeholder="Minimum 6 characters"
                          {...register("password")}
                          error={!!errors.password}
                          helperText={errors.password?.message}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockOutlinedIcon sx={{ fontSize: 17, color: "#94a3b8" }} />
                                </InputAdornment>
                              ),
                              sx: { height: 44 },
                            },
                          }}
                          sx={fieldStyle}
                        />
                      </Box>

                      {step === 0 && (
                        <Button
                          variant="contained"
                          disabled={!basicInfoComplete}
                          onClick={() => { if (basicInfoComplete) setStep(1); }}
                          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            mt: 0.5,
                            bgcolor: PRIMARY,
                            borderRadius: "10px",
                            height: 44,
                            fontWeight: 700,
                            textTransform: "none",
                            fontSize: 14,
                            letterSpacing: 0.2,
                            boxShadow: "0 4px 14px rgba(26,46,90,0.25)",
                            "&:hover": {
                              bgcolor: "#0f1e3d",
                              boxShadow: "0 6px 18px rgba(26,46,90,0.35)",
                            },
                            "&:disabled": { bgcolor: "#e2e8f0", color: "#94a3b8", boxShadow: "none" },
                          }}
                        >
                          Continue
                        </Button>
                      )}
                    </Stack>
                  </SectionBox>

                  {/* ── SECTION 2: Resume Upload ── */}
                  {step >= 1 && (
                    <SectionBox label="Resume Upload" stepNumber={2} done={!!selectedFile && step > 1}>
                      {!selectedFile ? (
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={
                            isParsing ? (
                              <CircularProgress size={15} sx={{ color: ORANGE }} />
                            ) : (
                              <UploadFileOutlinedIcon sx={{ fontSize: 18 }} />
                            )
                          }
                          disabled={isParsing}
                          sx={{
                            borderRadius: "10px",
                            borderColor: "#e2e8f0",
                            borderStyle: "dashed",
                            borderWidth: 2,
                            color: "#475569",
                            fontWeight: 600,
                            height: 72,
                            textTransform: "none",
                            fontSize: 13.5,
                            flexDirection: "column",
                            gap: 0.3,
                            bgcolor: "#f8fafc",
                            "&:hover": {
                              bgcolor: "#fff7ed",
                              borderColor: ORANGE,
                              color: ORANGE,
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          {isParsing ? "Parsing your resume..." : "Click to upload resume"}
                          {!isParsing && (
                            <Typography sx={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>
                              PDF, DOC, DOCX supported
                            </Typography>
                          )}
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeChange}
                          />
                        </Button>
                      ) : (
                        <Box
                          sx={{
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between",
                            p: "10px 14px",
                            border: "1.5px solid #bbf7d0",
                            borderRadius: "10px",
                            bgcolor: "#f0fdf4",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                            <Box
                              sx={{
                                width: 34, height: 34, borderRadius: "8px",
                                bgcolor: "#dcfce7",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <InsertDriveFileOutlinedIcon sx={{ color: "#16a34a", fontSize: 17 }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: 13, fontWeight: 700, color: "#15803d",
                                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}
                              >
                                {selectedFile.name}
                              </Typography>
                              <Typography sx={{ fontSize: 11, color: "#16a34a" }}>
                                {(selectedFile.size / 1024).toFixed(0)} KB
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            size="small" onClick={removeResume}
                            sx={{
                              minWidth: 0, color: "#dc2626", p: 0.8, flexShrink: 0,
                              borderRadius: "8px",
                              "&:hover": { bgcolor: "#fef2f2" },
                            }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                          </Button>
                        </Box>
                      )}
                    </SectionBox>
                  )}

                  {/* ── SECTION 3: reCAPTCHA + Send OTP ── */}
                  {step >= 2 && !verified && (
                    <SectionBox label="Security Verification" stepNumber={3} done={verified}>
                      <Stack spacing={2}>
                        <Box>
                          <FieldLabel>Complete the security check below</FieldLabel>
                          <Box
                            sx={{
                              border: "1.5px solid #e2e8f0",
                              borderRadius: "10px",
                              p: 1.5,
                              bgcolor: "#f8fafc",
                              display: "flex",
                              justifyContent: "center",
                              overflow: "visible",
                              position: "relative",
                              zIndex: 9999,
                            }}
                          >
                            <ReCAPTCHA
                              ref={recaptchaRef}
                              sitekey={RECAPTCHA_SITE_KEY}
                              onChange={(token) => setCaptchaToken(token)}
                              onExpired={() => setCaptchaToken(null)}
                            />
                          </Box>
                        </Box>

                        {!showOtpInput && (
                          <Button
                            variant="contained"
                            onClick={sendOtp}
                            disabled={!captchaToken || isSendingOtp}
                            startIcon={
                              isSendingOtp ? (
                                <CircularProgress size={15} sx={{ color: "#fff" }} />
                              ) : (
                                <VerifiedUserOutlinedIcon sx={{ fontSize: 17 }} />
                              )
                            }
                            sx={{
                              borderRadius: "10px",
                              bgcolor: captchaToken ? PRIMARY : "#e2e8f0",
                              color: captchaToken ? "#fff" : "#94a3b8",
                              height: 44,
                              fontWeight: 700,
                              textTransform: "none",
                              fontSize: 13.5,
                              boxShadow: captchaToken ? "0 4px 14px rgba(26,46,90,0.25)" : "none",
                              "&:hover": {
                                bgcolor: captchaToken ? "#0f1e3d" : "#e2e8f0",
                                boxShadow: captchaToken ? "0 6px 18px rgba(26,46,90,0.35)" : "none",
                              },
                              "&:disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
                              transition: "all 0.2s ease",
                            }}
                          >
                            {isSendingOtp ? "Sending code..." : "Send Verification Code"}
                          </Button>
                        )}
                      </Stack>
                    </SectionBox>
                  )}

                  {/* ── SECTION 4: OTP Input ── */}
                  {step >= 3 && !verified && (
                    <SectionBox label="Enter OTP" stepNumber={4} done={verified}>
                      <Stack spacing={2}>
                        {/* Email hint */}
                        <Box
                          sx={{
                            display: "flex", alignItems: "center", gap: 1,
                            p: "10px 14px", borderRadius: "8px",
                            bgcolor: PRIMARY_LIGHT, border: `1px solid #dce5f5`,
                          }}
                        >
                          <EmailOutlinedIcon sx={{ fontSize: 15, color: PRIMARY, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: 12.5, color: PRIMARY }}>
                            Code sent to <strong>{emailVal}</strong>
                          </Typography>
                        </Box>

                        <Box>
                          <FieldLabel>6-digit verification code</FieldLabel>
                          <TextField
                            fullWidth size="small"
                            placeholder="· · · · · ·"
                            {...register("otp")}
                            inputProps={{
                              maxLength: 6,
                              style: {
                                letterSpacing: 10,
                                fontSize: 22,
                                fontWeight: 800,
                                textAlign: "center",
                                color: PRIMARY,
                              },
                            }}
                            sx={{
                              ...fieldStyle,
                              "& .MuiOutlinedInput-root": {
                                ...fieldStyle["& .MuiOutlinedInput-root"],
                                height: 58,
                              },
                            }}
                          />
                        </Box>

                        <Button
                          variant="contained"
                          onClick={verifyOtp}
                          sx={{
                            bgcolor: PRIMARY,
                            borderRadius: "10px",
                            height: 44,
                            fontWeight: 700,
                            textTransform: "none",
                            fontSize: 13.5,
                            boxShadow: "0 4px 14px rgba(26,46,90,0.25)",
                            "&:hover": { bgcolor: "#0f1e3d", boxShadow: "0 6px 18px rgba(26,46,90,0.35)" },
                          }}
                        >
                          Verify & Continue
                        </Button>

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                          <Typography sx={{ fontSize: 12.5, color: "#64748b" }}>
                            Didn't receive the code?
                          </Typography>
                          <Button
                            size="small" onClick={resendOtp}
                            sx={{
                              color: ORANGE, textTransform: "none", fontSize: 12.5,
                              fontWeight: 700, p: "2px 6px", minWidth: 0,
                              "&:hover": { bgcolor: "#fff7ed" },
                            }}
                          >
                            Resend
                          </Button>
                        </Box>
                      </Stack>
                    </SectionBox>
                  )}

                  {/* ── VERIFIED BADGE ── */}
                  {verified && (
                    <Box
                      sx={{
                        display: "flex", alignItems: "center", gap: 2,
                        p: "14px 18px", borderRadius: "12px",
                        bgcolor: "#f0fdf4",
                        border: "1.5px solid #bbf7d0",
                      }}
                    >
                      <Box
                        sx={{
                          width: 40, height: 40, borderRadius: "50%",
                          bgcolor: "#dcfce7",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#15803d" }}>
                          Email verified successfully
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#16a34a" }}>
                          {emailVal}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* ── SUBMIT ── */}
                  {verified && (
                    <Button
                      type="submit"
                      fullWidth
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        height: 50,
                        background: `linear-gradient(135deg, ${PRIMARY} 0%, #1e3a72 100%)`,
                        color: "#fff",
                        borderRadius: "12px",
                        fontWeight: 800,
                        fontSize: 15,
                        textTransform: "none",
                        letterSpacing: 0.2,
                        boxShadow: "0 6px 20px rgba(26,46,90,0.3)",
                        "&:hover": {
                          background: `linear-gradient(135deg, #0f1e3d 0%, ${PRIMARY} 100%)`,
                          boxShadow: "0 10px 28px rgba(26,46,90,0.4)",
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      {isForgotMode ? "Save New Password" : "Create My Account"}
                    </Button>
                  )}

                  {/* ── FOOTER ── */}
                  <Typography textAlign="center" sx={{ fontSize: 12, color: "#94a3b8", pt: 0.5 }}>
                    By creating an account you agree to our{" "}
                    <Box component="span" sx={{ color: PRIMARY, fontWeight: 600, cursor: "pointer" }}>
                      Terms of Service
                    </Box>{" "}
                    and{" "}
                    <Box component="span" sx={{ color: PRIMARY, fontWeight: 600, cursor: "pointer" }}>
                      Privacy Policy
                    </Box>
                  </Typography>

                </Stack>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}