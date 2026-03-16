import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";

type Props = {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName?: string;
};

const PRIMARY = "#1a2e5a";
const ORANGE = "#f97316";

export default function DocumentViewer({ open, onClose, fileUrl, fileName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const isPdf = fileUrl?.toLowerCase().endsWith(".pdf");
  const isDoc =
    fileUrl?.toLowerCase().endsWith(".docx") ||
    fileUrl?.toLowerCase().endsWith(".doc");

  useEffect(() => {
    if (!open || !isDoc) return;

    const loadDoc = async () => {
      try {
        setLoading(true);
        if (containerRef.current) containerRef.current.innerHTML = "";
        const res = await fetch(fileUrl);
        const blob = await res.blob();
        if (containerRef.current) await renderAsync(blob, containerRef.current);
      } catch (err) {
        console.error("DOC preview error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDoc();
  }, [open, fileUrl]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName || "document";
    a.click();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 32px rgba(26,46,90,0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          px: 3,
          py: 2,
        }}
      >
        <Typography fontWeight={700} sx={{ color: PRIMARY, fontSize: 16 }}>
          {fileName || "Document"}
        </Typography>

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleDownload}
            sx={{
              borderColor: ORANGE,
              color: ORANGE,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#fff7ed", borderColor: ORANGE },
            }}
          >
            Download
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={onClose}
            sx={{
              bgcolor: PRIMARY,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#0f1e3d" },
            }}
          >
            Close
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: "hidden", bgcolor: "#f8f9fc" }}>
        <Box
          sx={{
            height: "75vh",
            overflow: isPdf ? "hidden" : "auto",
            p: isPdf ? 0 : 2,
          }}
        >
          {isPdf && (
            <iframe
              src={`${fileUrl}#toolbar=0`}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title="PDF"
            />
          )}

          {isDoc && (
            <>
              {loading && (
                <Typography sx={{ color: PRIMARY, fontWeight: 500, mb: 2, px: 1 }}>
                  Loading document...
                </Typography>
              )}
              <div
                ref={containerRef}
                style={{ width: "100%", minHeight: "100%", overflow: "visible" }}
              />
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}