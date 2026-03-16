import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, Paper, TextField, InputAdornment,
  Select, MenuItem, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, Divider, useTheme, useMediaQuery,
} from "@mui/material";
import { toast, Toaster } from "sonner";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import api from "../utils/tokenInstance";

type LoginRow = {
  id: number;
  email: string;
  password: string;
  role: string;
};

const paginationModel = { page: 0, pageSize: 10 };

const NAVY = "#1a2e5a";
const NAVY_TEXT = "#0c1a3a";
const ORANGE = "#f97316";
const BORDER_COLOR = "#d5dbe6";
const BG = "#f8f9fc";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    background: "#f8fafc",
    "&:hover fieldset": { borderColor: ORANGE },
    "&.Mui-focused fieldset": { borderColor: ORANGE },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: ORANGE },
};

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
  "& .MuiInputBase-input": { py: "7px", px: 1, fontSize: 13, color: "#334155" },
  "& .MuiInputAdornment-root svg": { fontSize: 16, color: "#94a3b8" },
};

const roleStyles: Record<string, { bg: string; color: string; border: string }> = {
  admin: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  user:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
};

function RoleSelect({ id, role, onUpdate }: { id: number; role: string; onUpdate: (id: number, role: string) => void }) {
  const style = roleStyles[role?.toLowerCase()] ?? { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
  return (
    <Select
      value={role ?? ""}
      size="small"
      onChange={(e) => onUpdate(id, e.target.value)}
      onClick={(e) => e.stopPropagation()}
      sx={{
        height: 26,
        fontSize: 12,
        width: 100,
        fontWeight: 700,
        textTransform: "capitalize",
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: "16px",
        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
        "& .MuiSelect-select": { py: "2px", pl: "10px", pr: "24px !important" },
        "& .MuiSelect-icon": { color: style.color, fontSize: 16, right: 4 },
      }}
    >
      <MenuItem value="admin" sx={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>Admin</MenuItem>
      <MenuItem value="user"  sx={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>User</MenuItem>
    </Select>
  );
}

export default function UserTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [rows, setRows] = useState<LoginRow[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchRole, setSearchRole] = useState("");

  // ─── Dialog State ──────────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [emailError, setEmailError] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/getlogin`);
      setRows(response.data);
    } catch (error) {
      console.error("Error fetching login:", error);
    }
  };

  const handleUpdate = async (id: number, role: string) => {
    try {
      await api.put(`/role/${id}`, { role });
      toast.success("Role updated successfully");
      fetchUser();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error("Failed to update role");
    }
  };

  const handleClickOpen = () => {
    setNewEmail("");
    setNewRole("user");
    setEmailError("");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleCreateLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail.trim()) { setEmailError("Email is required"); return; }
    if (!emailRegex.test(newEmail)) { setEmailError("Enter a valid email"); return; }

    setCreating(true);
    try {
      await api.post(`/create-emplogin`, { email: newEmail, role: newRole });
      toast.success("Login created successfully");
      setOpen(false);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create login");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const email = row.email?.toLowerCase() ?? "";
      const role = row.role?.toLowerCase() ?? "";
      return (
        email.includes(searchEmail.toLowerCase()) &&
        role.includes(searchRole.toLowerCase())
      );
    });
  }, [rows, searchEmail, searchRole]);

  const columns: GridColDef[] = [
    {
      field: 'sno',
      headerName: 'S.No',
      flex: 0.3,
      minWidth: 55,
      sortable: false,
      renderCell: (params) =>
        params.api.getRowIndexRelativeToVisibleRows(params.row.id) + 1,
    },
    { field: 'email', headerName: 'Email ID', flex: 1.2, minWidth: 180 },
    {
      field: 'role',
      headerName: 'Role',
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <RoleSelect id={params.row.id} role={params.value} onUpdate={handleUpdate} />
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", background: BG, px: { xs: 1, sm: 2, md: 0 } }}>
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
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 14, sm: 18 }, color: NAVY_TEXT, whiteSpace: "nowrap" }}>
              All Users ({filteredRows.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleClickOpen}
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
              {isMobile ? "Add" : "Add Login"}
            </Button>
          </Box>

          {/* Search filters */}
          <Box
            sx={{
              px: { xs: 1.5, sm: 3 },
              py: 1.5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
              flexShrink: 0,
              borderBottom: `1px solid ${BORDER_COLOR}`,
              background: "#fff",
            }}
          >
            <TextField
              placeholder="Search email…"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              size="small"
              sx={searchFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon /></InputAdornment>
                ),
              }}
            />
            <TextField
              placeholder="Search role…"
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              size="small"
              sx={searchFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon /></InputAdornment>
                ),
              }}
            />
          </Box>

          {/* DataGrid */}
          <Box sx={{ overflowX: { xs: "auto", sm: "hidden" } }}>
            <Box sx={{ minWidth: { xs: 420, sm: "100%" } }}>
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
                        No users found. Create your first login.
                      </Typography>
                    </Box>
                  ),
                }}
                sx={{
                  width: "100%",
                  border: 0,
                  "& .MuiDataGrid-columnHeaders": { background: NAVY, borderRadius: 0 },
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
                  "& .MuiDataGrid-cell--editing": {
                    bgcolor: "transparent !important",
                    boxShadow: "none !important",
                  },
                  "& .MuiDataGrid-cell--editing .MuiInputBase-root": {
                    fontSize: 13,
                    color: "#334155",
                  },
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
                  "& .MuiIconButton-root:hover": { backgroundColor: "transparent" },
                  "& .MuiTablePagination-root": { fontSize: { xs: 12, sm: 14 } },
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* ─── Add Login Dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: "16px", overflow: "visible", mx: { xs: 1.5, sm: "auto" } },
        }}
      >
        <DialogTitle sx={{ pb: 0.5, pt: 3, px: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 20, color: NAVY_TEXT }}>
            Add Employee Login
          </Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: 13, mt: 0.3 }}>
            Enter the employee email and assign a role.
          </Typography>
        </DialogTitle>

        <Divider sx={{ mt: 1.5 }} />

        <DialogContent sx={{ px: 3, py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* EMAIL */}
          <TextField
            autoFocus
            label="Email"
            fullWidth
            size="small"
            placeholder="employee@company.com"
            value={newEmail}
            onChange={(e) => { setNewEmail(e.target.value); setEmailError(""); }}
            error={!!emailError}
            helperText={emailError}
            sx={fieldSx}
          />

          {/* ROLE */}
          <FormControl fullWidth size="small">
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              sx={{
                borderRadius: "10px",
                background: "#f8fafc",
                "&:hover fieldset": { borderColor: ORANGE },
                "&.Mui-focused fieldset": { borderColor: ORANGE },
              }}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: "#64748b",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "8px",
              px: 2.5,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateLogin}
            disabled={creating}
            variant="contained"
            sx={{
              background: NAVY,
              borderRadius: "8px",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              "&:hover": { background: "#253a6e" },
              "&:disabled": { bgcolor: "#94a3b8" },
            }}
          >
            {creating ? "Creating..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}