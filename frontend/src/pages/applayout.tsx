import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import { useState, useEffect } from "react";
import { getUserRole } from "../utils/auth";
import axios from "axios";
import { stopTokenRefreshTimer } from "../utils/tokenTimer";
import { PublicClientApplication } from "@azure/msal-browser";

type Role = "user" | "admin";

type MenuItem = {
  text: string;
  path: string;
};

const PRIMARY = "#1a2e5a";
const ORANGE = "#f97316";

// ─── MSAL Instance ────────────────────────────────────────────────────────────
const msalInstance = new PublicClientApplication({
  auth: {
    clientId: "d239eedd-cbac-49c1-90ff-6e2b6e8e11ed",
    authority: "https://login.microsoftonline.com/289b0710-fda8-4386-aa2b-49936e406df7",
    redirectUri: "http://localhost:5173",
  },
});
const msalReady = msalInstance.initialize();

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const role = getUserRole() as Role | null;

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:5000/api/logout",
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch {
      // silent fail
    } finally {
      stopTokenRefreshTimer();
      localStorage.removeItem("accessToken");

      // clear Microsoft session if employee login was used
      await msalReady;
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutRedirect({ account: accounts[0] });
      } else {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    const onStorage = () => {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };

    // update logged-in state when another tab changes auth
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const menuItems: Record<Role, MenuItem[]> = {
    user: [
      { text: "Home", path: "/home" },
      { text: "View Jobs", path: "/jobapply" },
      { text: "My Profile", path: "/profile" },
      { text: "My Applications", path: "/myapplications" },
    ],
    admin: [
      { text: "Home", path: "/home" },
      { text: "Jobs Table", path: "/table" },
      { text: "Applications", path: "/applications" },
      { text: "Users", path: "/users" },
      { text: "Departments", path: "/dept" },
      { text: "Employment Type", path: "/employmenttype" },
      { text: "Dashboard", path: "/dashboard" },
    ],
  };

  const visibleMenu: MenuItem[] = role ? menuItems[role] : [];

  // For user role on mobile: use the same drawer as admin
  const showDrawerIcon = isLoggedIn && (role === "admin" || (role === "user" && isMobile));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>

      {/* ================= NAVBAR ================= */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "#ffffff", color: PRIMARY, borderBottom: "1px solid #e5e7eb" }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: { xs: 1.5, sm: 2 } }}>

          {/* LEFT SECTION */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

            {/* Drawer icon — admin always, user only on mobile */}
            {showDrawerIcon && (
              <IconButton onClick={() => setOpen(true)} size={isMobile ? "small" : "medium"}>
                <MenuIcon sx={{ color: PRIMARY }} />
              </IconButton>
            )}

            <Box
              sx={{
                width: { xs: 36, sm: 44 },
                height: { xs: 36, sm: 44 },
                borderRadius: "50%",
                bgcolor: ORANGE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <WorkOutlineRoundedIcon sx={{ color: "#fff", fontSize: { xs: 18, sm: 22 } }} />
            </Box>

            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: PRIMARY, letterSpacing: 0.3, fontSize: { xs: 16, sm: 20 } }}
            >
              TalentHub
            </Typography>

            {/* USER MENU IN TOPBAR — hidden on mobile (moved to drawer) */}
            {isLoggedIn && role === "user" && !isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 4 }}>
                {visibleMenu.map((item: MenuItem) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.text}
                      onClick={() => navigate(item.path)}
                      sx={{
                        color: isActive ? ORANGE : PRIMARY,
                        fontWeight: 600,
                        borderRadius: 0,
                        "&:hover": {
                          background: "transparent",
                          borderBottom: `2px solid ${ORANGE}`,
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                  );
                })}
              </Box>
            )}

          </Box>

          {/* RIGHT SECTION */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isLoggedIn ? (
              <Button
                onClick={handleLogout}
                startIcon={!isMobile ? <LogoutIcon /> : undefined}
                sx={{
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  borderRadius: 2,
                  px: { xs: 1.5, sm: 2 },
                  minWidth: { xs: 36, sm: "auto" },
                  fontWeight: 600,
                  fontSize: { xs: 13, sm: 14 },
                  "&:hover": { bgcolor: "rgba(239,68,68,0.08)", borderColor: "#ef4444" },
                }}
              >
                {isMobile ? <LogoutIcon sx={{ fontSize: 18 }} /> : "Logout"}
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/")}
                sx={{
                  border: `1px solid ${ORANGE}`,
                  color: ORANGE,
                  borderRadius: 2,
                  px: { xs: 1.5, sm: 2 },
                  fontWeight: 600,
                  fontSize: { xs: 13, sm: 14 },
                  "&:hover": { bgcolor: "rgba(249,115,22,0.08)", borderColor: ORANGE },
                }}
              >
                Login
              </Button>
            )}
          </Box>

        </Toolbar>
      </AppBar>

      {/* ================= DRAWER (admin always + user on mobile) ================= */}
      {showDrawerIcon && (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{
            sx: { bgcolor: "#ffffff", color: PRIMARY, width: 240, borderRight: "1px solid #e5e7eb" },
          }}
        >
          <Box
            sx={{
              p: 2.5, borderBottom: "1px solid #e5e7eb",
              display: "flex", alignItems: "center", gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 40, height: 40, borderRadius: "50%", bgcolor: ORANGE,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <WorkOutlineRoundedIcon sx={{ color: "#fff" }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: PRIMARY }}>
              TalentHub
            </Typography>
          </Box>

          <List sx={{ px: 1, pt: 1 }}>
            {visibleMenu.map((item: MenuItem) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItemButton
                  key={item.text}
                  onClick={() => { navigate(item.path); setOpen(false); }}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor: isActive ? "#fff7ed" : "transparent",
                    borderLeft: isActive ? `3px solid ${ORANGE}` : "3px solid transparent",
                    "&:hover": {
                      bgcolor: isActive ? "#fff7ed" : "rgba(26,46,90,0.08)",
                    },
                  }}
                >
                  <ListItemText
                    primary={item.text}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontWeight: isActive ? 700 : 500,
                        fontSize: 15,
                        color: isActive ? ORANGE : PRIMARY,
                      },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Drawer>
      )}

      {/* ================= CONTENT ================= */}
      <Box
        id="layout-content"
        sx={{
          flex: 1, bgcolor: "#f8f9fc",
          p: { xs: 2, sm: 3 },
          width: "100%", boxSizing: "border-box",
          overflow: "auto",
          height: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
        }}
      >
        <Outlet />
      </Box>

    </Box>
  );
}