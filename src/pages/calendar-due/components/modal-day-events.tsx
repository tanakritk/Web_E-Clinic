import dayjs from "dayjs";
import "dayjs/locale/th";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

dayjs.locale("th");

interface ModalDayEventsProps {
  open: boolean;
  date: Date | null;
  events: any[];
  onClose: () => void;
  onSelectEvent: (event: any) => void;
}

const ModalDayEvents = ({
  open,
  date,
  events,
  onClose,
  onSelectEvent,
}: ModalDayEventsProps) => {
  const formattedDate = date ? dayjs(date).format("D MMMM BBBB") : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #E91E63 0%, #F06292 100%)",
          px: 3,
          py: 2.5,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}
            >
              นัดหมายทั้งหมด
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "white", fontWeight: 700, mt: 0.25 }}
            >
              {formattedDate}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={`${events.length} รายการ`}
              size="small"
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                fontWeight: 700,
                fontSize: "12px",
                "& .MuiChip-label": { px: 1, color: "white" },
              }}
            />
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "white",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Event List */}
      <DialogContent sx={{ p: 2 }}>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {events.map((event, idx) => {
            const isSuccess = event.status === "Success";
            return (
              <Box key={event.id ?? idx}>
                <Box
                  onClick={() => {
                    onSelectEvent(event);
                    onClose();
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 2,
                    borderRadius: 3,
                    cursor: "pointer",
                    border: "1px solid",
                    transition: "all 0.2s",
                    backgroundColor: isSuccess ? "#E8F5E9" : "#FDECF2",
                    borderColor: isSuccess
                      ? "rgba(46,125,50,0.2)"
                      : "rgba(233,30,99,0.2)",
                    "&:hover": {
                      backgroundColor: isSuccess ? "#C8E6C9" : "#FCE4EC",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  {/* Status dot */}
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: isSuccess ? "#4CAF50" : "#E91E63",
                      flexShrink: 0,
                      mt: 0.25,
                      alignSelf: "flex-start",
                    }}
                  />

                  {/* Content */}
                  <Box flex={1} minWidth={0}>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      flexWrap="wrap"
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color: isSuccess ? "#2E7D32" : "#C2185B",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {event.customerName}
                      </Typography>
                      {isSuccess && (
                        <Chip
                          label="SUCCESS"
                          size="small"
                          color="success"
                          sx={{
                            fontSize: "10px",
                            fontWeight: 700,
                            height: 20,
                            "& .MuiChip-label": { px: 1, color: "white" },
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isSuccess ? "#388E3C" : "#E91E63",
                        display: "block",
                        mt: 0.25,
                      }}
                    >
                      {event.itemName}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                      <AccessTimeIcon
                        sx={{
                          fontSize: 12,
                          color: isSuccess ? "#66BB6A" : "#F48FB1",
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: isSuccess ? "#66BB6A" : "#F48FB1" }}
                      >
                        {dayjs(event.start).format("HH:mm น.")}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Arrow */}
                  <ChevronRightIcon
                    sx={{
                      fontSize: 18,
                      color: isSuccess ? "#A5D6A7" : "#F48FB1",
                      flexShrink: 0,
                    }}
                  />
                </Box>
                {idx < events.length - 1 && (
                  <Divider sx={{ mt: 0.5, borderColor: "transparent" }} />
                )}
              </Box>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ModalDayEvents;
