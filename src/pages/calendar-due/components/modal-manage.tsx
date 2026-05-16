import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  _SaleScheduleApi,
  _SaleScheduleKey,
} from "@/api/controller/trn-sale-schedule";
import { useLoading } from "@/context/loading-context";
import { useAlert } from "@/context/alert-context";
import ModalBill from "./modal-bill";

interface ModalManageProps {
  open: boolean;
  onClose: () => void;
  eventData: any;
}

const ModalManage = ({ open, onClose, eventData }: ModalManageProps) => {
  const queryClient = useQueryClient();
  const { setLoadingContext } = useLoading();
  const { setAlertContext } = useAlert();
  const [action, setAction] = useState<string>("Success");
  const [newDate, setNewDate] = useState<Dayjs | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  useEffect(() => {
    if (eventData) {
      setNewDate(dayjs(`${eventData.scheduleDate} ${eventData.scheduleTime}`));
      setAction("Success"); // Reset to default when opening new event
    }
  }, [eventData]);

  const updateMutation = useMutation({
    mutationFn: (body: any) =>
      _SaleScheduleApi().update(Number(eventData.id), body),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [_SaleScheduleKey().search] });
      setAlertContext({
        message: "บันทึกข้อมูลเรียบร้อย",
        type: "success",
      });
      if (action === "Success") {
        setShowBillModal(true);
      } else {
        onClose();
      }
    },
    onError: (error: any) => {
      setAlertContext({
        message: error?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        type: "warning",
      });
    },
    onSettled: () => {
      setLoadingContext(false);
    },
  });

  const handleSave = () => {
    if (!eventData) return;

    setLoadingContext(true);
    const body: any = {
      sessionNumber: eventData.sessionNumber,
      scheduleDate: eventData.scheduleDate,
      scheduleTime: eventData.scheduleTime,
      status: eventData.status,
      saleItemId: eventData.saleItemId,
    };

    if (action === "Success") {
      body.status = action;
    } else {
      body.status = action;
      if (newDate) {
        body.scheduleDate = newDate.format("YYYY-MM-DD");
        body.scheduleTime = newDate.format("HH:mm");
      }
    }

    updateMutation.mutate(body);
  };

  return (
    <>
      <Dialog
        open={open && !showBillModal}
        onClose={onClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          จัดการรายการนัดหมาย
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ชื่อลูกค้า
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              {eventData?.customerName}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              รายการ: {eventData?.itemName}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              นัดหมายเดิม: {dayjs(eventData?.start).format("D MMMM YYYY HH:mm")}
            </Typography>
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            เลือกดำเนินการ
          </Typography>
          <RadioGroup
            value={action}
            onChange={(e) => setAction(e.target.value)}
            sx={{ gap: 1 }}
          >
            <Box
              sx={{
                border: "1px solid",
                borderColor: action === "Success" ? "primary.main" : "divider",
                borderRadius: 2,
                px: 2,
                py: 0.5,
                backgroundColor:
                  action === "Success" ? "primary.50" : "transparent",
              }}
            >
              <FormControlLabel
                value="Success"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2" fontWeight={500}>
                    ทำรายการสำเร็จ
                  </Typography>
                }
                sx={{ width: "100%", m: 0 }}
              />
            </Box>
            <Box
              sx={{
                border: "1px solid",
                borderColor: action === "Pending" ? "primary.main" : "divider",
                borderRadius: 2,
                px: 2,
                py: 0.5,
                backgroundColor:
                  action === "Pending" ? "primary.50" : "transparent",
              }}
            >
              <FormControlLabel
                value="Pending"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2" fontWeight={500}>
                    เลื่อนวันทำรายการ
                  </Typography>
                }
                sx={{ width: "100%", m: 0 }}
              />
            </Box>
          </RadioGroup>

          {action === "Pending" && (
            <Box sx={{ mt: 3 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="th"
              >
                <DateTimePicker
                  label="ระบุวันและเวลาใหม่"
                  value={newDate}
                  onChange={(newValue) => setNewDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={onClose}
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={updateMutation.isPending}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 4,
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            {updateMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogActions>
      </Dialog>
      <ModalBill
        open={showBillModal}
        onClose={() => {
          setShowBillModal(false);
          onClose();
        }}
        eventData={eventData}
      />
    </>
  );
};

export default ModalManage;
