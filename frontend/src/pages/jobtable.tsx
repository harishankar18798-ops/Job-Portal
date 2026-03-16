import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/tokenInstance";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { toast, Toaster } from "sonner";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";

type JobRow = {
  id: number;
  title: string;
  description: string;
  deptId: number;
  employmentTypeId?: number;
  minExperience?: number;
  maxExperience?: number;
  skillsRequired?: string;
  educationRequired?: string;
  dept?: { id: number; name: string };
  employmentType?: { id: number; name: string };
};

const paginationModel = { page: 0, pageSize: 10 };

const NAVY = "#1a2e5a";
const NAVY_TEXT = "#0c1a3a";
const ORANGE = "#f97316";
const BORDER_COLOR = "#d5dbe6";
const BG = "#f8f9fc";

const searchFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    background: "#fff",
    fontSize: 13,
    height: 36,
    "& fieldset": { borderColor: BORDER_COLOR },
    "&:hover fieldset": { borderColor: "#a0aec0" },
    "&.Mui-focused fieldset": { borderColor: NAVY, borderWidth: "1.5px" },
  },
  "& .MuiInputBase-input": {
    py: "7px",
    px: 1,
    fontSize: 13,
    color: "#334155",
  },
  "& .MuiInputAdornment-root svg": {
    fontSize: 16,
    color: "#94a3b8",
  },
};

