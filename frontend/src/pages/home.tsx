import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
//import Chip from "@mui/material/Chip";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
//import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
//import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WorkOutlinedIcon from "@mui/icons-material/WorkOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EmojiObjectsOutlinedIcon from "@mui/icons-material/EmojiObjectsOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

const PRIMARY = "#1a2e5a";
const ORANGE  = "#f97316";
const LIGHT   = "#f8fafc";
const WHITE   = "#ffffff";

// ─── ADMIN HOME (unchanged) ───────────────────────────────────────────────────
function AdminHome() {
  const navigate = useNavigate();

  const adminCards = [
    { title: "Dashboard",       description: "Get a bird's-eye view of your hiring pipeline, job stats, and recent activity", icon: <DashboardOutlinedIcon sx={{ fontSize: 28, color: "#fff" }} />, href: "/dashboard",      bgColor: PRIMARY  },
    { title: "Jobs Table",      description: "Manage job listings, create new positions and edit existing ones",               icon: <TableChartOutlinedIcon sx={{ fontSize: 28, color: "#fff" }} />, href: "/table",          bgColor: ORANGE   },
    { title: "Applications",    description: "Review and manage all candidate applications in one place",                      icon: <AssignmentOutlinedIcon sx={{ fontSize: 28, color: "#fff" }} />, href: "/applications",   bgColor: PRIMARY  },
    { title: "Users",           description: "View and manage registered users and their roles",                               icon: <GroupOutlinedIcon sx={{ fontSize: 28, color: "#fff" }} />,      href: "/users",          bgColor: "#fb923c" },
    { title: "Departments",     description: "Manage departments and organizational structure",                                icon: <BusinessOutlinedIcon sx={{ fontSize: 28, color: "#fff" }} />,  href: "/dept",           bgColor: PRIMARY  },
    { title: "Employment Type", description: "Manage employment types such as full-time, part-time, and contract",            icon: <WorkOutlinedIcon sx={{ fontSize: 28, color: "#fff" }} />,       href: "/employmenttype", bgColor: ORANGE   },
  ];

  return (
    <Box sx={{ bgcolor: "#f8f9fc" }}>
      <Box component="main" sx={{ maxWidth: "1152px", mx: "auto", px: 3, py: 4 }}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" sx={{ color: "#0c1a3a", fontWeight: 700, mb: 1 }}>Welcome</Typography>
          <Typography variant="body1" sx={{ color: "#4a5568", fontSize: "1.1rem" }}>Manage your recruitment pipeline and team.</Typography>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 3 }}>
          {adminCards.map((card) => (
            <Card key={card.title} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3, transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" } }}>
              <CardActionArea onClick={() => navigate(card.href)} sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
                  <Avatar sx={{ bgcolor: card.bgColor, width: 52, height: 52, borderRadius: 3 }}>{card.icon}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: "#0c1a3a", fontWeight: 600, mb: 0.5 }}>{card.title}</Typography>
                    <Typography variant="body2" sx={{ color: "#4a5568", lineHeight: 1.6 }}>{card.description}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: ORANGE }}>Open</Typography>
                    <ArrowForwardIcon sx={{ fontSize: 16, color: ORANGE }} />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// ─── CANDIDATE HOME (role=user) ───────────────────────────────────────────────
