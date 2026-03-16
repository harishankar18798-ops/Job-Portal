import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRowModesModel, GridRowModes } from "@mui/x-data-grid";
import { useEffect, useState, useMemo } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import api from "../utils/tokenInstance";
import { useForm } from "react-hook-form";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { toast, Toaster } from "sonner";
import {
  Typography, Paper, Divider, IconButton, InputAdornment,
  useTheme, useMediaQuery,
} from "@mui/material";

type DeptRow = {
  id: number;
  name: string;
};

type DeptForm = {
  name: string;
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

export default function DepartmentTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [rows, setRows] = useState<DeptRow[]>([]);
  const [open, setOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeptForm>();

  const handleEditClick = (id: number) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: "edit" as unknown as GridRowModes, fieldToFocus: "name" },
    }));
  };

  const handleSaveClick = (id: number) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: "view" as unknown as GridRowModes },
    }));
  };

  const handleCancelClick = (id: number) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: "view" as unknown as GridRowModes, ignoreModifications: true },
    }));
  };

  const columns: GridColDef[] = [
    {
      field: "sno",
      headerName: "S.No",
      flex: 0.3,
      minWidth: 55,
      sortable: false,
      renderCell: (params) =>
        params.api.getRowIndexRelativeToVisibleRows(params.row.id) + 1,
    },
    {
      field: "name",
      headerName: "Department Name",
      flex: 1,
      minWidth: 150,
      editable: true,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      minWidth: 90,
      sortable: false,
      renderCell: (params) => {
        const isEditing = rowModesModel[params.row.id]?.mode === ("edit" as unknown as GridRowModes);
        if (isEditing) {
          return (
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", height: "100%" }}>
              <IconButton
                size="small"
                onClick={() => handleSaveClick(params.row.id)}
                sx={{
                  color: "#16a34a", bgcolor: "#f0fdf4", border: "1px solid #bbf7d0",
                  borderRadius: "6px", width: 28, height: 28,
                  "&:hover": { bgcolor: "#dcfce7" },
                }}
              >
                <SaveIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleCancelClick(params.row.id)}
                sx={{
                  color: "#dc2626", bgcolor: "#fef2f2", border: "1px solid #fecaca",
                  borderRadius: "6px", width: 28, height: 28,
                  "&:hover": { bgcolor: "#fee2e2" },
                }}
              >
                <CancelIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          );
        }
        return (
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", height: "100%" }}>
            <IconButton
              size="small"
              onClick={() => handleEditClick(params.row.id)}
              sx={{
                color: "#2459a3", bgcolor: "#eff6ff", border: "1px solid #bfdbfe",
                borderRadius: "6px", width: 28, height: 28,
                "&:hover": { bgcolor: "#dbeafe" },
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
              sx={{
                color: "#dc2626", bgcolor: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: "6px", width: 28, height: 28,
                "&:hover": { bgcolor: "#fee2e2" },
              }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  useEffect(() => {
    fetchDepts();
  }, []);

  const fetchDepts = async () => {
    try {
      const response = await api.get("/getdept");
      setRows(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/deletedept/${id}`);
      fetchDepts();
      toast.success("Department deleted successfully");
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("Failed to delete department");
    }
  };

  const handleUpdate = async (id: number, name: string) => {
    try {
      await api.put(`/updatedept/${id}`, { name });
      toast.success("Department updated successfully");
      fetchDepts();
    } catch (error) {
      console.error("Error updating department:", error);
      toast.error("Failed to update department");
    }
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onSubmit = async (data: DeptForm) => {
    try {
      await api.post("/createdept", { name: data.name });
      fetchDepts();
      reset();
      handleClose();
      toast.success("Department added successfully");
    } catch (error) {
      console.error("Error adding department:", error);
      toast.error("Failed to Add department");
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      row.name?.toLowerCase().includes(searchName.toLowerCase())
    );
  }, [rows, searchName]);

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
          {/* Header row */}
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
              All Departments ({filteredRows.length})
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
              {isMobile ? "Add" : "Add Department"}
            </Button>
          </Box>

          {/* Search filter */}
          <Box
            sx={{
              px: { xs: 1.5, sm: 3 },
              py: 1.5,
              flexShrink: 0,
              borderBottom: `1px solid ${BORDER_COLOR}`,
              background: "#fff",
            }}
          >
            <TextField
              placeholder="Search department name…"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              size="small"
              fullWidth
              sx={searchFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon /></InputAdornment>
                ),
              }}
            />
          </Box>

          {/* DataGrid with built-in navy header — always aligned */}
          <Box sx={{ overflowX: { xs: "auto", sm: "hidden" } }}>
            <Box sx={{ minWidth: { xs: 320, sm: "100%" } }}>
              <DataGrid
                autoHeight
                rows={filteredRows}
                columns={columns}
                rowModesModel={rowModesModel}
                // showToolbar
                // disableColumnFilter
                // disableColumnSelector
                // slotProps={{
                //   toolbar: {
                //     showQuickFilter: false
                //   }
                // }}
                onRowModesModelChange={setRowModesModel}
                editMode="cell"
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10, 20]}
                disableColumnMenu
                disableRowSelectionOnClick
                processRowUpdate={(newRow, oldRow) => {
                  if (newRow.name !== oldRow.name) {
                    handleUpdate(newRow.id, newRow.name);
                  }
                  return newRow;
                }}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography sx={{ color: "#94a3b8", fontSize: 14, textAlign: "center", px: 2 }}>
                        No departments found. Create your first department.
                      </Typography>
                    </Box>
                  ),
                }}
                sx={{
                  width: "100%",
                  border: 0,
                  // Built-in header styled navy
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

      {/* Dialog */}
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
            Add Department
          </Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: 13, mt: 0.3 }}>
            Enter the department name below.
          </Typography>
        </DialogTitle>

        <Divider sx={{ mt: 1.5 }} />

        <DialogContent sx={{ px: 3, py: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)} id="dept-form">
            <TextField
              autoFocus
              required
              label="Department Name"
              fullWidth
              size="small"
              sx={fieldSx}
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register("name", {
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: "Only letters and spaces allowed",
                },
              })}
            />
          </form>
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
            type="submit"
            form="dept-form"
            variant="contained"
            sx={{
              background: NAVY,
              borderRadius: "8px",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              "&:hover": { background: "#253a6e" },
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}