export default function JobTable() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [rows, setRows] = useState<JobRow[]>([]);

  const [searchTitle, setSearchTitle] = useState("");
  const [searchDept, setSearchDept] = useState("");
  const [searchEmpType, setSearchEmpType] = useState("");

  // On mobile, hide Description and Employment Type columns to save space
  const columns: GridColDef[] = [
    {
      field: "sno",
      headerName: "S.No",
      flex: 0.2,
      minWidth: 50,
      sortable: false,
      renderCell: (params) =>
        params.api.getRowIndexRelativeToVisibleRows(params.row.id) + 1,
    },
    { field: "title", headerName: "Title", flex: 0.8, minWidth: 130 },
    {
      field: "experienceReq",
      headerName: "Exp. Req",
      flex: 0.7,
      minWidth: 80,
      renderCell: (params) => {
        const min = params.row.minExperience;
        const max = params.row.maxExperience;
        if (min != null && max != null) return `${min}–${max} yrs`;
        if (min != null) return `${min}+ yrs`;
        if (max != null) return `Up to ${max} yrs`;
        return "—";
      },
    },
    {
      field: "deptName",
      headerName: "Department",
      flex: 0.8,
      minWidth: 90,
      renderCell: (params) => params.row.dept?.name,
    },
    {
      field: "employmentType",
      headerName: "Emp. Type",
      flex: 0.8,
      minWidth: 90,
      renderCell: (params) => params.row.employmentType?.name,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      minWidth: 80,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", height: "100%" }}>
          <IconButton
            size="small"
            onClick={() => navigate("/createjob", { state: { editRow: params.row } })}
            sx={{
              color: "#2459a3",
              bgcolor: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "6px",
              width: 28, height: 28,
              "&:hover": { bgcolor: "#dbeafe" },
            }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            sx={{
              color: "#dc2626",
              bgcolor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              width: 28, height: 28,
              "&:hover": { bgcolor: "#fee2e2" },
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      ),
    },
  ];



  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/getjob");
      setRows(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/deletejob/${id}`);
      toast.success("Job deleted successfully.");
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job...");
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const title = row.title?.toLowerCase() ?? "";
      const dept = row.dept?.name?.toLowerCase() ?? "";
      const empType = row.employmentType?.name?.toLowerCase() ?? "";

      return (
        title.includes(searchTitle.toLowerCase()) &&
        dept.includes(searchDept.toLowerCase()) &&
        empType.includes(searchEmpType.toLowerCase())
      );
    });
  }, [rows, searchTitle, searchDept, searchEmpType]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        background: BG,
        // Responsive padding so the table doesn't touch screen edges on mobile
        px: { xs: 1, sm: 2, md: 0 },
      }}
    >
      <Toaster position="top-right" richColors />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: "10px", sm: "14px" },
            border: `1px solid ${BORDER_COLOR}`,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Title row */}
          <Box
            sx={{
              px: { xs: 1.5, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              borderBottom: `1px solid ${BORDER_COLOR}`,
              gap: 1,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: 15, sm: 18 },
                color: NAVY_TEXT,
                whiteSpace: "nowrap",
              }}
            >
              All Jobs ({filteredRows.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/createjob")}
              sx={{
                background: ORANGE,
                borderRadius: "8px",
                fontWeight: 700,
                textTransform: "none",
                fontSize: { xs: 12, sm: 14 },
                px: { xs: 1.5, sm: 2.5 },
                py: 0.8,
                boxShadow: "none",
                whiteSpace: "nowrap",
                minWidth: "fit-content",
                "&:hover": { background: "#ea6c00", boxShadow: "none" },
              }}
            >
              {isMobile ? "Add" : "Add Job"}
            </Button>
          </Box>

          {/* Search filters row */}
          <Box
            sx={{
              px: { xs: 1.5, sm: 3 },
              py: 1.5,
              display: "grid",
              // Stack to 1 column on mobile, 2 on tablet, 3 on desktop
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
              gap: 1.5,
              flexShrink: 0,
              borderBottom: `1px solid ${BORDER_COLOR}`,
              background: "#fff",
            }}
          >
            <TextField
              placeholder="Search title…"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              size="small"
              sx={searchFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              placeholder="Search department…"
              value={searchDept}
              onChange={(e) => setSearchDept(e.target.value)}
              size="small"
              sx={searchFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              placeholder="Search employment type…"
              value={searchEmpType}
              onChange={(e) => setSearchEmpType(e.target.value)}
              size="small"
              sx={searchFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Scrollable area on mobile */}
          <Box sx={{ overflowX: { xs: "auto", sm: "hidden" } }}>
            <Box sx={{ minWidth: { xs: 600, sm: "100%" } }}>
            <DataGrid
              autoHeight
              rows={filteredRows}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10, 20]}
              disableColumnMenu
              disableRowSelectionOnClick
              slots={{
                noRowsOverlay: () => (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <Typography sx={{ color: "#94a3b8", fontSize: 14, textAlign: "center", px: 2 }}>
                      No jobs found. Create your first job posting.
                    </Typography>
                  </Box>
                ),
              }}
              sx={{
                width: "100%",
                border: 0,
                "& .MuiDataGrid-columnHeaders": {
                  background: NAVY,
                  borderRadius: 0,
                },
                "& .MuiDataGrid-columnHeader": {
                  background: NAVY,
                  "&:focus, &:focus-within": { outline: "none" },
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: { xs: 12, sm: 14 },
                  letterSpacing: 0.3,
                },
                "& .MuiDataGrid-sortIcon": { color: "#fff" },
                "& .MuiDataGrid-menuIconButton": { color: "#fff" },
                "& .MuiDataGrid-columnSeparator": { display: "none" },
                "& .MuiDataGrid-virtualScroller": {
                  overflowX: "hidden !important",
                  overflowY: "auto",
                },
                "& .MuiDataGrid-scrollbar--horizontal": { display: "none !important" },
                "& .MuiDataGrid-scrollbar--vertical": { display: "none !important" },
                "& .MuiDataGrid-row": { "&:hover": { background: "#f8fafc" } },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #f1f5f9",
                  color: "#334155",
                  fontSize: { xs: 12, sm: 13 },
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiDataGrid-footerContainer": { borderTop: `1px solid ${BORDER_COLOR}` },
                "& .MuiNativeSelect-select:focus": { backgroundColor: "#fff3e6 !important" },
                "& .MuiSelect-select:focus": { backgroundColor: "#fff3e6 !important" },
                "& .MuiTablePagination-select:focus": { backgroundColor: "#fff3e6 !important" },
                "& .MuiIconButton-root:hover": { backgroundColor: "#fff3e6" },
                // Slightly smaller pagination text on mobile
                "& .MuiTablePagination-root": { fontSize: { xs: 12, sm: 14 } },
              }}
            />
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}