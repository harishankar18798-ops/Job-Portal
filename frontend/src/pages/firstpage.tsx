import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box, Typography, Button, TextField, InputAdornment,
  CircularProgress, Alert,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { startTokenRefreshTimer } from "../utils/tokenTimer";

const NAVY  = "#1a2e5a";
const ORANGE = "#f97316";
const MID   = "#243d70";
const LIGHT = "#f8fafc";
const WHITE = "#ffffff";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function FirstPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSignIn = async (data: LoginForm) => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await axios.post("http://localhost:5000/api/loginlogin", data, { withCredentials: true });
      localStorage.setItem("accessToken", res.data.token);
      startTokenRefreshTimer();
      navigate("/home");
    } catch {
      setAuthError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box id="fp-wrap" sx={{
      position: "fixed", inset: 0,
      overflowY: "auto", overflowX: "hidden",
      bgcolor: LIGHT, fontFamily: "'Segoe UI', sans-serif", zIndex: 0,
    }}>

      {/* ═══════════════ HERO (100vh) ═══════════════ */}
      <Box sx={{
        //height: "100vh", minHeight: { xs: 1050, sm: 1050, md: 1050, lg: 700 },
        height: "100vh", minHeight: { xs: 1000, sm: 700, md: 800, lg: 580 },
        position: "relative", display: "flex", flexDirection: "column",
        bgcolor: WHITE, overflow: "hidden",
      }}>
        {/* bg texture */}
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          style={{ backgroundImage: "radial-gradient(circle, rgba(26,46,90,0.05) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
        <Box sx={{ position: "absolute", top: "-15%", right: "-8%", width: { xs: 280, md: 480 }, height: { xs: 280, md: 480 }, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 65%)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: "-10%", left: "-5%", width: { xs: 220, md: 360 }, height: { xs: 220, md: 360 }, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,46,90,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* NAV */}
        <Box component="header" sx={{ px: { xs: 3, sm: 4, md: 8 }, py: { xs: 2, md: 2.5 }, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, borderBottom: "1px solid #e8edf5", flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <WorkOutlineRoundedIcon sx={{ color: ORANGE, fontSize: 26 }} />
            <Typography sx={{ color: NAVY, fontWeight: 700, fontSize: { xs: "1.05rem", md: "1.2rem" } }}>TalentHub</Typography>
          </Box>
          <Button onClick={() => navigate("/jobapply")} sx={{ color: NAVY, fontWeight: 600, px: { xs: 2, md: 3 }, py: 1, borderRadius: 1.5, fontSize: "0.8rem", border: "1.5px solid #dde4ef", "&:hover": { borderColor: ORANGE, color: ORANGE, bgcolor: "#fff7ed" }, transition: "all 0.2s" }}>
            Open Roles
          </Button>
        </Box>

        {/* HERO BODY */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", px: { xs: 3, sm: 4, md: 8 }, py: { xs: 2, sm: 3, md: 2 }, zIndex: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.15fr 0.85fr" }, gap: { xs: 5, lg: 8 }, alignItems: "center", width: "100%", maxWidth: "1200px", mx: "auto" }}>

            {/* LEFT */}
            <Box sx={{ textAlign: { xs: "center", lg: "left" } }}>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5, mb: 3, justifyContent: { xs: "center", lg: "flex-start" } }}>
                <Box sx={{ width: 32, height: 2, bgcolor: ORANGE, borderRadius: 1 }} />
                <Typography sx={{ color: ORANGE, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", fontSize: "0.7rem" }}>
                  Careers at TalentHub
                </Typography>
              </Box>
              <Typography sx={{ fontSize: { xs: "2.4rem", sm: "3rem", md: "3.8rem" }, fontWeight: 700, color: NAVY, lineHeight: 1.1, mb: 2.5, letterSpacing: -0.5 }}>
                Let's grow<br />
                <Box component="span" sx={{ color: ORANGE }}>together.</Box>
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, color: "#5a6e84", mb: { xs: 4, md: 5 }, lineHeight: 1.9, maxWidth: { xs: "100%", lg: 460 }, mx: { xs: "auto", lg: 0 } }}>
                We're building a culture at <Box component="span" sx={{ color: NAVY, fontWeight: 600 }}>TalentHub</Box> where amazing people like you can do their best work. Ready to grow your career and help organizations grow better?
              </Typography>
              {/* Stats */}
              <Box sx={{ display: "flex", gap: { xs: 3, md: 5 }, justifyContent: { xs: "center", lg: "flex-start" }, flexWrap: "wrap" }}>
                {[{ v: "11+", l: "Years" }, { v: "50+", l: "Clients" }, { v: "5", l: "Regions" }].map(s => (
                  <Box key={s.l} sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: { xs: "1.7rem", md: "2rem" }, fontWeight: 800, color: ORANGE, lineHeight: 1 }}>{s.v}</Typography>
                    <Typography sx={{ fontSize: "0.66rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, mt: 0.4 }}>{s.l}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* RIGHT — sign-in card */}
            <Box sx={{ bgcolor: WHITE, border: "1px solid #e2eaf2", borderTop: `3px solid ${ORANGE}`, borderRadius: 3, p: { xs: 1.5, sm: 2.5 }, boxShadow: "0 20px 60px rgba(26,46,90,0.10)", mx: { xs: "auto", lg: 0 }, width: "100%", maxWidth: { xs: "100%", sm: 460, lg: "100%" } }}>
              <Typography sx={{ color: NAVY, fontSize: { xs: "1.25rem", md: "1.4rem" }, fontWeight: 700, mb: 0.5 }}>Welcome back</Typography>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.82rem", mb: 2 }}>Sign in to your TalentHub account</Typography>

              <Box component="form" onSubmit={handleSubmit(onSignIn)} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {authError && <Alert severity="error" sx={{ fontSize: "0.82rem" }}>{authError}</Alert>}

                <Box>
                  <Typography sx={{ color: "#64748b", mb: 0.8, fontSize: "0.72rem", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Email</Typography>
                  <TextField fullWidth placeholder="you@example.com" {...register("email")} error={!!errors.email} helperText={errors.email?.message}
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fafc", color: NAVY, borderRadius: 2, "& fieldset": { borderColor: "#e2eaf2" }, "&:hover fieldset": { borderColor: `${ORANGE}80` }, "&.Mui-focused fieldset": { borderColor: ORANGE } }, "& .MuiFormHelperText-root": { color: "#ef4444" }, "& input::placeholder": { color: "#94a3b8" } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: "#94a3b8", fontSize: 18 }} /></InputAdornment> }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                    <Typography sx={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Password</Typography>
                    <Typography onClick={() => navigate("/signup?mode=forgot")} sx={{ fontSize: "0.74rem", color: "#94a3b8", cursor: "pointer", "&:hover": { color: ORANGE } }}>Forgot password?</Typography>
                  </Box>
                  <TextField fullWidth type="password" placeholder="••••••••" {...register("password")} error={!!errors.password} helperText={errors.password?.message}
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fafc", color: NAVY, borderRadius: 2, "& fieldset": { borderColor: "#e2eaf2" }, "&:hover fieldset": { borderColor: `${ORANGE}80` }, "&.Mui-focused fieldset": { borderColor: ORANGE } }, "& .MuiFormHelperText-root": { color: "#ef4444" } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: "#94a3b8", fontSize: 18 }} /></InputAdornment> }}
                  />
                </Box>

                <Button type="submit" disabled={loading} endIcon={!loading && <ArrowForwardIcon />}
                  sx={{ py: 1.7, bgcolor: NAVY, color: WHITE, fontWeight: 800, fontSize: "0.88rem", borderRadius: 2, letterSpacing: 1, mt: 0.5, boxShadow: "0 8px 24px rgba(26,46,90,0.22)", "&:hover": { bgcolor: MID, boxShadow: "0 12px 32px rgba(26,46,90,0.32)", transform: "translateY(-1px)" }, transition: "all 0.2s" }}>
                  {loading ? <CircularProgress size={22} sx={{ color: WHITE }} /> : "SIGN IN"}
                </Button>

                <Typography sx={{ textAlign: "center", color: "#94a3b8", fontSize: "0.77rem" }}>
                  Don't have an account?{" "}
                  <Box component="span" onClick={() => navigate("/signup")} sx={{ color: ORANGE, cursor: "pointer", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}>Register here</Box>
                </Typography>

                {/* ── OR divider ── */}
                {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ flex: 1, height: "1px", bgcolor: "#e2eaf2" }} />
                  <Typography sx={{ color: "#94a3b8", fontSize: "0.72rem", letterSpacing: 1, textTransform: "uppercase" }}>or</Typography>
                  <Box sx={{ flex: 1, height: "1px", bgcolor: "#e2eaf2" }} />
                </Box> */}

                {/* ── Guest button ── */}
                {/* <Button
                  onClick={() => { localStorage.setItem("isGuest", "true"); navigate("/jobapply"); }}
                  sx={{
                    py: 1.5,
                    bgcolor: "transparent",
                    color: NAVY,
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    borderRadius: 2,
                    letterSpacing: 1,
                    border: `1.5px dashed ${ORANGE}80`,
                    "&:hover": {
                      bgcolor: `${ORANGE}08`,
                      borderColor: ORANGE,
                      color: ORANGE,
                    },
                    transition: "all 0.2s",
                  }}
                >
                  CONTINUE AS GUEST
                </Button> */}

              </Box>
            </Box>

          </Box>
        </Box>

      </Box>
      {/* END HERO */}

      {/* ═══════════════ BELOW FOLD ═══════════════ */}
      <Box id="fp-below">

        {/* ── ABOUT: Who We Are + Stats ── */}
        <Box sx={{ bgcolor: WHITE, py: { xs: 7, md: 9 }, px: { xs: 3, sm: 5, md: 8 } }}>
          <Box sx={{ maxWidth: "1100px", mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 5, md: 10 }, alignItems: "center" }}>
            <Box>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 28, height: 2, bgcolor: ORANGE, borderRadius: 1 }} />
                <Typography sx={{ color: ORANGE, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontSize: "0.7rem" }}>Who We Are</Typography>
              </Box>
              <Typography sx={{ color: NAVY, fontWeight: 700, fontSize: { xs: "1.8rem", md: "2.3rem" }, mb: 2.5, lineHeight: 1.2 }}>
                It's All About <Box component="span" sx={{ color: ORANGE }}>TalentHub</Box>
              </Typography>
              <Typography sx={{ color: "#5a6e84", lineHeight: 1.9, fontSize: "0.95rem" }}>
                Founded in 2011, TalentHub started operations in January 2013 and has provided its solutions to more than 50 customers in 5 regions — Southeast Asia, Middle East, India, Europe and Africa. Our sales offices are located in Chennai, India and Singapore.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
              {[{ v: "11+", l: "Years", bg: NAVY }, { v: "50+", l: "Clients", bg: ORANGE }, { v: "5", l: "Regions", bg: MID }].map(s => (
                <Box key={s.l} sx={{ flex: "1 1 110px", bgcolor: s.bg, borderRadius: 3, p: { xs: 3, md: 4 }, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: s.bg === ORANGE ? "0 16px 40px rgba(249,115,22,0.28)" : "0 12px 32px rgba(26,46,90,0.16)" }}>
                  <Typography sx={{ fontSize: { xs: "2rem", md: "2.6rem" }, fontWeight: 800, color: WHITE, lineHeight: 1 }}>{s.v}</Typography>
                  <Typography sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.65)", mt: 0.5 }}>{s.l}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── INDUSTRIES ── */}
        <Box sx={{ bgcolor: LIGHT, py: { xs: 7, md: 9 }, px: { xs: 3, sm: 5, md: 8 } }}>
          <Box sx={{ maxWidth: "1100px", mx: "auto", textAlign: "center" }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5, mb: 2, justifyContent: "center" }}>
              <Box sx={{ width: 24, height: 2, bgcolor: ORANGE, borderRadius: 1 }} />
              <Typography sx={{ color: ORANGE, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontSize: "0.7rem" }}>Our Expertise</Typography>
              <Box sx={{ width: 24, height: 2, bgcolor: ORANGE, borderRadius: 1 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, color: NAVY, mb: { xs: 3.5, md: 5 }, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
              Industries We Serve
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2 }}>
              {["Banking & Finance", "Healthcare", "Logistics", "Manufacturing", "Pharma", "FMCG"].map(ind => (
                <Box key={ind} sx={{ px: { xs: 3, md: 4 }, py: 1.5, borderRadius: "50px", border: `1.5px solid ${ORANGE}40`, color: NAVY, fontWeight: 600, fontSize: "0.88rem", bgcolor: `${ORANGE}08`, transition: "all 0.2s", "&:hover": { bgcolor: ORANGE, color: WHITE, borderColor: ORANGE, transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(249,115,22,0.3)" } }}>
                  {ind}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── FOOTER ── */}
        <Box component="footer" sx={{ py: 4, bgcolor: NAVY }}>
          <Box sx={{ maxWidth: "1100px", mx: "auto", px: { xs: 3, md: 8 }, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <WorkOutlineRoundedIcon sx={{ color: ORANGE, fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, color: WHITE, fontSize: "0.9rem" }}>TalentHub</Typography>
            </Box>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>contactus@talenthub.com</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>© 2026 TalentHub Global Solutions</Typography>
          </Box>
        </Box>

      </Box>
    </Box>
  );
}