// Content here is UNIQUE from FirstPage:
//   FirstPage has: About / Who We Are, Industries
//   HomePage has:  Dashboard actions, Why Work Here (culture perks), Tech Stack, Office Locations
function CandidateHome() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: LIGHT, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── WELCOME BANNER ─────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: PRIMARY, px: { xs: 3, sm: 5, md: 8 }, py: { xs: 5, md: 6 }, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <Box sx={{ position: "absolute", top: "-20%", right: "-5%", width: { xs: 280, md: 420 }, height: { xs: 280, md: 420 }, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.16) 0%, transparent 65%)", pointerEvents: "none" }} />

        <Box sx={{ maxWidth: "1100px", mx: "auto", position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr auto" }, gap: 3, alignItems: "center" }}>
            <Box>
              <Typography sx={{ color: WHITE, fontSize: { xs: "1.8rem", md: "2.4rem" }, fontWeight: 700, mb: 1.5, lineHeight: 1.2 }}>
                Your career journey starts here
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", lineHeight: 1.8, maxWidth: 500 }}>
                Browse open roles, complete your profile, and take the next step with TalentHub.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, gap: 2, flexWrap: "wrap" }}>
              <Button onClick={() => navigate("/jobapply")} endIcon={<ArrowForwardIcon />}
                sx={{ bgcolor: ORANGE, color: WHITE, fontWeight: 700, px: 4, py: 1.6, borderRadius: 2, fontSize: "0.85rem", letterSpacing: 0.8, whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(249,115,22,0.35)", "&:hover": { bgcolor: "#ea6c0a", transform: "translateY(-1px)" }, transition: "all 0.2s" }}>
                BROWSE JOBS
              </Button>
              <Button onClick={() => navigate("/profile")}
                sx={{ color: WHITE, fontWeight: 600, px: 4, py: 1.6, borderRadius: 2, fontSize: "0.85rem", letterSpacing: 0.8, border: "1.5px solid rgba(255,255,255,0.25)", whiteSpace: "nowrap", "&:hover": { bgcolor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.5)" }, transition: "all 0.2s" }}>
                MY PROFILE
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── QUICK ACTIONS ──────────────────────────────────────────────── */}
      {/* <Box sx={{ px: { xs: 3, sm: 5, md: 8 }, py: { xs: 4, md: 5 }, maxWidth: "1100px", mx: "auto" }}>
        <Typography sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.8rem", letterSpacing: 1.5, textTransform: "uppercase", mb: 2.5 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
          {[
            { title: "My Profile",        description: "Update your resume, skills, and career preferences", icon: <PersonOutlinedIcon sx={{ fontSize: 26, color: WHITE }} />, href: "/profile",  bg: PRIMARY, tag: "Account" },
            { title: "Browse Open Roles", description: "Explore all current openings and apply today",       icon: <SearchOutlinedIcon sx={{ fontSize: 26, color: WHITE }} />,  href: "/jobapply", bg: ORANGE,  tag: "Jobs"    },
          ].map(card => (
            <Card key={card.title} elevation={0} sx={{ border: "1px solid #e2eaf2", borderRadius: 3, bgcolor: WHITE, borderTop: `4px solid ${card.bg}`, transition: "all 0.25s", "&:hover": { boxShadow: "0 12px 32px rgba(0,0,0,0.08)", transform: "translateY(-3px)" } }}>
              <CardActionArea onClick={() => navigate(card.href)}>
                <CardContent sx={{ p: { xs: 3, md: 3.5 }, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <Avatar sx={{ bgcolor: card.bg, width: 48, height: 48, borderRadius: 2.5 }}>{card.icon}</Avatar>
                    <Chip label={card.tag} size="small" sx={{ bgcolor: `${card.bg}12`, color: card.bg, fontWeight: 600, fontSize: "0.68rem", border: `1px solid ${card.bg}25` }} />
                  </Box>
                  <Box>
                    <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "1rem", mb: 0.5 }}>{card.title}</Typography>
                    <Typography sx={{ color: "#64748b", fontSize: "0.86rem", lineHeight: 1.7 }}>{card.description}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, color: card.bg, fontSize: "0.8rem" }}>Go</Typography>
                    <ArrowForwardIcon sx={{ fontSize: 14, color: card.bg }} />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box> */}

      {/* ── WHY WORK HERE (culture & perks) ────────────────────────────── */}
      {/* NOTE: FirstPage shows WHO WE ARE. This section shows WHY JOIN US — different angle */}
      <Box sx={{ bgcolor: WHITE, py: { xs: 6, md: 8 }, px: { xs: 3, sm: 5, md: 8 } }}>
        <Box sx={{ maxWidth: "1100px", mx: "auto" }}>
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5, mb: 2, justifyContent: "center" }}>
              <Box sx={{ width: 24, height: 2, bgcolor: ORANGE, borderRadius: 1 }} />
              <Typography sx={{ color: ORANGE, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontSize: "0.7rem" }}>Life at TalentHub</Typography>
              <Box sx={{ width: 24, height: 2, bgcolor: ORANGE, borderRadius: 1 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, color: PRIMARY, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
              Why You'll Love Working Here
            </Typography>
            <Typography sx={{ color: "#64748b", fontSize: "0.95rem", mt: 1.5, maxWidth: 540, mx: "auto", lineHeight: 1.8 }}>
              We invest in our people. Here's what makes TalentHub a great place to build your career.
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {[
              { icon: <TrendingUpIcon sx={{ fontSize: 22 }} />,                title: "Rapid Growth",         desc: "Clear promotion paths, mentorship programs, and access to roles across departments from day one." },
              { icon: <PeopleAltOutlinedIcon sx={{ fontSize: 22 }} />,         title: "Inclusive Team",       desc: "A diverse, welcoming culture where every background and perspective is celebrated and valued." },
              { icon: <EmojiObjectsOutlinedIcon sx={{ fontSize: 22 }} />,      title: "Innovate Every Day",   desc: "Work on real challenges with modern technology. We give you the freedom to experiment and build." },
              { icon: <WorkspacePremiumOutlinedIcon sx={{ fontSize: 22 }} />,  title: "Competitive Pay",      desc: "Market-leading compensation, performance bonuses, and transparent salary bands at every level." },
              { icon: <HealthAndSafetyOutlinedIcon sx={{ fontSize: 22 }} />,   title: "Health & Wellness",    desc: "Comprehensive health insurance, mental wellness support, and flexible working arrangements." },
              { icon: <SchoolOutlinedIcon sx={{ fontSize: 22 }} />,            title: "Learning Budget",      desc: "Annual learning allowance for courses, certifications, and conferences to keep your skills sharp." },
            ].map(item => (
              <Box key={item.title} sx={{ bgcolor: LIGHT, border: "1px solid #e0eaf2", borderRadius: 3, p: { xs: 3, md: 3.5 }, transition: "all 0.25s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 16px 36px rgba(26,46,90,0.09)", borderColor: `${ORANGE}50`, "& .perk-icon": { bgcolor: ORANGE, color: WHITE } } }}>
                <Box className="perk-icon" sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${ORANGE}15`, color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", mb: 2.5, transition: "all 0.25s" }}>
                  {item.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, color: PRIMARY, mb: 1, fontSize: "0.95rem" }}>{item.title}</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#5a6e84", lineHeight: 1.8 }}>{item.desc}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── TECH STACK ─────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: PRIMARY, py: { xs: 5, md: 6 }, px: { xs: 3, sm: 5, md: 8 }, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <Box sx={{ maxWidth: "1100px", mx: "auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", letterSpacing: 3, textTransform: "uppercase", mb: 1, fontSize: "0.68rem" }}>Technologies You'll Work With</Typography>
          <Typography sx={{ color: WHITE, fontWeight: 700, fontSize: { xs: "1.4rem", md: "1.7rem" }, mb: 4 }}>Our Technology Stack</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: { xs: 3, md: 5 } }}>
            {["ReactJS", "Angular", "Node.js", "Salesforce", "AWS", "Azure", "SAP", "GCP"].map(tech => (
              <Box key={tech} sx={{ px: 3, py: 1.2, borderRadius: 2, border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s", "&:hover": { borderColor: ORANGE, bgcolor: "rgba(249,115,22,0.1)" } }}>
                <Typography sx={{ fontSize: { xs: "0.88rem", md: "1rem" }, fontWeight: 700, color: "rgba(255,255,255,0.45)", transition: "color 0.2s", "&:hover": { color: ORANGE } }}>
                  {tech}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── OFFICE LOCATIONS ───────────────────────────────────────────── */}
      <Box sx={{ bgcolor: LIGHT, py: { xs: 6, md: 7 }, px: { xs: 3, sm: 5, md: 8 } }}>
        <Box sx={{ maxWidth: "1100px", mx: "auto", textAlign: "center" }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5, mb: 2, justifyContent: "center" }}>
            <Box sx={{ width: 24, height: 2, bgcolor: ORANGE, borderRadius: 1 }} />
            <Typography sx={{ color: ORANGE, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontSize: "0.7rem" }}>Our Offices</Typography>
            <Box sx={{ width: 24, height: 2, bgcolor: ORANGE, borderRadius: 1 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, color: PRIMARY, fontSize: { xs: "1.7rem", md: "2rem" }, mb: { xs: 3.5, md: 5 } }}>
            Where We Work
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 3, md: 5 }, flexWrap: "wrap" }}>
            {[
              { city: "Chennai", country: "India", detail: "F1, Maruthi Eximius, Perungudi" },
              { city: "Singapore", country: "Singapore", detail: "Asia-Pacific Sales Office" },
            ].map(loc => (
              <Box key={loc.city} sx={{ bgcolor: WHITE, border: "1px solid #e2eaf2", borderRadius: 3, p: { xs: 3, md: 4 }, flex: "1 1 220px", maxWidth: 280, transition: "all 0.2s", "&:hover": { borderColor: `${ORANGE}60`, boxShadow: "0 8px 24px rgba(26,46,90,0.08)", transform: "translateY(-3px)" } }}>
                <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: `${ORANGE}15`, color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", mb: 2, mx: "auto" }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: PRIMARY, fontSize: "1.1rem", mb: 0.5 }}>{loc.city}</Typography>
                <Typography sx={{ color: ORANGE, fontSize: "0.78rem", fontWeight: 600, mb: 0.8, textTransform: "uppercase", letterSpacing: 1 }}>{loc.country}</Typography>
                <Typography sx={{ color: "#64748b", fontSize: "0.82rem", lineHeight: 1.6 }}>{loc.detail}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── BROWSE JOBS CTA ────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: WHITE, py: { xs: 6, md: 7 }, px: { xs: 3, sm: 5, md: 8 }, textAlign: "center" }}>
        <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: { xs: "1.5rem", md: "1.9rem" }, mb: 1.5 }}>
          Ready to find your next role?
        </Typography>
        <Typography sx={{ color: "#64748b", mb: 3.5, fontSize: "0.95rem", maxWidth: 440, mx: "auto", lineHeight: 1.8 }}>
          Explore all open positions at TalentHub and take the next step in your career today.
        </Typography>
        <Button onClick={() => navigate("/jobapply")} endIcon={<ArrowForwardIcon />}
          sx={{ bgcolor: ORANGE, color: WHITE, fontWeight: 700, px: 5, py: 1.7, borderRadius: 2, fontSize: "0.9rem", letterSpacing: 0.8, boxShadow: "0 8px 24px rgba(249,115,22,0.25)", "&:hover": { bgcolor: "#ea6c0a", transform: "translateY(-1px)", boxShadow: "0 12px 28px rgba(249,115,22,0.35)" }, transition: "all 0.2s" }}>
          EXPLORE OPEN ROLES
        </Button>
      </Box>

    </Box>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => { setRole(getUserRole()); }, []);
  if (role === "admin") return <AdminHome />;
  return <CandidateHome />;
}