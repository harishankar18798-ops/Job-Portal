import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  InputAdornment,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { startTokenRefreshTimer } from "../utils/tokenTimer";
import { PublicClientApplication } from "@azure/msal-browser";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ─── MSAL Config ────────────────────────────────────────────────────────────
const msalConfig = {
  auth: {
    clientId: "d239eedd-cbac-49c1-90ff-6e2b6e8e11ed",
    authority: "https://login.microsoftonline.com/289b0710-fda8-4386-aa2b-49936e406df7",
    redirectUri: "http://localhost:5173",
  },
};

const msalInstance = new PublicClientApplication(msalConfig);
const msalReady = msalInstance.initialize();
const loginRequest = {
  scopes: ["api://d239eedd-cbac-49c1-90ff-6e2b6e8e11ed/access_as_employee"],
};

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const SignIn = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [msalLoading, setMsalLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Handle Redirect Result on Page Load ──────────────────────────────────
  useEffect(() => {
    msalReady.then(() => {
      msalInstance.handleRedirectPromise().then(async (result) => {
        if (result) {
          try {
            const azureToken = result.accessToken;
            const response = await axios.post(
              "http://localhost:5000/api/msal-login",
              { azureToken },
              { withCredentials: true }
            );
            const token = response.data.token;
            localStorage.setItem("accessToken", token);
            startTokenRefreshTimer();
            navigate("/home");
          } catch (err: any) {
            console.error("Backend error after redirect:", err);
            setError(err.response?.data?.message || "Employee login failed. Please try again.");
          }
        }
      }).catch((err) => {
        console.error("Redirect handle error:", err);
      });
    });
  }, []);

  // ─── Standard Login ────────────────────────────────────────────────────────
  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/loginlogin",
        data,
        { withCredentials: true }
      );
      const token = response.data.token;
      localStorage.setItem("accessToken", token);
      startTokenRefreshTimer();
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Employee MSAL Login ───────────────────────────────────────────────────
  const handleEmployeeLogin = async () => {
    setMsalLoading(true);
    setError("");
    try {
      await msalReady;
      await msalInstance.loginRedirect(loginRequest);
    } catch (err: any) {
      console.error("MSAL full error:", err);
      setError("Employee login failed. Please try again.");
      setMsalLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", overflow: "hidden" }}>
      {/* LEFT PANEL */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          width: "50%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 12,
          position: "relative",
          bgcolor: "#1a2e5a",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 30% 40%, rgba(249,115,22,0.15), transparent 60%)",
          }}
        />
        <Box sx={{ textAlign: "center", zIndex: 1 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "16px",
              bgcolor: "#f97316",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 4,
            }}
          >
            <WorkOutlineRoundedIcon sx={{ fontSize: 40, color: "#fff" }} />
          </Box>
          <Typography variant="h3" sx={{ color: "#fff", mb: 2 }}>
            TalentHub
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.1rem",
              maxWidth: 400,
              mx: "auto",
            }}
          >
            Your complete recruitment management platform.
          </Typography>
        </Box>
      </Box>

      {/* RIGHT PANEL */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          bgcolor: "#f8f9fc",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 450 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Header */}
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ color: "#0c1a3a" }}>
                  Welcome Back
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a5568" }}>
                  Sign in to continue
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
              >
                {/* EMAIL */}
                <Box>
                  <Typography sx={{ mb: 0.6, fontWeight: 600 }}>
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="you@example.com"
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon />
                          </InputAdornment>
                        ),
                        sx: { bgcolor: "#fff", borderRadius: 2, height: 48 },
                      },
                    }}
                  />
                </Box>

                {/* PASSWORD */}
                <Box>
                  <Typography sx={{ mb: 0.6, fontWeight: 600 }}>
                    Password
                  </Typography>
                  <TextField
                    type="password"
                    fullWidth
                    placeholder="Enter password"
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon />
                          </InputAdornment>
                        ),
                        sx: { bgcolor: "#fff", borderRadius: 2, height: 48 },
                      },
                    }}
                  />
                </Box>

                {/* FORGOT PASSWORD */}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Typography
                    onClick={() => navigate("/signup?mode=forgot")}
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#f97316",
                      cursor: "pointer",
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Box>

                {/* SIGN IN BUTTON */}
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading || msalLoading}
                  sx={{
                    py: 1.4,
                    bgcolor: "#1a2e5a",
                    color: "#fff",
                    borderRadius: 2,
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#0f1724" },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} sx={{ color: "#fff" }} />
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <Divider>OR</Divider>

                {/* EMPLOYEE LOGIN BUTTON */}
                <Button
                  variant="contained"
                  fullWidth
                  disabled={msalLoading || loading}
                  onClick={handleEmployeeLogin}
                  sx={{
                    py: 1.4,
                    bgcolor: "#0078d4",
                    color: "#fff",
                    borderRadius: 2,
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#006abc" },
                  }}
                >
                  {msalLoading ? (
                    <CircularProgress size={22} sx={{ color: "#fff" }} />
                  ) : (
                    "Employee Login"
                  )}
                </Button>

                <Divider>OR</Divider>

                {/* CREATE ACCOUNT BUTTON */}
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={loading || msalLoading}
                  sx={{
                    py: 1.4,
                    borderRadius: 2,
                    color: "#f97316",
                    borderColor: "#f97316",
                    fontWeight: 700,
                  }}
                  onClick={() => navigate("/signup")}
                >
                  Create Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default SignIn;